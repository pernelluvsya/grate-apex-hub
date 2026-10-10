import { useSyncExternalStore } from 'react';
import { Platform, type ViewStyle } from 'react-native';

// Web-only style properties (cursor, transitions, outlines…) that React
// Native's types don't describe. Returns nothing on native.
export function webStyle(style: Record<string, unknown>): ViewStyle {
  return (Platform.OS === 'web' ? style : {}) as ViewStyle;
}

export const isWeb = Platform.OS === 'web';

// ── Keyboard vs pointer modality ─────────────────────────────────────
// Focus rings are shown for keyboard users only (like :focus-visible),
// so clicking a card with a mouse does not leave a ring behind.
let keyboardMode = false;
const listeners = new Set<() => void>();
let installed = false;

function install() {
  if (installed || typeof window === 'undefined' || !isWeb) return;
  installed = true;
  const set = (value: boolean) => {
    if (keyboardMode === value) return;
    keyboardMode = value;
    listeners.forEach((listener) => listener());
  };
  window.addEventListener(
    'keydown',
    (event) => {
      // `key` can be missing on synthetic keydown events (e.g. browser
      // password autofill on the login form), so never assume a string.
      const key = typeof event.key === 'string' ? event.key : '';
      if (key === 'Tab' || key.startsWith('Arrow') || key === 'Enter' || key === ' ') set(true);
    },
    true
  );
  window.addEventListener('mousedown', () => set(false), true);
  window.addEventListener('pointerdown', () => set(false), true);
  window.addEventListener('touchstart', () => set(false), true);
}

export function useKeyboardModality() {
  return useSyncExternalStore(
    (listener) => {
      install();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => keyboardMode,
    () => false
  );
}
