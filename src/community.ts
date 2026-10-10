import {
  collection, query, where, limit, getDocs, getDoc, doc, addDoc, setDoc, deleteDoc,
  orderBy, writeBatch, increment, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Media, cleanMedia } from "./media";
import { notify } from "./notifications";

export type Post = {
  id: string; board: string; title: string; body: string;
  authorUid: string; authorName: string; replyCount: number; likeCount?: number; media?: Media[];
  createdAt?: any; lastActivityAt?: any;
};
export type Reply = { id: string; body: string; media?: Media[]; authorUid: string; authorName: string; createdAt?: any; parentId?: string; replyTo?: string };
export type Me = { uid: string; username: string };

export const millis = (t: any): number => (t?.toMillis ? t.toMillis() : typeof t === "number" ? t : Date.now());

export function timeAgo(t: any) {
  const s = Math.max(0, Math.floor((Date.now() - millis(t)) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// Chat time in 24-hour clock: "14:32" today, "Mon 14:32" this week, "12 Sep 14:32" older.
export function clock(t: any) {
  const d = new Date(millis(t)), now = new Date();
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const days = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000);
  if (days <= 0) return hm;
  if (days < 7) return `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]} ${hm}`;
  return `${d.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]} ${hm}`;
}

const toPost = (id: string, d: any): Post => ({ id, replyCount: 0, ...d });

// Newest activity first. We sort on the phone instead of in the query so no
// extra Firestore index is needed.
const byActivity = (a: Post, b: Post) => millis(b.lastActivityAt ?? b.createdAt) - millis(a.lastActivityAt ?? a.createdAt);

export async function listPosts(board: string): Promise<Post[]> {
  const snap = await getDocs(query(collection(db, "posts"), where("board", "==", board), limit(100)));
  return snap.docs.map((d) => toPost(d.id, d.data())).sort(byActivity);
}
export async function listMyPosts(uid: string): Promise<Post[]> {
  const snap = await getDocs(query(collection(db, "posts"), where("authorUid", "==", uid), limit(100)));
  return snap.docs.map((d) => toPost(d.id, d.data())).sort(byActivity);
}
export async function getPost(id: string): Promise<Post | null> {
  const s = await getDoc(doc(db, "posts", id));
  return s.exists() ? toPost(s.id, s.data()) : null;
}

export async function createPost(board: string, title: string, body: string, me: Me, media?: Media[]) {
  const ref = await addDoc(collection(db, "posts"), {
    board, title: title.trim(), body: body.trim(),
    authorUid: me.uid, authorName: me.username,
    replyCount: 0, createdAt: serverTimestamp(), lastActivityAt: serverTimestamp(),
    ...(media?.length ? { media: cleanMedia(media) } : {}),
  });
  return ref.id;
}
export function deletePost(id: string) { return deleteDoc(doc(db, "posts", id)); }

export async function listReplies(postId: string): Promise<Reply[]> {
  const snap = await getDocs(query(collection(db, "posts", postId, "replies"), orderBy("createdAt", "asc"), limit(200)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

// Adds the reply and bumps the post's reply count in one all-or-nothing step.
export async function addReply(postId: string, body: string, me: Me, media?: Media[], authorUid?: string, to?: { parentId: string; authorUid: string; authorName: string } | null) {
  const batch = writeBatch(db);
  const rref = doc(collection(db, "posts", postId, "replies"));
  batch.set(rref, { body: body.trim(), authorUid: me.uid, authorName: me.username, createdAt: serverTimestamp(), ...(media?.length ? { media: cleanMedia(media) } : {}), ...(to ? { parentId: to.parentId, replyTo: to.authorName } : {}) });
  batch.update(doc(db, "posts", postId), { replyCount: increment(1), lastActivityAt: serverTimestamp() });
  await batch.commit();
  if (to) notify(to.authorUid, me, "reply", undefined, "replied to your comment");
  if (authorUid && (!to || to.authorUid !== authorUid)) notify(authorUid, me, "reply");
}
export async function deleteReply(postId: string, replyId: string) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "posts", postId, "replies", replyId));
  batch.update(doc(db, "posts", postId), { replyCount: increment(-1) });
  await batch.commit();
}
