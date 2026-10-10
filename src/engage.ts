import { collection, doc, getDoc, getDocs, query, orderBy, limit, writeBatch, increment, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { Media, cleanMedia } from "./media";
import { Activity, postActivity, fetchUser } from "./social";
import { Post } from "./community";
import { notify } from "./notifications";

// Likes, comments and reshares. An item is either a feed activity
// (users/{owner}/activity/{id}) or a discussion post (posts/{id}).
export type Ref = { kind: "activity" | "post"; owner: string; id: string };
export type Comment = { id: string; body: string; authorUid: string; authorName: string; createdAt?: any; parentId?: string; replyTo?: string };
// Who a new comment is replying to (the top-level comment it hangs under, and the person it answers).
export type ReplyTarget = { parentId: string; authorUid: string; authorName: string };

// Group a flat list into threads: top-level items in order, each with its replies underneath.
// A reply whose parent was deleted still shows, under a "deleted" placeholder.
export function thread<T extends { id: string; parentId?: string }>(items: T[]): { parent: T | null; parentId: string; replies: T[] }[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  const out: { parent: T | null; parentId: string; replies: T[] }[] = [];
  const slot = new Map<string, { parent: T | null; parentId: string; replies: T[] }>();
  for (const i of items) {
    if (!i.parentId) { const g = { parent: i, parentId: i.id, replies: [] as T[] }; slot.set(i.id, g); out.push(g); }
  }
  for (const i of items) {
    if (!i.parentId) continue;
    let g = slot.get(i.parentId);
    if (!g) { g = { parent: byId.get(i.parentId) ?? null, parentId: i.parentId, replies: [] }; slot.set(i.parentId, g); out.push(g); }
    g.replies.push(i);
  }
  return out;
}
export type Me = { uid: string; username: string };

export const refOf = (a: Activity): Ref => ({ kind: "activity", owner: a.uid, id: a.id });
export const refOfPost = (p: Post): Ref => ({ kind: "post", owner: p.authorUid, id: p.id });

const itemDoc = (r: Ref) => (r.kind === "activity" ? doc(db, "users", r.owner, "activity", r.id) : doc(db, "posts", r.id));
const likeDoc = (r: Ref, uid: string) => doc(itemDoc(r), "likes", uid);

export async function hasLiked(r: Ref, uid: string): Promise<boolean> {
  try { return (await getDoc(likeDoc(r, uid))).exists(); } catch { return false; }
}

// Adds / removes the like and moves the counter in one all-or-nothing step.
export async function setLike(r: Ref, me: Me, on: boolean) {
  const b = writeBatch(db);
  if (on) b.set(likeDoc(r, me.uid), { username: me.username, createdAt: serverTimestamp() });
  else b.delete(likeDoc(r, me.uid));
  b.update(itemDoc(r), { likeCount: increment(on ? 1 : -1) });
  await b.commit();
  if (on) notify(r.owner, me, "like", r.id);
}

export async function listComments(r: Ref): Promise<Comment[]> {
  const snap = await getDocs(query(collection(itemDoc(r), "comments"), orderBy("createdAt", "asc"), limit(100)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}
export async function addComment(r: Ref, me: Me, body: string, to?: ReplyTarget | null) {
  const b = writeBatch(db);
  b.set(doc(collection(itemDoc(r), "comments")), {
    authorUid: me.uid, authorName: me.username, body: body.trim().slice(0, 500), createdAt: serverTimestamp(),
    ...(to ? { parentId: to.parentId, replyTo: to.authorName } : {}),
  });
  b.update(itemDoc(r), { commentCount: increment(1) });
  await b.commit();
  if (to) notify(to.authorUid, me, "comment", undefined, "replied to your comment");
  if (!to || to.authorUid !== r.owner) notify(r.owner, me, "comment");
}
export async function deleteComment(r: Ref, cid: string) {
  const b = writeBatch(db);
  b.delete(doc(collection(itemDoc(r), "comments"), cid));
  b.update(itemDoc(r), { commentCount: increment(-1) });
  await b.commit();
}

export async function deleteActivity(a: Activity) {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "users", a.uid, "activity", a.id));
}

// ---- reshare: puts a copy of the post on your own feed ----
export type Orig = { kind: "activity" | "post"; uid: string; username: string; id: string; title?: string; text?: string; media?: Media[] };

export function origOf(a: Activity): Orig | null {
  if (a.type === "reshare") return a.data?.orig ?? null; // re-sharing a reshare shares the original
  if (a.type === "post") return { kind: "activity", uid: a.uid, username: a.username, id: a.id, text: a.data?.text || "", media: a.data?.media };
  return null;
}
export const origOfPost = (p: Post): Orig => ({ kind: "post", uid: p.authorUid, username: p.authorName, id: p.id, title: p.title, text: p.body.slice(0, 240), media: p.media });

export async function reshare(me: Me, o: Orig, note?: string) {
  const orig: any = { kind: o.kind, uid: o.uid, username: o.username, id: o.id };
  if (o.title) orig.title = o.title;
  if (o.text) orig.text = o.text.slice(0, 280);
  const m = cleanMedia(o.media);
  if (m.length) orig.media = m;
  const data: any = { orig };
  if (note?.trim()) data.text = note.trim().slice(0, 280);
  await postActivity(me.uid, me.username, "reshare", data);
  notify(o.uid, me, "reshare", o.id);
}

// small cache so each feed card doesn't re-fetch the same person's photo
const cache = new Map<string, Promise<{ photo?: string } | null>>();
export function getUserInfo(uid: string) {
  if (!cache.has(uid)) cache.set(uid, fetchUser(uid).catch(() => null));
  return cache.get(uid)!;
}
