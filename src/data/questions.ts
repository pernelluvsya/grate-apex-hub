// Question types used by the Interactive Lesson, the Lesson Quiz and
// Review (spaced repetition). One format, so every question can appear
// in all three places.
//
// `concept` names the idea a question tests. Missed concepts are what
// spaced repetition brings back later (see data/review.ts), so keep
// concept names stable and unique within a lesson.

import type { DifficultyLevel, SourceReference, SubjectId } from '@/data/lesson-types';

// The thinking skill a question practises (independent of its format).
// Lets quizzes mix skills and lets later features (Apex Challenge,
// Review) pick harder or more varied questions.
export type QuestionSkill =
  | 'recall'
  | 'terminology'
  | 'sequence'
  | 'match'
  | 'prediction'
  | 'cause-effect'
  | 'comparison'
  | 'pathway-reasoning'
  | 'application'
  | 'misconception';

type QuestionBase = {
  id: string; // unique within its topic
  prompt: string;
  concept: string; // concept NAME (see ConceptCoverage.name)
  conceptId?: string; // concept ID in the lesson's `concepts`
  skill?: QuestionSkill;
  explanation?: string; // short teaching feedback, shown after answering
  // A short "remember this" line shown when the answer is correct.
  takeaway?: string;
  label?: string; // e.g. 'Predict', 'Recall', 'What if?', 'Spot the error'
  objective?: string; // the learning objective it tests
  subject?: SubjectId;
  courseId?: string;
  topicId?: string;
  lessonId?: string;
  difficulty?: DifficultyLevel;
  // Only set when the lecture material itself supports the clinical link.
  clinical?: boolean;
  // learn — written for the interactive layer of its lesson (still used
  //         by Review); quiz — the lesson quiz bank (default)
  usage?: 'learn' | 'quiz';
  reviewEligible?: boolean; // default true
  version?: number; // bump when the question's meaning changes
  sourceRefs?: SourceReference[];
};

export type ChoiceQuestion = QuestionBase & {
  type: 'choice';
  options: string[];
  answer: number; // index of the correct option
  // Keep the authored option order (True/False, ordered scales).
  fixedOrder?: boolean;
};

export type MultiQuestion = QuestionBase & {
  type: 'multi';
  options: string[];
  answers: number[]; // indexes of all correct options
};

// Type-in / fill-in-the-blank (use "____" in the prompt for a blank).
export type TypeQuestion = QuestionBase & {
  type: 'type';
  accept: string[]; // first entry is shown as the correct answer
  placeholder?: string;
};

// Put items in order. `items` is written in the CORRECT order;
// the screen shows them shuffled.
export type OrderQuestion = QuestionBase & {
  type: 'order';
  items: string[];
};

// Match each left item to its right item. `pairs` are the correct pairs;
// the screen shows the right-hand options shuffled.
export type MatchQuestion = QuestionBase & {
  type: 'match';
  pairs: { left: string; right: string }[];
};

export type Question =
  | ChoiceQuestion
  | MultiQuestion
  | TypeQuestion
  | OrderQuestion
  | MatchQuestion;

// The learner's answer for each question type:
// choice → option index, multi → option indexes, type → text,
// order → item indexes in the chosen order,
// match → for each left item, the chosen right item index (-1 = none).
export type Answer = number | number[] | string;

// ─── Marking ────────────────────────────────────────────────────────

const SUBSCRIPTS: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
};

// "Malonyl-CoA", "malonyl coa" and "MALONYL CoA" all become "malonylcoa".
export function normalizeAnswer(text: string) {
  return text
    .toLowerCase()
    .replace(/β/g, 'beta')
    .replace(/α/g, 'alpha')
    .replace(/[₀-₉]/g, (digit) => SUBSCRIPTS[digit] ?? digit)
    .replace(/⁺/g, '+')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9+]/g, '');
}

function editDistance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      previous = current;
    }
  }

  return row[b.length];
}

// Typed answers ignore capitals, spaces, hyphens and punctuation.
// Longer answers also forgive a small typo; short ones (NADH vs NADPH)
// must be exact, because one letter changes the meaning.
export function typedAnswerMatches(input: string, accept: string[]) {
  const typed = normalizeAnswer(input);

  if (!typed) {
    return false;
  }

  return accept.some((option) => {
    const expected = normalizeAnswer(option);

    if (typed === expected) {
      return true;
    }

    const allowed =
      expected.length >= 14 ? 2 : expected.length >= 8 ? 1 : 0;

    return allowed > 0 && editDistance(typed, expected) <= allowed;
  });
}

// Has the learner given a full answer yet?
export function isAnswerComplete(
  question: Question,
  answer: Answer | undefined
) {
  if (answer === undefined) {
    return false;
  }

  switch (question.type) {
    case 'choice':
      return typeof answer === 'number';
    case 'multi':
      return Array.isArray(answer) && answer.length > 0;
    case 'type':
      return typeof answer === 'string' && answer.trim().length > 0;
    case 'order':
      return Array.isArray(answer) && answer.length === question.items.length;
    case 'match':
      return (
        Array.isArray(answer) &&
        answer.length === question.pairs.length &&
        answer.every((choice) => choice >= 0)
      );
  }
}

export function isAnswerCorrect(
  question: Question,
  answer: Answer | undefined
) {
  if (!isAnswerComplete(question, answer)) {
    return false;
  }

  switch (question.type) {
    case 'choice':
      return answer === question.answer;
    case 'multi': {
      const chosen = [...(answer as number[])].sort();
      const correct = [...question.answers].sort();
      return (
        chosen.length === correct.length &&
        chosen.every((value, index) => value === correct[index])
      );
    }
    case 'type':
      return typedAnswerMatches(answer as string, question.accept);
    // Compare text, not positions, so two identical items (e.g. two
    // "Reduction" steps) can be placed either way round.
    case 'order':
      return (answer as number[]).every(
        (value, index) => question.items[value] === question.items[index]
      );
    case 'match':
      return (answer as number[]).every(
        (value, index) =>
          question.pairs[value]?.right === question.pairs[index].right
      );
  }
}

// The correct answer, written out for feedback.
export function correctAnswerText(question: Question) {
  switch (question.type) {
    case 'choice':
      return question.options[question.answer];
    case 'multi':
      return question.answers.map((index) => question.options[index]).join('; ');
    case 'type':
      return question.accept[0];
    case 'order':
      return question.items.join(' → ');
    case 'match':
      return question.pairs
        .map((pair) => `${pair.left} → ${pair.right}`)
        .join('; ');
  }
}

// Apex Challenge allows 10 seconds per question, so only short, single-
// answer questions are fair game there.
export const APEX_LIMITS = { prompt: 120, option: 48, options: 4 } as const;

export function isApexEligible(question: Question) {
  if (question.type !== 'choice') return false;
  if (question.reviewEligible === false) return false;
  if (question.prompt.length > APEX_LIMITS.prompt) return false;
  if (question.options.length > APEX_LIMITS.options) return false;
  return question.options.every((option) => option.length <= APEX_LIMITS.option);
}

// A stable shuffle (same order every time for the same question), so
// items don't jump around between renders or page loads.
export function stableShuffle(count: number, seed: string) {
  let state = 0;

  for (let i = 0; i < seed.length; i++) {
    state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const order = Array.from({ length: count }, (_, i) => i);

  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  // Never show items already in the correct order.
  if (count > 1 && order.every((value, index) => value === index)) {
    order.push(order.shift()!);
  }

  return order;
}
