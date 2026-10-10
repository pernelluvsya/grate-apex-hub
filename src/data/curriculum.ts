// The curriculum: Subject → Course → Topic → Lesson → Concept, plus fast
// lookups for questions and concepts. Every screen and the learning
// engine read content through this module — never through a topic file
// directly — so content data stays separate from rendering logic.
//
// Indexes are built lazily, once, the first time they are needed.
import { contentTopics } from '@/data/content-catalog';
import type {
  ConceptCoverage,
  ContentTopic,
  CourseInfo,
  Lesson,
  RecallPrompt,
  SubjectId,
  Topic,
} from '@/data/lesson-types';
import type { Question } from '@/data/questions';
import { builtTopics } from '@/data/topics';

// ─── Courses ────────────────────────────────────────────────────────
// One lecture course per subject folder for now (content/<SUBJECT>/).
// Every ZIP inside the folder is one topic of that course. More courses
// (e.g. a second-semester course) are added here; screens adapt.
export const courseCatalog: CourseInfo[] = [
  {
    id: 'biochemistry-lectures',
    subject: 'biochemistry',
    title: 'Biochemistry',
    description: 'The supplied Biochemistry lecture course — one topic per lecture ZIP.',
    folder: 'BIOCHEMISTRY',
  },
  {
    id: 'physiology-lectures',
    subject: 'physiology',
    title: 'Physiology',
    description: 'The supplied Physiology lecture course — one topic per lecture ZIP.',
    folder: 'PHYSIOLOGY',
  },
  {
    id: 'anatomy-lectures',
    subject: 'anatomy',
    title: 'Anatomy',
    description: 'Anatomy lecture materials have not been supplied yet.',
    folder: 'ANATOMY',
  },
];

export function getCoursesForSubject(subject: SubjectId): CourseInfo[] {
  return courseCatalog.filter((course) => course.subject === subject);
}

export function getCourseInfo(courseId: string | undefined | null): CourseInfo | undefined {
  return courseCatalog.find((course) => course.id === courseId);
}

// ─── Topics ─────────────────────────────────────────────────────────

export const publishedTopics: Topic[] = builtTopics.map((built) => built.topic);

const topicById = new Map(publishedTopics.map((topic) => [topic.id, topic]));

export function getTopic(topicId: string | undefined | null): Topic | undefined {
  return topicId ? topicById.get(topicId) : undefined;
}

export function getTopicEntry(topicId: string | undefined | null): ContentTopic | undefined {
  return contentTopics.find((topic) => topic.id === topicId);
}

// Registry entries (published or not) for a course, in catalog order.
export function getCourseTopicEntries(courseId: string): ContentTopic[] {
  return contentTopics.filter((topic) => topic.courseId === courseId);
}

// Published topics for a course / subject.
export function getCourseTopics(courseId: string): Topic[] {
  return publishedTopics.filter((topic) => topic.courseId === courseId);
}

export function getSubjectTopics(subject: SubjectId): Topic[] {
  return publishedTopics.filter((topic) => topic.subject === subject);
}

// ─── Lessons ────────────────────────────────────────────────────────

export type LessonEntry = { topic: Topic; lesson: Lesson; index: number };

let lessonIndex: Map<string, LessonEntry> | null = null;

function lessons() {
  if (!lessonIndex) {
    lessonIndex = new Map();
    for (const topic of publishedTopics) {
      topic.lessons.forEach((lesson, index) => {
        lessonIndex!.set(lesson.id, { topic, lesson, index });
      });
    }
  }
  return lessonIndex;
}

// The topic that contains a lesson, and the lesson's position in it.
export function findLesson(lessonId: string | undefined | null): LessonEntry | null {
  if (!lessonId) return null;
  return lessons().get(lessonId) ?? null;
}

export function allLessonIds(): string[] {
  return Array.from(lessons().keys());
}

// ─── Concepts ───────────────────────────────────────────────────────
// A concept's key is `${topicId}/${conceptId}` — stable across content
// updates (renaming a concept does not lose its history).

export type ConceptEntry = {
  key: string;
  topic: Topic;
  lesson: Lesson;
  concept: ConceptCoverage;
};

export function conceptKey(topicId: string, conceptId: string) {
  return `${topicId}/${conceptId}`;
}

let conceptIndex: Map<string, ConceptEntry> | null = null;
// lessonId + concept NAME → key (older history stored names only)
let conceptByName: Map<string, string> | null = null;

function concepts() {
  if (!conceptIndex) {
    conceptIndex = new Map();
    conceptByName = new Map();
    for (const topic of publishedTopics) {
      for (const lesson of topic.lessons) {
        for (const concept of lesson.concepts) {
          const key = conceptKey(topic.id, concept.id);
          conceptIndex.set(key, { key, topic, lesson, concept });
          conceptByName.set(`${lesson.id}::${concept.name}`, key);
        }
      }
    }
  }
  return conceptIndex;
}

export function getConceptEntry(key: string | undefined | null): ConceptEntry | undefined {
  return key ? concepts().get(key) : undefined;
}

export function allConceptEntries(): ConceptEntry[] {
  return Array.from(concepts().values());
}

export function conceptKeyByName(lessonId: string, conceptName: string): string | undefined {
  concepts();
  return conceptByName!.get(`${lessonId}::${conceptName}`);
}

// Concepts the engine may schedule and quiz (unconfirmed material is
// shown in lessons but never tested — see ContentRelevance).
export function isTrackableConcept(concept: ConceptCoverage) {
  return concept.relevance !== 'needs-review';
}

// ─── Questions ──────────────────────────────────────────────────────

type QuestionIndex = {
  byId: Map<string, Question>;
  byTopic: Map<string, Question[]>;
  byLesson: Map<string, Question[]>;
  conceptOf: Map<string, string>; // question id → concept key
  recallById: Map<string, RecallPrompt>;
};

let questionIndex: QuestionIndex | null = null;

function questions(): QuestionIndex {
  if (questionIndex) return questionIndex;

  const index: QuestionIndex = {
    byId: new Map(),
    byTopic: new Map(),
    byLesson: new Map(),
    conceptOf: new Map(),
    recallById: new Map(),
  };

  for (const built of builtTopics) {
    const topic = built.topic;
    const excluded = new Set(
      topic.lessons.flatMap((lesson) =>
        lesson.concepts.filter((concept) => !isTrackableConcept(concept)).map((concept) => concept.id)
      )
    );
    const list: Question[] = [];

    for (const question of built.questions) {
      if (index.byId.has(question.id)) continue;
      if (question.conceptId && excluded.has(question.conceptId)) continue;
      index.byId.set(question.id, question);
      list.push(question);
      const lessonList = index.byLesson.get(question.lessonId ?? '') ?? [];
      lessonList.push(question);
      index.byLesson.set(question.lessonId ?? '', lessonList);
      if (question.conceptId) {
        index.conceptOf.set(question.id, conceptKey(topic.id, question.conceptId));
      }
    }
    index.byTopic.set(topic.id, list);

    for (const recall of built.recalls) {
      index.recallById.set(recall.id, recall);
      if (recall.conceptId) index.conceptOf.set(recall.id, conceptKey(topic.id, recall.conceptId));
    }
  }

  questionIndex = index;
  return index;
}

export function getQuestion(questionId: string | undefined | null): Question | undefined {
  return questionId ? questions().byId.get(questionId) : undefined;
}

export function getQuestionsByIds(ids: string[]): Question[] {
  const index = questions();
  return ids.map((id) => index.byId.get(id)).filter((q): q is Question => Boolean(q));
}

export function getRecall(recallId: string | undefined | null): RecallPrompt | undefined {
  return recallId ? questions().recallById.get(recallId) : undefined;
}

// Every question for a topic (quiz bank + interactive checkpoints).
export function getTopicQuestions(topicId: string): Question[] {
  return questions().byTopic.get(topicId) ?? [];
}

export function getLessonQuestions(lessonId: string): Question[] {
  return questions().byLesson.get(lessonId) ?? [];
}

// The lesson's quiz bank (excludes interactive checkpoints).
export function getLessonQuizBank(lessonId: string): Question[] {
  return getLessonQuestions(lessonId).filter((question) => question.usage !== 'learn');
}

export function hasLessonQuiz(lessonId: string) {
  return getLessonQuizBank(lessonId).length > 0;
}

// The concept a question (or recall prompt) tests, as a concept key.
export function conceptKeyForItem(itemId: string, fallback?: { lessonId?: string; concept?: string }) {
  const key = questions().conceptOf.get(itemId);
  if (key) return key;
  if (fallback?.lessonId && fallback.concept) return conceptKeyByName(fallback.lessonId, fallback.concept);
  return undefined;
}

export function totalQuestionCount() {
  return questions().byId.size;
}
