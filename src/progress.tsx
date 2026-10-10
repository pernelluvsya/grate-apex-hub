import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth, Profile } from "./auth";
import { postActivity } from "./social";
import { BankQ, Card, TopicStats, afterAnswer } from "./learning";
import { TermCard, Rating, schedule, norm, LEGACY_INTERVALS } from "./srs";

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

// ---- The shape of a student's saved progress ----
export type SubjectStats = { answered: number; correct: number; quizzes: number; best: number; xp?: number };
// A flashcard's saved state (Anki-style scheduling, see src/srs.ts).
export type { TermCard };
export const TERM_INTERVALS = LEGACY_INTERVALS; // the old fixed schedule, kept for older saved cards

// Pre-test / post-test for one course: how many right out of how many, and which questions the pre-test used.
export type TestRec = { pre?: { c: number; t: number; at: string; ids: string[] }; post?: { c: number; t: number; at: string } };
export type Progress = {
  xp: number;
  days: Record<string, number>;          // "2026-10-04" -> questions answered that day
  subjects: Record<string, SubjectStats>; // per course
  updatedAt: number;
  // ---- learning engine ----
  cards: Record<string, Card>;           // questions to revisit (spaced repetition)
  seen: Record<string, string[]>;        // course -> ids of questions answered at least once
  topics: TopicStats;                    // course -> topic -> [answered, correct]
  tests: Record<string, TestRec>;        // course -> pre/post test
  diff: Record<string, number>;          // course -> adaptive level 1..3
  lessons: Record<string, number>;       // lesson id -> how many sections finished
  terms: Record<string, TermCard>;       // flashcards: "lessonId:termhash" -> spaced-repetition state
  termDays: Record<string, number>;      // flashcards answered per day (feeds the review calendar)
  examDate?: string;                     // "2026-12-10"
  stars: Record<string, { on: boolean; u: number }>; // bookmarked questions: id -> starred or not (un-starred entries are kept so the change syncs to other devices)
  resetAt?: number;                      // set when the student clears their data, so older copies on other devices don't bring it back
};
const blank = (): Progress => ({ xp: 0, days: {}, subjects: {}, updatedAt: 0, cards: {}, seen: {}, topics: {}, tests: {}, diff: {}, lessons: {}, terms: {}, termDays: {}, stars: {} });
const fill = (p: any): Progress => ({ ...blank(), ...p });

export type RoundMode = "normal" | "review" | "adaptive" | "weak" | "pre" | "post";
export type RoundInfo = {
  pre?: { c: number; t: number };
  post?: { c: number; t: number; preC: number; preT: number };
  diff?: { from: number; to: number };
  review?: { fixed: number; still: number };
  newCards: number;
};

// ---- Rules copied from the old web hub ----
const RANKS: [number, string][] = [[0, "Fresher"], [3, "Riser"], [6, "Scholar"], [10, "Sharp"], [16, "Elite"], [25, "Apex Scholar"], [40, "Apex"], [70, "Master"], [100, "Grandmaster"], [200, "Endless"], [300, "Paragon"], [400, "Ultimate"], [500, "Immortal"]];
const XP_PER_LEVEL = 150;

export function rankFor(xp: number) {
  const level = 1 + Math.floor(xp / XP_PER_LEVEL);
  let title = RANKS[0][1];
  for (const [min, name] of RANKS) if (level >= min) title = name;
  const into = xp - (level - 1) * XP_PER_LEVEL;
  return { level, title, into, need: XP_PER_LEVEL, pct: Math.round((into / XP_PER_LEVEL) * 100) };
}

// Where the student sits on the rank ladder, for the Home rank card. The NEXT rank's name is never revealed, only how much XP is left.
export function rankProgress(xp: number) {
  const r = rankFor(xp);
  const next = RANKS.find(([min]) => min > r.level);
  const xpToNextRank = next ? Math.max(0, (next[0] - 1) * XP_PER_LEVEL - xp) : null;
  const span = next ? (next[0] - 1) * XP_PER_LEVEL - ([...RANKS].reverse().find(([min]) => min <= r.level)![0] - 1) * XP_PER_LEVEL : 0;
  const percentToNextRank = next ? Math.min(100, Math.max(0, Math.round(100 - (xpToNextRank! / span) * 100))) : 100;
  return { ...r, xpToNextRank, percentToNextRank, isTopRank: !next, xpToNextLevel: r.need - r.into };
}

const pad = (n: number) => String(n).padStart(2, "0");
const dayStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => dayStr(new Date());

export function streakOf(days: Record<string, number>) {
  const d = new Date();
  if (!days[dayStr(d)]) d.setDate(d.getDate() - 1); // today not studied yet: streak still alive from yesterday
  let s = 0;
  while (days[dayStr(d)]) { s++; d.setDate(d.getDate() - 1); }
  return s;
}

// XP rule from the old hub: +5 per correct, -2 per wrong, +15 for finishing, +40 for a perfect score.
export function xpForQuiz(correct: number, total: number) {
  const wrong = total - correct;
  return Math.max(0, correct * 5 - wrong * 2 + 15 + (correct === total ? 40 : 0));
}

// When this device and the cloud disagree, keep the larger value of everything.
function merge(a: Progress, b: Progress): Progress {
  // If one copy was cleared after the other was last used, the cleared copy wins outright.
  const ra = a.resetAt || 0, rb = b.resetAt || 0;
  if (ra > (b.updatedAt || 0) && ra >= rb) return { ...a, updatedAt: Date.now() };
  if (rb > (a.updatedAt || 0) && rb > ra) return { ...b, updatedAt: Date.now() };
  const out = blank();
  out.xp = Math.max(a.xp, b.xp);
  const dayKeys = new Set([...Object.keys(a.days), ...Object.keys(b.days)]);
  dayKeys.forEach((k) => (out.days[k] = Math.max(a.days[k] || 0, b.days[k] || 0)));
  const subj = new Set([...Object.keys(a.subjects), ...Object.keys(b.subjects)]);
  subj.forEach((k) => {
    const x = a.subjects[k], y = b.subjects[k];
    out.subjects[k] = {
      answered: Math.max(x?.answered || 0, y?.answered || 0),
      correct: Math.max(x?.correct || 0, y?.correct || 0),
      quizzes: Math.max(x?.quizzes || 0, y?.quizzes || 0),
      best: Math.max(x?.best || 0, y?.best || 0),
      xp: Math.max(x?.xp || 0, y?.xp || 0),
    };
  });
  // learning engine
  const ids = new Set([...Object.keys(a.cards), ...Object.keys(b.cards)]);
  ids.forEach((id) => { const x = a.cards[id], y = b.cards[id]; out.cards[id] = !x ? y : !y ? x : (y.u > x.u ? y : x); });
  new Set([...Object.keys(a.stars || {}), ...Object.keys(b.stars || {})]).forEach((id) => { const x = a.stars?.[id], y = b.stars?.[id]; out.stars[id] = !x ? y : !y ? x : (y.u > x.u ? y : x); }); // newest choice wins
  new Set([...Object.keys(a.seen), ...Object.keys(b.seen)]).forEach((k) => { out.seen[k] = Array.from(new Set([...(a.seen[k] || []), ...(b.seen[k] || [])])); });
  new Set([...Object.keys(a.topics), ...Object.keys(b.topics)]).forEach((k) => {
    out.topics[k] = {};
    new Set([...Object.keys(a.topics[k] || {}), ...Object.keys(b.topics[k] || {})]).forEach((t) => {
      const x = a.topics[k]?.[t] || [0, 0], y = b.topics[k]?.[t] || [0, 0];
      out.topics[k][t] = [Math.max(x[0], y[0]), Math.max(x[1], y[1])];
    });
  });
  new Set([...Object.keys(a.tests), ...Object.keys(b.tests)]).forEach((k) => {
    const x = a.tests[k], y = b.tests[k];
    if (!x || !y) { out.tests[k] = (x || y) as TestRec; return; }
    const xa = x.pre?.at ?? "", ya = y.pre?.at ?? "";
    out.tests[k] = xa !== ya ? (xa > ya ? x : y) : (y.post && !x.post ? y : x); // a newer pre-test starts a new cycle
  });
  const tk = new Set([...Object.keys(a.terms), ...Object.keys(b.terms)]);
  tk.forEach((id) => { const x = a.terms[id], y = b.terms[id]; out.terms[id] = !x ? y : !y ? x : (y.u > x.u ? y : x); });
  new Set([...Object.keys(a.termDays || {}), ...Object.keys(b.termDays || {})]).forEach((k) => { out.termDays[k] = Math.max(a.termDays?.[k] || 0, b.termDays?.[k] || 0); });
  const newer = a.updatedAt >= b.updatedAt ? a : b;
  out.diff = { ...(newer === a ? b.diff : a.diff), ...newer.diff };
  out.examDate = newer.examDate;
  new Set([...Object.keys(a.lessons), ...Object.keys(b.lessons)]).forEach((k) => { out.lessons[k] = Math.max(a.lessons[k] || 0, b.lessons[k] || 0); });
  if (ra || rb) out.resetAt = Math.max(ra, rb);
  out.updatedAt = Date.now();
  return out;
}

// The public leaderboard entry (collection "scores"). It is a summary of private
// progress: anyone signed in can read it, only the owner can write it.
export function buildScore(p: Progress, profile: Profile, net = 0) {
  const total = Math.max(0, p.xp + net);
  const r = rankFor(total);
  const subs = Object.values(p.subjects);
  const answered = subs.reduce((n, x) => n + x.answered, 0);
  const correct = subs.reduce((n, x) => n + x.correct, 0);
  const courseXp: Record<string, number> = {};
  Object.entries(p.subjects).forEach(([k, v]) => { if (v.xp) courseXp[k] = v.xp; });
  return {
    username: profile.username,
    xp: Math.round(total),
    level: r.level,
    title: r.title,
    streak: streakOf(p.days),
    answered,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
    hall: profile.hall ?? "",
    semester: profile.semester ?? 0,
    courseXp,
    updatedAt: serverTimestamp(),
  };
}

type Ctx = {
  progress: Progress;
  battleNet: number;
  streak: number;
  recordRound: (answers: { q: BankQ; ok: boolean }[], mode: RoundMode, primary: string, xpOverride?: number) => { xp: number; info: RoundInfo };
  setExamDate: (d: string | null) => void;
  markLesson: (id: string, sectionsDone: number) => void;
  toggleStar: (id: string) => void;
  gradeTerm: (id: string, rating: Rating) => void;
  resetProgress: () => Promise<void>;
  syncState: "idle" | "syncing" | "synced" | "offline";
};
export const PCtx = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const profileRef = useRef<Profile | null>(null);
  profileRef.current = profile;
  const [progress, setProgress] = useState<Progress>(blank());
  const [syncState, setSyncState] = useState<Ctx["syncState"]>("idle");
  const loaded = useRef(false);
  // XP won or lost in battles. Kept by the server in "battleLedger" and added on top of earned XP.
  const [net, setNet] = useState(0);
  const netRef = useRef(0); netRef.current = net;
  useEffect(() => {
    setNet(0);
    if (!user) return;
    return onSnapshot(doc(db, "battleLedger", user.uid), (s) => setNet(s.exists() ? Number(s.data().net) || 0 : 0), () => { });
  }, [user?.uid]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key = user ? `progress:${user.uid}` : null;

  // On login: load this device's copy, then merge with the cloud copy.
  useEffect(() => {
    loaded.current = false;
    if (!user || !key) { setProgress(blank()); return; }
    let cancelled = false;
    (async () => {
      let local = blank();
      try { const raw = await AsyncStorage.getItem(key); if (raw) local = fill(JSON.parse(raw)); } catch { }
      if (cancelled) return;
      setProgress(local);
      setSyncState("syncing");
      try {
        const snap = await getDoc(doc(db, "progress", user.uid));
        if (cancelled) return;
        const merged = snap.exists() ? merge(local, fill(snap.data())) : local;
        setProgress(merged);
        try { await AsyncStorage.setItem(key, JSON.stringify(merged)); } catch { }
        await setDoc(doc(db, "progress", user.uid), { ...merged, savedAt: serverTimestamp() });
        if (profileRef.current) await setDoc(doc(db, "scores", user.uid), buildScore(merged, profileRef.current, netRef.current));
        setSyncState("synced");
      } catch { setSyncState("offline"); }
      loaded.current = true;
    })();
    return () => { cancelled = true; };
  }, [user, key]);

  // Make sure every student has a leaderboard entry (even before their first
  // quiz), and refresh it if they change hall or semester.
  useEffect(() => {
    if (!user || !profile || !loaded.current) return;
    setDoc(doc(db, "scores", user.uid), buildScore(progress, profile, net)).catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile?.username, profile?.hall, profile?.semester, syncState === "synced", net]);

  const persist = useCallback((p: Progress) => {
    if (!user || !key) return;
    AsyncStorage.setItem(key, JSON.stringify(p)).catch(() => { });
    if (timer.current) clearTimeout(timer.current);
    // Wait 2 seconds after the last change, then upload once.
    timer.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, "progress", user.uid), { ...p, savedAt: serverTimestamp() });
        if (profileRef.current) await setDoc(doc(db, "scores", user.uid), buildScore(p, profileRef.current, netRef.current));
        setSyncState("synced");
      }
      catch { setSyncState("offline"); }
    }, 2000);
  }, [user, key]);

  const setExamDate = (d: string | null) => {
    const next: Progress = { ...progress, examDate: d ?? undefined, updatedAt: Date.now() };
    if (!d) delete next.examDate;
    setProgress(next);
    persist(next);
  };

  // Remember how far the student got in a lesson (never goes backwards).
  const markLesson = (id: string, sectionsDone: number) => {
    if ((progress.lessons[id] || 0) >= sectionsDone) return;
    const next: Progress = { ...progress, lessons: { ...progress.lessons, [id]: sectionsDone }, updatedAt: Date.now() };
    setProgress(next);
    persist(next);
  };

  // Bookmark / un-bookmark a question (the ⭐ in a quiz). Shows up in the course's Starred round.
  const toggleStar = (id: string) => {
    const on = !progress.stars?.[id]?.on;
    const next: Progress = { ...progress, stars: { ...(progress.stars || {}), [id]: { on, u: Date.now() } }, updatedAt: Date.now() };
    setProgress(next);
    persist(next);
  };

  // Flashcards, the way Anki does it: Again / Hard / Good / Easy move the card through learning steps,
  // then to longer and longer review intervals (src/srs.ts).
  const gradeTerm = (id: string, rating: Rating) => {
    const t = todayStr(), now = Date.now();
    const card = schedule(norm(progress.terms[id]), rating, now);
    const next: Progress = { ...progress, terms: { ...progress.terms, [id]: card }, termDays: { ...progress.termDays, [t]: (progress.termDays?.[t] || 0) + 1 }, updatedAt: now };
    setProgress(next);
    persist(next);
  };

  // One finished round -> update XP, subjects, review cards, topics, tests and difficulty together.
  const recordRound: Ctx["recordRound"] = (answersIn, mode, primary, xpOverride) => {
    const seenIn = new Set<string>();
    const answers = answersIn.filter((a) => (seenIn.has(a.q.id) ? false : (seenIn.add(a.q.id), true)));
    const total = answers.length;
    const correct = answers.filter((a) => a.ok).length;
    const xp = xpOverride ?? xpForQuiz(correct, total);
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const t = todayStr(), now = Date.now();
    const info: RoundInfo = { newCards: 0 };

    const subjects = { ...progress.subjects };
    const cards = { ...progress.cards };
    const seen: Record<string, string[]> = { ...progress.seen };
    const topics: TopicStats = { ...progress.topics };
    let fixed = 0, still = 0;

    const byCourse: Record<string, { q: BankQ; ok: boolean }[]> = {};
    answers.forEach((a) => (byCourse[a.q.course] ||= []).push(a));
    Object.entries(byCourse).forEach(([cid, list]) => {
      const old = subjects[cid] || { answered: 0, correct: 0, quizzes: 0, best: 0 };
      const isPrimary = cid === primary;
      subjects[cid] = {
        answered: old.answered + list.length,
        correct: old.correct + list.filter((a) => a.ok).length,
        quizzes: old.quizzes + (isPrimary ? 1 : 0),
        best: isPrimary ? Math.max(old.best, pct) : old.best,
        xp: (old.xp || 0) + (isPrimary ? xp : 0),
      };
      const seenSet = new Set(seen[cid] || []);
      const tp = { ...(topics[cid] || {}) };
      list.forEach(({ q, ok }) => {
        seenSet.add(q.id);
        const [an, co] = tp[q.topic] || [0, 0];
        tp[q.topic] = [an + 1, co + (ok ? 1 : 0)];
        const before = cards[q.id];
        const after = afterAnswer(before, cid, ok, t, now);
        if (after) cards[q.id] = after;
        if (!before && after) info.newCards++;
        if (before && !before.g && before.d <= t) { if (ok) fixed++; else still++; }
      });
      seen[cid] = Array.from(seenSet);
      topics[cid] = tp;
    });
    if (mode === "review") info.review = { fixed, still };

    const tests = { ...progress.tests };
    const diff = { ...progress.diff };
    if (mode === "pre") {
      tests[primary] = { pre: { c: correct, t: total, at: t, ids: answers.map((a) => a.q.id) } };
      info.pre = { c: correct, t: total };
    } else if (mode === "post") {
      const pre = tests[primary]?.pre;
      if (pre) {
        tests[primary] = { pre, post: { c: correct, t: total, at: t } };
        info.post = { c: correct, t: total, preC: pre.c, preT: pre.t };
      }
    } else if (mode === "adaptive") {
      const from = diff[primary] ?? 2;
      const to = pct >= 80 ? Math.min(3, from + 1) : pct < 50 ? Math.max(1, from - 1) : from;
      diff[primary] = to;
      info.diff = { from, to };
    }

    const next: Progress = {
      ...progress,
      xp: progress.xp + xp,
      days: { ...progress.days, [t]: (progress.days[t] || 0) + total },
      subjects, cards, seen, topics, tests, diff,
      updatedAt: now,
    };
    setProgress(next);
    persist(next);

    // Tell friends' feeds what happened (fire-and-forget).
    const prof = profileRef.current;
    if (prof && user) {
      const before = rankFor(progress.xp), after = rankFor(next.xp);
      const oldStreak = streakOf(progress.days), newStreak = streakOf(next.days);
      // Individual quiz / test scores stay private: only milestones (level-ups, streaks) go to the feed.
      if (after.level > before.level) postActivity(user.uid, prof.username, "level", { level: after.level, title: after.title });
      if (newStreak > oldStreak && STREAK_MILESTONES.includes(newStreak)) postActivity(user.uid, prof.username, "streak", { streak: newStreak });
    }
    return { xp, info };
  };

  // Wipe all study progress on this device AND in the cloud (used by "Clear my data").
  const resetProgress = async () => {
    if (!user || !key) return;
    if (timer.current) clearTimeout(timer.current); // don't let a queued upload put old progress back
    const now = Date.now();
    const next: Progress = { ...blank(), updatedAt: now, resetAt: now };
    setProgress(next);
    await AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => { });
    await setDoc(doc(db, "progress", user.uid), { ...next, savedAt: serverTimestamp() });
    if (profileRef.current) await setDoc(doc(db, "scores", user.uid), buildScore(next, profileRef.current, netRef.current)).catch(() => { });
    setSyncState("synced");
  };

  // What the rest of the app sees: earned XP plus battle winnings (or minus losses).
  const view = useMemo(() => (net ? { ...progress, xp: Math.max(0, progress.xp + net) } : progress), [progress, net]);
  return <PCtx.Provider value={{ progress: view, battleNet: net, streak: streakOf(progress.days), recordRound, setExamDate, markLesson, toggleStar, gradeTerm, resetProgress, syncState }}>{children}</PCtx.Provider>;
}

export function useProgress() {
  const v = useContext(PCtx);
  if (!v) throw new Error("useProgress must be used inside <ProgressProvider>");
  return v;
}