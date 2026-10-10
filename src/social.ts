import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { notify } from "./notifications";

export type ScoreRow = {
  uid: string; username: string; xp: number; level: number; title: string;
  streak: number; answered: number; accuracy: number; hall?: string; semester?: number;
  courseXp?: Record<string, number>;
};
export type UserHit = { uid: string; username: string };

const toRow = (id: string, d: any): ScoreRow => ({ uid: id, ...d });

// Top students ordered by a field, e.g. "xp" or "courseXp.biochemistry".
export async function fetchTop(field: string, max = 50, hall?: string): Promise<ScoreRow[]> {
  if (hall) {
    // One class only: filter by hall, then rank here (avoids needing a composite index).
    const snap = await getDocs(query(collection(db, "scores"), where("hall", "==", hall), limit(500)));
    const val = (r: ScoreRow) => (field.startsWith("courseXp.") ? r.courseXp?.[field.slice(9)] ?? 0 : (r as any)[field] ?? 0);
    return snap.docs.map((d) => toRow(d.id, d.data())).filter((r) => val(r) > 0 || field === "xp").sort((a, b) => val(b) - val(a)).slice(0, max);
  }
  const snap = await getDocs(query(collection(db, "scores"), orderBy(field, "desc"), limit(max)));
  return snap.docs.map((d) => toRow(d.id, d.data()));
}

export async function fetchScores(uids: string[]): Promise<ScoreRow[]> {
  const snaps = await Promise.all(uids.map((u) => getDoc(doc(db, "scores", u))));
  return snaps.filter((s) => s.exists()).map((s) => toRow(s.id, s.data()));
}

// Who I follow, and who follows me. Two people who follow each other are "friends".
export async function fetchFollowing(uid: string): Promise<string[]> {
  const snap = await getDocs(query(collection(db, "follows"), where("follower", "==", uid)));
  return snap.docs.map((d) => d.data().followee as string);
}
export async function fetchFollowers(uid: string): Promise<string[]> {
  const snap = await getDocs(query(collection(db, "follows"), where("followee", "==", uid)));
  return snap.docs.map((d) => d.data().follower as string);
}

const followId = (a: string, b: string) => `${a}_${b}`;
export async function follow(me: UserHit, target: UserHit) {
  await setDoc(doc(db, "follows", followId(me.uid, target.uid)), {
    follower: me.uid, followee: target.uid,
    followerName: me.username, followeeName: target.username,
    createdAt: serverTimestamp(),
  });
  notify(target.uid, me, "follow");
}
export function unfollow(meUid: string, targetUid: string) {
  return deleteDoc(doc(db, "follows", followId(meUid, targetUid)));
}

// Find students whose username starts with the typed text.
export async function searchUsers(text: string): Promise<UserHit[]> {
  const p = text.trim().toLowerCase();
  if (p.length < 2) return [];
  const snap = await getDocs(query(collection(db, "users"), where("username", ">=", p), where("username", "<=", p + ""), limit(10)));
  return snap.docs.map((d) => ({ uid: d.id, username: d.data().username as string }));
}

// ---------------- Activity feed ----------------
// Each student's activity lives under users/{uid}/activity. Reading a few per
// person (instead of one big query) means no extra Firestore indexes are needed.
export type Activity = { id: string; uid: string; type: "quiz" | "level" | "streak" | "recap" | "post" | "reshare" | "quizShare"; username: string; data: any; createdAt?: any; likeCount?: number; commentCount?: number };

export async function postActivity(uid: string, username: string, type: Activity["type"], data: Record<string, any>, throwOnError = false) {
  try {
    await addDoc(collection(db, "users", uid, "activity"), { type, username, data, createdAt: serverTimestamp() });
  } catch (e) {
    // the feed is nice-to-have; never block studying (unless the caller needs to tell the user it failed)
    if (throwOnError) throw e;
  }
}

export async function listActivity(uid: string, max = 8): Promise<Activity[]> {
  // Quiz scores are private. Older "quiz" items already saved are hidden here (feed, profiles and the You tab all read through this),
  // so read extra and drop them before trimming to `max`.
  const snap = await getDocs(query(collection(db, "users", uid, "activity"), orderBy("createdAt", "desc"), limit(max * 4)));
  return snap.docs.map((d) => ({ id: d.id, uid, ...(d.data() as any) } as Activity)).filter((a) => a.type !== "quiz").slice(0, max);
}

export async function fetchFeed(uids: string[], perPerson = 6, total = 60): Promise<Activity[]> {
  const lists = await Promise.all(uids.slice(0, 30).map((u) => listActivity(u, perPerson).catch(() => [] as Activity[])));
  const ms = (t: any) => (t?.toMillis ? t.toMillis() : Date.now());
  return lists.flat().sort((a, b) => ms(b.createdAt) - ms(a.createdAt)).slice(0, total);
}

// ---------------- Profiles ----------------
export async function fetchEdges(uid: string, dir: "followers" | "following"): Promise<UserHit[]> {
  const mine = dir === "following";
  const snap = await getDocs(query(collection(db, "follows"), where(mine ? "follower" : "followee", "==", uid)));
  return snap.docs.map((d) => {
    const x = d.data();
    return mine ? { uid: x.followee, username: x.followeeName } : { uid: x.follower, username: x.followerName };
  });
}

export async function fetchUser(uid: string): Promise<{ username: string; hall?: string; semester?: number; photo?: string; bio?: string } | null> {
  const s = await getDoc(doc(db, "users", uid));
  return s.exists() ? (s.data() as any) : null;
}

// People worth following: those who follow me (but I don't follow back), people my follows follow, classmates in my hall, and top scorers.
export type Suggestion = UserHit & { reason: string };
export async function suggestFollows(me: { uid: string; hall?: string; semester?: number }, max = 8): Promise<Suggestion[]> {
  const [following, followers, top] = await Promise.all([fetchEdges(me.uid, "following").catch(() => [] as UserHit[]), fetchEdges(me.uid, "followers").catch(() => [] as UserHit[]), fetchTop("xp", 60).catch(() => [] as ScoreRow[])]);
  const mine = new Set(following.map((f) => f.uid));
  const pts = new Map<string, { u: UserHit; score: number; reason: string; r: number }>();
  const add = (u: UserHit, score: number, reason: string) => {
    if (!u?.uid || u.uid === me.uid || mine.has(u.uid) || !u.username) return;
    const cur = pts.get(u.uid);
    if (!cur) pts.set(u.uid, { u, score, reason, r: score });
    else { cur.score += score; if (score > cur.r) { cur.r = score; cur.reason = reason; } }
  };
  followers.forEach((u) => add(u, 1000, "Follows you"));
  const second = await Promise.all(following.slice(0, 6).map((f) => fetchEdges(f.uid, "following").then((l) => l.map((u) => ({ u, via: f.username }))).catch(() => [])));
  second.flat().forEach(({ u, via }) => add(u, 3, `Followed by @${via}`));
  top.forEach((r, i) => {
    const same = !!me.hall && r.hall === me.hall && (me.semester == null || r.semester === me.semester);
    add({ uid: r.uid, username: r.username }, (same ? 3 : 0) + (i < 15 ? 1 : 0), same ? `Same class: ${r.hall}` : "Top student");
  });
  return [...pts.values()].filter((p) => p.score > 0).sort((a, b) => b.score - a.score).slice(0, max).map((p) => ({ ...p.u, reason: p.reason }));
}