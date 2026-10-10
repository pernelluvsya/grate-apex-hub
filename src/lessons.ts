// Lessons live in Firestore (loaded with scripts/seed-content.mjs):
//   lessons/{id}        small: title, icon, summary, section titles, version "v"
//   lessonContent/{id}  the lesson body as blocks (see Block below)
//   lessonImages/{id}   one picture each: { mime, data (base64) }
// Everything we download is also saved on the phone, so a lesson you opened once
// still opens without internet. When the version "v" changes, the new copy is fetched.
import { getItem, setItem, hasKey } from "./store";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { hash } from "./learning";

// ---- the shape of a lesson ----
// Text with a little formatting inside it: <b> <i> <sub> <sup> and <term d="meaning">word</term>.
export type Rich = string;
export type Block =
  | { k: "p"; x: Rich; lede?: 1 }
  | { k: "h"; x: Rich; l: 3 | 4 }
  | { k: "ul"; items: Rich[]; ol?: 1 }
  | { k: "table"; head: Rich[]; rows: { c: Rich[] }[] }
  | { k: "term"; name: Rich; def: Rich }
  | { k: "box"; title: Rich; tone?: string; blocks: Block[] }
  | { k: "step"; n: string; title: Rich; tone?: string; tags?: string[]; blocks?: Block[] }
  | { k: "cards"; items: { title: Rich; blocks: Block[] }[] }
  | { k: "video"; url: string; title: Rich; desc: Rich; tag?: string }
  | { k: "fig"; svg?: string; img?: string; w?: number; h?: number; cap?: Rich; alt?: string };
export type Section = { id: string; title: Rich; kicker?: string; blocks: Block[] };
export type LessonMeta = {
  id: string; course: string; order: number; title: string; sub?: string; icon: string; summary: string; minutes: number;
  sections: { id: string; title: string }[]; v?: string;
  qids?: string[]; qcount?: number;   // quiz questions that belong to this lesson (ids from src/learning.ts)
  extras?: string[];                  // which of mnemonics / facts / steps this lesson has
};
// Extra study aids that come with some lessons.
export type Group = { h: Rich; lines: Rich[] };
export type Extras = { mnemonics?: Group[]; facts?: Group[]; steps?: { title: string; items: { t: Rich; d: Rich }[] } };
export type Lesson = { meta: LessonMeta; sections: Section[]; extras?: Extras; v?: string };

// Vocabulary for flashcards and the glossary: the lesson's term boxes, plus every underlined word
// that has a tap-for-meaning (some lessons use those instead of term boxes).
export type Term = { id: string; name: string; def: Rich };
export function termsOf(lesson: Lesson): Term[] {
  const out: Term[] = [], seen = new Set<string>();
  const add = (name: string, def: Rich) => {
    name = name.trim();
    const key = name.toLowerCase();
    if (name.length < 2 || seen.has(key)) return;
    seen.add(key);
    out.push({ id: lesson.meta.id + ":" + hash(key), name, def });
  };
  // 1) term boxes
  const boxes = (bs: Block[]) => {
    for (const b of bs) {
      if (b.k === "term") add(plain(b.name), b.def);
      else if (b.k === "box" || b.k === "step") boxes(b.blocks || []);
      else if (b.k === "cards") b.items.forEach((c) => boxes(c.blocks));
    }
  };
  lesson.sections.forEach((sec) => boxes(sec.blocks));
  // 2) underlined words with a meaning
  const inline = (v: unknown) => {
    if (typeof v === "string") {
      if (v.indexOf("<term") < 0) return;
      const re = /<term d="([^"]*)">(.*?)<\/term>/g; let m: RegExpExecArray | null;
      while ((m = re.exec(v))) add(plain(m[2]), m[1]);
    } else if (Array.isArray(v)) v.forEach(inline);
    else if (v && typeof v === "object") Object.values(v as object).forEach(inline);
  };
  lesson.sections.forEach((sec) => inline(sec.blocks));
  return out;
}

const PREVIEW = process.env.EXPO_PUBLIC_PREVIEW === "1";
const get = (k: string) => getItem(k);
const put = (k: string, v: unknown) => { setItem(k, v); };

// ---- the list of lessons ----
export async function fetchLessonList(): Promise<{ lessons: LessonMeta[]; offline: boolean }> {
  if (PREVIEW) { // developer preview only: reads a copy placed next to the page
    const r = await fetch("/preview-content/index.json"); return { lessons: await r.json(), offline: false };
  }
  try {
    const snap = await getDocs(collection(db, "lessons"));
    const lessons = snap.docs.map((d) => d.data() as LessonMeta).sort((a, b) => a.order - b.order);
    if (lessons.length) put("ga:lessons:list", lessons);
    return { lessons, offline: false };
  } catch (e) {
    const cached = await get("ga:lessons:list");
    if (cached) return { lessons: cached, offline: true };
    throw e;
  }
}

// ---- one lesson ----
export async function fetchLesson(meta: LessonMeta): Promise<Lesson> {
  if (PREVIEW) { const r = await fetch(`/preview-content/lessons/${meta.id}.json`); return await r.json(); }
  const key = "ga:lesson:" + meta.id;
  const cached = (await get(key)) as Lesson | null;
  if (cached && cached.v && cached.v === meta.v) return cached; // up to date
  try {
    const snap = await getDoc(doc(db, "lessonContent", meta.id));
    if (!snap.exists()) throw new Error("This lesson has not been published yet.");
    const data = snap.data() as { sections: Section[]; extras?: Extras; v?: string };
    const lesson: Lesson = { meta, sections: data.sections, extras: data.extras, v: data.v };
    put(key, lesson);
    return lesson;
  } catch (e) {
    if (cached) return cached; // offline: show the saved copy
    throw e;
  }
}

// ---- pictures ----
const mem = new Map<string, string>();
export async function fetchImage(name: string): Promise<string | null> {
  if (mem.has(name)) return mem.get(name)!;
  if (PREVIEW) { const uri = `/preview-content/images/${name}`; mem.set(name, uri); return uri; }
  const id = name.replace(/\.[a-z]+$/, "");
  const key = "ga:img:" + id;
  let rec = (await get(key)) as { mime: string; data: string } | null;
  if (!rec) {
    try {
      const snap = await getDoc(doc(db, "lessonImages", id));
      if (snap.exists()) { rec = snap.data() as { mime: string; data: string }; put(key, rec); }
    } catch { /* offline */ }
  }
  if (!rec) return null;
  const uri = `data:${rec.mime};base64,${rec.data}`;
  mem.set(name, uri);
  return uri;
}

// ---- saving a course for offline reading ----
// Lessons you open are saved automatically. This saves every lesson (and its pictures) of a course at once.
export async function savedLessonIds(metas: LessonMeta[]): Promise<Set<string>> {
  const out = new Set<string>();
  await Promise.all(metas.map(async (m) => { if (await hasKey("ga:lesson:" + m.id)) out.add(m.id); }));
  return out;
}
export async function downloadLessons(metas: LessonMeta[], onProgress: (done: number, total: number) => void): Promise<number> {
  let done = 0, failed = 0;
  onProgress(0, metas.length);
  for (const m of metas) { // one at a time, so a slow connection is not flooded
    try {
      const l = await fetchLesson(m);
      const names = new Set<string>();
      const scan = (v: unknown) => { if (Array.isArray(v)) v.forEach(scan); else if (v && typeof v === "object") { const o = v as any; if (o.k === "fig" && typeof o.img === "string") names.add(o.img); Object.values(o).forEach(scan); } };
      scan(l.sections);
      for (const n of names) await fetchImage(n);
    } catch { failed++; }
    onProgress(++done, metas.length);
  }
  return failed;
}

// ---- helpers ----
export const plain = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

export type Run = { t: string; b?: boolean; i?: boolean; sub?: boolean; sup?: boolean; term?: string };
const unesc = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
// Turn the mini-markup into pieces the screen can style.
export function parseRich(src: string): Run[] {
  const runs: Run[] = [];
  const st = { b: 0, i: 0, sub: 0, sup: 0 };
  let term: string | undefined;
  const re = /<(\/?)(b|i|sub|sup|term)((?:\s+d="[^"]*")?)>|([^<]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m[4] !== undefined) {
      const r: Run = { t: unesc(m[4]) };
      if (st.b) r.b = true; if (st.i) r.i = true; if (st.sub) r.sub = true; if (st.sup) r.sup = true; if (term) r.term = term;
      runs.push(r);
    } else {
      const close = m[1] === "/", tag = m[2];
      if (tag === "term") { if (close) term = undefined; else { const d = /d="([^"]*)"/.exec(m[3] || ""); term = d ? unesc(d[1]) : undefined; } }
      else (st as any)[tag] += close ? -1 : 1;
    }
  }
  return runs;
}
