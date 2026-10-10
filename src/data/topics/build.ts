// Turns a topic's authored content into the shared Topic + question bank
// shapes. Works for any subject/topic: each topic file lists its concepts
// once, and every lesson step and question points at a concept by ID.
// From that ID the builder fills in subject, course, topic, lesson,
// concept name and source references, so authors never repeat them.
//
// Concept IDs are type-checked: a question that names a concept the topic
// doesn't define is a TypeScript error.
//
// The topic's question bank holds ONE canonical copy of every question:
//   usage 'quiz'  — the Lesson Quiz bank (default)
//   usage 'learn' — retrieval checkpoints from the interactive layer;
//                   Review can reuse them, quizzes only as a top-up
import { sourceFiles } from '@/data/content-catalog';
import type {
  ConceptCoverage,
  DifficultyLevel,
  InteractiveStep,
  Lesson,
  RecallPrompt,
  SourceReference,
  Topic,
} from '@/data/lesson-types';
import { correctAnswerText, type Question, type QuestionSkill } from '@/data/questions';

// A lesson quiz aims for at least this many lesson-specific questions
// when the lesson's material can support them (authoring check only).
export const TARGET_QUIZ_QUESTIONS_PER_LESSON = 30;

const ASSERTION_REASONING_OPTIONS = [
  'A. Both Assertion and Reason are true, and Reason is the correct explanation of Assertion.',
  'B. Both Assertion and Reason are true, but Reason is not the correct explanation of Assertion.',
  'C. Assertion is true, but Reason is false.',
  'D. Assertion is false, but Reason is true.',
  'E. Both Assertion and Reason are false.',
] as const;

export type ConceptDraft = Omit<ConceptCoverage, 'id'> & { lessonId: string };

type Authored<Q, K extends string> = Q extends Question
  ? Omit<Q, 'concept' | 'conceptId' | 'subject' | 'courseId' | 'topicId' | 'lessonId'> & {
      conceptId: K;
    }
  : never;

export type QuestionDraft<K extends string = string> = Authored<Question, K>;

export type RecallDraft<K extends string = string> = Omit<
  RecallPrompt,
  'concept' | 'conceptId' | 'topicId' | 'lessonId'
> & { conceptId: K };

export type InteractiveDraft<K extends string = string> =
  | Extract<InteractiveStep, { type: 'learn' }>
  | { type: 'ask'; question: QuestionDraft<K>; reveal?: string[] }
  | { type: 'recall'; recall: RecallDraft<K> };

export type LessonDraft<K extends string = string> = Omit<Lesson, 'concepts' | 'interactive'> & {
  interactive?: InteractiveDraft<K>[];
};

export type TopicDraft<K extends string> = Omit<Topic, 'lessons'> & {
  concepts: Record<K, ConceptDraft>;
  lessons: LessonDraft<K>[];
  // The topic's quiz bank. Each question belongs to the lesson of its
  // concept.
  questions: QuestionDraft<K>[];
};

export type BuiltTopic = {
  topic: Topic;
  questions: Question[]; // the whole bank (quiz + learn checkpoints)
  recalls: RecallPrompt[];
  problems: string[]; // authoring problems (also printed in development)
};

// Slide references for one source file, e.g. slides(DECK, [6, 7], [8])
// → slides 6, 7 and 8, with 8 marked as a diagram.
export function slides(
  sourceId: string,
  numbers: number[],
  visualSlides: number[] = []
): SourceReference[] {
  return [...numbers, ...visualSlides.filter((n) => !numbers.includes(n))]
    .sort((a, b) => a - b)
    .map((slide) => ({
      sourceId,
      slide,
      ...(visualSlides.includes(slide) ? { visual: true } : {}),
    }));
}

// Page references for a PDF source, e.g. pages(PDF, [3, 4]).
export function pages(sourceId: string, numbers: number[]): SourceReference[] {
  return [...numbers].sort((a, b) => a - b).map((page) => ({ sourceId, page }));
}

// A reference to a deck also covers any exact export of it
// (content-catalog `duplicateOf`), e.g. slide 6 → PDF page 6.
export function withExports(refs: SourceReference[]): SourceReference[] {
  const extra: SourceReference[] = [];

  for (const ref of refs) {
    if (ref.slide === undefined) continue;

    for (const file of sourceFiles) {
      if (file.duplicateOf === ref.sourceId && file.format === 'pdf') {
        extra.push({ ...ref, sourceId: file.id, slide: undefined, page: ref.slide });
      }
    }
  }

  return [...refs, ...extra].map((ref) => {
    const clean = { ...ref };
    if (clean.slide === undefined) delete clean.slide;
    return clean;
  });
}

// ─── Compact authoring helpers ───────────────────────────────────────
// Options are shuffled per attempt by the question card, so the correct
// option can always be written first.

export type QuestionExtra = {
  explanation?: string;
  takeaway?: string;
  difficulty?: DifficultyLevel;
  skill?: QuestionSkill;
  label?: string;
  clinical?: boolean;
  objective?: string;
  sourceRefs?: SourceReference[];
};

const SKILL_LABEL: Partial<Record<QuestionSkill, string>> = {
  recall: 'Recall',
  terminology: 'Terms',
  sequence: 'Order',
  match: 'Match',
  prediction: 'Predict',
  'cause-effect': 'Why?',
  comparison: 'Compare',
  'pathway-reasoning': 'Reason',
  application: 'Apply',
  misconception: 'Spot the error',
};

function withExtra<K extends string>(base: Record<string, unknown>, extra: QuestionExtra, fallbackSkill: QuestionSkill) {
  const skill = extra.skill ?? fallbackSkill;
  return { label: SKILL_LABEL[skill], ...base, ...extra, skill } as unknown as QuestionDraft<K>;
}

// Single-answer multiple choice: the correct option first, then distractors.
export function mcq<K extends string>(
  id: string,
  conceptId: K,
  prompt: string,
  correct: string,
  wrong: string[],
  extra: QuestionExtra = {}
): QuestionDraft<K> {
  return withExtra<K>({ id, type: 'choice', conceptId, prompt, options: [correct, ...wrong], answer: 0 }, extra, 'recall');
}

// Select all that apply.
export function multi<K extends string>(
  id: string,
  conceptId: K,
  prompt: string,
  correct: string[],
  wrong: string[],
  extra: QuestionExtra = {}
): QuestionDraft<K> {
  return withExtra<K>(
    { id, type: 'multi', conceptId, prompt, options: [...correct, ...wrong], answers: correct.map((_, i) => i), label: 'Select all' },
    extra,
    'recall'
  );
}

// Type the answer / fill in the blank (use ____ in the prompt).
export function fill<K extends string>(
  id: string,
  conceptId: K,
  prompt: string,
  accept: string[],
  extra: QuestionExtra & { placeholder?: string } = {}
): QuestionDraft<K> {
  return withExtra<K>({ id, type: 'type', conceptId, prompt, accept, label: 'Fill in' }, extra, 'recall');
}

// Put in order: items written in the CORRECT order.
export function order<K extends string>(
  id: string,
  conceptId: K,
  prompt: string,
  items: string[],
  extra: QuestionExtra = {}
): QuestionDraft<K> {
  return withExtra<K>({ id, type: 'order', conceptId, prompt, items }, extra, 'sequence');
}

// Match left → right (pairs written correctly; shown shuffled).
export function match<K extends string>(
  id: string,
  conceptId: K,
  prompt: string,
  pairs: [string, string][],
  extra: QuestionExtra = {}
): QuestionDraft<K> {
  return withExtra<K>(
    { id, type: 'match', conceptId, prompt, pairs: pairs.map(([left, right]) => ({ left, right })) },
    extra,
    'match'
  );
}

// Interactive-layer steps.
export function learn<K extends string = string>(
  title: string,
  body: string[],
  extra: Omit<Extract<InteractiveStep, { type: 'learn' }>, 'type' | 'title' | 'body'> = {}
): InteractiveDraft<K> {
  return { type: 'learn', title, body, ...extra };
}

export function ask<K extends string>(question: QuestionDraft<K>, reveal?: string[]): InteractiveDraft<K> {
  return { type: 'ask', question, reveal };
}

export function recall<K extends string>(
  id: string,
  conceptId: K,
  prompt: string,
  answer: string[],
  sourceRefs?: SourceReference[]
): InteractiveDraft<K> {
  return { type: 'recall', recall: { id, conceptId, prompt, answer, sourceRefs } };
}

// True/false, written as a statement. Kept in True/False order.
export function tf<K extends string>(draft: {
  id: string;
  conceptId: K;
  statement: string;
  answer: boolean;
  explanation?: string;
  takeaway?: string;
  difficulty?: DifficultyLevel;
  skill?: QuestionSkill;
  sourceRefs?: SourceReference[];
}): QuestionDraft<K> {
  return {
    id: draft.id,
    type: 'choice',
    conceptId: draft.conceptId,
    prompt: draft.statement,
    options: ['True', 'False'],
    answer: draft.answer ? 0 : 1,
    fixedOrder: true,
    label: 'True or false',
    skill: draft.skill ?? 'recall',
    explanation: draft.explanation,
    takeaway: draft.takeaway,
    difficulty: draft.difficulty,
    sourceRefs: draft.sourceRefs,
  } as QuestionDraft<K>;
}

export function buildTopic<K extends string>(draft: TopicDraft<K>): BuiltTopic {
  const { concepts, questions: questionDrafts, lessons, ...topicFields } = draft;
  const problems: string[] = [];

  const conceptOf = (id: K) => {
    const concept = concepts[id];
    if (!concept) problems.push(`Unknown concept "${id}"`);
    return concept;
  };

  const toQuestion = (
    question: QuestionDraft<K>,
    lessonId?: string,
    usage?: 'learn' | 'quiz'
  ): Question => {
    const concept = conceptOf(question.conceptId);
    const owningLesson = lessonId ?? concept?.lessonId ?? '';

    return {
      ...question,
      id: `${draft.id}:${question.id}`,
      concept: concept?.name ?? question.conceptId,
      subject: draft.subject,
      courseId: draft.courseId,
      topicId: draft.id,
      lessonId: owningLesson,
      usage: usage ?? question.usage ?? 'quiz',
      difficulty: question.difficulty ?? concept?.difficulty ?? 'introductory',
      sourceRefs: withExports(question.sourceRefs ?? concept?.sourceRefs ?? []),
    } as Question;
  };

  const toRecall = (recall: RecallDraft<K>, lessonId: string): RecallPrompt => {
    const concept = conceptOf(recall.conceptId);
    return {
      ...recall,
      id: `${draft.id}:${recall.id}`,
      concept: concept?.name ?? recall.conceptId,
      topicId: draft.id,
      lessonId,
      sourceRefs: withExports(recall.sourceRefs ?? concept?.sourceRefs ?? []),
    };
  };

  const recalls: RecallPrompt[] = [];

  const builtLessons: Lesson[] = lessons.map((lesson) => ({
    ...lesson,
    sourceRefs: withExports(lesson.sourceRefs),
    concepts: (Object.keys(concepts) as K[])
      .filter((id) => concepts[id].lessonId === lesson.id)
      .map((id) => {
        const { lessonId: _lessonId, ...concept } = concepts[id];
        return { ...concept, id, sourceRefs: withExports(concept.sourceRefs) };
      }),
    chunks: lesson.chunks.map((chunk) => ({
      ...chunk,
      sourceRefs: chunk.sourceRefs && withExports(chunk.sourceRefs),
    })),
    interactive: lesson.interactive?.map((step): InteractiveStep => {
      if (step.type === 'ask') {
        return { type: 'ask', question: toQuestion(step.question, lesson.id, 'learn'), reveal: step.reveal };
      }
      if (step.type === 'recall') {
        const built = toRecall(step.recall, lesson.id);
        recalls.push(built);
        return { type: 'recall', recall: built };
      }
      return { ...step, sourceRefs: step.sourceRefs && withExports(step.sourceRefs) };
    }),
  }));

  const quizQuestions = questionDrafts.map((question) => toQuestion(question));
  const assertionReasoningQuestions = builtLessons.flatMap((lesson) => {
    const lessonQuestions = quizQuestions.filter((question) => question.lessonId === lesson.id);
    const choiceQuestions = lessonQuestions.filter((question) => question.type === 'choice');
    const sourceQuestions = choiceQuestions.length >= 5 ? choiceQuestions : lessonQuestions;

    return Array.from({ length: Math.min(5, sourceQuestions.length) }, (_, index): Question => {
      const question = sourceQuestions[index];
      const alternate = sourceQuestions[(index + 1) % sourceQuestions.length];
      const answer = correctAnswerText(question);
      const distractor = question.type === 'choice'
        ? question.options.find((option, optionIndex) => optionIndex !== question.answer) ?? `not ${answer}`
        : `not ${answer}`;
      const fact = `The lesson identifies “${answer}” as the correct answer to: “${question.prompt}”`;
      const falseFact = `The lesson identifies “${distractor}” as the correct answer to: “${question.prompt}”`;
      const explanation = question.explanation?.trim()
        ? `The lesson explains: ${question.explanation.trim()}`
        : `The lesson gives “${answer}” as the correct response.`;
      const unrelatedFact = alternate.explanation?.trim()
        ? `The lesson also explains: ${alternate.explanation.trim()}`
        : `The lesson also tests “${correctAnswerText(alternate)}”.`;
      const relation = index % 5;
      const assertion = relation === 3 || relation === 4 ? falseFact : fact;
      const reason = relation === 1 ? unrelatedFact : relation === 2 || relation === 4 ? falseFact : explanation;

      return {
        id: `${draft.id}:${lesson.id}:assertion-reasoning-${index + 1}`,
        type: 'choice',
        concept: question.concept,
        conceptId: question.conceptId,
        subject: draft.subject,
        courseId: draft.courseId,
        topicId: draft.id,
        lessonId: lesson.id,
        usage: 'quiz',
        difficulty: question.difficulty,
        skill: 'pathway-reasoning',
        label: 'Assertion–Reasoning',
        prompt: `Assertion: ${assertion}.\n\nReason: ${reason}.\n\nChoose the correct relationship between the Assertion and Reason.`,
        options: [...ASSERTION_REASONING_OPTIONS],
        answer: relation,
        fixedOrder: true,
        explanation: `Answer ${String.fromCharCode(65 + relation)}. ${relation === 0 ? 'Both statements are true, and the Reason supports the Assertion.' : relation === 1 ? 'Both statements are true, but the Reason describes a separate point from this lesson.' : relation === 2 ? 'The Assertion is true, but the Reason names an incorrect answer.' : relation === 3 ? 'The Assertion names an incorrect answer, while the Reason is true.' : 'Both statements name incorrect answers.'}`,
        sourceRefs: question.sourceRefs,
      };
    });
  });
  const learnQuestions = builtLessons.flatMap((lesson) =>
    (lesson.interactive ?? []).flatMap((step) => (step.type === 'ask' ? [step.question] : []))
  );
  const questions = [...quizQuestions, ...assertionReasoningQuestions, ...learnQuestions];

  // ── Authoring checks. They never stop the app; they print in development.
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const names = new Set<string>();
  for (const id of Object.keys(concepts) as K[]) {
    const concept = concepts[id];
    if (!lessonIds.has(concept.lessonId)) {
      problems.push(`Concept "${id}" points to unknown lesson "${concept.lessonId}"`);
    }
    if (names.has(concept.name)) problems.push(`Duplicate concept name "${concept.name}"`);
    names.add(concept.name);
  }

  const ids = new Set<string>();
  for (const item of [...questions, ...recalls]) {
    if (ids.has(item.id)) problems.push(`Duplicate question/recall id "${item.id}"`);
    ids.add(item.id);
  }
  for (const question of questions) problems.push(...checkQuestion(question));

  for (const lesson of builtLessons) {
    const quizCount = [...quizQuestions, ...assertionReasoningQuestions].filter((question) => question.lessonId === lesson.id).length;
    if (quizCount < TARGET_QUIZ_QUESTIONS_PER_LESSON) {
      problems.push(
        `Lesson "${lesson.id}" has ${quizCount} quiz questions (target ${TARGET_QUIZ_QUESTIONS_PER_LESSON}; quizzes top up from earlier lessons)`
      );
    }
  }

  if (problems.length > 0 && typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`Content notes for ${draft.id}:\n${problems.join('\n')}`);
  }

  return {
    topic: { ...topicFields, lessons: builtLessons },
    questions,
    recalls,
    problems,
  };
}

// Structural checks for one question (answer indexes in range, etc.).
export function checkQuestion(question: Question): string[] {
  const where = `Question "${question.id}"`;
  const problems: string[] = [];
  if (!question.prompt.trim()) problems.push(`${where}: empty prompt`);

  switch (question.type) {
    case 'choice':
      if (!(question.answer >= 0 && question.answer < question.options.length)) {
        problems.push(`${where}: answer index out of range`);
      }
      if (new Set(question.options).size !== question.options.length) {
        problems.push(`${where}: duplicate options`);
      }
      break;
    case 'multi':
      if (
        !(
          question.answers.length > 0 &&
          question.answers.every((index) => index >= 0 && index < question.options.length)
        )
      ) {
        problems.push(`${where}: answer indexes out of range`);
      }
      if (new Set(question.options).size !== question.options.length) {
        problems.push(`${where}: duplicate options`);
      }
      break;
    case 'type':
      if (question.accept.length === 0) problems.push(`${where}: no accepted answers`);
      break;
    case 'order':
      if (question.items.length < 2) problems.push(`${where}: needs 2+ items`);
      break;
    case 'match':
      // Repeated right-hand items are allowed ("sort into categories"):
      // marking compares text, not positions.
      if (question.pairs.length < 2) problems.push(`${where}: needs 2+ pairs`);
      break;
  }

  return problems;
}
