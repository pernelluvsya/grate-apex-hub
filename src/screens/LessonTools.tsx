import React, { useMemo, useRef, useState } from "react";
import { ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import { Text, TextInput as RNInput } from "../Text";
import { useColors, Colors } from "../theme";
import { Button } from "../ui";
import { useProgress } from "../progress";
import { shuffle } from "../learning";
import { NEW_PER_DAY, RATING_NAMES, Rating, buildQueue, isLeech, norm, previewLabel, queueCounts, schedule } from "../srs";
import { Extras, Group, Term, plain } from "../lessons";
import { Rich } from "./LessonBlocks";
import ReviewCalendar from "./ReviewCalendar";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

// ---------- Glossary ----------
export function Glossary({ terms }: { terms: Term[] }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [q, setQ] = useState("");
  const list = useMemo(() => terms.slice().sort((a, b) => a.name.localeCompare(b.name)).filter((t) => !q || (t.name + " " + plain(t.def)).toLowerCase().includes(q.toLowerCase())), [terms, q]);
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
      <Text style={s.h}>📖 Glossary · {terms.length} terms</Text>
      <RNInput value={q} onChangeText={setQ} placeholder="Search terms…" placeholderTextColor={COLORS.muted} style={s.input} autoCapitalize="none" />
      {list.map((t) => (
        <View key={t.id} style={s.card}>
          <Text style={s.name}>{t.name}</Text>
          <Rich x={t.def} style={s.def} />
        </View>
      ))}
      {!list.length && <Text style={s.muted}>No terms match.</Text>}
    </ScrollView>
  );
}

// ---------- Flashcards (Anki-style spaced repetition) ----------
export function Flashcards({ terms, title, labels, intro }: { terms: Term[]; title?: string; labels?: [string, string]; intro?: string }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { progress, gradeTerm } = useProgress();
  const [queue, setQueue] = useState<Term[] | null>(null);
  const [sched, setSched] = useState(true); // false = practice only, the schedule is left alone
  const [flip, setFlip] = useState(false);
  const [tally, setTally] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [cal, setCal] = useState(false);
  const again = useRef<Set<string>>(new Set());

  const counts = useMemo(() => queueCounts(terms, progress.terms), [terms, progress.terms]);

  const begin = (list: Term[], scheduled: boolean) => { again.current = new Set(); setQueue(list); setSched(scheduled); setFlip(false); setTally({ 1: 0, 2: 0, 3: 0, 4: 0 }); };

  // What is left in this session: blue = new, red = learning, green = review (like Anki).
  const left = useMemo(() => {
    let n = 0, l = 0, r = 0;
    (queue ?? []).forEach((t) => { const c = norm(progress.terms[t.id]); if (!c) n++; else if (c.s === 2) r++; else l++; });
    return { n, l, r };
  }, [queue, progress.terms]);

  if (!queue && cal) return <ReviewCalendar terms={terms} studyCount={counts.total} onStudy={() => { setCal(false); begin(buildQueue(terms, progress.terms), true); }} onBack={() => setCal(false)} />;

  if (!queue) {
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <Text style={s.h}>{title ?? "🃏 Flashcards"}</Text>
        <Text style={s.muted}>{intro ?? "Spaced repetition like Anki. See the term, say the meaning out loud, flip, then tell it how it went: Again, Hard, Good or Easy. The easier a card is, the longer it waits before it comes back."}</Text>
        <View style={{ height: 14 }} />
        <TouchableOpacity disabled={!counts.total} style={[s.mode, !counts.total && { opacity: 0.5 }]} onPress={() => begin(buildQueue(terms, progress.terms), true)}>
          <Text style={s.name}>Study now ({counts.total})</Text>
          <Text style={s.muted}>
            {counts.total ? `${counts.newN} new · ${counts.learn} learning · ${counts.review} to review` : "All caught up. Come back tomorrow."}
            {counts.limited ? `\nDaily limit: ${NEW_PER_DAY} new cards a day.` : ""}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={terms.length < 1} style={s.mode} onPress={() => begin(shuffle(terms).slice(0, 5), false)}>
          <Text style={s.name}><Em n="challenge" /> Quick recall check</Text>
          <Text style={s.muted}>5 random cards, a minute or less. Doesn't change your schedule.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.mode} onPress={() => begin(terms, false)}>
          <Text style={s.name}>All cards ({terms.length})</Text>
          <Text style={s.muted}>Go through every card in this set. Doesn't change your schedule.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.mode} onPress={() => setCal(true)}>
          <Text style={s.name}><Em n="calendar" /> Review calendar</Text>
          <Text style={s.muted}>See what's due each day and how much you've reviewed</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (!queue.length) {
    const n = tally[1] + tally[2] + tally[3] + tally[4];
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 48 }}><Em n="sparkle" /></Text>
        <Text style={s.h}>{sched ? "Congratulations! You're done for now." : "Done!"}</Text>
        <Text style={[s.muted, { textAlign: "center", marginBottom: 20 }]}>
          {sched ? `${n} answer${n === 1 ? "" : "s"}: ${tally[1]} Again · ${tally[2]} Hard · ${tally[3]} Good · ${tally[4]} Easy` : `You went through ${n} card${n === 1 ? "" : "s"}.`}
        </Text>
        <Button title="Back to flashcards" onPress={() => setQueue(null)} />
      </View>
    );
  }

  const card = queue[0];
  const cur = norm(progress.terms[card.id]);
  const answer = (r: Rating) => {
    const rest = queue.slice(1);
    if (sched) {
      const nc = schedule(cur, r, Date.now());
      gradeTerm(card.id, r);
      // Still learning: it comes back in this session, a few cards later (longer wait = further back).
      if (nc.s !== 2) rest.splice(Math.min(rest.length, Math.max(2, Math.round(((nc.t ?? Date.now()) - Date.now()) / 60000))), 0, card);
    } else if (r === 1 && !again.current.has(card.id)) { again.current.add(card.id); rest.push(card); }
    setTally((t) => ({ ...t, [r]: t[r] + 1 }));
    setQueue(rest); setFlip(false);
  };
  const now = Date.now();
  const rate = (r: Rating) => (
    <TouchableOpacity key={r} style={s.rate} onPress={() => answer(r)}>
      <Text style={[s.rateIvl, { color: COLORS.muted }]}>{previewLabel(cur, r, now)}</Text>
      <Text style={[s.rateLbl, r === 1 && { color: COLORS.danger }, r === 3 && { color: COLORS.ok }, r === 4 && { color: COLORS.primary }]}>{RATING_NAMES[r]}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={s.topRow}>
        <TouchableOpacity onPress={() => setQueue(null)}><Text style={s.exit}><Em n="close" /> End</Text></TouchableOpacity>
        {sched
          ? <Text style={s.muted}><Text style={{ color: COLORS.primary, fontWeight: "800" }}>{left.n}</Text>  <Text style={{ color: COLORS.danger, fontWeight: "800" }}>{left.l}</Text>  <Text style={{ color: COLORS.ok, fontWeight: "800" }}>{left.r}</Text></Text>
          : <Text style={s.muted}>{queue.length} left</Text>}
      </View>
      <TouchableOpacity activeOpacity={0.9} style={s.flash} onPress={() => setFlip(!flip)}>
        <Text style={s.face}>{flip ? (labels?.[1] ?? "MEANING") : (labels?.[0] ?? "TERM")}{sched && !cur ? "  ·  NEW" : isLeech(cur) ? wi("  ·  🩸 LEECH") : ""}</Text>
        {flip ? <Rich x={card.def} style={s.back} /> : <Text style={[s.front, card.name.length > 70 && { fontSize: 18, lineHeight: 26 }]}>{card.name}</Text>}
        <Text style={s.hint}>{flip ? "" : "Tap to flip"}</Text>
      </TouchableOpacity>
      {!flip ? <Button title="Show answer" onPress={() => setFlip(true)} />
        : sched ? <View style={{ flexDirection: "row" }}>{([1, 2, 3, 4] as Rating[]).map(rate)}</View>
        : (
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, marginRight: 8 }}><Button variant="ghost" title="Again" onPress={() => answer(1)} /></View>
            <View style={{ flex: 1, marginLeft: 8 }}><Button title="Got it" onPress={() => answer(3)} /></View>
          </View>
        )}
    </View>
  );
}

// ---------- Mnemonics and key facts ----------
export function GroupList({ title, groups, accent }: { title: string; groups: Group[]; accent?: boolean }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
      <Text style={s.h}>{title}</Text>
      {groups.map((g, i) => (
        <View key={i} style={s.card}>
          {!!g.h && <Rich x={g.h} style={s.name} />}
          {g.lines.map((l, j) => <Rich key={j} x={l} style={[s.def, accent && { fontSize: 15.5 }]} />)}
        </View>
      ))}
    </ScrollView>
  );
}

// ---------- Step by step ----------
export function Steps({ data }: { data: NonNullable<Extras["steps"]> }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [n, setN] = useState(0);
  const it = data.items[n];
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
      <Text style={s.h}>🔄 {data.title}</Text>
      <View style={s.chips}>
        {data.items.map((_, k) => (
          <TouchableOpacity key={k} onPress={() => setN(k)} style={[s.chip, k === n && s.chipOn]}>
            <Text style={[s.chipText, k === n && { color: COLORS.onPrimary }]}>{k + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[s.card, { marginTop: 8 }]}>
        <Rich x={it.t} style={[s.name, { fontSize: 18 }]} />
        <Rich x={it.d} style={[s.def, { fontSize: 16, lineHeight: 25 }]} />
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1, marginRight: 8 }}><Button variant="ghost" title="← Previous" disabled={n === 0} onPress={() => setN(n - 1)} /></View>
        <View style={{ flex: 1, marginLeft: 8 }}><Button title="Next →" disabled={n === data.items.length - 1} onPress={() => setN(n + 1)} /></View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (C: Colors) => StyleSheet.create({
  h: { color: C.text, fontSize: 20, fontWeight: "800", marginBottom: 10 },
  muted: { color: C.muted, fontSize: 13.5, lineHeight: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  input: { color: C.text, borderColor: C.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: C.card, marginBottom: 14, fontSize: 15 },
  card: { backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  name: { color: C.accent, fontSize: 15, fontWeight: "700", marginBottom: 4 },
  def: { color: C.text, fontSize: 14.5, lineHeight: 22, marginBottom: 4 },
  mode: { backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 10 },
  topRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  exit: { color: C.muted, fontWeight: "700" },
  flash: { flex: 1, maxHeight: 420, backgroundColor: C.card, borderColor: C.accent, borderWidth: 1.5, borderRadius: 22, padding: 22, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  face: { color: C.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 14 },
  front: { color: C.text, fontSize: 26, fontWeight: "800", textAlign: "center" },
  back: { color: C.text, fontSize: 17, lineHeight: 26, textAlign: "center" },
  hint: { color: C.muted, fontSize: 12, marginTop: 18 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginBottom: 6 },
  chip: { width: 40, height: 40, borderRadius: 20, borderColor: C.border, borderWidth: 1, backgroundColor: C.card, alignItems: "center", justifyContent: "center", marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { color: C.text, fontWeight: "700" },
  rate: { flex: 1, marginHorizontal: 3, paddingVertical: 10, borderRadius: 14, alignItems: "center", borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  rateLbl: { color: C.text, fontWeight: "800", fontSize: 14 },
  rateIvl: { fontSize: 11.5, marginBottom: 2 },
});
