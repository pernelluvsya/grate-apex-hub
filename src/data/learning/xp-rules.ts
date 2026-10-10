// GRATEAPEX XP economy — every reward and penalty in one place.
//
// Principles (product decisions):
// - A task is worth 10–50 XP, by importance. Trivial repeated clicks earn
//   nothing on their own; completing meaningful learning does.
// - Wrong answers in a lesson quiz deduct XP (−2 each). Practising wrong
//   answers and Review are NOT penalised: forgetting is expected there and
//   remediation should never cost the learner.
// - Rewards are one-off per source (a lesson's XP is awarded once, a quiz
//   attempt once, a milestone once) — enforced by the XP ledger.
// - Powerups (×1.5, ×2, ×2.5, ×3) multiply GAINS only. They never reduce a
//   penalty's cost or change whether an answer was correct: the learning
//   outcome (memory, review schedule) is recorded before any reward.
// - Ranks are derived from lifetime XP (data/ranks.ts) and are unchanged.

export const XP_RULES = {
  taskMin: 10,
  taskMax: 50,
  lesson: { default: 25 },
  lessonQuiz: { completion: 20, bonusAt90: 20, bonusAt75: 10, wrongPenalty: 2 },
  topicQuiz: { completion: 30, bonusAt90: 20, bonusAt75: 10, wrongPenalty: 2 },
  practice: { completion: 10 },
  review: { base: 15, perRecalledDue: 2, max: 50 },
  apex: { completion: 20, bonusAt90: 30, bonusAt75: 20, bonusAt50: 10 },
  milestones: { topicCompleted: 50, conceptMastered: 5 },
  passPercent: 70, // a lesson quiz "passed" (also the mastery-check bar is 80)
  masteryCheckPercent: 80,
} as const;

export const POWERUP_MULTIPLIERS = [1, 1.5, 2, 2.5, 3] as const;
export type PowerupMultiplier = (typeof POWERUP_MULTIPLIERS)[number];

// Returns the default when a caller has no consumed power-up. Reward actions
// pass the selected inventory multiplier explicitly.
export function getActiveMultiplier(): PowerupMultiplier {
  return 1;
}

export type XpLine = { label: string; amount: number };

export type XpBreakdown = {
  lines: XpLine[];
  gained: number; // positive part, after any multiplier
  penalty: number; // ≤ 0
  net: number;
  multiplier: number;
};

function clampTask(amount: number) {
  return Math.max(XP_RULES.taskMin, Math.min(XP_RULES.taskMax, Math.round(amount)));
}

export function lessonCompletionXp(lessonXp: number | undefined) {
  return clampTask(lessonXp ?? XP_RULES.lesson.default);
}

function finish(lines: XpLine[], multiplier: number): XpBreakdown {
  const positive = lines.filter((line) => line.amount > 0).reduce((sum, line) => sum + line.amount, 0);
  const penalty = lines.filter((line) => line.amount < 0).reduce((sum, line) => sum + line.amount, 0);
  const gained = Math.round(positive * multiplier);
  const out = [...lines];
  if (multiplier > 1 && positive > 0) {
    out.push({ label: `Powerup ×${multiplier}`, amount: gained - positive });
  }
  return { lines: out, gained, penalty, net: gained + penalty, multiplier };
}

export type QuizKind = 'lesson' | 'topic' | 'practice' | 'mastery-check';

export function quizXp(input: {
  kind: QuizKind;
  correct: number;
  answered: number; // questions answered (skipped ones are not penalised)
  total: number;
  multiplier?: number;
}): XpBreakdown {
  const multiplier = input.multiplier ?? getActiveMultiplier();
  if (input.total <= 0) return finish([], multiplier);
  const percent = Math.round((input.correct / input.total) * 100);
  const wrong = Math.max(0, input.answered - input.correct);

  if (input.kind === 'practice') {
    return finish([{ label: 'Practice completed', amount: XP_RULES.practice.completion }], multiplier);
  }

  const rules = input.kind === 'topic' ? XP_RULES.topicQuiz : XP_RULES.lessonQuiz;
  const lines: XpLine[] = [{ label: input.kind === 'topic' ? 'Topic quiz completed' : 'Quiz completed', amount: rules.completion }];
  if (percent >= 90) lines.push({ label: 'Score 90%+', amount: rules.bonusAt90 });
  else if (percent >= 75) lines.push({ label: 'Score 75%+', amount: rules.bonusAt75 });
  if (wrong > 0) lines.push({ label: `${wrong} incorrect × −${rules.wrongPenalty}`, amount: -wrong * rules.wrongPenalty });
  return finish(lines, multiplier);
}

export function reviewXp(input: { recalledDue: number; answered: number; multiplier?: number }): XpBreakdown {
  const multiplier = input.multiplier ?? getActiveMultiplier();
  if (input.answered <= 0) return finish([], multiplier);
  const bonus = Math.min(
    XP_RULES.review.max - XP_RULES.review.base,
    input.recalledDue * XP_RULES.review.perRecalledDue
  );
  const lines: XpLine[] = [{ label: 'Review session completed', amount: XP_RULES.review.base }];
  if (bonus > 0) lines.push({ label: `${input.recalledDue} due concept${input.recalledDue === 1 ? '' : 's'} recalled`, amount: bonus });
  return finish(lines, multiplier);
}

export function apexXp(input: { correct: number; total: number; multiplier?: number }): XpBreakdown {
  const multiplier = input.multiplier ?? getActiveMultiplier();
  if (input.total <= 0) return finish([], multiplier);
  const percent = Math.round((input.correct / input.total) * 100);
  const lines: XpLine[] = [{ label: 'Apex Challenge completed', amount: XP_RULES.apex.completion }];
  if (percent >= 90) lines.push({ label: 'Accuracy 90%+', amount: XP_RULES.apex.bonusAt90 });
  else if (percent >= 75) lines.push({ label: 'Accuracy 75%+', amount: XP_RULES.apex.bonusAt75 });
  else if (percent >= 50) lines.push({ label: 'Accuracy 50%+', amount: XP_RULES.apex.bonusAt50 });
  return finish(lines, multiplier);
}

export function milestoneXp(kind: 'topicCompleted' | 'conceptMastered', multiplier = getActiveMultiplier()) {
  return finish([{ label: kind === 'topicCompleted' ? 'Topic completed' : 'Concept mastered', amount: XP_RULES.milestones[kind] }], multiplier);
}

export function formatXp(amount: number) {
  return `${amount >= 0 ? '+' : '−'}${Math.abs(amount)} XP`;
}
