import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../Text";
import { useColors, Colors } from "../theme";
import { Button } from "../ui";
import { streakOf, useProgress } from "../progress";
import { LEARN_STEPS, NEW_PER_DAY, newToday, norm } from "../srs";
import { dayStr, todayKey } from "../learning";
import { Term } from "../lessons";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

// An Anki-style calendar for flashcard spaced repetition.
//   Today and the days ahead: how many cards are due (overdue cards pile up on today, like Anki).
//   Past days: how many cards you reviewed (a heatmap that builds a habit).
// Counts cover every flashcard the student has ever answered. Card names are listed for the cards in `terms`.
const WEEK = ["M", "T", "W", "T", "F", "S", "S"];
const MAX_AHEAD = 3, MAX_BACK = 12; // months you can page forward / back

// How a card is doing, shown next to its name.
const cardMeta = (c?: { s?: number; i?: number; l?: number }) => (!c ? "new" : c.s === 2 ? `${c.i}d interval${(c.l ?? 0) ? ` · ${c.l} lapse${c.l === 1 ? "" : "s"}` : ""}` : c.s === 3 ? "relearning" : "learning");

const monthLabel = (y: number, m: number) => new Date(y, m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
const dayLabel = (key: string) => new Date(key + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

export default function ReviewCalendar({ terms, onStudy, studyCount, onBack, backLabel }: { terms: Term[]; onStudy?: () => void; studyCount?: number; onBack?: () => void; backLabel?: string }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { progress } = useProgress();
  const today = todayKey();
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [sel, setSel] = useState(today);

  const names = useMemo(() => new Map(terms.map((t) => [t.id, t.name])), [terms]);
  const newN = useMemo(() => Math.min(terms.filter((t) => !progress.terms[t.id]).length, Math.max(0, NEW_PER_DAY - newToday(progress.terms, today))), [terms, progress.terms, today]);

  // day -> ids due that day. Anything overdue counts as due today.
  const { due, overdue } = useMemo(() => {
    const due: Record<string, string[]> = {};
    let overdue = 0;
    for (const [id, c] of Object.entries(progress.terms)) {
      const k = c.d < today ? today : c.d;
      if (c.d < today) overdue++;
      (due[k] ||= []).push(id);
    }
    return { due, overdue };
  }, [progress.terms, today]);

  const total = Object.keys(progress.terms).length;
  const dueToday = due[today]?.length ?? 0;
  const nextWeek = useMemo(() => {
    let n = 0;
    for (let i = 1; i <= 7; i++) { const d = new Date(); d.setDate(d.getDate() + i); n += due[dayStr(d)]?.length ?? 0; }
    return n;
  }, [due]);
  const streak = streakOf(progress.termDays || {});

  // The month grid, weeks start on Monday.
  const cells = useMemo(() => {
    const first = (new Date(ym.y, ym.m, 1).getDay() + 6) % 7;
    const count = new Date(ym.y, ym.m + 1, 0).getDate();
    const out: (string | null)[] = Array(first).fill(null);
    for (let d = 1; d <= count; d++) out.push(dayStr(new Date(ym.y, ym.m, d)));
    while (out.length % 7) out.push(null);
    return out;
  }, [ym]);

  const offset = (ym.y - now.getFullYear()) * 12 + (ym.m - now.getMonth());
  const go = (n: number) => {
    const o = offset + n;
    if (o > MAX_AHEAD || o < -MAX_BACK) return;
    const d = new Date(now.getFullYear(), now.getMonth() + o, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
  };
  const jumpToday = () => { setYm({ y: now.getFullYear(), m: now.getMonth() }); setSel(today); };

  // Shade by how busy the day is.
  const dueShade = (n: number) => (n >= 30 ? "cc" : n >= 15 ? "99" : n >= 5 ? "66" : "33");
  const reviewed = (k: string) => progress.termDays?.[k] || 0;

  const selIds = due[sel] ?? [];
  const named = selIds.filter((id) => names.has(id));
  const hidden = selIds.length - named.length;
  const isPast = sel < today;
  const toStudy = studyCount ?? dueToday + newN; // how many cards the Study button will open

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
      {!!onBack && <TouchableOpacity onPress={onBack}><Text style={s.back}>{backLabel ?? "← Back to flashcards"}</Text></TouchableOpacity>}
      <Text style={s.h}><Em n="calendar" /> Review calendar</Text>

      <View style={s.stats}>
        <View style={s.stat}><Text style={s.statNum}>{dueToday}</Text><Text style={s.statLbl}>due today</Text></View>
        <View style={s.stat}><Text style={s.statNum}>{nextWeek}</Text><Text style={s.statLbl}>next 7 days</Text></View>
        <View style={s.stat}><Text style={s.statNum}>{streak}</Text><Text style={s.statLbl}>{streak === 1 ? "day streak" : wi("day streak 🔥")}</Text></View>
      </View>

      <View style={s.monthRow}>
        <TouchableOpacity onPress={() => go(-1)} disabled={offset <= -MAX_BACK} style={[s.nav, offset <= -MAX_BACK && { opacity: 0.3 }]}><Text style={s.navTxt}>‹</Text></TouchableOpacity>
        <TouchableOpacity onPress={jumpToday} style={{ flex: 1 }}><Text style={s.month}>{monthLabel(ym.y, ym.m)}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => go(1)} disabled={offset >= MAX_AHEAD} style={[s.nav, offset >= MAX_AHEAD && { opacity: 0.3 }]}><Text style={s.navTxt}>›</Text></TouchableOpacity>
      </View>

      <View style={s.grid}>
        {WEEK.map((w, i) => <View key={"w" + i} style={s.cellWrap}><Text style={s.weekday}>{w}</Text></View>)}
        {cells.map((k, i) => {
          if (!k) return <View key={"e" + i} style={s.cellWrap} />;
          const past = k < today;
          const n = past ? reviewed(k) : due[k]?.length ?? 0;
          const bg = past ? (n >= 10 ? COLORS.ok + "66" : n > 0 ? COLORS.okBg : "transparent") : n > 0 ? COLORS.primary + dueShade(n) : "transparent";
          return (
            <View key={k} style={s.cellWrap}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setSel(k)} style={[s.cell, { backgroundColor: bg }, k === today && s.cellToday, k === sel && s.cellSel]}>
                <Text style={[s.dayNum, past && !n && { opacity: 0.45 }]}>{Number(k.slice(8))}</Text>
                {n > 0 && <Text style={[s.count, past && { color: COLORS.ok }]}>{n}</Text>}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={s.legend}>
        <View style={[s.dot, { backgroundColor: COLORS.primary + "99" }]} /><Text style={s.legendTxt}>cards due</Text>
        <View style={[s.dot, { backgroundColor: COLORS.ok + "66", marginLeft: 16 }]} /><Text style={s.legendTxt}>cards reviewed</Text>
      </View>

      <View style={s.detail}>
        <Text style={s.detailTitle}>{sel === today ? "Today · " : ""}{dayLabel(sel)}</Text>
        {isPast ? (
          <Text style={s.muted}>{reviewed(sel) ? `You reviewed ${reviewed(sel)} card${reviewed(sel) === 1 ? "" : "s"}.` : "No cards reviewed this day."}</Text>
        ) : (
          <>
            <Text style={s.muted}>
              {selIds.length ? `${selIds.length} card${selIds.length === 1 ? "" : "s"} due` : "Nothing due"}
              {sel === today && overdue ? ` (${overdue} overdue)` : ""}
              {sel === today && newN ? ` · ${newN} new` : ""}
            </Text>
            {named.slice(0, 12).map((id) => (
              <View key={id} style={s.row}>
                <Text style={s.rowName} numberOfLines={1}>{names.get(id)}</Text>
                <Text style={s.rowMeta}>{cardMeta(norm(progress.terms[id]))}</Text>
              </View>
            ))}
            {named.length > 12 && <Text style={[s.muted, { marginTop: 6 }]}>+ {named.length - 12} more</Text>}
            {hidden > 0 && <Text style={[s.muted, { marginTop: 6 }]}>{named.length ? `+ ${hidden} from other lessons` : terms.length ? `${hidden} from other lessons and AI sets` : "Open a lesson's flashcards to study them."}</Text>}
            {sel === today && !!onStudy && toStudy > 0 && (
              <View style={{ marginTop: 12 }}><Button title={`Study now (${toStudy})`} onPress={onStudy} /></View>
            )}
            {sel === today && !toStudy && !!total && <Text style={[s.muted, { marginTop: 6 }]}>All caught up. Come back tomorrow.</Text>}
          </>
        )}
      </View>

      <Text style={[s.muted, { marginTop: 14 }]}>
        {total
          ? `${total} card${total === 1 ? "" : "s"} scheduled the Anki way: new cards go through ${LEARN_STEPS.join(" and ")} minute steps, then come back after 1 day and grow with each Good (Easy grows faster, Hard slower, Again starts over).`
          : "Answer a few flashcards and your review schedule will show up here."}
      </Text>
    </ScrollView>
  );
}

const makeStyles = (C: Colors) => StyleSheet.create({
  h: { color: C.text, fontSize: 20, fontWeight: "800", marginBottom: 12 },
  back: { color: C.accent, fontWeight: "800", marginBottom: 10 },
  muted: { color: C.muted, fontSize: 13.5, lineHeight: 20 },
  stats: { flexDirection: "row", marginBottom: 16 },
  stat: { flex: 1, backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderRadius: 14, paddingVertical: 12, marginHorizontal: 4, alignItems: "center" },
  statNum: { color: C.text, fontSize: 22, fontWeight: "800" },
  statLbl: { color: C.muted, fontSize: 11.5, marginTop: 2 },
  monthRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  nav: { width: 40, height: 40, borderRadius: 20, borderColor: C.border, borderWidth: 1, backgroundColor: C.card, alignItems: "center", justifyContent: "center" },
  navTxt: { color: C.text, fontSize: 22, fontWeight: "700", marginTop: -2 },
  month: { color: C.text, fontSize: 16, fontWeight: "800", textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cellWrap: { width: "14.2857%", padding: 2 },
  weekday: { color: C.muted, fontSize: 11.5, fontWeight: "700", textAlign: "center", paddingVertical: 4 },
  cell: { aspectRatio: 1, borderRadius: 10, borderWidth: 1, borderColor: "transparent", alignItems: "center", justifyContent: "center" },
  cellToday: { borderColor: C.accent },
  cellSel: { borderColor: C.text, borderWidth: 2 },
  dayNum: { color: C.text, fontSize: 13, fontWeight: "700" },
  count: { color: C.text, fontSize: 10.5, fontWeight: "800", marginTop: 1 },
  legend: { flexDirection: "row", alignItems: "center", marginTop: 8, marginBottom: 14 },
  dot: { width: 10, height: 10, borderRadius: 3, marginRight: 6 },
  legendTxt: { color: C.muted, fontSize: 12 },
  detail: { backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderRadius: 16, padding: 16 },
  detailTitle: { color: C.text, fontSize: 15.5, fontWeight: "800", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 7, borderTopWidth: 1, borderTopColor: C.border, marginTop: 6 },
  rowName: { color: C.text, fontSize: 14, fontWeight: "600", flex: 1, marginRight: 10 },
  rowMeta: { color: C.muted, fontSize: 12 },
});
