import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { AnimatedNumber } from '@/components/ui/animated-number';
import { Icon } from '@/components/ui/icon';
import { ProgressRing } from '@/components/ui/progress-ring';
import { elevation, Radius, Type, type ThemeColors } from '@/constants/theme';
import { rankProgress } from '@/progress';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

/**
 * Everyday rank display.
 *
 * Shows the CURRENT rank, lifetime XP and the XP still needed to reach the
 * next rank. The NEXT RANK'S NAME is deliberately never shown here (see the
 * UX rules in data/ranks.ts) — only the gap. The full ladder is revealed in
 * Explore ("The GRATEAPEX Journey").
 *
 * Renders nothing until the rank ladder has real thresholds, so it is safe
 * to mount anywhere.
 */
export function RankProgressCard({ lifetimeXp, style }: { lifetimeXp: number; style?: StyleProp<ViewStyle> }) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const rank = rankProgress(lifetimeXp);
  const percent = rank.percentToNextRank;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        <ProgressRing
          value={percent / 100}
          size={74}
          thickness={6}
          gradient={['#FFD54A', '#E3A400']}
          trackColor={colors.track}
          label={rank.isTopRank ? 'Highest rank reached' : `${percent}% of the way to the next rank`}
        >
          <Icon name="rank" size={26} color={colors.accentText} strokeWidth={2.1} />
        </ProgressRing>
        <View style={styles.text}>
          <Text style={styles.eyebrow}>CURRENT RANK</Text>
          <Text style={styles.rankName} numberOfLines={2}>
            {rank.title}
          </Text>
          <View style={styles.xpRow}>
            <Icon name="xp" size={14} color={colors.accent} filled />
            <AnimatedNumber value={lifetimeXp} style={styles.xpValue} />
            <Text style={styles.xpLabel}>lifetime XP</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {rank.isTopRank ? (
        <Text style={styles.caption}>You have reached the highest rank.</Text>
      ) : (
        <View style={styles.footer}>
          <Text style={styles.caption}>
            <Text style={styles.captionStrong}>{(rank.xpToNextRank ?? 0).toLocaleString()} XP</Text> to your next rank
          </Text>
          <Text style={styles.level}>
            Level {rank.level} · {rank.xpToNextLevel} XP to Level {rank.level + 1}
          </Text>
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.hairline,
      gap: 14,
      ...elevation(colors, 1),
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    text: { flex: 1, minWidth: 0 },
    eyebrow: { ...Type.overline, color: colors.textTertiary, marginBottom: 3 },
    rankName: { ...Type.title3, color: colors.text },
    xpRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
    xpValue: { ...Type.numeral, fontSize: 15, color: colors.text },
    xpLabel: { fontSize: 12, color: colors.textSecondary },
    divider: { height: 1, backgroundColor: colors.divider },
    footer: { gap: 4 },
    caption: { fontSize: 13, color: colors.textSecondary },
    captionStrong: { fontWeight: '800', color: colors.text },
    level: { fontSize: 12, color: colors.textTertiary },
  });
}
