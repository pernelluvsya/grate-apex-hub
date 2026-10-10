import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

// Home's notification preferences. They are per device (AsyncStorage); appearance, zoom and the rest
// of the settings live in the hub's own Profile tab and theme system.
export type NotificationCategory = 'learningReminders' | 'streakReminders' | 'socialEngagement' | 'friendRequests' | 'announcements';
export type NotificationPreferences = Record<NotificationCategory, boolean>;

const KEY = 'ga_home_notification_prefs';
const DEFAULTS: NotificationPreferences = { learningReminders: true, streakReminders: true, socialEngagement: true, friendRequests: true, announcements: true };
let prefs: NotificationPreferences = DEFAULTS;
let push = false;
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) { const j = JSON.parse(raw); prefs = { ...DEFAULTS, ...(j.prefs ?? {}) }; push = !!j.push; emit(); }
  } catch { /* defaults */ }
}
const save = () => AsyncStorage.setItem(KEY, JSON.stringify({ prefs, push })).catch(() => {});
function sub(l: () => void) { listeners.add(l); void load(); return () => listeners.delete(l); }

export function useNotificationPreferences(): NotificationPreferences {
  return useSyncExternalStore(sub, () => prefs, () => prefs);
}
export function usePushNotificationsPreference(): boolean {
  return useSyncExternalStore(sub, () => push, () => push);
}
export async function setNotificationPreference(category: NotificationCategory, enabled: boolean) {
  prefs = { ...prefs, [category]: enabled }; emit(); await save();
}
export async function setPushNotificationsPreference(enabled: boolean) {
  push = enabled; emit(); await save();
}
