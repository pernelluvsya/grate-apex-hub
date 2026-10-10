import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTabBarClearance } from "@/components/floating-tab-bar";
import { usePageAtBottom, useTabBarHidden } from "@/components/tab-bar-visibility";
import { MOTION } from "@/constants/motion";
import { Fonts, type ThemeColors } from "@/constants/theme";
import { useThemedStyles } from "@/hooks/use-theme";

/**
 * A quiet OrigiNate signature shown only when the active page is at its end.
 * It never intercepts taps and stays just above the phone tab bar.
 */
export function Signature({ aboveTabBar, autoHide }: { aboveTabBar: boolean; autoHide: boolean }) {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const clearance = useTabBarClearance();
  const reduceMotion = useReducedMotion();
  const barHidden = useTabBarHidden() && autoHide;
  const pageAtBottom = usePageAtBottom();

  const bottom = aboveTabBar && !barHidden ? clearance + 8 : insets.bottom + 10;
  const offset = useSharedValue(bottom);
  useEffect(() => { offset.value = withTiming(bottom, { duration: reduceMotion ? 0 : MOTION.standard }); }, [bottom, offset, reduceMotion]);
  const style = useAnimatedStyle(() => ({ bottom: offset.value }));

  if (!pageAtBottom) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, style]} aria-hidden>
      <Text style={styles.text}>Origi<Text style={styles.accent}>N</Text>ate</Text>
    </Animated.View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: { position: "absolute", right: 14, zIndex: 45 },
    text: { fontFamily: Fonts.display, fontSize: 10, fontWeight: "500", letterSpacing: 0.8, color: colors.textTertiary, opacity: 0.55 },
    accent: { color: colors.accentText, fontWeight: "800" },
  });
}
