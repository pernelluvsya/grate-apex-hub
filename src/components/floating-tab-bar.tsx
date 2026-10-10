import { useEffect, useState } from "react";
import { type LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CENTER_ROUTE, NAV_ITEMS, NavIconView } from "@/components/nav-items";
import { useTabBarHidden } from "@/components/tab-bar-visibility";
import { webStyle } from "@/components/ui/web";
import { MOTION, SPRING } from "@/constants/motion";
import { elevation, TAB_BAR_HEIGHT, TAB_BAR_INSET, type ThemeColors } from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

const MAX_BAR_WIDTH = 520;

/** Distance from the bottom of the window to the top of the bar (for floating things that sit above it). */
export function useTabBarClearance() {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR_INSET + TAB_BAR_HEIGHT;
}

/**
 * The phone navigation: a floating bar in the thumb zone with a sliding selection pill and the
 * Study button raised in the centre. 44px+ targets. It slides away while reading when the learner
 * chose "Auto-hide navigation".
 */
export function FloatingTabBar({
  activeRoute, onNavigate, autoHide, badges = {},
}: { activeRoute: string; onNavigate: (route: string) => void; autoHide: boolean; badges?: Record<string, number> }) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const scrolledAway = useTabBarHidden();
  const hidden = autoHide && scrolledAway;

  const activeIndex = NAV_ITEMS.findIndex((item) => item.route === activeRoute);
  const centerIndex = NAV_ITEMS.findIndex((item) => item.route === CENTER_ROUTE);

  const [barWidth, setBarWidth] = useState(0);
  const itemWidth = barWidth > 0 ? (barWidth - 8) / NAV_ITEMS.length : 0;

  const pillX = useSharedValue(0);
  const pillOpacity = useSharedValue(activeIndex >= 0 ? 1 : 0);
  const offset = useSharedValue(0);

  useEffect(() => {
    if (itemWidth <= 0) return;
    const x = Math.max(0, activeIndex) * itemWidth;
    pillX.value = reduceMotion ? x : withSpring(x, SPRING.snappy);
    pillOpacity.value = withTiming(activeIndex >= 0 ? 1 : 0, { duration: MOTION.micro });
  }, [activeIndex, itemWidth, pillX, pillOpacity, reduceMotion]);

  useEffect(() => {
    const distance = TAB_BAR_HEIGHT + TAB_BAR_INSET + insets.bottom + 24;
    offset.value = withTiming(hidden ? distance : 0, { duration: reduceMotion ? 0 : MOTION.standard });
  }, [hidden, insets.bottom, offset, reduceMotion]);

  const pillStyle = useAnimatedStyle(() => ({ opacity: pillOpacity.value, transform: [{ translateX: pillX.value }] }));
  const barStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));

  return (
    <Animated.View pointerEvents={hidden ? "none" : "box-none"} style={[styles.wrap, { bottom: insets.bottom + TAB_BAR_INSET }, barStyle]}>
      <View style={[styles.bar, elevation(colors, 3)]} onLayout={(e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width)} accessibilityRole="tablist">
        {itemWidth > 0 && activeIndex !== centerIndex ? <Animated.View style={[styles.pill, { width: itemWidth }, pillStyle]} /> : null}
        {NAV_ITEMS.map((item, index) => {
          const selected = item.route === activeRoute;
          const isCenter = index === centerIndex;
          const badge = badges[item.route] ?? 0;
          return (
            <Pressable
              key={item.route}
              onPress={() => onNavigate(item.route)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={item.accessibilityLabel}
              style={({ pressed }) => [styles.item, isCenter && styles.centerItem, pressed && styles.itemPressed]}
            >
              {isCenter ? (
                <View style={[styles.centerIcon, elevation(colors, 3), selected && styles.centerIconOn]}>
                  <NavIconView icon={item.icon} color={colors.onPrimary} size={26} active />
                </View>
              ) : (
                <View>
                  <NavIconView icon={item.icon} color={selected ? colors.navActive : colors.navInactive} size={22} active={selected} />
                  {badge > 0 ? (
                    <View style={styles.badge} pointerEvents="none"><Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text></View>
                  ) : null}
                </View>
              )}
              <Text style={[styles.label, selected && styles.labelActive]} numberOfLines={1}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: { position: "absolute", left: TAB_BAR_INSET, right: TAB_BAR_INSET, alignItems: "center", zIndex: 40 },
    bar: {
      width: "100%", maxWidth: MAX_BAR_WIDTH, height: TAB_BAR_HEIGHT, flexDirection: "row", alignItems: "center", paddingHorizontal: 4,
      borderRadius: 24, backgroundColor: colors.navSurface, borderWidth: 1, borderColor: colors.navBorder,
      ...webStyle({ backdropFilter: "blur(18px) saturate(150%)", WebkitBackdropFilter: "blur(18px) saturate(150%)" }),
      // No backdrop blur on native: a solid elevated surface keeps labels crisp.
      ...(Platform.OS !== "web" ? { backgroundColor: colors.surfaceElevated } : null),
    },
    pill: { position: "absolute", left: 4, top: 6, bottom: 6, borderRadius: 18, backgroundColor: colors.navActiveSubtle },
    item: { flex: 1, height: "100%", alignItems: "center", justifyContent: "center", gap: 3, ...webStyle({ cursor: "pointer", outlineStyle: "none", WebkitTapHighlightColor: "transparent" }) },
    centerItem: { overflow: "visible", justifyContent: "flex-end", paddingBottom: 7 },
    centerIcon: {
      position: "absolute", top: -18, width: 56, height: 56, borderRadius: 28, borderWidth: 4, borderColor: colors.surfaceElevated,
      backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
    },
    centerIconOn: { borderColor: colors.accent },
    itemPressed: { transform: [{ scale: 0.94 }] },
    label: { fontSize: 10.5, fontWeight: "700", color: colors.navInactive, letterSpacing: 0.2 },
    labelActive: { color: colors.navActive },
    badge: {
      position: "absolute", top: -6, right: -12, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, backgroundColor: colors.error,
      alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: colors.surfaceElevated,
    },
    badgeText: { color: "#FFFFFF", fontSize: 10.5, fontWeight: "800", lineHeight: 14 },
  });
}
