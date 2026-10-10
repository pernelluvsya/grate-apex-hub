import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedNumber } from '@/components/ui/animated-number';
import { Icon } from '@/components/ui/icon';
import { MOTION, SPRING } from '@/constants/motion';
import { elevation, Type, type ThemeColors } from '@/constants/theme';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

export type XpReward = {
  amount: number; // net XP; negative = XP lost
  message: string;
  lines?: { label: string; amount: number }[];
};

// A reward waiting to be shown on the next screen
// (used when XP is earned right before navigating, e.g. quiz → results).
// It lives only in memory and is cleared once taken, so refreshing or
// revisiting a screen never shows it again.
let pendingReward: XpReward | null = null;

export function setPendingXpReward(reward: XpReward) {
  pendingReward = reward;
}

export function takePendingXpReward() {
  const reward = pendingReward;
  pendingReward = null;
  return reward;
}

type XpToastProps = {
  reward: XpReward | null;
  onHide: () => void;
};

const VISIBLE_MS = 2800;

// The "+XP" moment: centred, prominent, and calm. Display only — it never
// awards XP, and it never blocks taps (the learner can keep going).
export function XpToast({ reward, onHide }: XpToastProps) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const halo = useSharedValue(0);

  useEffect(() => {
    if (!reward) return;
    const done = (finished?: boolean) => {
      'worklet';
      if (finished) runOnJS(onHide)();
    };
    opacity.value = 0;
    scale.value = reduceMotion ? 1 : 0.9;
    halo.value = 0;
    opacity.value = withSequence(
      withTiming(1, { duration: MOTION.standard }),
      withDelay(VISIBLE_MS, withTiming(0, { duration: MOTION.significant - 100 }, done))
    );
    if (!reduceMotion) {
      scale.value = withSpring(1, SPRING.pop);
      halo.value = withDelay(120, withTiming(1, { duration: MOTION.special + 300, easing: Easing.out(Easing.cubic) }));
    }
    // Only restart when a new reward arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reward]);

  const cardStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: (1 - halo.value) * 0.7,
    transform: [{ scale: 1 + halo.value * 1.1 }],
  }));

  if (!reward) return null;
  const lost = reward.amount < 0;

  return (
    <View style={styles.overlay}>
      <Animated.View
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${lost ? 'Lost' : 'Earned'} ${Math.abs(reward.amount)} XP. ${reward.message}`}
        style={[styles.toast, lost && styles.toastLost, elevation(colors, 3), cardStyle]}
      >
        <View style={styles.medallionWrap}>
          {!lost ? <Animated.View style={[styles.halo, haloStyle]} /> : null}
          <View style={[styles.medallion, lost && styles.medallionLost]}>
            <Icon name={lost ? 'minus' : 'xp'} size={30} color={lost ? colors.textSecondary : '#0A1F5C'} filled={!lost} strokeWidth={lost ? 2.4 : 1.6} />
          </View>
        </View>
        <AnimatedNumber value={reward.amount} signed suffix=" XP" duration={MOTION.special} delay={120} style={[styles.amount, lost && styles.amountLost]} />
        <Text style={[styles.message, lost && styles.messageLost]}>{reward.message}</Text>
        {reward.lines && reward.lines.length > 1 ? (
          <View style={[styles.lines, lost && styles.linesLost]}>
            {reward.lines.map((line, index) => (
              <View key={index} style={styles.line}>
                <Text style={[styles.lineLabel, lost && styles.messageLost]} numberOfLines={1}>
                  {line.label}
                </Text>
                <Text style={[styles.lineAmount, line.amount < 0 && styles.lineNegative]}>
                  {line.amount >= 0 ? `+${line.amount}` : `−${Math.abs(line.amount)}`}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      zIndex: 50,
      pointerEvents: 'none',
    },
    toast: {
      backgroundColor: colors.rewardBackground,
      paddingTop: 30,
      paddingBottom: 26,
      paddingHorizontal: 36,
      borderRadius: 28,
      alignItems: 'center',
      minWidth: 280,
      maxWidth: 400,
      borderWidth: 1,
      borderColor: 'rgba(253, 192, 10, 0.55)',
    },
    toastLost: { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
    medallionWrap: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    halo: {
      position: 'absolute',
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 2,
      borderColor: colors.accent,
    },
    medallion: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'inset 0px 2px 0px rgba(255,255,255,0.45), 0px 8px 24px rgba(253, 192, 10, 0.35)',
    },
    medallionLost: { backgroundColor: colors.surfaceMuted, boxShadow: 'none' },
    amount: { ...Type.numeral, color: colors.accent, fontSize: 44, lineHeight: 50, textAlign: 'center' },
    amountLost: { color: colors.textSecondary, fontSize: 36 },
    message: { color: colors.rewardMuted, fontSize: 16, marginTop: 4, textAlign: 'center', fontWeight: '600' },
    messageLost: { color: colors.textSecondary },
    lines: { marginTop: 16, paddingTop: 12, gap: 4, alignSelf: 'stretch', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' },
    linesLost: { borderTopColor: colors.divider },
    line: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
    lineLabel: { flex: 1, color: colors.rewardMuted, fontSize: 12.5 },
    lineAmount: { ...Type.numeral, fontSize: 12.5, color: colors.accent },
    lineNegative: { color: colors.error },
  });
}
