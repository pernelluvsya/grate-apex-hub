import type { ReactNode } from 'react';
import { ActivityIndicator, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { withIcons } from '@/components/em';
import { Icon, type IconName } from '@/components/ui/icon';
import { Interactive } from '@/components/ui/interactive';
import { webStyle } from '@/components/ui/web';
import { cssTransition, MOTION } from '@/constants/motion';
import type { ThemeColors } from '@/constants/theme';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger' | 'apex';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  // Trailing glyph: an icon name, or the legacy strings '→' / '⚡'
  // (rendered as the matching GRATEAPEX icon).
  trailing?: string;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  shortcut?: string; // keyboard hint shown on web, e.g. "Enter"
};

const TRAILING_ICONS: Record<string, IconName> = { '→': 'arrowRight', '⚡': 'challenge', '›': 'chevronRight' };

// Tactile buttons: a soft top sheen and inner highlight on filled
// variants, a small lift on hover, and a press that settles in.
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  trailing,
  fullWidth,
  style,
  accessibilityLabel,
  accessibilityHint,
  shortcut,
}: ButtonProps) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const textColor =
    variant === 'primary'
      ? colors.onPrimary
      : variant === 'gold' || variant === 'apex'
        ? '#0A1F5C'
        : variant === 'danger'
          ? '#FFFFFF'
          : colors.text;
  const trailingIcon = trailing ? (TRAILING_ICONS[trailing] ?? (trailing as IconName)) : null;
  const iconSize = size === 'sm' ? 15 : size === 'lg' ? 19 : 17;
  const filled = variant === 'primary' || variant === 'gold' || variant === 'apex' || variant === 'danger';
  const inactive = Boolean(disabled) && !loading;
  const labelColor = inactive ? colors.textTertiary : textColor;

  return (
    <Interactive
      onPress={onPress}
      disabled={disabled || loading}
      dimDisabled={false}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      style={({ hovered, pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        filled && !inactive && styles.filled,
        inactive && (filled ? styles.disabledFilled : styles.disabledPlain),
        fullWidth && styles.fullWidth,
        hovered && !inactive && styles[`${variant}Hover` as const],
        hovered && filled && !inactive && styles.lift,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator size="small" color={textColor} /> : icon}
        <Text style={[styles.label, styles[`${size}Label` as const], { color: labelColor }]} numberOfLines={2}>
          {withIcons(label, { size: iconSize + 1, color: labelColor })}
        </Text>
        {trailingIcon && !loading ? <Icon name={trailingIcon} size={iconSize} color={labelColor} strokeWidth={2.1} /> : null}
        {shortcut ? (
          <View style={[styles.kbd, { borderColor: textColor }]}>
            <Text style={[styles.kbdText, { color: textColor }]}>{shortcut}</Text>
          </View>
        ) : null}
      </View>
    </Interactive>
  );
}

const SHEEN = 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 55%)';

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    base: {
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'transparent',
      ...webStyle(cssTransition('transform, background-color, border-color, box-shadow, filter', MOTION.micro)),
    },
    filled: {
      boxShadow: `inset 0px 1px 0px rgba(255, 255, 255, 0.22), 0px 1px 2px ${colors.shadow}, 0px 6px 16px ${colors.shadow}`,
      ...webStyle({ backgroundImage: SHEEN }),
    } as ViewStyle,
    lift: { transform: [{ translateY: -1 }], ...webStyle({ filter: 'brightness(1.04)' }) },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    fullWidth: { alignSelf: 'stretch' },
    sm: { minHeight: 36, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 11 },
    md: { minHeight: 46, paddingHorizontal: 18, paddingVertical: 11 },
    lg: { minHeight: 54, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
    label: { fontWeight: '700', textAlign: 'center', letterSpacing: 0.1 },
    smLabel: { fontSize: 13 },
    mdLabel: { fontSize: 15 },
    lgLabel: { fontSize: 16 },

    primary: { backgroundColor: colors.primary },
    primaryHover: { backgroundColor: colors.primaryPressed },
    secondary: { backgroundColor: colors.surface, borderColor: colors.border, boxShadow: `0px 1px 2px ${colors.shadow}` } as ViewStyle,
    secondaryHover: { borderColor: colors.primaryBorder, backgroundColor: colors.surfaceMuted },
    ghost: { backgroundColor: 'transparent' },
    ghostHover: { backgroundColor: colors.surfaceMuted },
    gold: { backgroundColor: colors.accent },
    goldHover: { boxShadow: 'inset 0px 1px 0px rgba(255,255,255,0.3), 0px 8px 22px rgba(253, 192, 10, 0.35)' } as ViewStyle,
    danger: { backgroundColor: colors.error },
    dangerHover: { opacity: 0.94 },
    apex: { backgroundColor: '#FDC00A' },
    apexHover: { boxShadow: '0px 0px 0px 3px rgba(253, 192, 10, 0.25), 0px 10px 30px rgba(253, 192, 10, 0.4)' } as ViewStyle,
    pressed: { transform: [{ translateY: 0 }, { scale: 0.975 }] },
    // Disabled: a calm neutral surface (never a washed-out brand colour).
    disabledFilled: { backgroundColor: colors.surfaceMuted, borderColor: colors.border, boxShadow: 'none', ...webStyle({ backgroundImage: 'none', cursor: 'not-allowed' }) } as ViewStyle,
    disabledPlain: { opacity: 0.55, ...webStyle({ cursor: 'not-allowed' }) },

    kbd: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 5,
      paddingVertical: 1,
      opacity: 0.6,
      ...webStyle({ display: 'flex' }),
    },
    kbdText: { fontSize: 10, fontWeight: '700' },
  });
}
