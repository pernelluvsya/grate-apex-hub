import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BackLink } from '@/components/learning/nav-bits';
import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Card, Interactive } from '@/components/ui/interactive';
import { Pill, type PillTone } from '@/components/ui/pill';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ProgressRing } from '@/components/ui/progress-ring';
import { InlineNotice } from '@/components/ui/state-views';
import { PageHeader, Screen, SectionHeader } from '@/components/ui/screen';
import { Radius, Type, type ThemeColors } from '@/constants/theme';
import { createPersonalGoal, deletePersonalGoal, listPersonalGoals, refreshProgressGoals, type PersonalGoal } from '@/data/planning';
import { useHomeLearning } from '@/home/bridge';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

type Kind = 'lessons' | 'xp' | 'streak';
const KINDS: { value: Kind; label: string; unit: string; icon: IconName; step: number }[] = [
  { value: 'lessons', label: 'Lessons', unit: 'lessons', icon: 'lesson', step: 1 },
  { value: 'xp', label: 'XP', unit: 'XP', icon: 'xp', step: 50 },
  { value: 'streak', label: 'Streak', unit: 'day streak', icon: 'streak', step: 1 },
];
const TEMPLATES: { title: string; kind: Kind; target: number }[] = [
  { title: 'Finish 10 lessons', kind: 'lessons', target: 10 },
  { title: 'Earn 500 XP', kind: 'xp', target: 500 },
  { title: 'Reach a 7-day streak', kind: 'streak', target: 7 },
];
const DEADLINES: { label: string; days: number | null }[] = [
  { label: 'No deadline', days: null }, { label: '1 week', days: 7 }, { label: '1 month', days: 30 }, { label: '3 months', days: 90 },
];
const kindOf = (t: string) => KINDS.find((k) => k.value === t) ?? KINDS[0];
const isoIn = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

function dueInfo(deadline: string | null, done: boolean): { label: string; tone: PillTone } | null {
  if (!deadline || done) return null;
  const end = new Date(`${deadline}T23:59:59`).getTime();
  if (!Number.isFinite(end)) return null;
  const days = Math.ceil((end - Date.now()) / 86400000);
  if (days < 0) return { label: 'Overdue', tone: 'error' };
  if (days === 0) return { label: 'Due today', tone: 'warning' };
  if (days <= 3) return { label: `${days} day${days === 1 ? '' : 's'} left`, tone: 'warning' };
  return { label: `${days} days left`, tone: 'neutral' };
}

export default function GoalsScreen() {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const learning = useHomeLearning();
  const [goals, setGoals] = useState<PersonalGoal[]>([]);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('10');
  const [days, setDays] = useState<number | null>(null);
  const [kind, setKind] = useState<Kind>('lessons');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  async function reload() {
    try {
      await refreshProgressGoals({ lessonsCompleted: learning.lessonsDone, xp: learning.xp, streak: learning.streak });
      const list = await listPersonalGoals();
      setGoals(list);
      setComposing(list.length === 0);
      setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not sync your goals.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { queueMicrotask(() => { void reload(); }); }, []);

  const meta = kindOf(kind);
  const value = Number(target);
  const valid = title.trim().length > 0 && Number.isFinite(value) && value > 0;

  function bump(dir: 1 | -1) {
    const next = Math.max(meta.step, (Number.isFinite(value) ? value : 0) + dir * meta.step);
    setTarget(String(next));
  }
  function applyTemplate(t: (typeof TEMPLATES)[number]) { setTitle(t.title); setKind(t.kind); setTarget(String(t.target)); }

  async function addGoal() {
    if (!valid) { setError('Add a goal name and a target greater than zero.'); return; }
    setSaving(true);
    try {
      setError('');
      await createPersonalGoal({ title: title.trim(), goal_type: kind, target: Math.round(value), deadline: days === null ? null : isoIn(days) });
      setTitle(''); setDays(null);
      await reload();
      setComposing(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save the goal.'); }
    finally { setSaving(false); }
  }

  async function remove(id: string) {
    if (confirming !== id) { setConfirming(id); return; }
    try { await deletePersonalGoal(id); setGoals((old) => old.filter((g) => g.id !== id)); setConfirming(null); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not remove the goal.'); }
  }

  const { active, finished, overall } = useMemo(() => {
    const done = (g: PersonalGoal) => Boolean(g.completed_at) || Number(g.current) >= Number(g.target);
    const a = goals.filter((g) => !done(g)).sort((x, y) => (x.deadline ?? '9999').localeCompare(y.deadline ?? '9999'));
    const f = goals.filter(done);
    const avg = a.length ? a.reduce((s, g) => s + Math.min(1, Number(g.current) / Math.max(1, Number(g.target))), 0) / a.length : f.length ? 1 : 0;
    return { active: a, finished: f, overall: avg };
  }, [goals]);

  const GoalCard = ({ goal, done }: { goal: PersonalGoal; done: boolean }) => {
    const k = kindOf(goal.goal_type);
    const current = Math.max(0, Number(goal.current));
    const pct = Math.min(1, current / Math.max(1, Number(goal.target)));
    const due = dueInfo(goal.deadline, done);
    return <Card style={[styles.goalCard, done && styles.goalDone]}>
      <View style={styles.goalTop}>
        <View style={[styles.badge, done && styles.badgeDone]}><Icon name={done ? 'check' : k.icon} size={20} color={done ? colors.success : colors.primaryText} /></View>
        <View style={styles.flex}>
          <Text style={styles.title} numberOfLines={2}>{goal.title}</Text>
          <Text style={styles.muted}>{Math.min(current, Number(goal.target))} of {goal.target} {k.unit}</Text>
        </View>
        {due ? <Pill label={due.label} tone={due.tone} /> : done ? <Pill label="Completed" tone="success" /> : null}
      </View>
      <ProgressBar value={pct} height={8} color={done ? colors.success : undefined} label={`${goal.title} progress`} />
      <View style={styles.goalFoot}>
        <Text style={styles.pct}>{Math.round(pct * 100)}%</Text>
        <Button label={confirming === goal.id ? 'Tap again to remove' : 'Remove'} variant="ghost" size="sm" icon={<Icon name="trash" size={15} color={confirming === goal.id ? colors.error : colors.textTertiary} />} onPress={() => void remove(goal.id)} accessibilityLabel={`Remove ${goal.title}`} />
      </View>
    </Card>;
  };

  return <Screen width="content">
    <BackLink fallback="/" />
    <PageHeader title="Personal goals" subtitle="Set a target that fits your study life. Progress updates from your learning activity." />
    {error ? <InlineNotice tone="error" title="Goal sync issue" message={error} /> : null}

    <Card style={styles.summary}>
      <ProgressRing value={overall} size={84} thickness={8} showValue />
      <View style={styles.flex}>
        <Text style={styles.summaryTitle}>{active.length ? `${active.length} active goal${active.length === 1 ? '' : 's'}` : goals.length ? 'All goals complete' : 'No goals yet'}</Text>
        <Text style={styles.muted}>{finished.length} completed · tracked from your real progress</Text>
        <View style={styles.statRow}>
          <Stat icon="lesson" value={learning.lessonsDone} label="lessons" />
          <Stat icon="xp" value={learning.xp} label="XP" />
          <Stat icon="streak" value={learning.streak} label="day streak" />
        </View>
      </View>
    </Card>

    {composing ? <>
      <SectionHeader title="New goal" subtitle="Lesson, XP and streak goals track automatically." style={styles.section} />
      <Card style={styles.card}>
        <Text style={styles.label}>Quick start</Text>
        <View style={styles.chipRow}>{TEMPLATES.map((t) => <Interactive key={t.title} onPress={() => applyTemplate(t)} accessibilityRole="button" style={styles.chip}><Text style={styles.chipText}>{t.title}</Text></Interactive>)}</View>
        <Text style={styles.label}>Goal name</Text>
        <TextInput value={title} onChangeText={setTitle} maxLength={120} placeholder="e.g. Finish 10 lessons" placeholderTextColor={colors.textTertiary} style={styles.input} accessibilityLabel="Goal name" />
        <Text style={styles.label}>What to track</Text>
        <View style={styles.chipRow}>{KINDS.map((item) => <Interactive key={item.value} onPress={() => { setKind(item.value); setTarget(String(item.value === 'xp' ? 500 : item.value === 'streak' ? 7 : 10)); }} accessibilityRole="radio" accessibilityState={{ checked: kind === item.value }} style={[styles.chip, kind === item.value && styles.chipActive]}><Icon name={item.icon} size={15} color={kind === item.value ? colors.primaryText : colors.textSecondary} /><Text style={[styles.chipText, kind === item.value && styles.chipTextActive]}>{item.label}</Text></Interactive>)}</View>
        <Text style={styles.label}>Target ({meta.unit})</Text>
        <View style={styles.stepper}>
          <Interactive onPress={() => bump(-1)} accessibilityRole="button" accessibilityLabel="Decrease target" style={styles.stepBtn}><Icon name="minus" size={18} color={colors.text} /></Interactive>
          <TextInput value={target} onChangeText={(t) => setTarget(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" style={[styles.input, styles.stepInput]} accessibilityLabel="Goal target" />
          <Interactive onPress={() => bump(1)} accessibilityRole="button" accessibilityLabel="Increase target" style={styles.stepBtn}><Icon name="plus" size={18} color={colors.text} /></Interactive>
        </View>
        <Text style={styles.label}>Deadline</Text>
        <View style={styles.chipRow}>{DEADLINES.map((d) => <Interactive key={d.label} onPress={() => setDays(d.days)} accessibilityRole="radio" accessibilityState={{ checked: days === d.days }} style={[styles.chip, days === d.days && styles.chipActive]}><Text style={[styles.chipText, days === d.days && styles.chipTextActive]}>{d.label}</Text></Interactive>)}</View>
        <View style={styles.actions}>
          {goals.length ? <Button label="Cancel" variant="ghost" onPress={() => setComposing(false)} /> : null}
          <Button label={saving ? 'Saving…' : 'Save goal'} onPress={() => void addGoal()} disabled={!valid || saving} />
        </View>
      </Card>
    </> : null}

    {busy ? <Text style={[styles.muted, styles.section]}>Loading goals…</Text> : <>
      <View style={styles.listHead}>
        <View style={styles.flex}><SectionHeader title="Your goals" subtitle="Progress is private to you." style={styles.section} /></View>
        {!composing ? <Button label="New goal" size="sm" icon={<Icon name="plus" size={16} color={colors.onPrimary ?? colors.text} />} onPress={() => setComposing(true)} /> : null}
      </View>
      {active.map((g) => <GoalCard key={g.id} goal={g} done={false} />)}
      {!goals.length && !composing ? <Card style={styles.card}><Text style={styles.body}>No goals yet. Add one and progress will appear here as you study.</Text></Card> : null}
      {finished.length ? <>
        <SectionHeader title="Completed" subtitle="Nice work. Remove them when you are ready." style={styles.section} />
        {finished.map((g) => <GoalCard key={g.id} goal={g} done />)}
      </> : null}
    </>}
  </Screen>;

  function Stat({ icon, value: v, label }: { icon: IconName; value: number; label: string }) {
    return <View style={styles.stat}><Icon name={icon} size={14} color={colors.textTertiary} /><Text style={styles.statText}><Text style={styles.statNum}>{v}</Text> {label}</Text></View>;
  }
}

function createStyles(c: ThemeColors) { return StyleSheet.create({
  card: { gap: 10, marginTop: 12 }, section: { marginTop: 26 }, goalCard: { gap: 12, marginTop: 10 }, goalDone: { opacity: 0.8 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 14 }, summaryTitle: { ...Type.title3, color: c.text },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 4, marginTop: 8 }, stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { ...Type.caption, color: c.textSecondary }, statNum: { fontWeight: '800', color: c.text },
  input: { width: '100%', minWidth: 0, borderWidth: 1, borderColor: c.borderStrong, borderRadius: Radius.md, backgroundColor: c.surfaceSunken, paddingHorizontal: 12, paddingVertical: 10, color: c.text, fontSize: 14 },
  flex: { flex: 1, minWidth: 0 }, label: { ...Type.caption, color: c.textSecondary, fontWeight: '700', marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceMuted },
  chipActive: { borderColor: c.primary, backgroundColor: c.primarySubtle }, chipText: { ...Type.caption, color: c.textSecondary }, chipTextActive: { color: c.primaryText, fontWeight: '800' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 }, stepInput: { flex: 1, textAlign: 'center', fontWeight: '800', fontSize: 16 },
  stepBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceMuted, borderWidth: 1, borderColor: c.border },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 6 },
  listHead: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  goalTop: { flexDirection: 'row', gap: 12, alignItems: 'center' }, title: { ...Type.title3, color: c.text }, muted: { ...Type.caption, color: c.textTertiary, marginTop: 3 }, body: { ...Type.callout, color: c.textSecondary },
  badge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primarySubtle }, badgeDone: { backgroundColor: c.surfaceMuted },
  goalFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, pct: { ...Type.caption, color: c.textSecondary, fontWeight: '800' },
}); }
