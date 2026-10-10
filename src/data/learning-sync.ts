import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { auth, db } from '@/lib/firebase';

const LEGACY_CACHE_OWNER_KEY = 'grateapex_learning_cache_owner';

export type CloudLearningStats = {
  total_xp: number;
  current_streak: number;
  last_activity_date: string | null;
};

export type CloudLessonRow = { lessonId: string; completedAt: number | null };

export type CloudProgress = {
  stats: CloudLearningStats | null;
  completedLessons: CloudLessonRow[];
};

export type AttemptMode =
  | 'interactive'
  | 'interactive-retry'
  | 'lesson-quiz'
  | 'topic-quiz'
  | 'practice'
  | 'review'
  | 'recall'
  | 'apex'
  | 'mastery-check';

export type CloudQuestionAttempt = {
  id: string;
  questionId: string;
  topicId: string;
  lessonId: string;
  concept: string;
  correct: boolean;
  attemptedAt: number;
  mode: AttemptMode;
};

export type CloudQuizKind = 'lesson' | 'apex_challenge' | 'topic' | 'review' | 'practice';

export type CloudQuizAttempt = {
  id: string;
  attemptType: CloudQuizKind;
  courseId: string | null;
  lessonId: string | null;
  score: number;
  total: number;
  percentage: number;
  timeSeconds: number;
  wrongConcepts: string[];
  wrongQuestionIds: string[];
  practice: boolean;
  completedAt: number;
};

export type CloudReviewItem = {
  lessonId: string;
  concept: string;
  stage: number;
  dueAt: number;
  misses: number;
  lastReviewedAt: number;
  firstTrackedAt: number;
  reason: 'learned' | 'missed';
};

export type CloudLearningEvent = {
  id: string;
  type: string;
  at: number;
  topicId: string | null;
  lessonId: string | null;
  refId: string | null;
  data: Record<string, unknown> | null;
};

async function getUserId(): Promise<string | null> {
  return auth.currentUser?.uid ?? null;
}

export async function getAuthenticatedLearningUserId(): Promise<string | null> {
  return getUserId();
}

export async function readLearningCache(key: string) {
  const userId = await getUserId();
  if (!userId) return AsyncStorage.getItem(key);

  const accountKey = `${key}:${userId}`;
  const accountValue = await AsyncStorage.getItem(accountKey);
  if (accountValue !== null) return accountValue;

  const legacyOwner = await AsyncStorage.getItem(LEGACY_CACHE_OWNER_KEY);
  if (legacyOwner && legacyOwner !== userId) return null;

  if (!legacyOwner) {
    await AsyncStorage.setItem(LEGACY_CACHE_OWNER_KEY, userId);
  }
  const legacyValue = await AsyncStorage.getItem(key);
  if (legacyValue !== null) {
    await AsyncStorage.setItem(accountKey, legacyValue);
  }
  return legacyValue;
}

export async function writeLearningCache(key: string, value: string) {
  const userId = await getUserId();
  const storageKey = userId ? `${key}:${userId}` : key;
  await AsyncStorage.setItem(storageKey, value);
}

export function subscribeToLearningAuthChanges(listener: (userId: string | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    listener(user?.uid ?? null);
  });
}

function toMillis(value: any): number {
  if (!value) return Date.now();
  if (typeof value === 'number') return value;
  if (value?.toMillis) return value.toMillis();
  if (value?.toDate) return value.toDate().getTime();
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : Date.now();
}

export function createLearningRecordId() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();

  const bytes = new Uint8Array(16);
  if (cryptoApi?.getRandomValues) {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// ─── Progress ────────────────────────────────────────────────────────

export async function loadCloudProgress(): Promise<CloudProgress | null> {
  const userId = await getUserId();
  if (!userId) return null;

  try {
    const progressDocRef = doc(db, 'progress', userId);
    const snap = await getDoc(progressDocRef);

    if (!snap.exists()) {
      return null;
    }

    const d = snap.data() || {};
    const totalXp = Number(d.xp ?? 0);
    const streak =
      typeof d.days === 'number'
        ? d.days
        : d.days && typeof d.days === 'object'
          ? Object.keys(d.days).length
          : Number(d.streak ?? 0);

    const lastActivity = d.savedAt?.toDate
      ? d.savedAt.toDate().toISOString().split('T')[0]
      : (d.lastActivityDate ?? null);

    let completedLessons: CloudLessonRow[] = [];
    if (d.lessons && typeof d.lessons === 'object' && !Array.isArray(d.lessons)) {
      completedLessons = Object.entries(d.lessons).map(([id, val]: [string, any]) => ({
        lessonId: id,
        completedAt:
          typeof val === 'number'
            ? val
            : val && typeof val === 'object' && 'completedAt' in val
              ? toMillis(val.completedAt)
              : null,
      }));
    } else if (Array.isArray(d.lessons)) {
      completedLessons = d.lessons.map((item: any) =>
        typeof item === 'string'
          ? { lessonId: item, completedAt: null }
          : { lessonId: item.lessonId || item.id, completedAt: item.completedAt ? toMillis(item.completedAt) : null }
      );
    }

    return {
      stats: {
        total_xp: totalXp,
        current_streak: streak,
        last_activity_date: lastActivity,
      },
      completedLessons,
    };
  } catch (error) {
    console.warn('Could not load learning progress from Firestore:', error);
    return null;
  }
}

/** Clear all server-backed learning records for the signed-in learner. */
export async function resetCloudLearningProgress() {
  const userId = await getUserId();
  if (!userId) throw new Error('Sign in before resetting your learning progress.');

  const progressDocRef = doc(db, 'progress', userId);
  await setDoc(progressDocRef, {
    xp: 0,
    streak: 0,
    lessons: {},
    days: {},
    subjects: {},
    topics: {},
    cards: {},
    seen: {},
    terms: {},
    tests: {},
    savedAt: serverTimestamp(),
    updatedAt: Date.now(),
  });
}

export async function saveCloudProgress(
  completedLessons: { lessonId: string; xp: number; completedAt?: number }[],
  stats: CloudLearningStats
) {
  const userId = await getUserId();
  if (!userId) return;

  try {
    const progressDocRef = doc(db, 'progress', userId);
    const snap = await getDoc(progressDocRef);
    const existing = snap.data() || {};
    const existingLessons = existing.lessons && typeof existing.lessons === 'object' ? existing.lessons : {};

    const updatedLessons: Record<string, any> = { ...existingLessons };
    for (const l of completedLessons) {
      updatedLessons[l.lessonId] = {
        completedAt: l.completedAt || Date.now(),
        xp: l.xp,
      };
    }

    await setDoc(
      progressDocRef,
      {
        xp: stats.total_xp,
        streak: stats.current_streak,
        lastActivityDate: stats.last_activity_date,
        lessons: updatedLessons,
        savedAt: serverTimestamp(),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not save learning progress to Firestore:', error);
  }
}

export async function saveCloudXpEvent(
  sourceType: 'lesson' | 'quiz',
  sourceId: string,
  amount: number,
  stats: CloudLearningStats
) {
  if (amount <= 0) return;
  const userId = await getUserId();
  if (!userId) return;

  try {
    const progressDocRef = doc(db, 'progress', userId);
    await setDoc(
      progressDocRef,
      {
        xp: stats.total_xp,
        streak: stats.current_streak,
        lastActivityDate: stats.last_activity_date,
        savedAt: serverTimestamp(),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not save XP event to Firestore:', error);
  }
}

export async function recordCloudXpAdjustment(amount: number, sourceId: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || amount === 0) return false;

  try {
    const progressDocRef = doc(db, 'progress', userId);
    const snap = await getDoc(progressDocRef);
    const currentXp = Number(snap.data()?.xp ?? 0);
    await updateDoc(progressDocRef, {
      xp: Math.max(0, currentXp + amount),
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    console.warn('Could not adjust XP in Firestore:', error);
    return false;
  }
}

// ─── Quiz attempts ───────────────────────────────────────────────────

export async function loadCloudQuizAttempts(): Promise<CloudQuizAttempt[]> {
  const userId = await getUserId();
  if (!userId) return [];

  try {
    const scoresQuery = query(
      collection(db, 'scores'),
      where('userId', '==', userId),
      limit(200)
    );
    const snap = await getDocs(scoresQuery);

    return snap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        attemptType: d.attemptType || d.attempt_type || 'lesson',
        courseId: d.courseId || d.course_id || null,
        lessonId: d.lessonId || d.lesson_id || null,
        score: Number(d.score || 0),
        total: Number(d.total || 0),
        percentage: Number(d.percentage || 0),
        timeSeconds: Number(d.timeSeconds || d.time_seconds || 0),
        wrongConcepts: d.wrongConcepts || d.wrong_concepts || [],
        wrongQuestionIds: d.wrongQuestionIds || d.wrong_question_ids || [],
        practice: Boolean(d.practice),
        completedAt: toMillis(d.completedAt || d.completed_at),
      };
    });
  } catch (error) {
    console.warn('Could not load quiz attempts from Firestore:', error);
    return [];
  }
}

export async function saveCloudQuizAttempt(attempt: CloudQuizAttempt): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || attempt.total <= 0) return false;

  try {
    const scoreDocRef = doc(db, 'scores', attempt.id);
    await setDoc(
      scoreDocRef,
      {
        ...attempt,
        userId,
        savedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Could not save quiz attempt to Firestore:', error);
    return false;
  }
}

// ─── Question attempts ───────────────────────────────────────────────

export async function loadCloudQuestionAttempts(): Promise<CloudQuestionAttempt[]> {
  const userId = await getUserId();
  if (!userId) return [];

  try {
    const progressDocRef = doc(db, 'progress', userId);
    const snap = await getDoc(progressDocRef);
    const d = snap.data();
    const attempts = d?.questionAttempts || [];
    return attempts.map((a: any) => ({
      ...a,
      attemptedAt: toMillis(a.attemptedAt),
    }));
  } catch (error) {
    console.warn('Could not load question attempts from Firestore:', error);
    return [];
  }
}

export async function saveCloudQuestionAttempts(attempts: CloudQuestionAttempt[]) {
  if (attempts.length === 0) return;
  const userId = await getUserId();
  if (!userId) return;

  try {
    const progressDocRef = doc(db, 'progress', userId);
    const snap = await getDoc(progressDocRef);
    const existing = snap.data()?.questionAttempts || [];
    const merged = [...existing, ...attempts].slice(-2000);

    await setDoc(
      progressDocRef,
      {
        questionAttempts: merged,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not save question attempts to Firestore:', error);
  }
}

// ─── Review schedule (projection of the memory model) ────────────────

export async function loadCloudReviewItems(): Promise<CloudReviewItem[]> {
  const userId = await getUserId();
  if (!userId) return [];

  try {
    const progressDocRef = doc(db, 'progress', userId);
    const snap = await getDoc(progressDocRef);
    const d = snap.data();
    const items = d?.reviewSchedule || [];
    return items.map((item: any) => ({
      ...item,
      dueAt: toMillis(item.dueAt),
      lastReviewedAt: toMillis(item.lastReviewedAt),
      firstTrackedAt: toMillis(item.firstTrackedAt),
    }));
  } catch (error) {
    console.warn('Could not load review items from Firestore:', error);
    return [];
  }
}

export async function saveCloudReviewItems(items: CloudReviewItem[]) {
  if (items.length === 0) return;
  const userId = await getUserId();
  if (!userId) return;

  try {
    const progressDocRef = doc(db, 'progress', userId);
    await setDoc(
      progressDocRef,
      {
        reviewSchedule: items,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not save review items to Firestore:', error);
  }
}

// ─── Learning events ─────────────────────────────────────────────────

export async function loadCloudLearningEvents(): Promise<CloudLearningEvent[]> {
  const userId = await getUserId();
  if (!userId) return [];

  try {
    const progressDocRef = doc(db, 'progress', userId);
    const snap = await getDoc(progressDocRef);
    const d = snap.data();
    const events = d?.learningEvents || [];
    return events.map((event: any) => ({
      ...event,
      at: toMillis(event.at),
    }));
  } catch (error) {
    console.warn('Could not load learning events from Firestore:', error);
    return [];
  }
}

export async function saveCloudLearningEvents(events: CloudLearningEvent[]) {
  if (events.length === 0) return;
  const userId = await getUserId();
  if (!userId) return;

  try {
    const progressDocRef = doc(db, 'progress', userId);
    const snap = await getDoc(progressDocRef);
    const existing = snap.data()?.learningEvents || [];
    const merged = [...existing, ...events].slice(-500);

    await setDoc(
      progressDocRef,
      {
        learningEvents: merged,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not save learning events to Firestore:', error);
  }
}
