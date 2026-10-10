import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { Interactive } from '@/components/ui/interactive';
import { SPRING } from '@/constants/motion';
import { elevation, type ThemeColors } from '@/constants/theme';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

// Equal-width segments with a thumb that springs to the selection.
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
  label,
}: {
  options: readonly { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const segment = width > 0 ? (width - 6) / options.length : 0;
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = reduceMotion ? index * segment : withSpring(index * segment, SPRING.snappy);
  }, [index, segment, x, reduceMotion]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      style={[styles.track, style]}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
      accessibilityRole="tablist"
      accessibilityLabel={label}
    >
      {segment > 0 ? <Animated.View style={[styles.thumb, elevation(colors, 1), { width: segment }, thumb]} /> : null}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Interactive
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.count ? `${option.label}, ${option.count}` : option.label}
            style={styles.segment}
          >
            <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
              {option.label}
              {option.count ? <Text style={styles.count}> {option.count}</Text> : null}
            </Text>
          </Interactive>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    track: {
      flexDirection: 'row',
      padding: 3,
      borderRadius: 12,
      backgroundColor: colors.surfaceSunken,
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    thumb: {
      position: 'absolute',
      left: 3,
      top: 3,
      bottom: 3,
      borderRadius: 9,
      backgroundColor: colors.surfaceElevated,
    },
    segment: { flex: 1, minHeight: 34, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
    label: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    labelSelected: { color: colors.text },
    count: { color: colors.accentText, fontWeight: '800' },
  });
}
