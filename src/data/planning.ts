import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';

// Personal goals live in users/{uid}/goals (owner-only, see firestore.rules).
export type PersonalGoal = {
  id: string;
  user_id: string;
  title: string;
  goal_type: 'lessons' | 'xp' | 'questions' | 'streak' | 'topic' | 'study_plan';
  target: number;
  current: number;
  deadline: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

async function currentUserId() {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to sync your goals.');
  return user.uid;
}

export async function listPersonalGoals(): Promise<PersonalGoal[]> {
  try {
    const userId = await currentUserId();
    const snap = await getDocs(collection(db, 'users', userId, 'goals'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PersonalGoal);
  } catch {
    return [];
  }
}

export async function createPersonalGoal(
  input: Pick<PersonalGoal, 'title' | 'goal_type' | 'target' | 'deadline'>
): Promise<PersonalGoal> {
  const userId = await currentUserId();
  const id = `goal_${Date.now()}`;
  const now = new Date().toISOString();
  const goal: PersonalGoal = {
    id,
    user_id: userId,
    ...input,
    current: 0,
    completed_at: null,
    created_at: now,
    updated_at: now,
  };

  await setDoc(doc(db, 'users', userId, 'goals', id), goal);
  return goal;
}

export async function deletePersonalGoal(id: string) {
  const userId = await currentUserId();
  await deleteDoc(doc(db, 'users', userId, 'goals', id));
}

export async function updatePersonalGoal(id: string, current: number) {
  const userId = await currentUserId();
  await updateDoc(doc(db, 'users', userId, 'goals', id), {
    current,
    completed_at: current > 0 ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  });
}

export async function refreshProgressGoals(progress: { lessonsCompleted: number; xp: number; streak: number }) {
  try {
    const userId = await currentUserId();
    const snap = await getDocs(collection(db, 'users', userId, 'goals'));
    const supported: Record<string, number> = {
      lessons: progress.lessonsCompleted,
      xp: progress.xp,
      streak: progress.streak,
    };

    for (const d of snap.docs) {
      const g = d.data();
      if (g.goal_type in supported) {
        const current = Math.max(0, supported[g.goal_type]);
        if (Number(g.current) !== current) {
          await updateDoc(d.ref, {
            current,
            completed_at: current >= Number(g.target) ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          });
        }
      }
    }
  } catch {}
}
