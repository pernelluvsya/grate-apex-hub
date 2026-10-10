import React, { createContext, useContext, useEffect, useRef } from "react";
import { Animated, Easing, Platform, TouchableOpacity, View, ViewStyle } from "react-native";
import { Text } from "./Text";
import { useColors } from "./theme";

// Skeleton placeholders shown while a list loads. They mirror the real card and row
// layouts so the page doesn't jump when the content arrives.

// One shared pulse drives every block inside a SkeletonGroup (one animation loop, not one per block).
const PulseCtx = createContext<Animated.Value | null>(null);
const useNative = Platform.OS !== "web";

export function SkeletonGroup({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: useNative }),
        Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: useNative }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <PulseCtx.Provider value={pulse}>
      <View accessible accessibilityRole="progressbar" accessibilityLabel="Loading" style={style}>{children}</View>
    </PulseCtx.Provider>
  );
}

// A single grey bar or circle. Colour comes from the theme's muted text colour so it reads in every theme.
export function SkeletonBlock({ w = "100%", h = 14, r = 8, style }: { w?: number | string; h?: number; r?: number; style?: any }) {
  const COLORS = useColors();
  const pulse = useContext(PulseCtx);
  const opacity = pulse ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] }) : 0.6;
  return <Animated.View style={[{ width: w as any, height: h, borderRadius: r, backgroundColor: COLORS.muted + "38", opacity }, style]} />;
}

const cardBox = (COLORS: ReturnType<typeof useColors>) => ({
  backgroundColor: COLORS.card,
  borderColor: COLORS.border,
  borderWidth: 1,
  borderRadius: 16,
  padding: 14,
  marginBottom: 10,
});

// A feed post: author row, then body lines. Matches PostCard.
export function SkeletonPost() {
  const COLORS = useColors();
  return (
    <View style={cardBox(COLORS)}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <SkeletonBlock w={38} h={38} r={19} />
        <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
          <SkeletonBlock w="40%" h={12} />
          <SkeletonBlock w="24%" h={10} />
        </View>
      </View>
      <View style={{ marginTop: 12, gap: 8 }}>
        <SkeletonBlock h={12} />
        <SkeletonBlock w="86%" h={12} />
        <SkeletonBlock w="55%" h={12} />
      </View>
    </View>
  );
}

// A discussion or group card: title, body lines, then a meta line. Matches the board and group lists.
export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  const COLORS = useColors();
  return (
    <View style={cardBox(COLORS)}>
      <SkeletonBlock w="62%" h={16} />
      <View style={{ marginTop: 10, gap: 7 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBlock key={i} h={11} w={i === lines - 1 ? "70%" : "100%"} />
        ))}
      </View>
      <SkeletonBlock w="34%" h={10} style={{ marginTop: 12 }} />
    </View>
  );
}

// A row with an avatar, a name and a snippet. Matches chat rows and friend pickers.
export function SkeletonRow({ avatar = 42 }: { avatar?: number }) {
  const COLORS = useColors();
  return (
    <View style={[cardBox(COLORS), { flexDirection: "row", alignItems: "center" }]}>
      <SkeletonBlock w={avatar} h={avatar} r={avatar / 2} />
      <View style={{ flex: 1, marginLeft: 12, gap: 7 }}>
        <SkeletonBlock w="45%" h={13} />
        <SkeletonBlock w="75%" h={10} />
      </View>
    </View>
  );
}

// A lesson row on a course page: title, subtitle, progress bar, meta line. Matches the Study lesson cards.
export function SkeletonLesson() {
  const COLORS = useColors();
  return (
    <View style={cardBox(COLORS)}>
      <SkeletonBlock w="70%" h={16} />
      <SkeletonBlock w="48%" h={11} style={{ marginTop: 10 }} />
      <SkeletonBlock h={5} r={999} style={{ marginTop: 14 }} />
      <SkeletonBlock w="40%" h={10} style={{ marginTop: 10 }} />
    </View>
  );
}

// The "Read offline" card at the top of a course's lessons.
export function SkeletonInfoCard() {
  const COLORS = useColors();
  return (
    <View style={cardBox(COLORS)}>
      <SkeletonBlock w="34%" h={15} />
      <SkeletonBlock w="88%" h={11} style={{ marginTop: 10 }} />
      <SkeletonBlock w="30%" h={12} style={{ marginTop: 12 }} />
    </View>
  );
}

// The whole lesson reader while a lesson downloads: title, progress bar, tool chips, a section heading and paragraphs.
// `onBack` keeps a real back link on screen so a slow connection never traps the student.
export function SkeletonLessonPage({ onBack }: { onBack?: () => void }) {
  const COLORS = useColors();
  return (
    <SkeletonGroup style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
      {onBack
        ? <TouchableOpacity onPress={onBack} accessibilityLabel="Back to course"><Text style={{ color: COLORS.muted, fontWeight: "700" }}>‹ Back to course</Text></TouchableOpacity>
        : <SkeletonBlock w={110} h={13} />}
      <SkeletonBlock w="64%" h={24} style={{ marginTop: 18 }} />
      <SkeletonBlock w="40%" h={12} style={{ marginTop: 10 }} />
      <SkeletonBlock h={5} r={999} style={{ marginTop: 16 }} />
      <View style={{ flexDirection: "row", marginTop: 16 }}>
        {[96, 84, 104].map((w, i) => <SkeletonBlock key={i} w={w} h={34} r={999} style={{ marginRight: 8 }} />)}
      </View>
      <SkeletonBlock w="52%" h={19} style={{ marginTop: 26 }} />
      <View style={{ marginTop: 14, gap: 9 }}>
        {["100%", "96%", "100%", "88%", "100%", "62%"].map((w, i) => <SkeletonBlock key={i} w={w} h={12} />)}
      </View>
      <View style={{ marginTop: 22, gap: 9 }}>
        {["100%", "92%", "70%"].map((w, i) => <SkeletonBlock key={i} w={w} h={12} />)}
      </View>
      <SkeletonBlock h={48} r={999} style={{ marginTop: 28 }} />
    </SkeletonGroup>
  );
}
