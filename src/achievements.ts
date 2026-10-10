import { Progress, rankFor } from "./progress";

export type Ach = {
  id: string; icon: string; name: string; desc: string; group: string;
  // how far along (cur) out of goal; earned when cur >= goal
  prog: (p: Progress) => { cur: number; goal: number };
};

const answered = (p: Progress) => Object.values(p.subjects).reduce((n, s) => n + s.answered, 0);
const correct = (p: Progress) => Object.values(p.subjects).reduce((n, s) => n + s.correct, 0);

export function longestStreak(days: Record<string, number>) {
  const keys = Object.keys(days).filter((k) => days[k] > 0).sort();
  let best = 0, run = 0, prev = 0;
  for (const k of keys) {
    const [y, m, d] = k.split("-").map(Number);
    const t = Date.UTC(y, m - 1, d) / 86400000;
    run = prev && t - prev === 1 ? run + 1 : 1;
    prev = t; if (run > best) best = run;
  }
  return best;
}

const lessonsStarted = (p: Progress) => Object.values(p.lessons).filter((n) => n > 0).length;
const accuracyOk = (p: Progress) => { const a = answered(p); return a >= 100 ? Math.round((correct(p) / a) * 100) : 0; };
const improved = (p: Progress) => Object.values(p.tests).filter((t) => t.pre && t.post && t.post.c / Math.max(1, t.post.t) > t.pre.c / Math.max(1, t.pre.t)).length;

const quizzes = (p: Progress) => Object.values(p.subjects).reduce((t, s) => t + (s.quizzes || 0), 0);
const studyDays = (p: Progress) => Object.values(p.days).filter((v) => v > 0).length;
const bestDay = (p: Progress) => Math.max(0, ...Object.values(p.days));
const uniqueSeen = (p: Progress) => Object.values(p.seen).reduce((t, ids) => t + ids.length, 0);
const sections = (p: Progress) => Object.values(p.lessons).reduce((t, v) => t + Math.max(0, v), 0);
const testsDone = (p: Progress) => Object.values(p.tests).filter((t) => t.pre || t.post).length;
const accuracyAt = (min: number, pct: number) => (p: Progress) => { const a = answered(p); return a >= min ? Math.round((correct(p) / a) * 100) : 0; };

const studiedDays = (p: Progress) => Object.keys(p.days).filter((k) => p.days[k] > 0).sort();
const dayNum = (k: string) => { const [y, m, d] = k.split("-").map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
const weekendDays = (p: Progress) => studiedDays(p).filter((k) => { const w = new Date(dayNum(k) * 86400000).getUTCDay(); return w === 0 || w === 6; }).length;
const monthsStudied = (p: Progress) => new Set(studiedDays(p).map((k) => k.slice(0, 7))).size;
const comeback = (p: Progress) => { const d = studiedDays(p).map(dayNum); return d.some((t, i) => i > 0 && t - d[i - 1] - 1 >= 7) ? 1 : 0; };
const busyDays = (p: Progress) => Object.values(p.days).filter((v) => v >= 20).length;
const onDate = (md: string) => (p: Progress) => studiedDays(p).some((k) => k.slice(5) === md) ? 1 : 0;
const fixed = (p: Progress) => Object.values(p.cards).filter((c) => c.g).length;

const n = (id: string, icon: string, name: string, desc: string, group: string, goal: number, cur: (p: Progress) => number): Ach =>
  ({ id, icon, name, desc, group, prog: (p) => ({ cur: Math.min(goal, cur(p)), goal }) });

export const ACHIEVEMENTS: Ach[] = [
  n("q1", "🌱", "First steps", "Answer your first question", "Questions", 1, answered),
  n("q100", "📝", "Warming up", "Answer 100 questions", "Questions", 100, answered),
  n("q250", "✏️", "Getting serious", "Answer 250 questions", "Questions", 250, answered),
  n("q500", "📚", "Bookworm", "Answer 500 questions", "Questions", 500, answered),
  n("q1000", "🧠", "Thousand club", "Answer 1,000 questions", "Questions", 1000, answered),
  n("q2500", "🚀", "Question machine", "Answer 2,500 questions", "Questions", 2500, answered),
  n("q5000", "🏛️", "Living library", "Answer 5,000 questions", "Questions", 5000, answered),
  n("q10000", "🌌", "Ten thousand strong", "Answer 10,000 questions", "Questions", 10000, answered),
  n("right100", "✅", "On the money", "Get 100 questions right", "Questions", 100, correct),
  n("right1000", "💎", "Brain trust", "Get 1,000 questions right", "Questions", 1000, correct),
  n("fresh500", "🔍", "Fresh eyes", "See 500 different questions", "Questions", 500, uniqueSeen),
  n("fresh1500", "🧩", "Question hunter", "See 1,500 different questions", "Questions", 1500, uniqueSeen),

  n("s3", "🔥", "On a roll", "Study 3 days in a row", "Streaks", 3, (p) => longestStreak(p.days)),
  n("s7", "🔥", "Week warrior", "Study 7 days in a row", "Streaks", 7, (p) => longestStreak(p.days)),
  n("s14", "⚡", "Fortnight focus", "Study 14 days in a row", "Streaks", 14, (p) => longestStreak(p.days)),
  n("s30", "🌋", "Unstoppable", "Study 30 days in a row", "Streaks", 30, (p) => longestStreak(p.days)),
  n("s60", "🛡️", "Iron habit", "Study 60 days in a row", "Streaks", 60, (p) => longestStreak(p.days)),
  n("s100", "👑", "Centurion", "Study 100 days in a row", "Streaks", 100, (p) => longestStreak(p.days)),
  n("s365", "🌞", "Year of grind", "Study 365 days in a row", "Streaks", 365, (p) => longestStreak(p.days)),
  n("d10", "📅", "Regular", "Study on 10 different days", "Streaks", 10, studyDays),
  n("d50", "🗒️", "Dedicated", "Study on 50 different days", "Streaks", 50, studyDays),
  n("d100", "🏅", "Hundred-day scholar", "Study on 100 different days", "Streaks", 100, studyDays),
  n("day50", "💪", "Power day", "Answer 50 questions in one day", "Streaks", 50, bestDay),
  n("day100", "🏋️", "Marathon day", "Answer 100 questions in one day", "Streaks", 100, bestDay),

  n("l5", "⭐", "Level 5", "Reach level 5", "Levels", 5, (p) => rankFor(p.xp).level),
  n("l10", "🌟", "Level 10", "Reach level 10", "Levels", 10, (p) => rankFor(p.xp).level),
  n("l15", "✨", "Level 15", "Reach level 15", "Levels", 15, (p) => rankFor(p.xp).level),
  n("l25", "💫", "Level 25", "Reach level 25", "Levels", 25, (p) => rankFor(p.xp).level),
  n("l50", "🏆", "Level 50", "Reach level 50", "Levels", 50, (p) => rankFor(p.xp).level),
  n("l75", "🎖️", "Level 75", "Reach level 75", "Levels", 75, (p) => rankFor(p.xp).level),
  n("l100", "🥇", "Grandmaster", "Reach level 100", "Levels", 100, (p) => rankFor(p.xp).level),
  n("xp1k", "⚙️", "1,000 XP", "Earn 1,000 XP", "Levels", 1000, (p) => p.xp),
  n("xp10k", "🔋", "10,000 XP", "Earn 10,000 XP", "Levels", 10000, (p) => p.xp),

  n("perfect", "💯", "Flawless", "Score 100% in a round", "Skill", 100, (p) => Math.max(0, ...Object.values(p.subjects).map((s) => s.best))),
  n("acc80", "🎯", "Sharpshooter", "Keep 80% accuracy over 100+ questions", "Skill", 80, accuracyOk),
  n("acc90", "🏹", "Marksman", "Keep 90% accuracy over 250+ questions", "Skill", 90, accuracyAt(250, 90)),
  n("improve", "📈", "Level up", "Beat your pre-test score in a post-test", "Skill", 1, improved),
  n("quiz10", "📋", "Quiz taker", "Finish 10 quizzes", "Skill", 10, quizzes),
  n("quiz50", "📑", "Quiz regular", "Finish 50 quizzes", "Skill", 50, quizzes),
  n("quiz200", "🗃️", "Quiz legend", "Finish 200 quizzes", "Skill", 200, quizzes),
  n("pretest", "🧪", "Baseline", "Take a pre-test or post-test", "Skill", 1, testsDone),


  n("les1", "📖", "Reader", "Start your first lesson", "Lessons", 1, lessonsStarted),
  n("les10", "🎓", "Scholar", "Open 10 lessons", "Lessons", 10, lessonsStarted),
  n("les25", "📕", "Bookish", "Open 25 lessons", "Lessons", 25, lessonsStarted),
  n("les50", "🏫", "Professor in training", "Open 50 lessons", "Lessons", 50, lessonsStarted),
  n("sec50", "📃", "Section sprinter", "Finish 50 lesson sections", "Lessons", 50, sections),
  n("sec200", "📜", "Deep reader", "Finish 200 lesson sections", "Lessons", 200, sections),
  n("fc50", "🗂️", "Card shark", "Review 50 flashcards", "Lessons", 50, (p) => Object.keys(p.terms).length),
  n("fc200", "🃏", "Flashcard fiend", "Review 200 flashcards", "Lessons", 200, (p) => Object.keys(p.terms).length),
  n("fc500", "🎴", "Memory palace", "Review 500 flashcards", "Lessons", 500, (p) => Object.keys(p.terms).length),
  n("exam", "🗓️", "Planner", "Set your exam date", "Lessons", 1, (p) => (p.examDate ? 1 : 0)),
  n("fix10", "🩹", "Mistake fixer", "Master 10 questions you got wrong", "Mistakes", 10, fixed),
  n("fix50", "🔧", "Redemption arc", "Master 50 questions you got wrong", "Mistakes", 50, fixed),
  n("fix200", "🛠️", "Never wrong twice", "Master 200 questions you got wrong", "Mistakes", 200, fixed),
  n("fix500", "🦾", "Zero weak spots", "Master 500 questions you got wrong", "Mistakes", 500, fixed),

  n("back", "🔙", "Comeback kid", "Return to studying after a break of 7+ days", "Habits", 1, comeback),
  n("wknd10", "🛋️", "Weekend warrior", "Study on 10 weekend days", "Habits", 10, weekendDays),
  n("wknd30", "🌴", "No days off", "Study on 30 weekend days", "Habits", 30, weekendDays),
  n("busy10", "⏱️", "Serious business", "Answer 20+ questions on 10 different days", "Habits", 10, busyDays),
  n("busy30", "🏗️", "Built different", "Answer 20+ questions on 30 different days", "Habits", 30, busyDays),
  n("mon3", "🗓️", "Season ticket", "Study in 3 different months", "Habits", 3, monthsStudied),
  n("mon6", "🍂", "Half-year hero", "Study in 6 different months", "Habits", 6, monthsStudied),

  n("ny", "🎆", "New year, new me", "Study on 1 January", "Special days", 1, onDate("01-01")),
  n("val", "💘", "Hopelessly devoted", "Study on 14 February", "Special days", 1, onDate("02-14")),
  n("xmas", "🎄", "Christmas cram", "Study on 25 December", "Special days", 1, onDate("12-25")),
  n("nye", "🥂", "Last one of the year", "Study on 31 December", "Special days", 1, onDate("12-31")),
];

export const earned = (p: Progress) => ACHIEVEMENTS.filter((a) => { const r = a.prog(p); return r.cur >= r.goal; }).map((a) => a.id);