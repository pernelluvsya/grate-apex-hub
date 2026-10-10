import { Animated as RNAnimated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';

/**
 * "developed by OrigiNate" — a small credit near the bottom of the intro.
 *
 * Absolutely positioned, so the (locked) logo and its animation do not
 * move by a pixel. It fades in just after the logo appears and leaves
 * with the rest of the intro (the overlay's own fade-out).
 */
export function IntroCredit({ progress }: { progress: RNAnimated.Value }) {
  const insets = useSafeAreaInsets();
  const opacity = progress.interpolate({ inputRange: [0, 0.14, 0.3, 1], outputRange: [0, 0, 1, 1] });
  const translateY = progress.interpolate({ inputRange: [0, 0.14, 0.3, 1], outputRange: [6, 6, 0, 0] });

  return (
    <RNAnimated.View
      accessible
      accessibilityLabel="Developed by OrigiNate"
      style={[styles.wrap, { bottom: insets.bottom + 44, opacity, transform: [{ translateY }] }]}
    >
      <Text style={styles.by}>developed by</Text>
      <Text style={styles.name}>
        Origi<Text style={styles.accent}>N</Text>ate
      </Text>
    </RNAnimated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: 3, pointerEvents: 'none' },
  by: { fontSize: 10.5, fontWeight: '600', letterSpacing: 1.8, textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)' },
  name: { fontFamily: Fonts.display, fontSize: 15, fontWeight: '700', letterSpacing: 1.3, color: '#FFFFFF' },
  accent: { color: '#FDC00A', fontWeight: '800' },
});
