import { router } from '@/lib/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { stateColor } from '@/components/learning/memory-ui';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Interactive } from '@/components/ui/interactive';
import { webStyle } from '@/components/ui/web';
import { cssTransition, MOTION, SPRING } from '@/constants/motion';
import { elevation, Radius, Type, type ThemeColors } from '@/constants/theme';
import { type CalendarDay, reviewMonth, reviewStrip } from '@/data/learning/calendar';
import { MEMORY_STATE_LABEL, type HistoryAttempt, type MemoryModel } from '@/data/learning/memory-types';
import { startOfDay } from '@/data/learning/time';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';
import { routes } from '@/lib/routes';

// The reinforcement calendar — when each concept comes back, straight
// from the scheduler's due dates (never decorative), plus the reviews
// already done.
//
//   wide (≥ 600px of room) → month grid with a gliding selection outline,
//                            day details beside it, legend + totals
//   narrow (phones)        → day strip with a spring selection pill and
//                            an event panel underneath
// Layout follows the space the calendar is given, not the window.

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const GRID_GAP = 6;
const MONTH_RANGE = { min: -2, max: 3 };

export function ReviewCalendar({ memory, attempts, now }: { memory: MemoryModel; attempts: readonly HistoryAttempt[]; now: number }) {
  const [width, setWidth] = useState(0);
  return (
    <View onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}>
      {width === 0 ? null : width >= 600 ? (
        <MonthCalendar memory={memory} attempts={attempts} now={now} width={width} />
      ) : (
        <StripCalendar memory={memory} attempts={attempts} now={now} />
      )}
    </View>
  );
}

// ── Shared bits ────────────────────────────────────────────────────────

type DotKind = 'overdue' | 'weak' | 'due' | 'reviewed';

function dotsFor(day: CalendarDay): DotKind[] {
  const dots: DotKind[] = [];
  if (day.overdue > 0) dots.push('overdue');
  if (day.weak > 0) dots.push('weak');
  if (day.due.length - day.weak - day.overdue > 0 || (day.due.length > 0 && dots.length === 0)) dots.push('due');
  if (day.reviewed.total > 0) dots.push('reviewed');
  return dots.slice(0, 3);
}

function useDotColors() {
  const colors = useTheme();
  return {
    overdue: colors.error,
    weak: colors.warning,
    due: colors.accent,
    reviewed: colors.success,
  } satisfies Record<DotKind, string>;
}

function fullDate(day: CalendarDay) {
  return new Date(day.start).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

function dayTitle(day: CalendarDay) {
  return day.isToday ? 'Today' : fullDate(day);
}

function daySummary(day: CalendarDay) {
  if (day.isPast) {
    return day.reviewed.total > 0
      ? `${day.reviewed.total} review answer${day.reviewed.total === 1 ? '' : 's'} · ${day.reviewed.correct} correct`
      : 'No reviews this day';
  }
  if (day.due.length === 0) return 'Nothing scheduled';
  const parts = [`${day.due.length} concept${day.due.length === 1 ? '' : 's'} due`];
  if (day.overdue > 0) parts.push(`${day.overdue} overdue`);
  if (day.weak > 0) parts.push(`${day.weak} need work`);
  return parts.join(' · ');
}

// The selected day's agenda: what returns, how important, effect on mastery.
function DayAgenda({ day, max = 5, compact = false }: { day: CalendarDay; max?: number; compact?: boolean }) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();

  if (day.isPast || day.due.length === 0) {
    return (
      <Animated.View entering={FadeIn.duration(MOTION.standard)} key={`empty-${day.start}`} style={styles.emptyAgenda}>
        <View style={styles.emptyMark}>
          <Icon name={day.isPast && day.reviewed.total > 0 ? 'check' : 'calendar'} size={22} color={colors.textTertiary} />
        </View>
        <Text style={styles.emptyTitle}>{day.isPast ? (day.reviewed.total > 0 ? 'Reviewed' : 'No reviews') : day.isToday ? 'All caught up' : 'Nothing scheduled'}</Text>
        <Text style={styles.emptyText}>
          {day.isPast
            ? day.reviewed.total > 0
              ? `${day.reviewed.correct} of ${day.reviewed.total} recalled correctly.`
              : 'Reviews you complete will be logged here.'
            : day.isToday
              ? 'Nothing is due today. Learn something new — it will return here on schedule.'
              : 'No concept is due to return on this day.'}
        </Text>
      </Animated.View>
    );
  }

  const shown = day.due.slice(0, max);
  const lowMastery = day.due.filter((concept) => concept.mastery < 0.6).length;
  return (
    <Animated.View entering={FadeIn.duration(MOTION.standard)} key={`list-${day.start}`} style={styles.agenda}>
      {shown.map((concept, index) => (
        <View key={concept.key} style={[styles.conceptRow, index > 0 && styles.conceptDivider]}>
          <View style={[styles.conceptDot, { backgroundColor: stateColor(colors, concept.state) }]} />
          <View style={styles.flex}>
            <Text style={styles.conceptName} numberOfLines={1}>
              {concept.name}
            </Text>
            <Text style={styles.conceptMeta} numberOfLines={1}>
              {(concept as { subtitle?: string }).subtitle ?? MEMORY_STATE_LABEL[concept.state]}
            </Text>
          </View>
          {!compact ? (
            <View style={styles.masteryCell} accessibilityLabel={`Mastery estimate ${Math.round(concept.mastery * 100)}%`}>
              <View style={styles.masteryTrack}>
                <View style={[styles.masteryFill, { width: `${Math.round(concept.mastery * 100)}%`, backgroundColor: stateColor(colors, concept.state) }]} />
              </View>
              <Text style={styles.masteryText}>{Math.round(concept.mastery * 100)}%</Text>
            </View>
          ) : null}
        </View>
      ))}
      {day.due.length > max ? <Text style={styles.more}>+ {day.due.length - max} more</Text> : null}
      {lowMastery > 0 ? (
        <Text style={styles.effect}>
          {lowMastery} of these {lowMastery === 1 ? 'is' : 'are'} below 60% mastery — reviewing on time is what moves them up.
        </Text>
      ) : (
        <Text style={styles.effect}>Reviewing on schedule keeps these from slipping and lengthens the next interval.</Text>
      )}
      {day.isToday ? (
        <Button label="Start review" trailing="→" onPress={() => router.push(routes.review({ focus: 'due' }))} style={styles.cta} />
      ) : null}
    </Animated.View>
  );
}

function Legend() {
  const styles = useThemedStyles(createStyles);
  const dots = useDotColors();
  const items: { kind: DotKind; label: string }[] = [
    { kind: 'overdue', label: 'Overdue' },
    { kind: 'weak', label: 'Needs work' },
    { kind: 'due', label: 'Due' },
    { kind: 'reviewed', label: 'Reviewed' },
  ];
  return (
    <View style={styles.legend}>
      {items.map((item) => (
        <View key={item.kind} style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: dots[item.kind] }]} />
          <Text style={styles.legendText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Month grid (desktop and wide containers) ──────────────────────────

function MonthCalendar({ memory, attempts, now, width }: { memory: MemoryModel; attempts: readonly HistoryAttempt[]; now: number; width: number }) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const dots = useDotColors();
  const reduceMotion = useReducedMotion();
  const [offset, setOffset] = useState(0);
  const month = useMemo(() => reviewMonth(memory, attempts, now, offset), [memory, attempts, now, offset]);
  const today = startOfDay(now);
  const days = month.weeks.flat();
  const [selectedStart, setSelectedStart] = useState(today);
  const selectedIndex = Math.max(0, days.findIndex((day) => day.start === selectedStart));
  const selected = days.find((day) => day.start === selectedStart) ?? days.find((day) => day.isToday) ?? days[0];

  const withSide = width >= 720;
  const gridWidth = withSide ? width - 290 : width;
  const tile = (gridWidth - GRID_GAP * 6) / 7;
  const tileHeight = Math.min(64, Math.max(48, tile * 0.82));

  // The selection outline glides between tiles.
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const visible = days.some((day) => day.start === selectedStart);
  useEffect(() => {
    const col = selectedIndex % 7;
    const row = Math.floor(selectedIndex / 7);
    const nx = col * (tile + GRID_GAP);
    const ny = row * (tileHeight + GRID_GAP);
    x.value = reduceMotion ? nx : withSpring(nx, SPRING.snappy);
    y.value = reduceMotion ? ny : withSpring(ny, SPRING.snappy);
  }, [selectedIndex, tile, tileHeight, x, y, reduceMotion]);
  const outline = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }] }));

  function changeMonth(next: number) {
    setOffset(next);
    if (next === 0) setSelectedStart(today);
  }

  const grid = (
    <View style={{ width: gridWidth }}>
      <View style={styles.weekdays}>
        {WEEKDAYS.map((label) => (
          <View key={label} style={[styles.weekdayPill, { width: tile }]}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.gridBody}>
        {visible ? (
          <Animated.View style={[styles.outline, { width: tile, height: tileHeight }, outline]} />
        ) : null}
        {month.weeks.map((week, row) => (
          <View key={row} style={styles.week}>
            {week.map((day) => {
              const isSelected = day.start === selectedStart;
              const dayDots = dotsFor(day);
              return (
                <Interactive
                  key={day.start}
                  onPress={() => setSelectedStart(day.start)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${dayTitle(day)}: ${daySummary(day)}`}
                  style={({ hovered }) => [
                    styles.tile,
                    { width: tile, height: tileHeight },
                    day.isToday && styles.tileToday,
                    !day.inMonth && styles.tileOutside,
                    hovered && !isSelected && styles.tileHover,
                  ]}
                >
                  <Text style={[styles.tileDate, day.isToday && styles.tileDateToday, day.isPast && !day.isToday && styles.tileDatePast]}>{day.date}</Text>
                  <View style={styles.tileDots}>
                    {dayDots.map((kind) => (
                      <View key={kind} style={[styles.dot, { backgroundColor: dots[kind] }]} />
                    ))}
                  </View>
                  {day.due.length > 1 ? <Text style={styles.tileCount}>{day.due.length}</Text> : null}
                </Interactive>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );

  const side = (
    <View style={[styles.side, withSide ? styles.sideBeside : styles.sideBelow]}>
      <Text style={styles.sideKicker}>{selected.isToday ? 'TODAY' : selected.isPast ? 'LOOKING BACK' : 'COMING UP'}</Text>
      <Text style={styles.sideTitle}>{fullDate(selected)}</Text>
      <Text style={styles.sideSummary}>{daySummary(selected)}</Text>
      <DayAgenda day={selected} max={withSide ? 6 : 4} />
    </View>
  );

  return (
    <View>
      <View style={styles.monthHeader}>
        <Text style={styles.monthLabel} accessibilityRole="header" accessibilityLiveRegion="polite">
          {month.label}
        </Text>
        <View style={styles.monthNav}>
          {offset !== 0 ? <Button label="Today" size="sm" variant="ghost" onPress={() => changeMonth(0)} /> : null}
          <IconButton icon="chevronLeft" label="Previous month" size={34} tone="surface" onPress={() => offset > MONTH_RANGE.min && changeMonth(offset - 1)} />
          <IconButton icon="chevronRight" label="Next month" size={34} tone="surface" onPress={() => offset < MONTH_RANGE.max && changeMonth(offset + 1)} />
        </View>
      </View>
      <View style={withSide ? styles.monthRow : null}>
        {grid}
        {side}
      </View>
      <View style={styles.footer}>
        <Legend />
        <Text style={styles.totals}>
          <Text style={styles.totalStrong}>{month.totals.dueThisMonth}</Text> due this month ·{' '}
          <Text style={styles.totalStrong}>{month.totals.reviewedThisMonth}</Text> answers reviewed ·{' '}
          <Text style={styles.totalStrong}>{month.totals.activeDays}</Text> active day{month.totals.activeDays === 1 ? '' : 's'}
          {month.totals.overdue > 0 ? (
            <Text style={{ color: colors.error }}> · {month.totals.overdue} overdue</Text>
          ) : null}
        </Text>
      </View>
    </View>
  );
}

// ── Day strip (phones) ────────────────────────────────────────────────

const CELL = 46;
const STRIP_BACK = 3;

function StripCalendar({ memory, attempts, now }: { memory: MemoryModel; attempts: readonly HistoryAttempt[]; now: number }) {
  const styles = useThemedStyles(createStyles);
  const dots = useDotColors();
  const reduceMotion = useReducedMotion();
  const days = useMemo(() => reviewStrip(memory, attempts, now, STRIP_BACK), [memory, attempts, now]);
  const [index, setIndex] = useState(STRIP_BACK);
  const day = days[index] ?? days[STRIP_BACK];
  const scroller = useRef<ScrollView>(null);

  const pill = useSharedValue(STRIP_BACK * CELL);
  useEffect(() => {
    pill.value = reduceMotion ? index * CELL : withSpring(index * CELL, SPRING.snappy);
  }, [index, pill, reduceMotion]);
  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: pill.value }] }));

  const monthLabel = new Date(day.start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <View>
      <View style={styles.stripHeader}>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        {index !== STRIP_BACK ? (
          <Button
            label="Today"
            size="sm"
            variant="ghost"
            onPress={() => {
              setIndex(STRIP_BACK);
              scroller.current?.scrollTo({ x: 0, animated: !reduceMotion });
            }}
          />
        ) : null}
      </View>
      <ScrollView ref={scroller} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip} decelerationRate="fast">
        <Animated.View style={[styles.stripPill, pillStyle]} />
        {days.map((item, i) => {
          const isSelected = i === index;
          const weekday = new Date(item.start).toLocaleDateString(undefined, { weekday: 'narrow' });
          const itemDots = dotsFor(item);
          return (
            <Interactive
              key={item.start}
              onPress={() => setIndex(i)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${dayTitle(item)}: ${daySummary(item)}`}
              style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
            >
              <Text style={[styles.cellWeekday, isSelected && styles.cellWeekdaySelected]}>{weekday}</Text>
              <Text style={[styles.cellDate, isSelected && styles.cellDateSelected, item.isToday && !isSelected && styles.cellDateToday]}>{item.date}</Text>
              <View style={styles.cellDots}>
                {!isSelected
                  ? itemDots.slice(0, 2).map((kind) => <View key={kind} style={[styles.dotSmall, { backgroundColor: dots[kind] }]} />)
                  : null}
              </View>
            </Interactive>
          );
        })}
      </ScrollView>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>{dayTitle(day)}</Text>
          <Text style={styles.panelSummary}>{daySummary(day)}</Text>
        </View>
        <DayAgenda day={day} max={4} compact />
      </View>
      <Legend />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    flex: { flex: 1, minWidth: 0 },

    // Month header
    monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    monthLabel: { ...Type.title3, color: colors.text },
    monthNav: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    monthRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },

    // Grid
    weekdays: { flexDirection: 'row', gap: GRID_GAP, marginBottom: GRID_GAP + 2 },
    weekdayPill: { paddingVertical: 5, borderRadius: 999, backgroundColor: colors.surfaceMuted, alignItems: 'center' },
    weekdayText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: colors.textTertiary },
    gridBody: { gap: GRID_GAP },
    week: { flexDirection: 'row', gap: GRID_GAP },
    tile: {
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingTop: 6,
      backgroundColor: colors.surfaceSunken,
      borderWidth: 1,
      borderColor: colors.hairline,
      ...webStyle(cssTransition('background-color, border-color', MOTION.micro)),
    },
    tileToday: { backgroundColor: colors.primarySubtle, borderColor: colors.primaryBorder },
    tileOutside: { opacity: 0.38 },
    tileHover: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
    tileDate: { ...Type.numeral, fontSize: 14, color: colors.text },
    tileDateToday: { color: colors.primaryText },
    tileDatePast: { color: colors.textTertiary, fontWeight: '700' },
    tileDots: { position: 'absolute', left: 8, bottom: 7, flexDirection: 'row', gap: 4 },
    tileCount: { position: 'absolute', right: 7, bottom: 5, fontSize: 10, fontWeight: '800', color: colors.textTertiary },
    outline: {
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: 2,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.primary,
      pointerEvents: 'none',
      ...elevation(colors, 1),
    },
    dot: { width: 7, height: 7, borderRadius: 4 },
    dotSmall: { width: 5, height: 5, borderRadius: 3 },

    // Day details
    side: { gap: 4 },
    sideBeside: { flex: 1, minWidth: 0, paddingLeft: 20, borderLeftWidth: 1, borderLeftColor: colors.divider },
    sideBelow: { marginTop: 16 },
    sideKicker: { ...Type.overline, color: colors.textTertiary },
    sideTitle: { ...Type.title3, color: colors.text },
    sideSummary: { ...Type.caption, color: colors.textSecondary, marginBottom: 8 },

    agenda: { gap: 0 },
    conceptRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
    conceptDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
    conceptDot: { width: 8, height: 8, borderRadius: 4 },
    conceptName: { fontSize: 13, fontWeight: '700', color: colors.text },
    conceptMeta: { fontSize: 11, color: colors.textTertiary, marginTop: 1 },
    masteryCell: { width: 74, flexDirection: 'row', alignItems: 'center', gap: 6 },
    masteryTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.track, overflow: 'hidden' },
    masteryFill: { height: '100%', borderRadius: 2 },
    masteryText: { fontSize: 10, fontWeight: '800', color: colors.textTertiary, width: 28, textAlign: 'right' },
    more: { fontSize: 12, color: colors.textTertiary, marginTop: 4 },
    effect: { ...Type.caption, color: colors.textSecondary, marginTop: 8 },
    cta: { marginTop: 12, alignSelf: 'flex-start' },
    emptyAgenda: { alignItems: 'center', paddingVertical: 18, gap: 4 },
    emptyMark: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    emptyTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
    emptyText: { ...Type.caption, color: colors.textSecondary, textAlign: 'center', maxWidth: 280 },

    // Legend + totals
    footer: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.divider, gap: 8 },
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 4 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendText: { fontSize: 11, fontWeight: '700', color: colors.textTertiary },
    totals: { fontSize: 12, color: colors.textSecondary },
    totalStrong: { fontWeight: '800', color: colors.text },

    // Strip
    stripHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, minHeight: 36 },
    strip: { paddingVertical: 4 },
    stripPill: {
      position: 'absolute',
      left: 3,
      top: 26,
      width: CELL - 6,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      pointerEvents: 'none',
      ...elevation(colors, 1),
    },
    cell: { width: CELL, alignItems: 'center', paddingTop: 4, paddingBottom: 2 },
    cellPressed: { transform: [{ scale: 0.92 }] },
    cellWeekday: { fontSize: 11, fontWeight: '700', color: colors.textTertiary, height: 18 },
    cellWeekdaySelected: { color: colors.text },
    cellDate: { ...Type.numeral, fontSize: 15, color: colors.textSecondary, height: 40, lineHeight: 40, textAlign: 'center', width: 40 },
    cellDateSelected: { color: colors.onPrimary },
    cellDateToday: { color: colors.primaryText },
    cellDots: { flexDirection: 'row', gap: 3, height: 8, alignItems: 'center' },
    panel: {
      marginTop: 10,
      borderRadius: Radius.lg,
      backgroundColor: colors.surfaceSunken,
      borderWidth: 1,
      borderColor: colors.hairline,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 12,
      marginBottom: 10,
    },
    panelHeader: { marginBottom: 4 },
    panelTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
    panelSummary: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  });
}
