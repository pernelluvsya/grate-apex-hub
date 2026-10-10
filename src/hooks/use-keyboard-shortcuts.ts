import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

// Keyboard shortcuts for web (laptops). Keys are matched on
// KeyboardEvent.key, case-insensitively ('Enter', 'a', '1', 'ArrowRight').
// Typing inside a text field is never intercepted, except keys listed in
// `allowInInputs` (e.g. 'Enter' to check a typed answer).
export function useKeyboardShortcuts(
  handlers: Record<string, (() => void) | undefined>,
  enabled = true,
  allowInInputs: string[] = []
) {
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  });

  const allowed = allowInInputs.join('|');

  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled || typeof window === 'undefined') return;
    const allow = allowed ? allowed.split('|') : [];

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      // Synthetic keydown events (e.g. password autofill) can arrive without a key.
      if (typeof event.key !== 'string' || event.key === '') return;
      const target = event.target as HTMLElement | null;
      const typing =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (typing && !allow.includes(key)) return;
      // A focused button handles its own Enter/Space.
      if (!typing && (key === 'Enter' || key === ' ') && target?.getAttribute('role') === 'button') return;
      const handler = ref.current[key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, allowed]);
}
