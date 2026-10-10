import { collection, doc, getDocs, limit, onSnapshot, orderBy, query, setDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { pushFor } from "./push";

// In-app notifications: one small document per event in users/{them}/notifications.
// The person who did the thing writes it; only the recipient can read it.
export type NType = "like" | "comment" | "reshare" | "follow" | "reply" | "battle" | "support" | "message";
export type Notif = { id: string; type: NType; from: string; fromName: string; text?: string; read: boolean; createdAt: number };

const WHAT: Record<NType, string> = {
  like: "liked your post", comment: "commented on your post", reshare: "reshared your post",
  follow: "started following you", reply: "replied to your discussion", battle: "challenged you to an XP battle", support: "replied to your support message", message: "sent you a message",
};
export const describeNotif = (n: Notif) => `@${n.fromName} ${n.text || WHAT[n.type]}`;

// Best effort: a failed notification must never break the action itself.
// `key` makes the id stable, so repeating the same action (like → unlike → like) only notifies once.
export async function notify(to: string, me: { uid: string; username: string }, type: NType, key?: string, text?: string) {
  if (!to || to === me.uid) return;
  try {
    const id = key ? `${type}_${key}_${me.uid}` : undefined;
    const ref = id ? doc(db, "users", to, "notifications", id) : doc(collection(db, "users", to, "notifications"));
    const data: any = { type, from: me.uid, fromName: me.username, read: false, createdAt: Date.now() };
    if (text) data.text = text.slice(0, 100);
    await setDoc(ref, data);
    pushFor(to, ref.id);
  } catch { /* already notified, or not allowed: fine */ }
}

export function watchNotifs(uid: string, cb: (n: Notif[]) => void) {
  return onSnapshot(query(collection(db, "users", uid, "notifications"), orderBy("createdAt", "desc"), limit(50)),
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Notif))), () => cb([]));
}

export async function markRead(uid: string, ids: string[]) {
  if (!ids.length) return;
  const b = writeBatch(db);
  ids.slice(0, 400).forEach((id) => b.update(doc(db, "users", uid, "notifications", id), { read: true }));
  await b.commit().catch(() => {});
}

// Deletes every notification of this user (also the ones older than the 50 shown), 400 at a time.
export async function clearNotifs(uid: string) {
  const col = collection(db, "users", uid, "notifications");
  for (let i = 0; i < 10; i++) {
    const snap = await getDocs(query(col, limit(400)));
    if (snap.empty) return;
    const b = writeBatch(db);
    snap.docs.forEach((d) => b.delete(d.ref));
    await b.commit();
    if (snap.size < 400) return;
  }
}
