import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "./firebase";

// Live XP battles. The server (/api/battle) is the referee: it picks questions, grades
// answers, holds the stakes and pays the winner. We just watch the battle document.
import { API_BASE as BASE } from "./apiBase";

export const STAKES = [10, 25, 50, 100]; // quick picks; any amount from MIN_STAKE to MAX_STAKE works
export const MIN_STAKE = 5, MAX_STAKE = 1000, MIN_N = 3, MAX_N = 20;
export const LOBBY_TTL = 10 * 60 * 1000, PRESENCE_TTL = 25000;
export type BQ = { id: string; q: string; o: string[] };
export type Battle = {
  id: string; players: [string, string]; challenger: string; names: Record<string, string>;
  stake: number; course: string; status: "invited" | "lobby" | "live" | "done" | "declined" | "cancelled";
  N: number; T: number; createdAt: number; startAt?: number; endedAt?: number;
  questions: BQ[]; qStart: number[]; scores: Record<string, number>;
  ans?: Record<string, Record<string, { ok: boolean; pts: number; ms: number }>>;
  reveal?: Record<string, { a: number; e: string }>;
  winner?: string | null;
  acceptedAt?: number; present?: Record<string, number>; // lobby: when each player last checked in
};

// How far the server's clock is from ours, so both players' timers agree.
let skew = 0;
export const serverNow = () => Date.now() + skew;

async function call(body: object): Promise<any> {
  const tok = await auth.currentUser?.getIdToken();
  if (!tok) throw new Error("Please log in first.");
  const t0 = Date.now();
  let r: Response;
  try { r = await fetch(`${BASE}/api/battle`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${tok}` }, body: JSON.stringify(body) }); }
  catch { throw new Error("Couldn't reach the server. Check your internet."); }
  let j: any = null;
  try { j = await r.json(); } catch { /* not deployed here */ }
  if (!j) throw new Error("Battles aren't available here yet.");
  if (!r.ok) throw new Error(j.error || "Something went wrong.");
  if (j.now) skew = j.now - (t0 + Date.now()) / 2;
  return j;
}

export const syncClock = () => call({ action: "time" }).catch(() => {});
export const createBattle = (opponent: string, stake: number, course: string, n: number): Promise<{ id: string }> => call({ action: "create", opponent, stake, course, n });
export const joinBattle = (id: string) => call({ action: "join", id });
export const leaveBattle = (id: string) => call({ action: "leave", id }).catch(() => {});
export const abortBattle = (id: string) => call({ action: "abort", id });
export const acceptBattle = (id: string) => call({ action: "accept", id });
export const declineBattle = (id: string) => call({ action: "decline", id });
export const cancelBattle = (id: string) => call({ action: "cancel", id });
export const answerBattle = (id: string, qi: number, pick: number): Promise<{ ok: boolean; pts: number; a: number; e: string }> => call({ action: "answer", id, qi, pick });
export const advanceBattle = (id: string, qi: number) => call({ action: "advance", id, qi });
export const settleBattle = (id: string) => call({ action: "settle", id });

export function watchMyBattles(uid: string, cb: (b: Battle[]) => void) {
  return onSnapshot(query(collection(db, "battles"), where("players", "array-contains", uid)),
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Battle)).sort((a, b) => b.createdAt - a.createdAt)), () => cb([]));
}
export function watchBattle(id: string, cb: (b: Battle | null) => void) {
  return onSnapshot(doc(db, "battles", id), (s) => cb(s.exists() ? ({ id: s.id, ...(s.data() as any) } as Battle) : null), () => cb(null));
}
export function watchLedger(uid: string, cb: (l: { net: number; wins?: number; losses?: number; draws?: number; played?: number }) => void) {
  return onSnapshot(doc(db, "battleLedger", uid), (s) => cb(s.exists() ? (s.data() as any) : { net: 0 }), () => cb({ net: 0 }));
}
