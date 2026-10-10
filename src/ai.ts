import { auth } from "./firebase";
import { BankQ, hash } from "./learning";
import { LessonMeta } from "./lessons";

// Talks to the server function in /api/ai (it holds the AI key; the app never sees it).
import { API_BASE as BASE } from "./apiBase";

export type ChatMsg = { role: "user" | "assistant"; content: string };
export type AiQ = { q: string; o: string[]; a: number; e: string };

async function call(body: object): Promise<any> {
  const tok = await auth.currentUser?.getIdToken();
  if (!tok) throw new Error("Please log in first.");
  let r: Response;
  try {
    r = await fetch(`${BASE}/api/ai`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${tok}` }, body: JSON.stringify(body) });
  } catch { throw new Error("Couldn't reach the AI. Check your internet."); }
  let j: any = null;
  try { j = await r.json(); } catch { /* not JSON: the function isn't deployed here */ }
  if (!j) throw new Error("The AI isn't available here yet.");
  if (!r.ok) throw Object.assign(new Error(j.error || "The AI is unavailable right now."), { left: j.left });
  return j;
}

export const askTutor = (lessonId: string, messages: ChatMsg[]): Promise<{ reply: string; left: number }> =>
  call({ mode: "chat", lessonId, messages });

export async function aiQuestions(lessonId: string, n = 5, topic?: string): Promise<{ questions: AiQ[]; left: number }> {
  return call({ mode: "questions", lessonId, n, topic });
}

export type AiCard = { f: string; b: string };
export const aiFlashcards = (lessonId: string, section: string): Promise<{ cards: AiCard[]; left: number }> =>
  call({ mode: "flashcards", lessonId, section }).catch((e) => {
    // an older deployed /api/ai doesn't know the flashcards mode and answers "Bad request."
    if (e?.message === "Bad request.") throw new Error("The server is running an old version. Push the latest code to GitHub and let Vercel redeploy, then try again.");
    throw e;
  });

// Turn AI questions into the same shape as our own question bank.
export const toBank = (qs: AiQ[], m: LessonMeta): BankQ[] =>
  qs.map((x) => ({ ...x, t: m.title, id: "ai:" + hash(x.q + x.o.join("|")), course: m.course, topic: m.title, set: "ai", diff: 2 as const }));
