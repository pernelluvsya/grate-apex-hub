import { Doc, cleanDoc } from "./docs";
import {
  collection, query, where, orderBy, limitToLast, onSnapshot, getDocs, doc, addDoc, writeBatch, updateDoc,
  deleteDoc, arrayUnion, arrayRemove, deleteField, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Me } from "./community";
import { Media, cleanMedia } from "./media";
import { canEditOrDeleteForAll } from "./messages";
import type { Share, ReplyTo, EditEntry } from "./messages";
import { Voice, cleanVoice } from "./voice";

export const MAX_MEMBERS = 20;

export type Group = {
  id: string; name: string; description: string; ownerUid: string; ownerName: string;
  memberUids: string[]; members: Record<string, string>; createdAt?: any;
};
export type Message = {
  id: string; text: string; media?: Media[]; share?: Share; audio?: Voice; doc?: Doc; reply?: ReplyTo; fwd?: boolean; reactions?: Record<string, string>; authorUid: string; authorName: string; createdAt?: any;
  editedAt?: any; editHistory?: EditEntry[]; deletedFor?: Record<string, boolean>;
  system?: boolean // centred notice such as "@sam left the group", not a normal chat bubble
};

const toGroup = (id: string, d: any): Group => ({ id, description: "", members: {}, memberUids: [], ...d });

export async function createGroup(name: string, description: string, me: Me): Promise<string> {
  const ref = await addDoc(collection(db, "groups"), {
    name: name.trim(), description: description.trim(),
    ownerUid: me.uid, ownerName: me.username,
    memberUids: [me.uid], members: { [me.uid]: me.username },
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listMyGroups(uid: string): Promise<Group[]> {
  const snap = await getDocs(query(collection(db, "groups"), where("memberUids", "array-contains", uid)));
  return snap.docs.map((d) => toGroup(d.id, d.data()));
}

// The server only accepts this if the owner and the new member follow each other.
export function addMember(groupId: string, uid: string, username: string) {
  return updateDoc(doc(db, "groups", groupId), { memberUids: arrayUnion(uid), [`members.${uid}`]: username });
}
// Leaving is one atomic write: drop me from the group, post a "left the group" notice in the chat for the others,
// AND leave a "left" note so the chat stays in my list until I delete it.
export function leaveGroup(group: Group, uid: string) {
  const batch = writeBatch(db);
  const name = group.members[uid] ?? "A member";
  batch.set(doc(collection(db, "groups", group.id, "messages")), {
    text: `@${name} left the group`, system: true, authorUid: uid, authorName: name, createdAt: serverTimestamp(),
  });
  batch.update(doc(db, "groups", group.id), { memberUids: arrayRemove(uid), [`members.${uid}`]: deleteField() });
  batch.set(doc(db, "users", uid, "leftGroups", group.id), { name: group.name, leftAt: serverTimestamp() });
  return batch.commit();
}

// Groups I left. They can't be opened any more (I'm not a member), but I can delete them from my list.
export type LeftGroup = { id: string; name: string; leftAt?: any };
export async function listLeftGroups(uid: string): Promise<LeftGroup[]> {
  const snap = await getDocs(collection(db, "users", uid, "leftGroups"));
  return snap.docs.map((d) => ({ id: d.id, name: (d.data() as any).name ?? "Group", leftAt: (d.data() as any).leftAt }));
}
// The rules only allow this once I'm no longer a member of that group.
export function deleteLeftGroup(uid: string, groupId: string) { return deleteDoc(doc(db, "users", uid, "leftGroups", groupId)); }
export function deleteGroup(groupId: string) { return deleteDoc(doc(db, "groups", groupId)); }

// "Live" = the phone keeps a connection open and Firestore pushes new data in.
export function subscribeGroup(groupId: string, cb: (g: Group | null) => void, onErr: (e: any) => void) {
  return onSnapshot(doc(db, "groups", groupId), (s) => cb(s.exists() ? toGroup(s.id, s.data()) : null), onErr);
}
export function subscribeMessages(groupId: string, cb: (m: Message[]) => void, onErr: (e: any) => void) {
  const q = query(collection(db, "groups", groupId, "messages"), orderBy("createdAt", "asc"), limitToLast(100));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data({ serverTimestamps: "estimate" }) as any) }))), onErr);
}
export function reactMessage(groupId: string, mid: string, uid: string, emoji: string | null) {
  return updateDoc(doc(db, "groups", groupId, "messages", mid), { [`reactions.${uid}`]: emoji ?? deleteField() });
}
export function sendMessage(groupId: string, text: string, me: Me, media?: Media[], share?: Share, extra: { audio?: Voice; doc?: Doc; reply?: ReplyTo; fwd?: boolean } = {}) {
  return addDoc(collection(db, "groups", groupId, "messages"), {
    text: text.trim(), authorUid: me.uid, authorName: me.username, createdAt: serverTimestamp(),
    ...(media?.length ? { media: cleanMedia(media) } : {}),
    ...(share ? { share: cleanShareObj(share) } : {}),
    ...(cleanVoice(extra.audio) ? { audio: cleanVoice(extra.audio) } : {}),
    ...(cleanDoc(extra.doc) ? { doc: cleanDoc(extra.doc) } : {}),
    ...(extra.reply ? { reply: { id: extra.reply.id, from: extra.reply.from, name: extra.reply.name, text: extra.reply.text.slice(0, 120) } } : {}),
    ...(extra.fwd ? { fwd: true } : {}),
  });
}

// ---- edit / delete (same rules as private chats: edit + delete for everyone within 3 minutes, delete for me any time) ----
export async function editMessage(groupId: string, mid: string, newText: string, old: Message) {
  if (!canEditOrDeleteForAll(old.createdAt)) throw new Error("Messages can only be edited within 3 minutes of sending");
  const editHistory = [...(old.editHistory ?? []), { text: old.text, editedAt: old.editedAt || old.createdAt }];
  await updateDoc(doc(db, "groups", groupId, "messages", mid), { text: newText.trim(), editedAt: serverTimestamp(), editHistory });
}
export function deleteMessageForMe(groupId: string, mid: string, uid: string) {
  return updateDoc(doc(db, "groups", groupId, "messages", mid), { [`deletedFor.${uid}`]: true });
}
export async function deleteMessageForEveryone(groupId: string, mid: string, createdAt: any) {
  if (!canEditOrDeleteForAll(createdAt)) throw new Error("Messages can only be deleted for everyone within 3 minutes of sending");
  return deleteDoc(doc(db, "groups", groupId, "messages", mid));
}

function cleanShareObj(s: Share) {
  const o: any = { kind: s.kind, uid: s.uid, username: s.username, id: s.id };
  if (s.title) o.title = s.title.slice(0, 200);
  if (s.text) o.text = s.text.slice(0, 280);
  const m = cleanMedia(s.media); if (m.length) o.media = m;
  return o;
}