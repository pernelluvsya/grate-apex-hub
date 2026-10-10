import type { Href } from '@/lib/router';
import { router } from '@/lib/router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Interactive } from '@/components/ui/interactive';
import { elevation, Radius, Type, type ThemeColors } from '@/constants/theme';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

// "← Back": returns to the previous page, or the given parent when the
// page was opened directly.
export function BackLink({ fallback, label = 'Back' }: { fallback: Href; label?: string }) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  return (
    <Interactive
      onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
      accessibilityLabel={label}
      style={({ hovered, pressed }) => [styles.back, hovered && styles.backHover, pressed && styles.backPressed]}
    >
      <Icon name="chevronLeft" size={16} color={colors.textSecondary} strokeWidth={2.2} />
      <Text style={styles.backText}>{label}</Text>
    </Interactive>
  );
}

export type Crumb = { label: string; href?: Href };

// Subject › Course › Topic — always shows where the learner is.
export function Breadcrumbs({ items, style }: { items: Crumb[]; style?: StyleProp<ViewStyle> }) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  return (
    <View style={[styles.crumbs, style]} accessibilityRole="header">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <View key={`${item.label}-${index}`} style={styles.crumbItem}>
            {item.href && !last ? (
              <Interactive
                accessibilityRole="link"
                accessibilityLabel={item.label}
                onPress={() => router.navigate(item.href!)}
                style={({ hovered }) => [styles.crumbLink, hovered && styles.crumbHover]}
              >
                <Text style={styles.crumbText}>{item.label}</Text>
              </Interactive>
            ) : (
              <Text style={[styles.crumbText, last && styles.crumbCurrent]} numberOfLines={1}>
                {item.label}
              </Text>
            )}
            {!last ? <Icon name="chevronRight" size={12} color={colors.textTertiary} strokeWidth={2.2} style={styles.crumbSep} /> : null}
          </View>
        );
      })}
    </View>
  );
}

// A compact statistic: value, label, optional hint and icon.
export function StatTile({
  value,
  label,
  hint,
  accent,
  icon,
  style,
}: {
  value: ReactNode;
  label: string;
  hint?: string;
  accent?: string;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  return (
    <View style={[styles.stat, style]}>
      {icon ? (
        <View style={styles.statIcon}>
          <Icon name={icon} size={16} color={accent ?? colors.primaryText} filled={icon === 'xp' || icon === 'streak'} />
        </View>
      ) : null}
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text style={[styles.statValue, accent ? { color: accent } : null]} numberOfLines={1}>
          {value}
        </Text>
      ) : (
        value
      )}
      <Text style={styles.statLabel}>{label}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    back: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.hairline,
      borderRadius: 999,
      paddingVertical: 7,
      paddingLeft: 10,
      paddingRight: 14,
      ...elevation(colors, 1),
    },
    backHover: { borderColor: colors.primaryBorder },
    backPressed: { transform: [{ scale: 0.97 }] },
    backText: { color: colors.text, fontSize: 13, fontWeight: '700' },
    crumbs: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', rowGap: 2 },
    crumbItem: { flexDirection: 'row', alignItems: 'center', maxWidth: '100%' },
    crumbLink: { borderRadius: 6, paddingHorizontal: 3, paddingVertical: 1 },
    crumbHover: { backgroundColor: colors.surfaceMuted },
    crumbText: { fontSize: 12, fontWeight: '700', color: colors.textTertiary, letterSpacing: 0.3 },
    crumbCurrent: { color: colors.textSecondary },
    crumbSep: { marginHorizontal: 4 },
    stat: {
      flex: 1,
      minWidth: 120,
      backgroundColor: colors.surface,
      borderRadius: Radius.md,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.hairline,
      ...elevation(colors, 1),
    },
    statIcon: {
      width: 30,
      height: 30,
      borderRadius: 10,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    statValue: { ...Type.numeral, fontSize: 22, color: colors.text },
    statLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginTop: 2 },
    statHint: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  });
}
