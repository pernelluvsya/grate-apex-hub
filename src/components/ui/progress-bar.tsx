import { useEffect } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import type { ThemeColors } from '@/constants/theme';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

// A progress bar whose fill animates to its value (instantly when the
// learner prefers reduced motion).
export function ProgressBar({
  value,
  color,
  height = 8,
  style,
  label,
}: {
  value: number; // 0–1
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const width = useSharedValue(reduceMotion ? clamped : 0);

  useEffect(() => {
    width.value = reduceMotion ? clamped : withTiming(clamped, { duration: 600 });
  }, [clamped, reduceMotion, width]);

  const fill = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));

  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Animated.View style={[styles.fill, { borderRadius: height / 2, backgroundColor: color ?? colors.primary }, fill]} />
    </View>
  );
}

// Several values stacked in one bar (e.g. memory states).
export function StackedBar({
  segments,
  height = 10,
  style,
  label,
}: {
  segments: { value: number; color: string }[];
  height?: number;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const styles = useThemedStyles(createStyles);
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);
  return (
    <View
      style={[styles.track, styles.stacked, { height, borderRadius: height / 2 }, style]}
      accessibilityLabel={label}
    >
      {total > 0 &&
        segments
          .filter((segment) => segment.value > 0)
          .map(({ value, color }, index) => (
            <View key={index} style={{ flex: value, backgroundColor: color }} />
          ))}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    track: {
      width: '100%',
      backgroundColor: colors.track,
      overflow: 'hidden',
    },
    stacked: {
      flexDirection: 'row',
    },
    fill: {
      height: '100%',
    },
  });
}
