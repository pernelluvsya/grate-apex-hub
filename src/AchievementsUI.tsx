import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, View } from "react-native";
import { Text } from "./Text";
import { useColors } from "./theme";
import { useAuth } from "./auth";
import { useProgress } from "./progress";
import { ACHIEVEMENTS, earned } from "./achievements";
import { getItem, setItem } from "./store";
import { Em, Glyph } from "./components/em";
import { Icon, type IconName } from "./components/ui/icon";
import { withIcons as wi } from "./components/em";

// Each achievement group gets one drawn icon (earned: gold on the badge; locked: a padlock).
const GROUP_ICON: Record<string, IconName> = { Questions: "lesson", Streaks: "streak", Levels: "rank", Skill: "target", Lessons: "learn", Mistakes: "reinforce", Habits: "calendar", "Special days": "sparkle" };
export const achievementIcon = (group: string): IconName => GROUP_ICON[group] ?? "achievement";

// Shelf of every badge: earned ones in colour, locked ones dimmed with a progress bar.
export function AchievementShelf() {
  const COLORS = useColors();
  const { progress } = useProgress();
  const groups = Array.from(new Set(ACHIEVEMENTS.map((a) => a.group)));
  const done = earned(progress).length;
  return (
    <View>
      <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "800" }}><Em n="achievement" /> Achievements</Text>
      <Text style={{ color: COLORS.muted, marginTop: 2, marginBottom: 10 }}>{done} of {ACHIEVEMENTS.length} earned</Text>
      {groups.map((g) => (
        <View key={g} style={{ marginBottom: 8 }}>
          <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: "700", marginVertical: 6 }}>{g.toUpperCase()}</Text>
          {ACHIEVEMENTS.filter((a) => a.group === g).map((a) => {
            const r = a.prog(progress), ok = r.cur >= r.goal;
            return (
              <View key={a.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, opacity: ok ? 1 : 0.65 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: ok ? COLORS.primary : COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Text style={{ fontSize: 22, opacity: ok ? 1 : 0.4 }}>{ok ? a.icon : wi("🔒")}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.text, fontWeight: "700" }}>{a.name}</Text>
                  <Text style={{ color: COLORS.muted, fontSize: 13 }}>{a.desc}</Text>
                  {!ok && (
                    <View style={{ height: 5, borderRadius: 3, backgroundColor: COLORS.border, marginTop: 6, overflow: "hidden" }}>
                      <View style={{ width: `${Math.round((r.cur / r.goal) * 100)}%`, height: 5, backgroundColor: COLORS.accent }} />
                    </View>
                  )}
                </View>
                {!ok && r.goal !== 1 && <Text style={{ color: COLORS.muted, fontSize: 12, marginLeft: 8 }}>{r.cur}/{r.goal}</Text>}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// Watches progress and pops a banner whenever a new badge is earned.
// The first time on a device it just records what's already earned, so nobody gets a flood.
export function AchievementWatcher() {
  const COLORS = useColors();
  const { user } = useAuth();
  const { progress, syncState } = useProgress();
  const seen = useRef<Set<string> | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [shown, setShown] = useState<string | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const key = user ? `ach:${user.uid}` : null;

  useEffect(() => { seen.current = null; setQueue([]); }, [key]);

  useEffect(() => {
    if (!key || (syncState !== "synced" && syncState !== "offline")) return;
    let off = false;
    (async () => {
      if (!seen.current) {
        const saved = await getItem<string[]>(key);
        if (off) return;
        seen.current = new Set(saved ?? earned(progress));
        if (!saved) await setItem(key, Array.from(seen.current));
      }
      const fresh = earned(progress).filter((id) => !seen.current!.has(id));
      if (!fresh.length || off) return;
      fresh.forEach((id) => seen.current!.add(id));
      await setItem(key, Array.from(seen.current));
      setQueue((q) => [...q, ...fresh]);
    })();
    return () => { off = true; };
  }, [progress, syncState, key]);

  useEffect(() => {
    if (shown || !queue.length) return;
    setShown(queue[0]); setQueue((q) => q.slice(1));
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(3500),
      Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShown(null));
  }, [queue, shown, fade]);

  const a = ACHIEVEMENTS.find((x) => x.id === shown);
  if (!a) return null;
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", top: 20, left: 0, right: 0, alignItems: "center", opacity: fade, zIndex: 999 }}>
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, borderColor: COLORS.accent, borderWidth: 2, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 16, maxWidth: 360 }}>
        <View style={{ marginRight: 12 }}><Icon name={achievementIcon(a.group)} size={30} color={COLORS.accent} filled /></View>
        <View style={{ flexShrink: 1 }}>
          <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: "800" }}>ACHIEVEMENT UNLOCKED</Text>
          <Text style={{ color: COLORS.text, fontWeight: "800", fontSize: 16 }}>{a.name}</Text>
          <Text style={{ color: COLORS.muted, fontSize: 12 }}>{a.desc}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// Horizontal row of badge tiles (earned first, then the closest locked ones).
export function AchievementChips({ onMore, wrap }: { onMore?: () => void; wrap?: boolean }) {
  const COLORS = useColors();
  const { progress } = useProgress();
  const rows = ACHIEVEMENTS.map((a) => { const r = a.prog(progress); return { a, ok: r.cur >= r.goal, pct: r.cur / r.goal }; });
  const list = [...rows.filter((x) => x.ok), ...rows.filter((x) => !x.ok).sort((x, y) => y.pct - x.pct)];
  return (
    <ScrollView horizontal={!wrap} showsHorizontalScrollIndicator={false} contentContainerStyle={wrap ? { flexDirection: "row", flexWrap: "wrap" } : { paddingRight: 8 }}>
      {list.map(({ a, ok }) => (
        <View key={a.id} style={{ width: 96, alignItems: "center", paddingVertical: 14, paddingHorizontal: 6, marginRight: 10, marginBottom: wrap ? 10 : 0, borderRadius: 18, borderWidth: 1, borderColor: ok ? COLORS.accent : COLORS.border, backgroundColor: COLORS.card, opacity: ok ? 1 : 0.6 }}>
          <Text style={{ fontSize: 30, opacity: ok ? 1 : 0.35 }}>{ok ? a.icon : wi("🔒")}</Text>
          <Text numberOfLines={1} style={{ color: COLORS.muted, fontSize: 12, marginTop: 6 }}>{a.name}</Text>
        </View>
      ))}
      {onMore && (
        <View style={{ justifyContent: "center" }}>
          <Text onPress={onMore} style={{ color: COLORS.accent, fontWeight: "700", paddingHorizontal: 10 }}>See all</Text>
        </View>
      )}
    </ScrollView>
  );
}
