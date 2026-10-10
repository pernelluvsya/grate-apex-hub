import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/hooks/use-theme';

/** Light, slow-moving line illustrations that sit in the page background. */
export function PageMotifs({ lively }: { lively: boolean }) {
  const colors = useTheme();
  const reduceMotion = useReducedMotion();
  const driftA = useSharedValue(0);
  const driftB = useSharedValue(0);
  const driftC = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    driftA.value = withRepeat(withTiming(1, { duration: 11000, easing: Easing.inOut(Easing.sin) }), -1, true);
    driftB.value = withRepeat(withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) }), -1, true);
    driftC.value = withRepeat(withTiming(1, { duration: 12500, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [driftA, driftB, driftC, reduceMotion]);

  const floatA = useAnimatedStyle(() => ({
    transform: [{ translateY: -driftA.value * 7 }, { rotate: `${-4 + driftA.value * 8}deg` }],
  }));
  const floatB = useAnimatedStyle(() => ({
    transform: [{ translateY: -driftB.value * 6 }, { rotate: `${3 - driftB.value * 6}deg` }],
  }));
  const floatC = useAnimatedStyle(() => ({
    transform: [{ translateY: -driftC.value * 8 }, { rotate: `${-3 + driftC.value * 6}deg` }],
  }));

  return (
    <View pointerEvents="none" accessible={false} style={[StyleSheet.absoluteFill, styles.layer]}>
      <Animated.View style={[styles.motif, styles.leftTop, floatA]}>
        <Icon name="learn" size={34} color={colors.primaryText} />
      </Animated.View>
      <Animated.View style={[styles.motif, styles.rightMid, floatB]}>
        <Icon name="anatomy" size={31} color={colors.primaryText} />
      </Animated.View>
      <Animated.View style={[styles.motif, styles.leftBottom, floatC]}>
        <Icon name="social" size={30} color={colors.primaryText} />
      </Animated.View>
      {lively ? (
        <Animated.View style={[styles.motif, styles.rightBottom, floatA]}>
          <Icon name="sparkle" size={24} color={colors.accentText} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { zIndex: 0, overflow: 'hidden' },
  motif: { position: 'absolute', opacity: 0.15 },
  leftTop: { top: '14%', left: '3%' },
  rightMid: { top: '43%', right: '3%' },
  leftBottom: { bottom: '16%', left: '5%' },
  rightBottom: { bottom: '13%', right: '8%', opacity: 0.16 },
});
