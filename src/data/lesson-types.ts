// The one type system for GRATEAPEX course content.
//
//   Subject → Course → Topic → Lesson → Concept
//
//   Subject  Anatomy / Biochemistry / Physiology
//   Course   a lecture course inside a subject (content/<SUBJECT>/ today)
//   Topic    one lecture topic — one ZIP of lecture material
//   Lesson   an academically meaningful part of a topic
//   Concept  the unit the learning engine tracks and schedules
//
// Every lesson has three layers:
//   1. interactive — learn by answering: retrieval BEFORE explanation
//                    ('learn' cards, 'ask' checkpoints, 'recall' prompts)
//   2. reading     — the structured revision summary (chunks, high-yield
//                    points, common confusions, key points)
//   3. quiz        — drawn from the topic's question bank by
//                    data/learning/selection.ts (never a fixed list)
//
// Everything carries source references back to the files in /content,
// so any statement can be traced to a slide or page. Lecture files
// define WHAT is taught; reference textbooks (role 'reference') only
// clarify or correct within that scope, and are labelled.
import type { Question } from '@/data/questions';

export type SubjectId = 'anatomy' | 'biochemistry' | 'physiology';

// Shown to learners as Easy / Medium / Hard (see difficultyLabel).
// Difficulty is retrieval/reasoning demand, not obscurity:
//   introductory — recognise a directly taught relationship
//   intermediate — retrieve and connect two facts
//   advanced     — apply several ideas or tell close mechanisms apart
export type DifficultyLevel = 'introductory' | 'intermediate' | 'advanced';

export type ContentCategory =
  | 'core'
  | 'important-detail'
  | 'supporting'
  | 'clinical'
  | 'terminology'
  | 'visual-process'
  | 'potentially-incidental';

// needs-review: unconfirmed material (e.g. an image added to a deck after
// the lecture). Shown, but never quizzed or scheduled until confirmed.
export type ContentRelevance = 'core' | 'supporting' | 'needs-review';

// ─── Sources ────────────────────────────────────────────────────────

export type SourceReference = {
  sourceId: string;
  slide?: number;
  page?: number;
  visual?: boolean; // the information is in a diagram/image, not text
  note?: string;
};

export type SourceFormat = 'ppt' | 'pptx' | 'ppsx' | 'pptm' | 'pdf' | 'docx' | 'png';

export type SourceFile = {
  id: string;
  path: string; // relative to the project root (the ZIP for zipped files)
  member?: string; // the file inside the ZIP, when zipped
  format: SourceFormat;
  topicId: string; // '' for a reference used across topics
  subjectFolder: string;
  // lecture     — lecturer material: defines what is taught
  // export      — an exact copy of another file (see duplicateOf)
  // supplementary — lecturer-provided extra material
  // study-aid   — a study guide / practice sheet / AI summary found with
  //               the lecture files. Not lecturer content: never used as
  //               a source of facts for lessons or questions
  // reference   — an authoritative textbook, used only to explain or
  //               correct lecture material (never to add syllabus topics)
  role: 'lecture' | 'export' | 'supplementary' | 'study-aid' | 'reference';
  title?: string;
  shortName?: string; // e.g. "Lehninger" — used in textbook citations
  author?: string;
  year?: string;
  slideCount?: number;
  pageCount?: number;
  // text   — text extracted (slide/page numbers are reliable)
  // partial — some units are images only
  // image-only — no extractable text (needs OCR / manual transcription)
  // empty  — no usable content (lock file, resource fork, …)
  // unextracted — not processed (e.g. a 1.5 GB video deck)
  textStatus?: 'text' | 'partial' | 'image-only' | 'empty' | 'unextracted';
  // Set when this file is an exact export or copy of another file.
  // References to the original automatically cover the copy.
  duplicateOf?: string;
  // Older/newer version of the same lecture (not identical).
  versionOf?: string;
  // Material in the file that was added after the lecturer's version
  // (speaker notes, comments, pasted images). Kept, but labelled.
  annotations?: SourceAnnotation[];
  note?: string;
};

export type SourceAnnotation = {
  slide: number;
  kind: 'speaker-note' | 'comment' | 'added-image';
  author?: string;
  summary: string;
};

// A section of source material for a topic that has no lessons yet.
export type TopicOutlineSection = {
  title: string;
  points: string[];
  sourceRefs: SourceReference[];
};

// ─── Curriculum registry ────────────────────────────────────────────

export type CourseInfo = {
  id: string;
  subject: SubjectId;
  title: string;
  description: string;
  folder: string; // content/<folder>
};

// published            — lessons + question bank exist (data/topics/)
// source-only          — material inventoried; lessons not built yet
// needs-classification — subject/topic must be confirmed first
// empty                — the supplied ZIP holds no usable lecture file
export type TopicStatus = 'published' | 'source-only' | 'needs-classification' | 'empty';

export type ContentTopic = {
  id: string;
  title: string;
  subject: SubjectId | null; // null until the subject is confirmed
  courseId: string | null;
  folderSubject: string; // the folder name in /content
  zip?: string; // the ZIP this topic was supplied as
  sourceFileIds: string[];
  status: TopicStatus;
  emoji?: string;
  outline?: TopicOutlineSection[];
  note?: string;
};

// Where two supplied sources (or two parts of one source) disagree.
// The lecture statements are always kept (traceability). When the
// reference textbook settles the point, `resolution` records what it
// establishes and where; lessons then teach the resolved version and
// show the lecture wording in a "clarified" note. Anything the textbook
// cannot settle stays 'unresolved' (a verification item, never quizzed).
export type SourceDiscrepancy = {
  id: string;
  concept: string;
  statements: { text: string; sourceRefs: SourceReference[] }[];
  status: 'unresolved' | 'resolved';
  resolution?: { text: string; sourceRefs: SourceReference[] };
  note?: string;
};

// Knowledge that lives in a diagram, written out so lessons and
// questions can use it without the image.
export type SourceDiagram = {
  id: string;
  title: string;
  sourceRefs: SourceReference[];
  shows: string[];
  note?: string;
};

// ─── Lessons ────────────────────────────────────────────────────────

export type ConceptCoverage = {
  id: string; // unique within the topic — stable, used by the memory model
  name: string; // unique within the topic; shown in Review and Results
  category: ContentCategory;
  relevance: ContentRelevance;
  difficulty?: DifficultyLevel;
  sourceRefs: SourceReference[];
  verificationNote?: string;
};

export type LessonStep = {
  label: string;
  detail?: string;
};

export type LessonNote = {
  // check         — sources disagree and it is NOT settled; confirm
  //                 with the lecturer
  // clarified     — the slides disagree or are unclear; the reference
  //                 textbook settles it (lecture wording is quoted)
  // textbook      — a short explanation from the reference textbook,
  //                 filling a gap in the lecture's own explanation
  // annotation    — from notes/comments/images added to a deck later
  // supplementary — not in the supplied material at all
  // lecturer      — a point the lecturer stresses / a lecture-specific
  //                 framing worth knowing for this course's exams
  kind: 'check' | 'clarified' | 'textbook' | 'annotation' | 'supplementary' | 'lecturer';
  text: string;
};

// A small comparison table (e.g. synthesis vs β-oxidation).
export type LessonTable = {
  columns: string[];
  rows: string[][];
};

export type LessonTerm = {
  term: string;
  meaning: string;
};

// What a reading section is about — drives its icon and accent only.
export type LessonChunkKind =
  | 'overview'
  | 'definitions'
  | 'pathway'
  | 'mechanism'
  | 'structure'
  | 'regulation'
  | 'comparison'
  | 'clinical'
  | 'classification';

export type LessonChunk = {
  title: string;
  kind?: LessonChunkKind;
  // 'textbook' = the whole section explains the lecture using the
  // reference textbook (shown with a label). Default: lecture material.
  origin?: 'lecture' | 'textbook';
  paragraphs?: string[];
  steps?: LessonStep[];
  terms?: LessonTerm[]; // important enzymes / molecules / structures
  table?: LessonTable;
  keyPoints?: string[];
  sourceRefs?: SourceReference[]; // lecture and/or textbook references
  notes?: LessonNote[];
};

// "Students often think X — actually Y."
export type LessonConfusion = {
  confusion: string;
  clarification: string;
};

// Layer 1 — learn by answering.
//   learn  — a short teaching card
//   ask    — a retrieval checkpoint: the learner answers BEFORE the
//            explanation; `reveal` adds teaching after the answer
//   recall — open recall: the learner retrieves from memory, then
//            compares with the model answer and rates themselves
export type InteractiveStep =
  | {
      type: 'learn';
      title: string;
      body: string[];
      steps?: LessonStep[];
      terms?: LessonTerm[];
      keyPoint?: string;
      sourceRefs?: SourceReference[];
    }
  | { type: 'ask'; question: Question; reveal?: string[] }
  | { type: 'recall'; recall: RecallPrompt };

export type RecallPrompt = {
  id: string; // `${topicId}:${id}` once built — unique like question IDs
  prompt: string;
  answer: string[]; // the model answer, point by point
  concept: string; // concept NAME
  conceptId?: string;
  topicId?: string;
  lessonId?: string;
  sourceRefs?: SourceReference[];
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  xp: number; // completion XP (see data/learning/xp-rules.ts for limits)
  concepts: ConceptCoverage[];
  sourceRefs: SourceReference[];
  estimatedMinutes?: number;
  objectives?: string[]; // "What you'll learn" — short orientation
  interactive?: InteractiveStep[]; // layer 1
  chunks: LessonChunk[]; // layer 2: the reading sections, in order
  summary?: string[]; // layer 2: "Key points to remember"
  highYield?: string[]; // layer 2: high-yield points for revision
  confusions?: LessonConfusion[]; // layer 2: common confusions
};

// A published topic: lessons + question bank, built from a draft in
// data/topics/<topic>/ by data/topics/build.ts.
export type Topic = {
  id: string; // same as the topic id in content-catalog.ts
  subject: SubjectId;
  courseId: string;
  title: string;
  description: string;
  emoji: string;
  source?: string;
  sourceFileIds: string[];
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  // Bump when lessons/questions change meaningfully. Learner history is
  // keyed by stable lesson/concept/question IDs, so it survives updates.
  contentVersion: number;
  lessons: Lesson[];
  discrepancies?: SourceDiscrepancy[];
  diagrams?: SourceDiagram[];
};

export function difficultyLabel(level: DifficultyLevel | undefined) {
  switch (level) {
    case 'advanced':
      return 'Hard';
    case 'intermediate':
      return 'Medium';
    default:
      return 'Easy';
  }
}
