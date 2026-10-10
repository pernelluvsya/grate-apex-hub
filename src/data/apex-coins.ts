import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';

// Apex Coins are an economy, so the balance is read-only from the app: it lives on users/{uid}.apexCoins
// and only the server (an admin-key endpoint) may change it. Until that endpoint exists the balance is 0.
export type ApexCoinReward = 'apex_challenge' | 'topic_completion';
export type StreakRecoveryOffer = { id: string; lost_streak: number; lost_on: string };

export async function readApexCoinBalance(): Promise<number> {
  const user = auth.currentUser;
  if (!user) return 0;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    const n = Number(snap.data()?.apexCoins ?? 0);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch { return 0; }
}
export async function readStreakRecoveryOffer(): Promise<StreakRecoveryOffer | null> { return null; }
