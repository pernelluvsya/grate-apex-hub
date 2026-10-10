// The list of courses. Who can see each course (hall + semester) is set in access.json,
// which the server also reads. If you change it, also update the course lists in
// firestore.rules (search "lessonOpen") so the database enforces the same thing. To add a new course: put its questions JSON in
// src/data/courses/ and add one entry here.
import ACCESS from "./access.json";
const A = ACCESS as Record<string, { halls: ("HB1" | "HB2")[]; semesters: (1 | 2)[] }>;
// kind "input" = type-the-answer question: o is [] and the expected answer is in ans.
export type Q = { q: string; o: string[]; a: number; e: string; t: string; p?: string[]; kind?: "input"; ans?: string };
export type QSet = { id: string; name: string; questions: Q[] };
export type CourseData = { id: string; name: string; sets: QSet[] };

export type Course = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  halls: ("HB1" | "HB2")[];
  semesters: (1 | 2)[];
  load: () => CourseData;
  // Optional friendly names for a course's past papers, keyed by the paper name used in the question data ("Past Questions 1").
  paperLabels?: Record<string, string>;
};

// require() is written out per course so the app bundler can find each file.
export const COURSES: Course[] = [
  { id: "biochemistry", name: "Biochemistry", icon: "🧪", desc: "Metabolism, enzymes, and the pathways that keep cells running.", halls: A.biochemistry.halls, semesters: A.biochemistry.semesters, load: () => require("./courses/biochemistry.json") },
  { id: "physiology", name: "Physiology", icon: "🫀", desc: "How the body's systems work, from single cells to whole organs.", halls: A.physiology.halls, semesters: A.physiology.semesters, load: () => require("./courses/physiology.json") },
  { id: "anatomy", name: "Anatomy", icon: "🩻", desc: "Structures, regions, and how the body is put together.", halls: A.anatomy.halls, semesters: A.anatomy.semesters, load: () => require("./courses/anatomy.json"),
    paperLabels: { "Past Questions 1": "Gross Anatomy", "Past Questions 2": "Micro Anatomy", "Past Questions 3": "Micro Anatomy", "Past Questions 4": "Reproduction & Development" } },
  { id: "behavioural", name: "Behavioural Science", icon: "🧠", desc: "Psychology, behaviour, and the mind behind medicine.", halls: A.behavioural.halls, semesters: A.behavioural.semesters, load: () => require("./courses/behavioural.json") },
  { id: "entomology", name: "Entomology", icon: "🦟", desc: "Insects, vectors, and the essentials of medical entomology.", halls: A.entomology.halls, semesters: A.entomology.semesters, load: () => require("./courses/entomology.json") },
  { id: "biolchem", name: "Biological Chemistry", icon: "⚗️", desc: "Elements, bonds, carbohydrates, nucleic acids, proteins, enzymes, metabolism and lipids.", halls: A.biolchem.halls, semesters: A.biolchem.semesters, load: () => require("./courses/biolchem.json") },
  { id: "medgen", name: "Basic Medical Genetics", icon: "🧬", desc: "Cells, chromosomes, inheritance, molecular genetics and gene regulation.", halls: A.medgen.halls, semesters: A.medgen.semesters, load: () => require("./courses/medgen.json") },
  { id: "compapp", name: "Computer Appreciation", icon: "💻", desc: "Excel and PowerPoint skills for coursework and presentations.", halls: A.compapp.halls, semesters: A.compapp.semesters, load: () => require("./courses/compapp.json") },
  { id: "algebra", name: "Algebra", icon: "➗", desc: "Sets, equations, logs, sequences, trigonometry, matrices, calculus.", halls: A.algebra.halls, semesters: A.algebra.semesters, load: () => require("./courses/algebra.json") },
  { id: "stats", name: "Statistical Methods", icon: "📊", desc: "Descriptive statistics, probability and distributions.", halls: A.stats.halls, semesters: A.stats.semesters, load: () => require("./courses/stats.json") },
  { id: "commskills", name: "Communication Skills", icon: "🗣️", desc: "Grammar, punctuation, concord, sentences and clear communication.", halls: A.commskills.halls, semesters: A.commskills.semesters, load: () => require("./courses/commskills.json") },
  { id: "bmc", name: "Basic Medical Chemistry", icon: "🧫", desc: "Organic chemistry for medicine: amines, alcohols, acids, aromatics, alkenes.", halls: A.bmc.halls, semesters: A.bmc.semesters, load: () => require("./courses/bmc.json") },
  { id: "cellstruct", name: "Cell Structure", icon: "🔬", desc: "Microscopy, prokaryotes vs eukaryotes, organelles and the plasma membrane.", halls: A.cellstruct.halls, semesters: A.cellstruct.semesters, load: () => require("./courses/cellstruct.json") },
];

// Who sees what: your own hall and semester. HB2, HB3 and MB1-MB3 students can also open all HB1 and HB2 courses
// (they can always go back for revision); HB1 students only see their own semester.
const ADVANCED = ["HB2", "HB3", "MB1", "MB2", "MB3"]; // these classes can open every HB1 and HB2 course
export function canSee(c: { halls: string[]; semesters: number[] }, hall?: string, semester?: number) {
  if (!hall) return true;
  if (ADVANCED.includes(hall) && (c.halls.includes("HB1") || c.halls.includes("HB2"))) return true;
  return c.halls.includes(hall) && (!semester || c.semesters.includes(semester));
}
// Your own class's courses only (what shows on your Study page).
export function coursesFor(hall?: string, semester?: number) {
  return COURSES.filter((c) => !hall || (c.halls.includes(hall as any) && (!semester || c.semesters.includes(semester as any))));
}
// Courses you may open but that aren't your own class (HB1 material for HB2 students).
// The Study page keeps these behind a button.
export function extraCoursesFor(hall?: string, semester?: number) {
  const own = new Set(coursesFor(hall, semester).map((c) => c.id));
  return COURSES.filter((c) => canSee(c, hall, semester) && !own.has(c.id));
}
// Everything this student may open: their own class plus the revision courses.
export function accessibleCourses(hall?: string, semester?: number) {
  return COURSES.filter((c) => canSee(c, hall, semester));
}
