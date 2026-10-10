import { useSyncExternalStore } from 'react';

// false while the static web HTML is being generated and during
// hydration; true straight after, in the browser (and always on native).
//
// The web build is pre-rendered at export time, when the screen width,
// the time of day, saved settings and the signed-in session are unknown.
// Rendering the app only once this is true means the pre-rendered HTML
// and the first browser render always match — no hydration errors.
const noop = () => () => {};

export function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
}
