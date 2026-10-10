// Single source of truth for subscription plans (kept separate from config.ts so it can't go missing).
export const PLANS = {
  sem1: { ghs: 25, label: "1 semester", days: 150 },
  sem2: { ghs: 40, label: "2 semesters", days: 300 },
} as const;
export type PlanId = keyof typeof PLANS;
export const PLAN_IDS = Object.keys(PLANS) as PlanId[];

// Manual MoMo payment details (set in Vercel / .env)
export const MOMO = {
  number: process.env.EXPO_PUBLIC_MOMO_NUMBER || "",
  name: process.env.EXPO_PUBLIC_MOMO_NAME || "",
  network: process.env.EXPO_PUBLIC_MOMO_NETWORK || "MTN MoMo",
};
