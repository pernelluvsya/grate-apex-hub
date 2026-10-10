import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, View } from "react-native";
import { Text } from "./Text";
import { useColors } from "./theme";

// Pull-to-refresh for the web build / PWA. (React Native's <RefreshControl> only works in the native app;
// react-native-web ignores it.)
//
// Usage in a screen:
//   const { scrollRef, indicator } = usePullToRefresh(load);
//   <View style={{ flex: 1 }}>{indicator}<ScrollView ref={scrollRef} ...>...</ScrollView></View>
//
// Pull down while the list is scrolled to the top: an arrow follows your finger, release past the line to refresh.
// It also stops Chrome's own pull-down page reload on that list, so the two don't fight.
const TRIGGER = 64; // how far (px) you must pull before release refreshes
const MAX = 96;

export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const COLORS = useColors();
  const scrollRef = useRef<ScrollView>(null);
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const cb = useRef(onRefresh);
  cb.current = onRefresh; // always the latest load()

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const node: any = (scrollRef.current as any)?.getScrollableNode?.() ?? scrollRef.current;
    if (!node || typeof node.addEventListener !== "function") return;
    node.style.overscrollBehaviorY = "contain"; // no browser pull-to-reload / scroll chaining from this list

    let startY: number | null = null;
    let dist = 0;
    let running = false;

    const start = (e: TouchEvent) => {
      if (running) return;
      startY = node.scrollTop <= 0 ? e.touches[0].clientY : null; // only when already at the top
      dist = 0;
    };
    const move = (e: TouchEvent) => {
      if (startY === null || running) return;
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0 || node.scrollTop > 0) { if (dist) { dist = 0; setPull(0); } return; } // scrolling up / not at top
      dist = Math.min(dy * 0.5, MAX); // resistance: the arrow moves half as far as the finger
      if (e.cancelable) e.preventDefault(); // we are handling this drag
      setPull(dist);
    };
    const end = async () => {
      if (startY === null) return;
      startY = null;
      const d = dist;
      dist = 0;
      if (d >= TRIGGER && !running) {
        running = true;
        setBusy(true);
        setPull(TRIGGER);
        try { await cb.current(); } finally { running = false; setBusy(false); setPull(0); }
      } else setPull(0);
    };

    node.addEventListener("touchstart", start, { passive: true });
    node.addEventListener("touchmove", move, { passive: false }); // not passive: we call preventDefault
    node.addEventListener("touchend", end);
    node.addEventListener("touchcancel", end);
    return () => {
      node.removeEventListener("touchstart", start);
      node.removeEventListener("touchmove", move);
      node.removeEventListener("touchend", end);
      node.removeEventListener("touchcancel", end);
    };
  }, []);

  const indicator = Platform.OS === "web" && (pull > 0 || busy) ? (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, alignItems: "center", zIndex: 20, opacity: Math.min(1, pull / TRIGGER), transform: [{ translateY: pull - 40 }] }}>
      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" }}>
        {busy
          ? <ActivityIndicator color={COLORS.accent} />
          : <Text style={{ color: COLORS.accent, fontSize: 18, fontWeight: "800" }}>{pull >= TRIGGER ? "↻" : "↓"}</Text>}
      </View>
    </View>
  ) : null;

  return { scrollRef, indicator };
}
