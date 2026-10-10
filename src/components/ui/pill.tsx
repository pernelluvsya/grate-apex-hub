import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { ThemeColors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-theme';

export type PillTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'gold';

// A small label: status, tag, difficulty, memory state…
export function Pill({
  label,
  tone = 'neutral',
  style,
  dotColor,
}: {
  label: string;
  tone?: PillTone;
  style?: StyleProp<ViewStyle>;
  dotColor?: string;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.pill, styles[tone], style]}>
      {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
      <Text style={[styles.text, styles[`${tone}Text` as const]]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      borderRadius: 999,
      paddingVertical: 3,
      paddingHorizontal: 9,
    },
    dot: { width: 7, height: 7, borderRadius: 4 },
    text: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
    neutral: { backgroundColor: colors.surfaceMuted },
    neutralText: { color: colors.textSecondary },
    primary: { backgroundColor: colors.primarySubtle },
    primaryText: { color: colors.primaryText },
    success: { backgroundColor: colors.successSubtle },
    successText: { color: colors.successText },
    warning: { backgroundColor: colors.warningSubtle },
    warningText: { color: colors.warningText },
    error: { backgroundColor: colors.errorSubtle },
    errorText: { color: colors.error },
    gold: { backgroundColor: colors.accentSubtle },
    goldText: { color: colors.accentText },
  });
}
