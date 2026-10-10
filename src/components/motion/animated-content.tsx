import { type PropsWithChildren, useEffect } from 'react';
import type { ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { MOTION_DISTANCE, MOTION_DURATION_MS, MOTION_EASING } from '@/constants/motion';

export type AnimatedContentProps = PropsWithChildren<
  ViewProps & {
    delay?: number;
    duration?: number;
  }
>;

/**
 * Fades a section in with a restrained upward movement when it mounts.
 *
 * Driven by an animated style (not a layout "entering" animation): on the
 * web, Reanimated takes custom entering animations out of the page flow
 * when they finish (position: absolute), which let the cards below draw
 * over the Home greeting.
 */
export function AnimatedContent({
  children,
  delay = 0,
  duration = MOTION_DURATION_MS.content,
  style,
  ...viewProps
}: AnimatedContentProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(delay, withTiming(1, { duration, easing: MOTION_EASING.entrance }));
  }, [delay, duration, progress, reduceMotion]);

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * MOTION_DISTANCE.content }],
  }));

  return (
    <Animated.View {...viewProps} style={[style, animated]}>
      {children}
    </Animated.View>
  );
}
