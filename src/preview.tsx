// Developer-only: renders the app with fake data so the design can be checked
// without logging in. Used when the app is started with EXPO_PUBLIC_PREVIEW=1.
import React from "react";
import { Ctx as AuthCtx } from "./auth";
import { PCtx } from "./progress";

const noop = async () => {};
export function PreviewProviders({ children, level = 1 }: { children: React.ReactNode; level?: number }) {
  const today = new Date(); const k = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const days: Record<string, number> = {};
  for (let i = 0; i < 4; i++) { const d = new Date(today); d.setDate(d.getDate() - i); days[k(d)] = 20 + i * 5; }
  const xp = (level - 1) * 150 + 60;
  const auth: any = {
    user: { uid: "preview", email: "kofi@grateapex.app" },
    profile: { username: "kofi_a", hall: "HB1", semester: 2, onboardingDone: true, classLocked: true, tutorialDone: true },
    loading: false, signUp: noop, signIn: noop, signInWithGoogle: noop, chooseUsername: noop, signOut: noop, saveOnboarding: noop, finishTutorial: noop, replayTutorial: noop, changeUsername: noop,
  };
  const progress: any = {
    progress: { xp, days, updatedAt: 0, cards: {}, seen: { biochemistry: Array.from({ length: 120 }, (_, i) => "x" + i) }, tests: {}, terms: {}, lessons: { "physiology-01": 3, "biochemistry-03": 11 }, diff: { biochemistry: 3 }, examDate: k(new Date(today.getTime() + 31 * 86400000)),
      topics: { biochemistry: { "Glycolysis": [12, 5], "Lipid metabolism": [8, 4], "Enzymes": [20, 18] } }, subjects: {
      biochemistry: { answered: 120, correct: 88, quizzes: 6, best: 92, xp: 400 }, physiology: { answered: 45, correct: 30, quizzes: 2, best: 71, xp: 150 } } },
    streak: 4, recordRound: () => ({ xp: 50, info: { newCards: 3 } }), setExamDate: () => {}, markLesson: () => {}, toggleStar: () => {}, gradeTerm: () => {}, syncState: "synced",
  };
  return <AuthCtx.Provider value={auth}><PCtx.Provider value={progress}>{children}</PCtx.Provider></AuthCtx.Provider>;
}
