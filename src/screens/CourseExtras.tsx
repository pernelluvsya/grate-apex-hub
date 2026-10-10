import React, { useMemo, useState } from "react";
import { Image, ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import { Text, TextInput } from "../Text";
import { useColors, Colors } from "../theme";
import { Button } from "../ui";
import { Hover } from "../ui";
import { useProgress, xpForQuiz } from "../progress";
import { shuffle } from "../learning";
import { Course } from "../data/catalog";
import { extrasFor, gradeTyped, typeinId, EXTRA_IMAGES, TypeInQ } from "../data/extras";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

export type ExtraKind = "glossary" | "quickref" | "formulas" | "typein" | "cards";
export const EXTRA_LABELS: Record<ExtraKind, { icon: string; title: string }> = {
  glossary: { icon: "📖", title: "Glossary" },
  quickref: { icon: "📋", title: "Quick Reference" },
  formulas: { icon: "Σ", title: "Formula Sheet" },
  typein: { icon: "✍️", title: "Type-in answers" },
  cards: { icon: "🗂️", title: "Study cards" },
};

export default function CourseExtras({ course, kind, onBack }: { course: Course; kind: ExtraKind; onBack: () => void }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const data = extrasFor(course.id);
  const head = (sub?: string) => (
    <>
      <TouchableOpacity onPress={onBack}><Text style={s.back}>‹ Back to {course.name}</Text></TouchableOpacity>
      <Text style={s.h}>{wi(EXTRA_LABELS[kind].icon)} {course.name} · {EXTRA_LABELS[kind].title}</Text>
      {!!sub && <Text style={s.muted}>{sub}</Text>}
    </>
  );
  if (!data) return <ScrollView contentContainerStyle={s.page}>{head()}<Text style={s.muted}>Nothing here yet.</Text></ScrollView>;
  if (kind === "typein") return <TypeIn course={course} qs={data.typein} onBack={onBack} />;
  if (kind === "glossary") return <GlossaryView head={head(`${data.glossary.length} terms`)} items={data.glossary} />;
  if (kind === "cards") return <CardsView head={head(`${data.cards.length} card${data.cards.length === 1 ? "" : "s"}. Try to answer first, then reveal.`)} cards={data.cards} />;

  if (kind === "quickref") {
    return (
      <ScrollView contentContainerStyle={s.page}>
        {head("Fast comparison tables for the things most often mixed up in exams.")}
        {data.quickref.map((r, n) => (
          <View key={n} style={s.card}>
            <Text style={s.cardTitle}>{r.title}</Text>
            {!!r.note && <Text style={[s.muted, { marginTop: 0, marginBottom: 10 }]}>{r.note}</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {!!r.head.length && (
                  <View style={[s.tr, { backgroundColor: COLORS.border }]}>
                    {r.head.map((h, i) => <Text key={i} style={[s.td, s.th, { width: colW(r.head.length) }]}>{h}</Text>)}
                  </View>
                )}
                {r.rows.map((row, ri) => (
                  <View key={ri} style={[s.tr, ri < r.rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
                    {row.map((c, ci) => <Text key={ci} style={[s.td, ci === 0 && { fontWeight: "700" }, { width: colW(r.head.length || row.length) }]}>{c}</Text>)}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    );
  }

  // formulas
  return (
    <ScrollView contentContainerStyle={s.page}>
      {head("Key equations, each with a worked example.")}
      {data.formulas.map((f, n) => (
        <View key={n} style={s.card}>
          <Text style={s.cardTitle}>{f.title}</Text>
          <View style={s.eq}><Text style={s.eqText} selectable>{f.eq}</Text></View>
          {!!f.worked && <Text style={s.body}><Text style={{ fontWeight: "800", color: COLORS.accent }}>Worked example: </Text>{f.worked}</Text>}
          {!!f.note && <Text style={[s.muted, { marginTop: 8, lineHeight: 20 }]}>{f.note}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}
const colW = (cols: number) => (cols <= 2 ? 190 : cols === 3 ? 160 : 130);

// ---------- Glossary ----------
function GlossaryView({ head, items }: { head: React.ReactNode; items: { t: string; n: string; d: string }[] }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [limit, setLimit] = useState(60);
  const topics = useMemo(() => Array.from(new Set(items.map((i) => i.t))), [items]);
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return items.filter((i) => (!topic || i.t === topic) && (!k || (i.n + " " + i.d).toLowerCase().includes(k))).sort((a, b) => a.n.localeCompare(b.n));
  }, [items, q, topic]);
  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      {head}
      <TextInput value={q} onChangeText={(v) => { setQ(v); setLimit(60); }} placeholder="Search terms…" placeholderTextColor={COLORS.muted} style={s.input} autoCapitalize="none" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {[null, ...topics].map((t) => (
          <TouchableOpacity key={t ?? "all"} onPress={() => { setTopic(t); setLimit(60); }} style={[s.chip, topic === t && { backgroundColor: COLORS.accent, borderColor: COLORS.accent }]}>
            <Text style={[s.chipText, topic === t && { color: COLORS.onPrimary }]}>{t ?? "All topics"}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {list.slice(0, limit).map((g, n) => (
        <View key={g.n + n} style={s.card}>
          <Text style={s.cardTitle}>{g.n}</Text>
          <Text style={s.body}>{g.d}</Text>
          <Text style={[s.muted, { marginTop: 6 }]}>{g.t}</Text>
        </View>
      ))}
      {list.length > limit && <Button variant="ghost" title={`Show more (${list.length - limit} left)`} onPress={() => setLimit(limit + 80)} />}
      {!list.length && <Text style={s.muted}>No terms match.</Text>}
    </ScrollView>
  );
}

// ---------- Study cards (tap to reveal) ----------
function CardsView({ head, cards }: { head: React.ReactNode; cards: { t: string; q: string; a: string; e: string; img?: string }[] }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const c = cards[i];
  const go = (n: number) => { setI(n); setShow(false); };
  return (
    <ScrollView contentContainerStyle={s.page}>
      {head}
      <Text style={[s.muted, { marginBottom: 10 }]}>{i + 1} / {cards.length} · {c.t}</Text>
      <View style={s.card}>
        {c.img && EXTRA_IMAGES[c.img] ? <Image source={EXTRA_IMAGES[c.img]} resizeMode="contain" style={{ width: "100%", height: 320, marginBottom: 12 }} /> : null}
        <Text style={[s.body, { fontWeight: "700", fontSize: 17, lineHeight: 25 }]}>{c.q}</Text>
        {show ? (
          <View style={{ marginTop: 14 }}>
            <Text style={[s.small, { color: COLORS.ok, fontWeight: "800", marginBottom: 4 }]}>Answer</Text>
            <Text style={s.body}>{c.a}</Text>
            {!!c.e && <Text style={[s.muted, { marginTop: 10, lineHeight: 20 }]}>{c.e}</Text>}
          </View>
        ) : <View style={{ marginTop: 14 }}><Button title="Reveal answer" onPress={() => setShow(true)} /></View>}
      </View>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity disabled={i === 0} onPress={() => go(i - 1)} style={[s.nav, { marginRight: 10 }, i === 0 && { opacity: 0.35 }]}><Text style={s.navText}>‹ Previous</Text></TouchableOpacity>
        <TouchableOpacity disabled={i === cards.length - 1} onPress={() => go(i + 1)} style={[s.nav, s.navMain, i === cards.length - 1 && { opacity: 0.35 }]}><Text style={[s.navText, { color: COLORS.onPrimary }]}>Next ›</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ---------- Type-in answers ----------
function TypeIn({ course, qs, onBack }: { course: Course; qs: TypeInQ[]; onBack: () => void }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { recordRound, progress, toggleStar } = useProgress();
  const [round, setRound] = useState<{ title: string; list: TypeInQ[] } | null>(null);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);   // what the student typed, per question (kept when moving around)
  const [checked, setChecked] = useState<boolean[]>([]);  // submitted with "Check answer"
  const [xp, setXp] = useState<number | null>(null);      // set once the round is finished

  const groups = useMemo(() => {
    const m = new Map<string, TypeInQ[]>();
    qs.forEach((q) => { if (!m.has(q.g)) m.set(q.g, []); m.get(q.g)!.push(q); });
    return Array.from(m.entries());
  }, [qs]);
  const past = useMemo(() => qs.filter((q) => q.past), [qs]);

  const begin = (title: string, list: TypeInQ[]) => { setRound({ title, list }); setI(0); setAnswers(list.map(() => "")); setChecked(list.map(() => false)); setXp(null); };
  const leave = () => { setRound(null); };

  if (!round) {
    return (
      <ScrollView contentContainerStyle={s.page}>
        <TouchableOpacity onPress={onBack}><Text style={s.back}>‹ Back to {course.name}</Text></TouchableOpacity>
        <Text style={s.h}>✍️ {course.name} · Type-in answers</Text>
        <Text style={[s.muted, { marginBottom: 14 }]}>{qs.length} questions with no options. Work it out and type the answer (a number, to the accuracy asked). Close answers count.</Text>
        <Hover style={[s.card, { borderColor: COLORS.accent, borderWidth: 2 }]} onPress={() => begin("Mixed", shuffle(qs).slice(0, 15))}>
          <Text style={s.cardTitle}><Em n="challenge" /> Mixed round</Text>
          <Text style={s.muted}>{Math.min(15, qs.length)} random questions</Text>
        </Hover>
        {past.length > 0 && (
          <Hover style={s.card} onPress={() => begin("Past questions", past.slice())}>
            <Text style={s.cardTitle}><Em n="edit" /> Past questions</Text>
            <Text style={s.muted}>{past.length} questions from past papers</Text>
          </Hover>
        )}
        {groups.map(([g, list]) => (
          <Hover key={g} style={s.card} onPress={() => begin(g, list.slice())}>
            <Text style={s.cardTitle}>{g}</Text>
            <Text style={s.muted}>{list.length} question{list.length === 1 ? "" : "s"}</Text>
          </Hover>
        ))}
      </ScrollView>
    );
  }

  const N = round.list.length;
  const isRight = (n: number) => checked[n] && gradeTyped(answers[n], round.list[n].a);
  const answeredN = checked.filter(Boolean).length;
  const finish = () => {
    const c = round.list.filter((_, n) => isRight(n)).length;
    const x = xpForQuiz(c, N);
    recordRound([], "normal", course.id, x); // XP only: these questions aren't in the multiple-choice bank
    setXp(x);
  };

  if (xp !== null) {
    const correct = round.list.filter((_, n) => isRight(n)).length, pct = Math.round((correct / N) * 100);
    return (
      <ScrollView contentContainerStyle={s.page}>
        <Text style={{ fontSize: 56, textAlign: "center" }}>{pct === 100 ? wi("💯") : pct >= 70 ? wi("🎉") : wi("💪")}</Text>
        <Text style={[s.h, { textAlign: "center" }]}>{correct} / {N} correct ({pct}%)</Text>
        <Text style={[s.muted, { textAlign: "center", marginBottom: N - answeredN ? 4 : 20 }]}>+{xp} XP</Text>
        {N - answeredN > 0 && <Text style={[s.muted, { textAlign: "center", marginBottom: 20 }]}>{N - answeredN} question{N - answeredN === 1 ? "" : "s"} not checked</Text>}
        <Button title="Another round" onPress={() => begin(round.title, shuffle(round.list))} />
        <Button variant="ghost" title="Back to type-in sets" onPress={leave} />
      </ScrollView>
    );
  }

  const q = round.list[i];
  const typed = answers[i] ?? "";
  const isChecked = checked[i];
  const ok = isRight(i);
  const qid = typeinId(course.id, q);
  const starred = !!progress.stars?.[qid]?.on;
  const setTyped = (t: string) => setAnswers((a) => a.map((v, n) => (n === i ? t : v)));
  const check = () => { if (!typed.trim() || isChecked) return; setChecked((c) => c.map((v, n) => (n === i ? true : v))); };
  const go = (n: number) => { if (n >= 0 && n < N) setI(n); };
  const nextOrFinish = () => (i === N - 1 ? finish() : go(i + 1));

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
        <TouchableOpacity onPress={leave}><Text style={s.exit}><Em n="close" /> Quit</Text></TouchableOpacity>
        <Text style={s.small}>{i + 1} / {N}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={[s.small, { flex: 1 }]}>{round.title} · {q.t}</Text>
        <TouchableOpacity onPress={() => toggleStar(qid)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel={starred ? "Remove bookmark" : "Bookmark this question"} style={{ paddingHorizontal: 6 }}>
          <Text style={{ fontSize: 22, color: starred ? "#facc15" : COLORS.muted }}>{starred ? wi("★") : wi("☆")}</Text>
        </TouchableOpacity>
      </View>
      <Text style={[s.q, q.q.length > 140 && { fontSize: 16, lineHeight: 24 }]} selectable>{q.q}</Text>
      <TextInput
        value={typed} onChangeText={setTyped} editable={!isChecked} placeholder="Type your answer" placeholderTextColor={COLORS.muted}
        autoCapitalize="none" autoCorrect={false} onSubmitEditing={() => (isChecked ? nextOrFinish() : check())}
        style={[s.input, isChecked && { borderColor: ok ? COLORS.ok : COLORS.danger, backgroundColor: ok ? COLORS.okBg : COLORS.badBg }]}
      />
      {!isChecked ? <Button title="Check answer" onPress={check} disabled={!typed.trim()} /> : (
        <View>
          <Text style={[s.small, { color: ok ? COLORS.ok : COLORS.danger, fontWeight: "700", marginBottom: 6 }]}>{ok ? "Correct!" : `Not quite. The answer is ${q.a}.`}</Text>
          {!!q.e && (
            <View style={s.card}>
              <Text style={[s.small, { color: COLORS.accent, fontWeight: "700", marginBottom: 6 }]}><Em n="book" /> Worked example</Text>
              <Text style={s.body}>{q.e}</Text>
            </View>
          )}
        </View>
      )}

      {/* question navigator: jump to any question; colours show checked right / wrong */}
      <View style={[s.card, { marginTop: 16 }]}>
        <Text style={[s.small, { fontWeight: "700", marginBottom: 8 }]}>Questions · {answeredN} / {N} checked</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {round.list.map((_, n) => {
            const right = isRight(n), wrong = checked[n] && !right, done = checked[n];
            return (
              <TouchableOpacity key={n} onPress={() => go(n)} style={[s.navChip, done && s.navChipDone, right && s.navChipRight, wrong && s.navChipWrong, n === i && s.navChipNow]}>
                <Text style={[s.navChipText, done && !right && !wrong && { color: COLORS.onPrimary }]}>{n + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity onPress={finish} style={{ marginTop: 12 }}>
          <Text style={s.exit}>🏁 Finish now{answeredN < N ? ` (${N - answeredN} not checked)` : ""}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <TouchableOpacity onPress={() => go(i - 1)} disabled={i === 0} style={[s.nav, { marginRight: 10 }, i === 0 && { opacity: 0.35 }]}>
          <Text style={s.navText}>‹ Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={nextOrFinish} style={[s.nav, s.navMain]}>
          <Text style={[s.navText, { color: COLORS.onPrimary }]}>{i === N - 1 ? "Finish" : "Next ›"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const makeStyles = (COLORS: Colors) => StyleSheet.create({
  page: { padding: 20, paddingBottom: 140, width: "100%", maxWidth: 820, alignSelf: "center" },
  back: { color: COLORS.accent, fontWeight: "700", marginBottom: 14 },
  h: { color: COLORS.text, fontSize: 22, fontWeight: "800", marginBottom: 4 },
  muted: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  small: { color: COLORS.muted, fontSize: 14 },
  exit: { color: COLORS.muted, fontWeight: "700" },
  q: { color: COLORS.text, fontSize: 19, fontWeight: "700", lineHeight: 27, marginVertical: 14 },
  body: { color: COLORS.text, fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 12 },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700", marginBottom: 4 },
  input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, color: COLORS.text, fontSize: 16, marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  chipText: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
  navChip: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, alignItems: "center", justifyContent: "center", marginRight: 6, marginBottom: 6 },
  navChipDone: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  navChipRight: { backgroundColor: COLORS.okBg, borderColor: COLORS.ok },
  navChipWrong: { backgroundColor: COLORS.badBg, borderColor: COLORS.danger },
  navChipNow: { borderWidth: 2, borderColor: "#ffd34d" },
  navChipText: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  tr: { flexDirection: "row" },
  td: { color: COLORS.text, fontSize: 13, lineHeight: 19, padding: 9 },
  th: { fontWeight: "800", color: COLORS.text },
  eq: { backgroundColor: COLORS.bg, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, padding: 12, marginVertical: 10 },
  eqText: { color: COLORS.text, fontSize: 16, fontWeight: "700", lineHeight: 24 },
  nav: { flex: 1, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, paddingVertical: 14, alignItems: "center" },
  navMain: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  navText: { color: COLORS.text, fontWeight: "700", fontSize: 15 },
});
