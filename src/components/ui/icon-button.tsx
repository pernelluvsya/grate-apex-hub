import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Interactive } from '@/components/ui/interactive';
import { webStyle } from '@/components/ui/web';
import { cssTransition, MOTION } from '@/constants/motion';
import type { ThemeColors } from '@/constants/theme';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

// A round icon-only button (settings, notifications, close…).
// Always has an accessible label; optional badge count.
export function IconButton({
  icon,
  label,
  onPress,
  size = 40,
  tone = 'ghost',
  badge,
  style,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  size?: number;
  tone?: 'ghost' | 'surface';
  badge?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  return (
    <Interactive
      onPress={onPress}
      accessibilityLabel={badge ? `${label}, ${badge} new` : label}
      style={({ hovered, pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        tone === 'surface' && styles.surface,
        hovered && styles.hovered,
        pressed && styles.pressed,
        style,
      ]}
    >
      {({ hovered }) => (
        <>
          <Icon name={icon} size={Math.round(size * 0.52)} color={hovered ? colors.text : colors.textSecondary} />
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
            </View>
          ) : null}
        </>
      )}
    </Interactive>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      ...webStyle(cssTransition('background-color, transform', MOTION.micro)),
    },
    surface: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairline },
    hovered: { backgroundColor: colors.surfaceMuted },
    pressed: { transform: [{ scale: 0.94 }] },
    badge: {
      position: 'absolute',
      top: 2,
      right: 2,
      minWidth: 17,
      height: 17,
      paddingHorizontal: 4,
      borderRadius: 9,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    badgeText: { fontSize: 9.5, fontWeight: '900', color: '#0A1F5C' },
  });
}
