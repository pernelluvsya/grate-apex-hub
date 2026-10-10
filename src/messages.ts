import {
  deleteField, collection, doc, getDoc, setDoc, addDoc, onSnapshot, query, where, orderBy, limitToLast, updateDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Me } from "./community";
import { Media, cleanMedia } from "./media";
import { Voice, cleanVoice } from "./voice";
import { Doc, cleanDoc } from "./docs";
import { Orig } from "./engage";
import { UserHit, fetchEdges } from "./social";
import { notify } from "./notifications";

// Direct messages between friends (people who follow each other).
// chats/{uidA_uidB} (uids sorted) holds the inbox line; chats/{id}/messages holds the conversation.
export type Share = Orig; // a post sent inside a message
export type Chat = {
  id: string; members: [string, string]; names: Record<string, string>;
  lastText?: string; lastAt?: number; lastFrom?: string; seen?: Record<string, number>; typing?: Record<string, number>;
  cleared?: Record<string, any>; // per person: when they deleted the chat for themselves (server time)
};
// A message you are answering: who wrote it and a short snippet (or a label for voice / photo).
export type ReplyTo = { id: string; from: string; name: string; text: string };
// A call that was rung from this chat. The caller's app writes it when the call ends, so both people see it in the conversation.
export type CallLog = { status: "answered" | "missed" | "declined"; secs: number };
export const callText = (c: CallLog) => (c.status === "answered" ? `📞 Call · ${talked(c.secs)}` : c.status === "declined" ? "📞 Call declined" : "📞 Missed call");
// 75 -> "1 min 15 sec", 3700 -> "1 hr 1 min", 4 -> "4 sec"
export const talked = (secs: number) => {
  const s = Math.max(1, Math.round(secs)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h} hr ${m} min` : m ? `${m} min ${r} sec` : `${r} sec`;
};

// Edit history entry
export type EditEntry = { text: string; editedAt: any };

// Direct message with support for editing and deletion
export type DM = {
  id: string;
  from: string;
  text: string;
  call?: CallLog;
  media?: Media[];
  share?: Share;
  audio?: Voice;
  doc?: Doc;
  reply?: ReplyTo;
  fwd?: boolean;
  reactions?: Record<string, string>;
  createdAt?: any;
  editedAt?: any;                      // Timestamp of last edit
  editHistory?: EditEntry[];           // Previous versions of message
  deletedFor?: Record<string, boolean>; // Track who deleted it for themselves
};
export const ms = (t: any): number => (typeof t === "number" ? t : t?.toMillis?.() ?? Date.now());
export const snippet = (m: { text?: string; audio?: any; doc?: any; share?: any; media?: any[]; call?: CallLog }) =>
  (m.text?.trim() || (m.call ? callText(m.call) : m.audio ? "🎤 Voice message" : m.doc ? `📄 ${m.doc.name}` : m.share ? "📎 Shared a post" : m.media?.length ? "📷 Photo / video" : "")).slice(0, 100);

export const chatId = (a: string, b: string) => (a < b ? `${a}_${b}` : `${b}_${a}`);
export const otherOf = (c: Chat, me: string) => c.members.find((m) => m !== me) ?? me;
export const isUnread = (c: Chat, me: string) => !!c.lastAt && c.lastFrom !== me && c.lastAt > (c.seen?.[me] ?? 0);

// Friends = people I follow who also follow me.
export async function fetchFriends(uid: string): Promise<UserHit[]> {
  const [fg, fr] = await Promise.all([fetchEdges(uid, "following"), fetchEdges(uid, "followers")]);
  const back = new Set(fr.map((u) => u.uid));
  return fg.filter((u) => back.has(u.uid));
}

export const cleanShare = (s: Share): Share => {
  const o: any = { kind: s.kind, uid: s.uid, username: s.username, id: s.id };
  if (s.title) o.title = s.title.slice(0, 200);
  if (s.text) o.text = s.text.slice(0, 280);
  const m = cleanMedia(s.media); if (m.length) o.media = m;
  return o;
};

export function watchChats(uid: string, cb: (c: Chat[]) => void, onErr?: (e: any) => void) {
  return onSnapshot(query(collection(db, "chats"), where("members", "array-contains", uid)),
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Chat)).sort((a, b) => (b.lastAt ?? 0) - (a.lastAt ?? 0))),
    (e) => { onErr?.(e); cb([]); });
}
export function watchChat(id: string, cb: (c: Chat | null) => void) {
  return onSnapshot(doc(db, "chats", id), (s) => cb(s.exists() ? ({ id: s.id, ...(s.data() as any) } as Chat) : null), () => cb(null));
}
export function watchMessages(id: string, cb: (m: DM[]) => void, onErr: (e: any) => void) {
  const q = query(collection(db, "chats", id, "messages"), orderBy("createdAt", "asc"), limitToLast(100));
  return onSnapshot(q, (s) => cb(s.docs.map((d) => ({ id: d.id, ...(d.data({ serverTimestamps: "estimate" }) as any) }))), onErr);
}

const preview = (text: string, media?: Media[], share?: Share, audio?: Voice, doc?: Doc, call?: CallLog) =>
  (text.trim() ? text.trim() : call ? callText(call) : audio ? "🎤 Voice message" : doc ? `📄 ${doc.name}` : share ? "📎 Shared a post" : media?.length ? "📷 Photo/video" : "").slice(0, 100);

// Sends a message to a friend. Creates the chat the first time.
export async function sendDM(me: Me, friend: UserHit, text: string, opts: { media?: Media[]; share?: Share; audio?: Voice; doc?: Doc; reply?: ReplyTo; fwd?: boolean; call?: CallLog } = {}) {
  const id = chatId(me.uid, friend.uid);
  const now = Date.now();
  const members = me.uid < friend.uid ? [me.uid, friend.uid] : [friend.uid, me.uid];
  const ref = doc(db, "chats", id);
  const last = { lastText: preview(text, opts.media, opts.share, opts.audio, opts.doc, opts.call), lastAt: now, lastFrom: me.uid };
  if ((await getDoc(ref)).exists()) await updateDoc(ref, { ...last, [`names.${me.uid}`]: me.username, [`seen.${me.uid}`]: now });
  else await setDoc(ref, { members, names: { [me.uid]: me.username, [friend.uid]: friend.username }, ...last, seen: { [me.uid]: now } });
  await addDoc(collection(db, "chats", id, "messages"), {
    from: me.uid, text: text.trim(), createdAt: serverTimestamp(),
    ...(opts.media?.length ? { media: cleanMedia(opts.media) } : {}),
    ...(opts.share ? { share: cleanShare(opts.share) } : {}),
    ...(cleanVoice(opts.audio) ? { audio: cleanVoice(opts.audio) } : {}),
    ...(cleanDoc(opts.doc) ? { doc: cleanDoc(opts.doc) } : {}),
    ...(opts.reply ? { reply: { id: opts.reply.id, from: opts.reply.from, name: opts.reply.name, text: opts.reply.text.slice(0, 120) } } : {}),
    ...(opts.fwd ? { fwd: true } : {}),
    ...(opts.call ? { call: { status: opts.call.status, secs: Math.max(0, Math.min(86400, Math.round(opts.call.secs))) } } : {}),
  });
  // at most one notification per chat every 10 minutes, so a long conversation doesn't flood the bell
  if (!opts.call) notify(friend.uid, me, "message", `${id}_${Math.floor(now / 600000)}`, opts.share ? "shared a post with you" : opts.audio ? "sent you a voice message" : opts.doc ? "sent you a document" : "sent you a message");
  return id;
}

export function markSeen(id: string, uid: string) {
  return updateDoc(doc(db, "chats", id), { [`seen.${uid}`]: Date.now() }).catch(() => { });
}
// React to a message with an emoji (null removes your reaction). One reaction per person.
export function reactDM(id: string, mid: string, uid: string, emoji: string | null) {
  return updateDoc(doc(db, "chats", id, "messages", mid), { [`reactions.${uid}`]: emoji ?? deleteField() });
}
// "typing…": we store the time we last typed (0 = stopped) on the chat. Only works once the chat exists.
export function setTyping(id: string, uid: string, on: boolean) {
  return updateDoc(doc(db, "chats", id), { [`typing.${uid}`]: on ? Date.now() : 0 }).catch(() => { });
}
export function deleteDM(id: string, mid: string) { return deleteDoc(doc(db, "chats", id, "messages", mid)); }

// Delete a chat FOR ME. Nothing is removed from Firestore (the other person keeps their copy, no time limit applies):
// we just stamp "cleared at" on the chat. The inbox hides the chat and the conversation only shows newer messages.
export function clearChatForMe(id: string, uid: string) {
  return updateDoc(doc(db, "chats", id), { [`cleared.${uid}`]: serverTimestamp() });
}
export const clearedAt = (c: Chat | null | undefined, uid: string): number => (c?.cleared?.[uid] ? ms(c.cleared[uid]) : 0);
// A cleared chat stays out of the inbox until somebody sends a newer message.
export const isCleared = (c: Chat, uid: string): boolean => { const t = clearedAt(c, uid); return t > 0 && t >= (c.lastAt ?? 0); };

// Writes "missed / declined / answered + how long" into the chat after a call.
export const logCall = (me: Me, friend: UserHit, call: CallLog) => sendDM(me, friend, "", { call });

// ============ MESSAGE EDITING & DELETION FEATURES ============

/**
 * Check if a message can be edited or deleted for everyone.
 * Messages can only be edited/deleted for everyone within 3 minutes of creation.
 * Keep EDIT_WINDOW_MS in step with duration.value(180, 's') in firestore.rules.
 */
export const EDIT_WINDOW_MS = 3 * 60 * 1000;
export const canEditOrDeleteForAll = (createdAt: any): boolean => {
  const age = Date.now() - ms(createdAt);
  return age < EDIT_WINDOW_MS;
};

/**
 * Get a human-readable time remaining until a message can no longer be edited
 */
export const timeUntilEditLocked = (createdAt: any): string | null => {
  const age = Date.now() - ms(createdAt);
  const remaining = Math.max(0, EDIT_WINDOW_MS - age);
  if (remaining === 0) return null;
  const secs = Math.ceil(remaining / 1000);
  return secs >= 60 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${secs}s`;
};

/**
 * Edit a message (only the owner can edit, within 3 minutes).
 * Stores the old version in editHistory and updates editedAt timestamp.
 */
export async function editDM(
  chatId: string,
  messageId: string,
  newText: string,
  oldMessage: DM
) {
  if (!canEditOrDeleteForAll(oldMessage.createdAt)) {
    throw new Error("Messages can only be edited within 3 minutes of sending");
  }

  const messageRef = doc(db, "chats", chatId, "messages", messageId);

  // Preserve the old version in edit history
  const editHistory = [...(oldMessage.editHistory ?? [])];
  editHistory.push({
    text: oldMessage.text,
    editedAt: oldMessage.editedAt || oldMessage.createdAt,
  });

  // Update the message with new text and track the edit
  await updateDoc(messageRef, {
    text: newText.trim(),
    editedAt: serverTimestamp(),
    editHistory: editHistory,
  });
}

/**
 * Delete a message for the current user only.
 * The message still exists for others (hidden via deletedFor flag).
 */
export function deleteDMForMe(chatId: string, messageId: string, uid: string) {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  return updateDoc(messageRef, {
    [`deletedFor.${uid}`]: true,
  });
}

/**
 * Delete a message for everyone (only within 3 minutes).
 * Actually removes the message document from Firestore.
 * Only the message owner can do this, and only within 3 minutes.
 */
export async function deleteDMForEveryone(
  chatId: string,
  messageId: string,
  createdAt: any
) {
  if (!canEditOrDeleteForAll(createdAt)) {
    throw new Error("Messages can only be deleted for everyone within 3 minutes of sending");
  }
  return deleteDoc(doc(db, "chats", chatId, "messages", messageId));
}