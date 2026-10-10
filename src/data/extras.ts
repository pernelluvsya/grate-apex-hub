// Extra study material for the HB1 semester 1 courses, taken from the old single-file hub:
//   glossary   ~600 terms per course (topic, term, definition)
//   quickref   comparison tables for things students mix up
//   formulas   key equations with a worked example
//   typein     questions where you type the answer (a number) instead of picking an option
//   cards      "reveal" study cards (written answers)
// The JSON files live in ./extras/<course>.json. require() is written out per course so the bundler can find each file.
export type GlossaryItem = { t: string; n: string; d: string };
export type QuickRef = { title: string; note: string; head: string[]; rows: string[][] };
export type Formula = { title: string; eq: string; worked: string; note: string };
import type { BankQ } from "../learning";
export type TypeInQ = { q: string; a: string; e: string; t: string; g: string; past: boolean };
export type StudyCard = { t: string; q: string; a: string; e: string; img?: string };
export type CourseExtrasData = { glossary: GlossaryItem[]; quickref: QuickRef[]; formulas: Formula[]; typein: TypeInQ[]; cards: StudyCard[] };

const LOADERS: Record<string, () => CourseExtrasData> = {
  biolchem: () => require("./extras/biolchem.json"),
  medgen: () => require("./extras/medgen.json"),
  compapp: () => require("./extras/compapp.json"),
  algebra: () => require("./extras/algebra.json"),
  stats: () => require("./extras/stats.json"),
  commskills: () => require("./extras/commskills.json"),
  bmc: () => require("./extras/bmc.json"),
  cellstruct: () => require("./extras/cellstruct.json"),
};
// Pictures used by study cards (file name -> bundled image).
export const EXTRA_IMAGES: Record<string, any> = {
  "bmc-essay-1.jpg": require("../../assets/extras/bmc-essay-1.jpg"),
};

const cache = new Map<string, CourseExtrasData | null>();
export function extrasFor(courseId: string): CourseExtrasData | null {
  if (cache.has(courseId)) return cache.get(courseId)!;
  const load = LOADERS[courseId];
  const d = load ? load() : null;
  cache.set(courseId, d);
  return d;
}

// ---- stable ids, so a type-in question can be bookmarked (⭐) like any quiz question ----
const fnvId = (s: string) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); };
export const typeinId = (courseId: string, q: TypeInQ) => "ti:" + fnvId(courseId + "|" + q.q + "|" + q.a);

// The same type-in questions in the shape the quiz screen understands (kind "input"), so starred ones can be played.
export function typeinBankFor(courseId: string, qs: TypeInQ[]): BankQ[] {
  return qs.map((x) => ({
    id: typeinId(courseId, x), q: x.q, o: [], a: -1, e: x.e, t: x.t, kind: "input" as const, ans: x.a,
    course: courseId, topic: x.t, set: x.g, diff: 2 as const, past: x.past, papers: x.past ? ["Past questions"] : [],
  }));
}

// ---- checking a typed answer (same rules as the old hub, plus ranges) ----
const normAns = (s: string) =>
  String(s).trim().toLowerCase().replace(/[\u2013\u2014]/g, "-").replace(/\s*\bto\b\s*/g, "-").replace(/\s+/g, "").replace(/\u00b1/g, "+-").replace(/%/g, "").replace(/,/g, "");
const isNum = (s: string) => /^-?\d+(\.\d+)?$/.test(s);
export function gradeTyped(user: string, correct: string): boolean {
  const u = normAns(user), c = normAns(correct);
  if (!u) return false;
  const ub = u.replace(/^\+/, ""), cb = c.replace(/^\+/, "");
  // an answer written as a range (6.775-6.785) accepts any number inside it, or the range itself
  const r = cb.match(/^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);
  if (r && isNum(ub)) { const lo = Math.min(+r[1], +r[2]), hi = Math.max(+r[1], +r[2]), v = parseFloat(ub); return v >= lo - 1e-9 && v <= hi + 1e-9; }
  if (isNum(ub) && isNum(cb)) { const cn = parseFloat(cb); return Math.abs(parseFloat(ub) - cn) <= Math.max(0.01, 0.005 * Math.abs(cn)); }
  return u === c;
}
