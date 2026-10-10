import React, { useMemo, useState } from "react";
import { TouchableOpacity, View, StyleSheet, TextInput } from "react-native";
import { Text } from "../Text";
import { Panel } from "../ui";
import { useColors, Colors } from "../theme";
import { useProgress, RoundMode } from "../progress";
import { Course } from "../data/catalog";
import { BankQ, banksFor, courseOf, dueIds, reviewRound, weakTopics, weakRound, onThisDay, studyPlan, todayKey, addDays, validDay } from "../learning";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

export type StartRound = (r: { title: string; mode: RoundMode; primary: string; make: () => BankQ[]; feedback?: "instant" | "end"; perQ?: number }) => void;

// The "Smart study" panel on the Study home screen.
export function LearnPanel({ courses, start }: { courses: Course[]; start: StartRound }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { progress, setExamDate } = useProgress();
  const [planOpen, setPlanOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const all = useMemo(() => banksFor(courses), [courses]);
  const ids = courses.map((c) => c.id);
  const today = todayKey();

  const due = useMemo(() => dueIds(progress.cards, today).filter((id) => all.some((q) => q.id === id)), [progress.cards, all, today]);
  const weak = useMemo(() => weakTopics(progress.topics, ids), [progress.topics, ids.join(",")]);
  const otd = useMemo(() => onThisDay(progress.cards, all, today, "me"), [progress.cards, all, today]);
  const seenCount = ids.reduce((n, id) => n + (progress.seen[id]?.length || 0), 0);
  const exam = progress.examDate;
  const plan = exam && validDay(exam) ? studyPlan({ examDate: exam, today, totalQuestions: all.length, seenCount, reviewsDue: due.length, answeredToday: progress.days[today] || 0 }) : null;
  const nm = (id: string) => courseOf(id)?.name ?? id;

  const saveTyped = () => { if (validDay(typed) && typed > today) { setExamDate(typed); setTyped(""); } };

  return (
    <>
      <Text style={s.section}><Em n="brain" /> Smart study</Text>
      <Panel>
        <TouchableOpacity disabled={!due.length} style={[s.row, !due.length && { opacity: 0.5 }]} onPress={() => start({ title: "Review · due today", mode: "review", primary: courseOf(all.find((q) => q.id === due[0])?.course ?? "")?.id ?? ids[0], make: () => reviewRound(all, progress.cards, todayKey()) })}>
          <Text style={s.rowIcon}><Em n="repeat" /></Text>
          <View style={{ flex: 1 }}>
            <Text style={s.rowTitle}>Review due ({due.length})</Text>
            <Text style={s.muted}>{due.length ? "Mistakes that are ready to be tried again" : "Nothing due. Wrong answers come back after 2 days."}</Text>
          </View>
        </TouchableOpacity>

        <View style={s.divider} />
        <TouchableOpacity disabled={!weak.length} style={[s.row, !weak.length && { opacity: 0.5 }]} onPress={() => start({ title: "Weak spots", mode: "weak", primary: weak[0].course, make: () => { const w = weakTopics(progress.topics, ids); return w.length ? weakRound(all, w, progress.seen) : []; } })}>
          <Text style={s.rowIcon}><Em n="target" /></Text>
          <View style={{ flex: 1 }}>
            <Text style={s.rowTitle}>Weak spots</Text>
            {weak.length ? weak.slice(0, 3).map((w) => <Text key={w.course + w.topic} style={s.muted} numberOfLines={1}>{w.pct}% · {w.topic} ({nm(w.course)})</Text>)
              : <Text style={s.muted}>Answer a few rounds. Topics under 75% (after 4+ answers) show up here.</Text>}
          </View>
        </TouchableOpacity>

        {otd && (
          <>
            <View style={s.divider} />
            <TouchableOpacity style={s.row} onPress={() => start({ title: "On this day", mode: "review", primary: otd.q.course, make: () => [otd.q] })}>
              <Text style={s.rowIcon}><Em n="calendar" /></Text>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>On this day</Text>
                <Text style={s.muted}>You got a question wrong on {otd.card.w}. Try it again today.</Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        <View style={s.divider} />
        <TouchableOpacity style={s.row} onPress={() => setPlanOpen(!planOpen)}>
          <Text style={s.rowIcon}><Em n="calendar" /></Text>
          <View style={{ flex: 1 }}>
            <Text style={s.rowTitle}>Study plan</Text>
            <Text style={s.muted}>{plan ? `${plan.daysLeft} day${plan.daysLeft === 1 ? "" : "s"} to your exam · today: ${plan.todayTarget} questions` : "Set your exam date and get a daily target"}</Text>
          </View>
          <Text style={s.muted}>{planOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {planOpen && (
          <View style={{ marginTop: 12 }}>
            <Text style={s.muted}>Exam date</Text>
            <View style={s.chips}>
              {[14, 30, 60, 90].map((n) => (
                <TouchableOpacity key={n} style={[s.chip, exam === addDays(today, n) && s.chipOn]} onPress={() => setExamDate(addDays(today, n))}>
                  <Text style={[s.chipText, exam === addDays(today, n) && { color: COLORS.onPrimary }]}>in {n} days</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.dateRow}>
              <TextInput value={typed} onChangeText={setTyped} placeholder="or type YYYY-MM-DD" placeholderTextColor={COLORS.muted} style={s.input} autoCapitalize="none" />
              <TouchableOpacity style={[s.chip, s.chipOn]} onPress={saveTyped}><Text style={[s.chipText, { color: COLORS.onPrimary }]}>Set</Text></TouchableOpacity>
            </View>
            {typed.length >= 10 && !(validDay(typed) && typed > today) && <Text style={[s.muted, { color: COLORS.danger }]}>Use a future date like {addDays(today, 30)}</Text>}

            {plan && exam && (
              <View style={{ marginTop: 14 }}>
                <Text style={s.rowTitle}>Exam on {exam}</Text>
                <Text style={s.muted}>{plan.daysLeft} days left · you've seen {plan.seen} of {plan.total} questions ({plan.unseen} new to go)</Text>
                <View style={s.bar}><View style={[s.fill, { width: `${plan.total ? Math.round((plan.seen / plan.total) * 100) : 0}%`, backgroundColor: COLORS.primary }]} /></View>
                <Text style={[s.rowTitle, { marginTop: 14 }]}>Today's target</Text>
                <Text style={s.muted}>{plan.reviews} review{plan.reviews === 1 ? "" : "s"} + {plan.newPerDay} new questions = {plan.todayTarget}</Text>
                <View style={s.bar}><View style={[s.fill, { width: `${Math.min(100, Math.round((plan.doneToday / Math.max(1, plan.todayTarget)) * 100))}%`, backgroundColor: COLORS.accent }]} /></View>
                <Text style={s.muted}>{plan.doneToday} answered today{plan.doneToday >= plan.todayTarget ? wi(" · target hit! 🏆") : ""}</Text>
                <Text style={[s.muted, { marginTop: 10 }]}>{plan.daysLeft <= 3 ? "Final days: just revise. Do your reviews and weak spots." : "The last 3 days are kept for revision, so new questions are spread over the days before."}</Text>
                <TouchableOpacity onPress={() => setExamDate(null)}><Text style={[s.muted, { color: COLORS.danger }]}>Remove exam date</Text></TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </Panel>
    </>
  );
}

const makeStyles = (COLORS: Colors) => StyleSheet.create({
  section: { color: COLORS.text, fontSize: 18, fontWeight: "800", marginVertical: 8 },
  row: { flexDirection: "row", alignItems: "flex-start" },
  rowIcon: { fontSize: 22, marginRight: 12, marginTop: 2 },
  rowTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  muted: { color: COLORS.muted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  chip: { borderColor: COLORS.border, borderWidth: 1, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14, marginRight: 8, marginBottom: 8, backgroundColor: COLORS.card, justifyContent: "center" },
  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
  dateRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  input: { flex: 1, color: COLORS.text, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, backgroundColor: COLORS.card },
  bar: { height: 7, borderRadius: 999, backgroundColor: COLORS.light ? "rgba(10,31,160,0.1)" : "rgba(255,255,255,0.12)", overflow: "hidden", marginTop: 10 },
  fill: { height: 7, borderRadius: 999 },
});
