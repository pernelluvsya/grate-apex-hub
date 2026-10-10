// The canonical progression model — ONE definition of progress, derived
// from real learning state and shared by every screen (Home, Learn,
// topic pages, Progress, Profile):
//
//   Subject → Course → Topic → Lesson → Concept mastery → review readiness
//
// Definitions:
//   lesson  not-started | in-progress (lesson open, not finished) |
//           completed (lesson finished) | quiz-passed (and a lesson quiz
//           scored ≥ 70%)
//   topic   not-started | in-progress | completed (every lesson
//           completed) | mastered (completed, ≥ 80% of its concepts
//           remembered or mastered, none struggling)
//   covered = lessons started or completed
//   mastery = average concept mastery estimate over ALL trackable
//             concepts (untouched concepts count as 0)
// Pure — no React, no storage.
import {
  conceptKey,
  getCourseTopics,
  getSubjectTopics,
  getTopic,
  isTrackableConcept,
  publishedTopics,
} from '@/data/curriculum';
import type { Lesson, SubjectId, Topic } from '@/data/lesson-types';
import type { LessonPhase, LessonSession } from '@/data/learning/lesson-sessions';
import {
  type ConceptMemory,
  countStates,
  lastRevisedAt,
  type MemoryCounts,
  type MemoryModel,
} from '@/data/learning/memory';
import { XP_RULES } from '@/data/learning/xp-rules';
import type { QuizAttempt } from '@/data/quiz-history';

export type LearningInputs = {
  completedAt: Record<string, number>; // lessonId → when completed
  memory: MemoryModel;
  quizzes: readonly QuizAttempt[];
  sessions: Record<string, LessonSession>;
  now: number;
};

export type LessonStatus = 'not-started' | 'in-progress' | 'completed' | 'quiz-passed';

export type LessonProgress = {
  lessonId: string;
  topicId: string;
  index: number;
  lesson: Lesson;
  status: LessonStatus;
  completedAt: number | null;
  inSession: boolean;
  sessionPhase: LessonPhase | null;
  sessionUpdatedAt: number | null;
  bestQuizPercent: number | null;
  lastQuizPercent: number | null;
  lastQuizAt: number | null;
  quizAttempts: number;
  conceptTotal: number;
  counts: MemoryCounts;
  due: number;
  mastery: number;
  lastRevisedAt: number | null;
  concepts: ConceptMemory[];
};

export type TopicStatus = 'not-started' | 'in-progress' | 'completed' | 'mastered';

export type TopicProgress = {
  topic: Topic;
  status: TopicStatus;
  lessons: LessonProgress[];
  total: number;
  completed: number;
  started: number;
  quizzesPassed: number;
  percent: number; // lessons completed
  mastery: number; // 0–1
  conceptTotal: number;
  counts: MemoryCounts;
  due: number;
  lastRevisedAt: number | null;
  nextLesson: LessonProgress | null;
  weakConcepts: ConceptMemory[];
};

export type AggregateProgress = {
  topics: TopicProgress[];
  lessonsTotal: number;
  lessonsCompleted: number;
  lessonsStarted: number;
  percent: number;
  mastery: number;
  conceptTotal: number;
  counts: MemoryCounts;
  due: number;
  topicsCompleted: number;
  topicsMastered: number;
  topicsStarted: number;
  lastRevisedAt: number | null;
};

function lessonQuizzes(quizzes: readonly QuizAttempt[], lessonId: string) {
  return quizzes.filter(
    (attempt) =>
      attempt.lessonId === lessonId &&
      (attempt.kind === 'lesson' || attempt.kind === 'mastery-check') &&
      !attempt.practice
  );
}

export function lessonProgress(topic: Topic, lesson: Lesson, index: number, input: LearningInputs): LessonProgress {
  const completedAt = input.completedAt[lesson.id] ?? null;
  const session = input.sessions[lesson.id];
  const inSession = Boolean(session && session.phase !== 'complete' && completedAt === null);
  const quizzes = lessonQuizzes(input.quizzes, lesson.id);
  const best = quizzes.length ? Math.max(...quizzes.map((attempt) => attempt.percentage)) : null;
  const last = quizzes.length ? quizzes[0] : null; // newest first
  const trackable = lesson.concepts.filter(isTrackableConcept);
  const concepts = trackable
    .map((concept) => input.memory.concepts.get(conceptKey(topic.id, concept.id)))
    .filter((concept): concept is ConceptMemory => Boolean(concept));
  const counts = countStates(concepts);
  counts.new += trackable.length - concepts.length;
  const mastery = trackable.length
    ? concepts.reduce((sum, concept) => sum + concept.mastery, 0) / trackable.length
    : 0;

  let status: LessonStatus = 'not-started';
  if (completedAt !== null) {
    status = best !== null && best >= XP_RULES.passPercent ? 'quiz-passed' : 'completed';
  } else if (inSession) {
    status = 'in-progress';
  }

  return {
    lessonId: lesson.id,
    topicId: topic.id,
    index,
    lesson,
    status,
    completedAt,
    inSession,
    sessionPhase: session?.phase ?? null,
    sessionUpdatedAt: session?.updatedAt ?? null,
    bestQuizPercent: best,
    lastQuizPercent: last?.percentage ?? null,
    lastQuizAt: last?.completedAt ?? null,
    quizAttempts: quizzes.length,
    conceptTotal: trackable.length,
    counts,
    due: counts.due,
    mastery,
    lastRevisedAt: lastRevisedAt(concepts),
    concepts,
  };
}

export function topicProgress(topic: Topic, input: LearningInputs): TopicProgress {
  const lessons = topic.lessons.map((lesson, index) => lessonProgress(topic, lesson, index, input));
  const total = lessons.length;
  const completed = lessons.filter((lesson) => lesson.completedAt !== null).length;
  const started = lessons.filter((lesson) => lesson.status !== 'not-started').length;
  const quizzesPassed = lessons.filter((lesson) => lesson.status === 'quiz-passed').length;
  const allConcepts = lessons.flatMap((lesson) => lesson.concepts);
  const conceptTotal = lessons.reduce((sum, lesson) => sum + lesson.conceptTotal, 0);
  const counts = countStates(allConcepts);
  counts.new += conceptTotal - allConcepts.length;
  const mastery = conceptTotal
    ? allConcepts.reduce((sum, concept) => sum + concept.mastery, 0) / conceptTotal
    : 0;

  let status: TopicStatus = 'not-started';
  if (completed === total && total > 0) {
    const solid = counts.remembered + counts.mastered;
    status = conceptTotal > 0 && solid / conceptTotal >= 0.8 && counts.struggling === 0 ? 'mastered' : 'completed';
  } else if (started > 0) {
    status = 'in-progress';
  }

  const nextLesson =
    lessons.find((lesson) => lesson.status === 'in-progress') ??
    lessons.find((lesson) => lesson.status === 'not-started') ??
    null;

  return {
    topic,
    status,
    lessons,
    total,
    completed,
    started,
    quizzesPassed,
    percent: total ? Math.round((completed / total) * 100) : 0,
    mastery,
    conceptTotal,
    counts,
    due: counts.due,
    lastRevisedAt: lastRevisedAt(allConcepts),
    nextLesson,
    weakConcepts: allConcepts
      .filter((concept) => concept.state === 'struggling' || concept.lastResult === 'incorrect')
      .sort((a, b) => b.priority - a.priority),
  };
}

function aggregate(topics: Topic[], input: LearningInputs): AggregateProgress {
  const list = topics.map((topic) => topicProgress(topic, input));
  const lessonsTotal = list.reduce((sum, item) => sum + item.total, 0);
  const lessonsCompleted = list.reduce((sum, item) => sum + item.completed, 0);
  const lessonsStarted = list.reduce((sum, item) => sum + item.started, 0);
  const conceptTotal = list.reduce((sum, item) => sum + item.conceptTotal, 0);
  const counts = countStates(list.flatMap((item) => item.lessons.flatMap((lesson) => lesson.concepts)));
  counts.new += conceptTotal - counts.tracked;
  const masterySum = list.reduce((sum, item) => sum + item.mastery * item.conceptTotal, 0);
  const revised = list.map((item) => item.lastRevisedAt).filter((value): value is number => value !== null);

  return {
    topics: list,
    lessonsTotal,
    lessonsCompleted,
    lessonsStarted,
    percent: lessonsTotal ? Math.round((lessonsCompleted / lessonsTotal) * 100) : 0,
    mastery: conceptTotal ? masterySum / conceptTotal : 0,
    conceptTotal,
    counts,
    due: counts.due,
    topicsCompleted: list.filter((item) => item.status === 'completed' || item.status === 'mastered').length,
    topicsMastered: list.filter((item) => item.status === 'mastered').length,
    topicsStarted: list.filter((item) => item.status !== 'not-started').length,
    lastRevisedAt: revised.length ? Math.max(...revised) : null,
  };
}

export function courseProgress(courseId: string, input: LearningInputs) {
  return aggregate(getCourseTopics(courseId), input);
}

export function subjectProgress(subject: SubjectId, input: LearningInputs) {
  return aggregate(getSubjectTopics(subject), input);
}

export function curriculumProgress(input: LearningInputs) {
  return aggregate(publishedTopics, input);
}

export function topicProgressById(topicId: string, input: LearningInputs) {
  const topic = getTopic(topicId);
  return topic ? topicProgress(topic, input) : null;
}

export const LESSON_STATUS_LABEL: Record<LessonStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
  'quiz-passed': 'Quiz passed',
};

export const TOPIC_STATUS_LABEL: Record<TopicStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
  mastered: 'Mastered',
};
