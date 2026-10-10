import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

// The GRATEAPEX mark (G, A, cap, gold swoosh and star) from the logo.
// Two layers: the letters take the theme's logo color, the gold stays gold.
// It lights up (gold glow) while pointed at on web, or pressed on phones.

// Size of the cut-out images (assets/images/grateapex-mark-*.png).
const ASPECT_RATIO = 617 / 495;

type LogoMarkProps = {
  height?: number;
};

export function LogoMark({ height = 32 }: LogoMarkProps) {
  const colors = useTheme();
  const [lit, setLit] = useState(false);

  const displayHeight = height * 1.2;
  const size = { width: displayHeight * ASPECT_RATIO, height: displayHeight };

  return (
    <Pressable
      onHoverIn={() => setLit(true)}
      onHoverOut={() => setLit(false)}
      onPressIn={() => setLit(true)}
      onPressOut={() => setLit(false)}
      accessibilityRole="image"
      accessibilityLabel="GrAteApex Hub logo"
    >
      <View style={[size, styles.scaled, lit && styles.lit]}>
        <Image
          source={require('@/assets/images/grateapex-mark-letters.png')}
          style={[styles.layer, size]}
          tintColor={colors.logoLetters}
          resizeMode="contain"
        />
        <Image
          source={require('@/assets/images/grateapex-mark-gold.png')}
          style={[styles.layer, size]}
          resizeMode="contain"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scaled: { transform: [{ scale: 1.07 }] },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  // Subtle premium glow around the mark while it is pointed at / pressed.
  // `filter` is a web-only style; on native it is ignored harmlessly, so the
  // press still reads through the slight scale.
  lit: {
    transform: [{ scale: 1.13 }],
    ...(Platform.OS === 'web'
      ? {
          filter: 'drop-shadow(0px 0px 7px rgba(253, 192, 10, 0.55))',
        }
      : null),
  },
});
