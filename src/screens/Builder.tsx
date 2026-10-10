import React, { useMemo, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "../Text";
import { useColors, Colors } from "../theme";
import { Button } from "../ui";
import { BankQ, shuffle } from "../learning";
import { withIcons as wi } from "../components/em";

export type Topic = { id: string; title: string; qids: string[]; pastQids?: string[] };
export type RoundOpts = { title: string; make: () => BankQ[]; feedback: "instant" | "end"; perQ?: number };

// The Custom Quiz Builder and the Timed Drill from the original hub.
export default function Builder({ kind, bank, topics, onStart, onBack }: { kind: "custom" | "drill"; bank: BankQ[]; topics: Topic[]; onStart: (o: RoundOpts) => void; onBack: () => void }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const drill = kind === "drill";
  const [picked, setPicked] = useState<string[]>([]);
  const [count, setCount] = useState(drill ? 20 : 20);
  const [secs, setSecs] = useState<number>(drill ? 15 : 0);
  const [fb, setFb] = useState<"instant" | "end">("instant");
  const [pastOnly, setPastOnly] = useState(false); // only questions that appeared in real past papers
  const hasPast = useMemo(() => bank.some((q) => q.past), [bank]);

  // In past-questions mode a topic means "the past questions on that topic", and topics with none are hidden.
  const shownTopics = useMemo(() => (pastOnly ? topics.filter((t) => (t.pastQids?.length ?? 0) > 0) : topics), [pastOnly, topics]);
  const chosen = useMemo(() => picked.filter((id) => shownTopics.some((t) => t.id === id)), [picked, shownTopics]);
  const pool = useMemo(() => {
    const base = pastOnly ? bank.filter((q) => q.past) : bank;
    if (!chosen.length) return base;
    const ids = new Set(shownTopics.filter((t) => chosen.includes(t.id)).flatMap((t) => (pastOnly ? t.pastQids ?? [] : t.qids)));
    return base.filter((q) => ids.has(q.id));
  }, [chosen, bank, shownTopics, pastOnly]);
  const n = count === 0 ? pool.length : Math.min(count, pool.length);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const Chip = ({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={[s.chip, on && s.chipOn]}><Text style={[s.chipText, on && { color: COLORS.onPrimary }]}>{wi(label)}</Text></TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity onPress={onBack}><Text style={s.back}>‹ Back to Practice</Text></TouchableOpacity>
      <Text style={s.title}>{drill ? wi("⏱️ Timed Drill") : wi("🎯 Custom Quiz Builder")}</Text>
      <Text style={s.desc}>{drill ? "Rapid fire. Every question has a countdown. Pick your topics and the seconds per question." : "Pick your topics, how many questions, the timing and when you see the answers."}</Text>

      {hasPast && (
        <>
          <Text style={s.label}>Questions from</Text>
          <View style={s.row}>
            <Chip on={!pastOnly} label="All questions" onPress={() => setPastOnly(false)} />
            <Chip on={pastOnly} label="📝 Past questions only" onPress={() => setPastOnly(true)} />
          </View>
        </>
      )}

      {shownTopics.length > 0 && (
        <>
          <Text style={s.label}>Topics {chosen.length ? `(${chosen.length} chosen)` : "(all)"}</Text>
          <View style={s.row}>
            <Chip on={!chosen.length} label="All topics" onPress={() => setPicked([])} />
            {shownTopics.map((t) => <Chip key={t.id} on={chosen.includes(t.id)} label={pastOnly ? `${t.title} (${t.pastQids?.length ?? 0})` : t.title} onPress={() => toggle(t.id)} />)}
          </View>
        </>
      )}

      {!drill && (
        <>
          <Text style={s.label}>Number of questions</Text>
          <View style={s.row}>{[10, 20, 30, 50, 0].map((c) => <Chip key={c} on={count === c} label={c ? String(c) : "All"} onPress={() => setCount(c)} />)}</View>
          <Text style={s.label}>Time per question</Text>
          <View style={s.row}>{[0, 30, 45, 60].map((c) => <Chip key={c} on={secs === c} label={c ? `${c}s` : "No timer"} onPress={() => setSecs(c)} />)}</View>
          <Text style={s.label}>Show answers</Text>
          <View style={s.row}>
            <Chip on={fb === "instant"} label="After each question" onPress={() => setFb("instant")} />
            <Chip on={fb === "end"} label="At the end (exam style)" onPress={() => setFb("end")} />
          </View>
        </>
      )}
      {drill && (
        <>
          <Text style={s.label}>Seconds per question</Text>
          <View style={s.row}>{[10, 15, 20, 30].map((c) => <Chip key={c} on={secs === c} label={`${c}s`} onPress={() => setSecs(c)} />)}</View>
        </>
      )}

      <Text style={[s.desc, { marginVertical: 14 }]}>{pool.length} {pastOnly ? "past " : ""}questions available · this round: {n}</Text>
      <Button title={drill ? "Start the drill" : "Start quiz"} disabled={pool.length === 0}
        onPress={() => onStart({
          title: (drill ? "Timed Drill" : "Custom Quiz") + (pastOnly ? " · Past questions" : ""),
          make: () => shuffle(pool).slice(0, drill ? 20 : count === 0 ? pool.length : count),
          feedback: drill ? "instant" : fb, perQ: secs || undefined,
        })} />
    </View>
  );
}

const makeStyles = (C: Colors) => StyleSheet.create({
  back: { color: C.accent, fontWeight: "700", marginBottom: 12 },
  title: { color: C.text, fontSize: 20, fontWeight: "800", marginBottom: 6 },
  desc: { color: C.muted, fontSize: 14, lineHeight: 20 },
  label: { color: C.text, fontWeight: "700", fontSize: 14, marginTop: 16, marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap" },
  chip: { borderWidth: 1, borderColor: C.border, backgroundColor: C.card, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { color: C.text, fontSize: 14, fontWeight: "600" },
});
