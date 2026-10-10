// Tab bar visibility: auto-hide on scroll.
//
// - Phones / narrow web: the floating bottom bar slides away while the learner scrolls DOWN and comes
//   back as soon as they scroll UP, reach the end of the page, or open another tab.
// - Desktop web: the left rail has its own auto-hide (pointer at the left edge; desktop-sidebar.tsx).
//
// Screens spread `useTabBarScroll()` on their main ScrollView (the `Screen` primitive already does),
// or call `useNavScroll()` and pass its `onScroll`. Whether the hiding applies is the learner's choice
// (Settings: "Auto-hide navigation"); the bar reads that itself.

import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

const TOP_ZONE = 48;   // below this offset the bar is always shown
const THRESHOLD = 8;   // ignore tiny jitters

let hidden = false;
let pageAtBottom = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

function setHidden(next: boolean) { if (hidden !== next) { hidden = next; emit(); } }
function setPageAtBottom(next: boolean) { if (pageAtBottom !== next) { pageAtBottom = next; emit(); } }

export const showTabBar = () => setHidden(false);
export const hideTabBar = () => setHidden(true);
export const usePageAtBottom = () => useSyncExternalStore(subscribe, () => pageAtBottom, () => false);
/** True while the bar is scrolled away (the caller decides whether auto-hide applies). */
export const useTabBarHidden = () => useSyncExternalStore(subscribe, () => hidden, () => false);

export function TabBarVisibilityProvider({ children }: { children: ReactNode }) { return <>{children}</>; }

export function useTabBarScroll() {
  const lastY = useRef(0);
  const contentHeight = useRef(0);
  const viewportHeight = useRef(0);
  const isFocused = useRef(false);

  // Only the active screen updates the shared state; inactive tabs stay mounted.
  useFocusEffect(useCallback(() => {
    isFocused.current = true;
    const measured = contentHeight.current > 0 && viewportHeight.current > 0;
    setPageAtBottom(measured && (contentHeight.current <= viewportHeight.current + 1 || lastY.current + viewportHeight.current >= contentHeight.current - 32));
    showTabBar();
    return () => { isFocused.current = false; setPageAtBottom(false); };
  }, []));

  return useMemo(() => ({
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!isFocused.current) return;
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      const y = Math.max(0, contentOffset.y);
      const atEnd = y + layoutMeasurement.height >= contentSize.height - 32;
      setPageAtBottom(atEnd);
      const dy = y - lastY.current;
      if (y < TOP_ZONE || atEnd) { setHidden(false); lastY.current = y; }
      else if (dy > THRESHOLD) { setHidden(true); lastY.current = y; }
      else if (dy < -THRESHOLD) { setHidden(false); lastY.current = y; }
    },
    onLayout: (event: LayoutChangeEvent) => {
      viewportHeight.current = event.nativeEvent.layout.height;
      if (isFocused.current && contentHeight.current > 0) {
        setPageAtBottom(contentHeight.current <= viewportHeight.current + 1 || lastY.current + viewportHeight.current >= contentHeight.current - 32);
      }
    },
    onContentSizeChange: (_w: number, h: number) => {
      contentHeight.current = h;
      if (isFocused.current && viewportHeight.current > 0) {
        setPageAtBottom(h <= viewportHeight.current + 1 || lastY.current + viewportHeight.current >= h - 32);
      }
    },
    scrollEventThrottle: 32,
  }), []);
}

/** Older screens: `const { onScroll } = useNavScroll();` */
export function useNavScroll() {
  const scroll = useTabBarScroll();
  const isHidden = useTabBarHidden();
  return { onScroll: scroll.onScroll, isVisible: !isHidden, show: showTabBar, hide: hideTabBar };
}
