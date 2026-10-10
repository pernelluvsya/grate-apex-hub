import React, { useEffect, useState } from "react";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "../Text";
import { useAuth } from "../auth";
import { answerFeedback } from "../feedback";
import { useProgress } from "../progress";
import { useColors } from "../theme";
import Background from "../Background";
import { Column, Panel } from "../ui";
import Icon from "../Icon";
import { COURSES } from "../data/catalog";
import { Answer, QOTD_XP, Stats, myAnswer, qotdStreak, saveAnswer, todayStats, todaysQuestion, classKey } from "../qotd";
import { withIcons as wi } from "../components/em";

export default function QotdCard() {
  const COLORS = useColors();
  const { user, profile } = useAuth();
  const { recordRound } = useProgress();
  const q = React.useMemo(() => todaysQuestion(profile?.hall, profile?.semester), [profile?.hall, profile?.semester, classKey(profile?.hall, profile?.semester)]);
  const [ans, setAns] = useState<Answer | null | undefined>(undefined); // undefined = still loading
  const [stats, setStats] = useState<Stats | null>(null);
  const [streak, setStreak] = useState(0);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [gained, setGained] = useState<number | null>(null);
  const [err, setErr] = useState("");

  const load = async () => {
    if (!user) return;
    try {
      const [a, st, sk] = await Promise.all([myAnswer(user.uid), todayStats(profile?.hall, profile?.semester), qotdStreak(user.uid)]);
      setAns(a); setStats(st); setStreak(sk);
    } catch { setAns(null); }
  };
  useEffect(() => { load(); }, [user?.uid, q?.id]);

  if (!q || !user) return null;
  const done = !!ans;
  const choose = async () => {
    if (sel === null || busy || done) return;
    setBusy(true); setErr("");
    const ok = sel === q.a;
    answerFeedback(ok ? "right" : "wrong", !profile?.feedbackOff); // right here, still inside the tap, so iPhones allow the sound
    try {
      await saveAnswer(user.uid, profile?.hall, profile?.semester, { ok, pick: sel });
      const r = recordRound([{ q, ok }], "normal", q.course, ok ? QOTD_XP.right : QOTD_XP.wrong);
      setGained(r.xp);
      await load();
    } catch (e: any) { setErr(e?.code === "permission-denied" ? "You've already answered today's question." : "Couldn't save your answer. Check your internet."); load(); }
    setBusy(false);
  };

  const pct = stats && stats.total ? Math.round((stats.correct / stats.total) * 100) : null;
  const shown = ans ? ans.pick : sel;
  return (
    <>
      <TouchableOpacity activeOpacity={0.85} onPress={() => setOpen(true)}>
        <Panel>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 28, marginRight: 12 }}>{done ? (ans!.ok ? wi("✅") : wi("📘")) : wi("❓")}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.text, fontSize: 17, fontWeight: "800" }}>Question of the Day</Text>
              <Text style={{ color: COLORS.muted, marginTop: 2 }} numberOfLines={1}>
                {ans === undefined ? "Loading…" : done ? (ans!.ok ? "Nailed it! Come back tomorrow." : "See the answer and how others did.") : `One question, +${QOTD_XP.right} XP if you get it right`}
              </Text>
            </View>
            {streak > 0 && <Text style={{ color: "#ff8a3d", fontWeight: "800", marginRight: 8 }}>🔥 {streak}</Text>}
            <Icon name="chevron" size={18} color={COLORS.muted} />
          </View>
        </Panel>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <Background><Column>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: "800" }}>Question of the Day</Text>
                <Text style={{ color: COLORS.muted, marginTop: 2 }}>{COURSES.find((c) => c.id === q.course)?.name ?? "Mixed"} · same question for your whole class</Text>
              </View>
              <TouchableOpacity onPress={() => setOpen(false)} style={{ padding: 10 }} accessibilityLabel="Close"><Icon name="close" size={26} color={COLORS.text} /></TouchableOpacity>
            </View>
            <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "700", lineHeight: 26, marginBottom: 14 }}>{q.q}</Text>
            {q.o.map((o, i) => {
              const isRight = done && i === q.a, isMine = shown === i;
              const wrong = done && isMine && i !== q.a;
              return (
                <TouchableOpacity key={i} disabled={done || busy} onPress={() => setSel(i)} activeOpacity={0.8}
                  style={{ flexDirection: "row", alignItems: "center", backgroundColor: isRight ? "rgba(34,197,94,0.15)" : wrong ? "rgba(239,68,68,0.15)" : COLORS.card, borderColor: isRight ? "#22c55e" : wrong ? COLORS.danger : isMine ? COLORS.primary : COLORS.border, borderWidth: 2, borderRadius: 14, padding: 14, marginBottom: 10 }}>
                  <Text style={{ color: COLORS.muted, fontWeight: "800", width: 26 }}>{String.fromCharCode(65 + i)}</Text>
                  <Text style={{ color: COLORS.text, flex: 1, lineHeight: 21 }}>{o}</Text>
                </TouchableOpacity>
              );
            })}
            {!!err && <Text style={{ color: COLORS.danger, marginBottom: 8 }}>{err}</Text>}
            {!done && (
              <TouchableOpacity onPress={choose} disabled={sel === null || busy} style={{ backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center", opacity: sel === null || busy ? 0.5 : 1 }}>
                <Text style={{ color: COLORS.onPrimary, fontWeight: "800", fontSize: 16 }}>{busy ? "Saving…" : "Lock in my answer"}</Text>
              </TouchableOpacity>
            )}
            {done && (
              <View style={{ backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 4 }}>
                <Text style={{ color: ans!.ok ? "#22c55e" : COLORS.danger, fontSize: 20, fontWeight: "800" }}>{ans!.ok ? wi("Correct! 🎉") : "Not this time"}</Text>
                {gained !== null && <Text style={{ color: COLORS.accent, fontWeight: "800", marginTop: 4 }}>+{gained} XP</Text>}
                {!!q.e && <Text style={{ color: COLORS.text, marginTop: 8, lineHeight: 21 }}>{q.e}</Text>}
                <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 12 }} />
                <Text style={{ color: COLORS.muted }}>
                  {pct !== null ? `${pct}% of your class got this right (${stats!.total} answered).` : "You're the first in your class today!"}
                </Text>
                <Text style={{ color: COLORS.muted, marginTop: 4 }}>🔥 {streak}-day Question of the Day streak. {ans!.ok ? "" : "Missed ones come back in your review a couple of days later."}</Text>
              </View>
            )}
          </ScrollView>
        </Column></Background>
      </Modal>
    </>
  );
}
