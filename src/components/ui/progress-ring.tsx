import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { MOTION } from '@/constants/motion';
import { Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTween } from '@/hooks/use-tween';

/**
 * A circular progress indicator: mastery, course completion, score arcs.
 * The arc glides to its value (instantly under reduced motion). Pass
 * `children` to put a label in the centre, or `showValue` for a percent.
 */
export function ProgressRing({
  value,
  size = 64,
  thickness = 6,
  color,
  gradient,
  trackColor,
  showValue = false,
  label,
  children,
  delay = 0,
  style,
}: {
  value: number; // 0–1
  size?: number;
  thickness?: number;
  color?: string;
  gradient?: readonly [string, string];
  trackColor?: string;
  showValue?: boolean;
  label?: string;
  children?: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useTheme();
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const animated = useTween(clamped, MOTION.significant + 280, delay);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const gradientId = `ring${Math.round(size)}${(gradient ?? []).join('').replace(/[^a-zA-Z0-9]/g, '')}`;
  const stroke = gradient ? `url(#${gradientId})` : (color ?? colors.primary);

  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {gradient ? (
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={gradient[0]} />
              <Stop offset="1" stopColor={gradient[1]} />
            </LinearGradient>
          </Defs>
        ) : null}
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor ?? colors.track} strokeWidth={thickness} fill="none" />
        {animated > 0.001 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={stroke}
            strokeWidth={thickness}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - animated)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        {children ??
          (showValue ? (
            <Text style={[styles.value, { fontSize: Math.max(11, size * 0.26), color: colors.text }]}>{Math.round(animated * 100)}%</Text>
          ) : null)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  value: { ...Type.numeral },
});
