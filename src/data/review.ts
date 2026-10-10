import { useSyncExternalStore } from 'react';

import {
  getAuthenticatedLearningUserId,
  loadCloudReviewItems,
  readLearningCache,
  saveCloudReviewItems,
  subscribeToLearningAuthChanges,
  type CloudReviewItem,
  writeLearningCache,
} from '@/data/learning-sync';
import type { LegacySchedule, MemoryModel } from '@/data/learning/memory';

// Bridge between the learning engine and the earlier review system.
//
// The memory model (data/learning/memory.ts) is now the single source of
// truth for spaced repetition. This module only:
//   1. loads schedules created by the earlier system (local
//      'grateapex_review' and Supabase `review_schedule`) so the memory
//      model can carry them over for concepts with no answer history;
//   2. writes the memory model's concept schedule back to
//      `review_schedule` (a projection, in the table's existing shape),
//      so the cloud copy stays meaningful for future server features.

const STORAGE_KEY = 'grateapex_review';
const EMPTY: LegacySchedule[] = [];

let legacy: LegacySchedule[] = [];
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();
// lessonId::concept → serialized row last written to the cloud
const projected = new Map<string, string>();
let projectTimer: ReturnType<typeof setTimeout> | null = null;

function notify() {
  listeners.forEach((listener) => listener());
}

function toLegacy(item: Record<string, unknown>): LegacySchedule | null {
  if (typeof item.lessonId !== 'string' || typeof item.concept !== 'string') return null;
  if (typeof item.dueAt !== 'number') return null;
  return {
    lessonId: item.lessonId,
    concept: item.concept,
    stage: Number(item.stage) || 0,
    dueAt: item.dueAt,
    misses: Number(item.misses) || 0,
    lastReviewedAt: Number(item.lastReviewedAt) || item.dueAt,
    firstTrackedAt: typeof item.firstTrackedAt === 'number' ? item.firstTrackedAt : undefined,
  };
}

async function load() {
  const merged = new Map<string, LegacySchedule>();
  try {
    const requestedUserId = await getAuthenticatedLearningUserId();
    const saved = await readLearningCache(STORAGE_KEY);
    if ((await getAuthenticatedLearningUserId()) !== requestedUserId) return;
    if (saved) {
      const data = JSON.parse(saved);
      const items = data && typeof data === 'object' && data.items ? Object.values(data.items) : [];
      for (const raw of items) {
        const item = toLegacy(raw as Record<string, unknown>);
        if (item) merged.set(`${item.lessonId}::${item.concept}`, item);
      }
    }
  } catch (error) {
    console.log('Could not load earlier review schedule:', error);
  }

  const remote = await loadCloudReviewItems();
  for (const row of remote) {
    const key = `${row.lessonId}::${row.concept}`;
    projected.set(key, serialize(row));
    const current = merged.get(key);
    if (!current || row.lastReviewedAt > current.lastReviewedAt) {
      merged.set(key, {
        lessonId: row.lessonId,
        concept: row.concept,
        stage: row.stage,
        dueAt: row.dueAt,
        misses: row.misses,
        lastReviewedAt: row.lastReviewedAt,
        firstTrackedAt: row.firstTrackedAt,
      });
    }
  }

  legacy = Array.from(merged.values());
  notify();
}

export function ensureLegacyScheduleLoaded() {
  if (!loadPromise) loadPromise = load();
  return loadPromise;
}

/** Retry saving locally cached review schedules after reconnecting. */
export async function syncLegacyReviewSchedule() {
  await ensureLegacyScheduleLoaded();
  const requestedUserId = await getAuthenticatedLearningUserId();
  if (!requestedUserId || legacy.length === 0) return;
  const rows = legacy.map((item): CloudReviewItem => ({
    lessonId: item.lessonId,
    concept: item.concept,
    stage: Math.max(0, Math.min(4, item.stage)),
    dueAt: item.dueAt,
    misses: item.misses,
    lastReviewedAt: item.lastReviewedAt,
    firstTrackedAt: item.firstTrackedAt ?? item.lastReviewedAt,
    reason: item.misses > 0 ? 'missed' : 'learned',
  }));
  if ((await getAuthenticatedLearningUserId()) === requestedUserId) await saveCloudReviewItems(rows);
}

export function getLegacySchedulesSnapshot(): LegacySchedule[] {
  return legacy;
}

export async function resetLegacyReviewSchedule() {
  await ensureLegacyScheduleLoaded();
  if (projectTimer) clearTimeout(projectTimer);
  projectTimer = null;
  projected.clear();
  legacy = [];
  notify();
  await writeLearningCache(STORAGE_KEY, JSON.stringify({ items: {} }));
}

export function useLegacySchedules(): LegacySchedule[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      void ensureLegacyScheduleLoaded();
      return () => listeners.delete(listener);
    },
    () => legacy,
    () => EMPTY
  );
}

function stageFor(intervalDays: number) {
  if (intervalDays <= 1) return 0;
  if (intervalDays <= 3) return 1;
  if (intervalDays <= 7) return 2;
  if (intervalDays <= 14) return 3;
  return 4;
}

function serialize(row: CloudReviewItem) {
  return `${row.stage}|${row.dueAt}|${row.misses}|${row.lastReviewedAt}|${row.reason}`;
}

// Writes changed concept schedules to Supabase (debounced).
export function projectScheduleToCloud(model: MemoryModel, force = false) {
  if (projectTimer) clearTimeout(projectTimer);
  projectTimer = setTimeout(() => {
    projectTimer = null;
    const rows: CloudReviewItem[] = [];
    for (const concept of model.concepts.values()) {
      if (concept.dueAt === null) continue;
      const lastReviewedAt = concept.lastReviewedAt ?? concept.learnedAt ?? concept.firstSeenAt ?? concept.dueAt;
      const row: CloudReviewItem = {
        lessonId: concept.lessonId,
        concept: concept.name,
        stage: stageFor(concept.intervalDays),
        dueAt: concept.dueAt,
        misses: concept.lapses + (concept.reviews === 0 ? concept.incorrect : 0),
        lastReviewedAt,
        firstTrackedAt: concept.firstSeenAt ?? lastReviewedAt,
        reason: concept.incorrect > 0 ? 'missed' : 'learned',
      };
      const key = `${row.lessonId}::${row.concept}`;
      const value = serialize(row);
      if (!force && projected.get(key) === value) continue;
      projected.set(key, value);
      rows.push(row);
    }
    if (rows.length > 0) void saveCloudReviewItems(rows);
  }, 4000);
}

let activeLearningUserId: string | null | undefined;
subscribeToLearningAuthChanges((userId) => {
  if (activeLearningUserId === userId) return;
  activeLearningUserId = userId;
  legacy = [];
  projected.clear();
  loadPromise = null;
  notify();
  if (userId) void ensureLegacyScheduleLoaded();
});
