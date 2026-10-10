import { useSyncExternalStore } from 'react';

// The browser's light/dark preference, updated live when it changes.
// (react-native-web's own hook did not pick up live changes.)
// Pre-rendered web pages always start as 'light'; the real value is
// applied right after the page loads.

function getQuery() {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;
}

function subscribe(onChange: () => void) {
  const query = getQuery();

  query?.addEventListener('change', onChange);

  return () => query?.removeEventListener('change', onChange);
}

export function useColorScheme(): 'light' | 'dark' {
  return useSyncExternalStore(
    subscribe,
    () => (getQuery()?.matches ? 'dark' : 'light'),
    () => 'light'
  );
}
