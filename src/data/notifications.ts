import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Href } from '@/lib/router';
import { useSyncExternalStore } from 'react';

import type { IconName } from '@/components/ui/icon';
import type { MemoryModel } from '@/data/learning/memory-types';
import { dayKey, DAY_MS, endOfDay, startOfDay } from '@/data/learning/time';
import { rankProgress } from '@/progress';

// Notifications are DERIVED from real learning state (what is due, the
// streak, milestones, new GRATEAPEX features) — nothing is invented and
// nothing is sent anywhere. Only the "read" marks are stored, on this
// device.

export type NotificationGroup = 'learning' | 'updates';

export type AppNotification = {
  id: string; // stable, so read marks survive re-derivation
  group: NotificationGroup;
  title: string;
  body: string;
  at: number;
  href?: Href;
  icon: IconName;
  tone: 'primary' | 'gold' | 'warning' | 'success';
};

type Inputs = {
  memory: MemoryModel;
  streak: number;
  lastActivityDate: string | null;
  xp: number;
  now: number;
};

export function buildNotifications({ memory, streak, lastActivityDate, xp, now }: Inputs): AppNotification[] {
  const items: AppNotification[] = [];
  const today = startOfDay(now);
  const concepts = Array.from(memory.concepts.values()).filter((concept) => concept.dueAt !== null);
  const dueToday = concepts.filter((concept) => concept.dueAt! <= endOfDay(now));
  const overdue = dueToday.filter((concept) => concept.dueAt! < today);

  if (dueToday.length > 0) {
    items.push({
      id: `due-${dayKey(now)}`,
      group: 'learning',
      title: 'Your next reinforcement is ready.',
      body: `${dueToday.length} concept${dueToday.length === 1 ? '' : 's'} due today${overdue.length ? ` · ${overdue.length} overdue` : ''}. Reviewing now protects your mastery.`,
      at: today,
      href: '/learn' as Href,
      icon: 'reinforce',
      tone: overdue.length ? 'warning' : 'primary',
    });
  }

  if (streak > 0 && lastActivityDate === dayKey(now - DAY_MS)) {
    items.push({
      id: `streak-${dayKey(now)}`,
      group: 'learning',
      title: 'Keep the momentum.',
      body: `Complete a lesson today to keep your ${streak}-day streak.`,
      at: today,
      href: '/learn' as Href,
      icon: 'streak',
      tone: 'gold',
    });
  }

  const rank = rankProgress(xp);
  if (!rank.isTopRank && rank.xpToNextRank !== null && rank.percentToNextRank >= 85) {
    items.push({
      id: `rank-near-${rank.title}`,
      group: 'learning',
      title: 'Your next rank is close.',
      body: `${rank.xpToNextRank.toLocaleString()} XP to go.`,
      at: today,
      href: '/progress' as Href,
      icon: 'rank',
      tone: 'gold',
    });
  }

  return items.sort((a, b) => b.at - a.at);
}

// ── Read marks (this device) ──────────────────────────────────────────

const STORAGE_KEY = 'grateapex_notifications_read';
const LIMIT = 400;
let read = new Set<string>();
let loaded = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

async function load() {
  if (loaded) return;
  loaded = true;
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      const ids = JSON.parse(saved);
      if (Array.isArray(ids)) {
        read = new Set(ids.filter((id): id is string => typeof id === 'string'));
        notify();
      }
    }
  } catch (problem) {
    console.warn('Could not load notification read marks:', problem);
  }
}

async function save() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(read).slice(-LIMIT)));
  } catch (problem) {
    console.warn('Could not save notification read marks:', problem);
  }
}

export function markNotificationsRead(ids: string[]) {
  let changed = false;
  for (const id of ids) {
    if (!read.has(id)) {
      read.add(id);
      changed = true;
    }
  }
  if (!changed) return;
  read = new Set(read);
  notify();
  void save();
}

export function useReadNotifications(): ReadonlySet<string> {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      void load();
      return () => listeners.delete(listener);
    },
    () => read,
    () => read
  );
}
