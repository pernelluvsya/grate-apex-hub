import { Text } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

// Native: the APEX wordmark fades in (the web version draws a stroke —
// see apex-wordmark.web.tsx).
export function ApexWordmark({ size = 72 }: { size?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(700)} accessibilityLabel="Apex Challenge" accessibilityRole="image">
      <Text
        style={{
          fontSize: size,
          fontWeight: '900',
          letterSpacing: size * 0.12,
          color: '#FDC00A',
          textAlign: 'center',
        }}
      >
        APEX
      </Text>
    </Animated.View>
  );
}
