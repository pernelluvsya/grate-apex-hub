// Saves an unfinished quiz so a student can pick up where they left off.
// Stored with the same on-device storage as offline lessons (IndexedDB on the web / installed app,
// AsyncStorage on the phone). The questions themselves are saved too, because rounds are picked at
// random: resuming has to bring back the SAME questions, not a fresh set.
import type { BankQ } from "./learning";
import { getItem, setItem, delItem, keysWithPrefix } from "./store";

export interface QuizSessionState {
    primary: string;
    title: string;
    mode: string;
    feedback?: "instant" | "end";
    questions: BankQ[];
    selections: (number | string | null)[];
    locked: boolean[];
    currentIndex: number;
    timestamp: number;
}

export interface SavedSession {
    session: QuizSessionState;
    elapsed: number; // seconds since it was saved
}

const EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// A short fingerprint of the title, so "Anatomy · Practice" and "Lesson 3 · Practice" don't share a save.
const tag = (s: string) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); };
const keyFor = (primary: string, mode: string, title: string) => `quiz_session_${primary}_${mode}_${tag(title)}`;

export async function saveQuizSession(s: QuizSessionState): Promise<void> {
    await setItem(keyFor(s.primary, s.mode, s.title), s);
}

export async function clearQuizSession(primary: string, mode: string, title: string): Promise<void> {
    await delItem(keyFor(primary, mode, title));
}

// Returns the saved quiz, or null if there is none, it is too old, or it looks damaged.
export async function loadQuizSession(primary: string, mode: string, title: string): Promise<SavedSession | null> {
    const s = await getItem<QuizSessionState>(keyFor(primary, mode, title));
    if (!s || !Array.isArray(s.questions) || !Array.isArray(s.selections) || !Array.isArray(s.locked)) return null;
    const n = s.questions.length;
    if (n === 0 || s.selections.length !== n || s.locked.length !== n) { await clearQuizSession(primary, mode, title); return null; }
    const age = Date.now() - s.timestamp;
    if (!(age >= 0) || age > EXPIRY) { await clearQuizSession(primary, mode, title); return null; }
    return { session: s, elapsed: Math.floor(age / 1000) };
}

// Every unfinished quiz saved for a course (newest first), for the "Unfinished quizzes" list.
export async function listQuizSessions(primary: string): Promise<SavedSession[]> {
    const keys = await keysWithPrefix(`quiz_session_${primary}_`);
    const out: SavedSession[] = [];
    for (const k of keys) {
        const s = await getItem<QuizSessionState>(k);
        if (!s || s.primary !== primary) continue;
        const found = await loadQuizSession(s.primary, s.mode, s.title); // validates and expires
        if (found && answeredIn(found.session) > 0) out.push(found);
    }
    return out.sort((a, b) => b.session.timestamp - a.session.timestamp);
}

// How many questions the student has actually answered in a saved quiz.
export const answeredIn = (s: QuizSessionState) =>
    s.selections.filter((x, n) => x !== null && (s.locked[n] || s.feedback === "end")).length;