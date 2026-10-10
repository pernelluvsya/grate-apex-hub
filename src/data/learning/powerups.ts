import { useSyncExternalStore } from 'react';

import {
  getAuthenticatedLearningUserId,
  readLearningCache,
  subscribeToLearningAuthChanges,
  writeLearningCache,
} from '@/data/learning-sync';
import type { PowerupMultiplier } from '@/data/learning/xp-rules';

export type PowerupSource = 'lesson' | 'quiz' | 'streak' | 'share';
export type Powerup = {
  id: string;
  source: PowerupSource;
  sourceId: string;
  multiplier: Exclude<PowerupMultiplier, 1>;
  earnedAt: number;
};

const STORAGE_KEY = 'grateapex_powerups';
const EMPTY: readonly Powerup[] = [];
let inventory: Powerup[] = [];
let earnedKeys = new Set<string>();
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function ordered(items: Powerup[]) {
  return [...items].sort((a, b) => b.multiplier - a.multiplier || a.earnedAt - b.earnedAt);
}

async function save() {
  try {
    await writeLearningCache(STORAGE_KEY, JSON.stringify({ inventory, earnedKeys: [...earnedKeys] }));
  } catch (error) {
    console.warn('Could not save power-ups:', error);
  }
}

async function load() {
  // AsyncStorage's web adapter touches window during static rendering.
  if (typeof window === 'undefined') return;
  const requestedUserId = await getAuthenticatedLearningUserId();
  try {
    const saved = await readLearningCache(STORAGE_KEY);
    if ((await getAuthenticatedLearningUserId()) !== requestedUserId) return;
    if (!saved) return;
    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return;
    const data = parsed as { inventory?: unknown; earnedKeys?: unknown };
    inventory = Array.isArray(data.inventory)
      ? data.inventory.filter((item): item is Powerup => Boolean(item) && typeof item === 'object'
        && typeof (item as Powerup).id === 'string'
        && [1.5, 2, 2.5, 3].includes((item as Powerup).multiplier))
      : [];
    earnedKeys = new Set(Array.isArray(data.earnedKeys)
      ? data.earnedKeys.filter((item): item is string => typeof item === 'string')
      : inventory.map((item) => `${item.source}:${item.sourceId}`));
    inventory = ordered(inventory);
    notify();
  } catch (error) {
    console.warn('Could not load power-ups:', error);
  }
}

function ensureLoaded() {
  if (!loadPromise) loadPromise = load();
  return loadPromise;
}

export function ensurePowerupsLoaded() {
  return ensureLoaded();
}

export function usePowerups(): readonly Powerup[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      void ensureLoaded();
      return () => listeners.delete(listener);
    },
    () => inventory,
    () => EMPTY
  );
}

export async function resetPowerups() {
  await ensureLoaded();
  inventory = [];
  earnedKeys = new Set();
  await save();
  notify();
}

export async function grantPowerup(source: PowerupSource, sourceId: string, multiplier: Exclude<PowerupMultiplier, 1> = 1.5) {
  await ensureLoaded();
  const key = `${source}:${sourceId}`;
  if (!sourceId || earnedKeys.has(key)) return false;
  earnedKeys.add(key);
  inventory = ordered([...inventory, { id: key, source, sourceId, multiplier, earnedAt: Date.now() }]);
  await save();
  notify();
  return true;
}

export async function consumePowerup(): Promise<Powerup | null> {
  await ensureLoaded();
  const powerup = inventory[0];
  if (!powerup) return null;
  inventory = inventory.filter((item) => item.id !== powerup.id);
  await save();
  notify();
  return powerup;
}

export async function returnPowerup(powerup: Powerup) {
  await ensureLoaded();
  if (inventory.some((item) => item.id === powerup.id)) return;
  inventory = ordered([powerup, ...inventory]);
  await save();
  notify();
}

subscribeToLearningAuthChanges(() => {
  inventory = [];
  earnedKeys = new Set();
  loadPromise = null;
  notify();
  void ensureLoaded();
});
