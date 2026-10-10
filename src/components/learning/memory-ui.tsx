import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Pill } from '@/components/ui/pill';
import { StackedBar } from '@/components/ui/progress-bar';
import type { ThemeColors } from '@/constants/theme';
import { MEMORY_STATE_LABEL, type MemoryCounts } from '@/data/learning/memory-types';
import type { MemoryState } from '@/data/learning/memory-types';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

export function stateColor(colors: ThemeColors, state: MemoryState) {
  switch (state) {
    case 'learning':
      return colors.stateLearning;
    case 'struggling':
      return colors.stateStruggling;
    case 'remembered':
      return colors.stateRemembered;
    case 'mastered':
      return colors.stateMastered;
    default:
      return colors.stateNew;
  }
}

export function MemoryStateBadge({ state, due }: { state: MemoryState; due?: boolean }) {
  const colors = useTheme();
  const tone = state === 'struggling' ? 'error' : state === 'mastered' ? 'gold' : state === 'remembered' ? 'success' : state === 'learning' ? 'primary' : 'neutral';
  return (
    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
      <Pill label={MEMORY_STATE_LABEL[state]} tone={tone} dotColor={stateColor(colors, state)} />
      {due ? <Pill label="Due" tone="warning" /> : null}
    </View>
  );
}

const ORDER: MemoryState[] = ['mastered', 'remembered', 'learning', 'struggling', 'new'];

// Stacked bar of concept states with an optional legend.
export function MemoryDistribution({
  counts,
  legend = true,
  style,
  height = 10,
}: {
  counts: MemoryCounts;
  legend?: boolean;
  style?: StyleProp<ViewStyle>;
  height?: number;
}) {
  const colors = useTheme();
  const styles = useThemedStyles(createStyles);
  const total = ORDER.reduce((sum, state) => sum + counts[state], 0);
  return (
    <View style={style}>
      <StackedBar
        height={height}
        label={`${counts.mastered} mastered, ${counts.remembered} remembered, ${counts.learning} learning, ${counts.struggling} struggling, ${counts.new} new`}
        segments={ORDER.map((state) => ({ value: counts[state], color: stateColor(colors, state) }))}
      />
      {legend && total > 0 ? (
        <View style={styles.legend}>
          {ORDER.filter((state) => counts[state] > 0).map((state) => (
            <View key={state} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: stateColor(colors, state) }]} />
              <Text style={styles.legendText}>
                {counts[state]} {MEMORY_STATE_LABEL[state].toLowerCase()}
              </Text>
            </View>
          ))}
          {counts.due > 0 ? (
            <View style={styles.legendItem}>
              <Text style={[styles.legendText, styles.dueText]}>· {counts.due} due</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 12, color: colors.textSecondary },
    dueText: { color: colors.warningText, fontWeight: '700' },
  });
}
