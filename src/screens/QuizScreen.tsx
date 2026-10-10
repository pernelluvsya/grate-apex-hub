import React, { useState, useMemo, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useLayout } from "../responsive";
import { ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import { Text, TextInput } from "../Text";
import { BankQ, isTyped, isRightAnswer } from "../learning";
import { useProgress, RoundMode, RoundInfo } from "../progress";
import { useColors, Colors } from "../theme";
import { Button } from "../ui";
import { levelName } from "../learning";
import { saveQuizSession, clearQuizSession } from "../quizSession";
import ResultsShareSheet, { QuizResultData } from "../ResultsShareSheet";
import { useScreenBack } from "../backStack";
import { useAuth } from "../auth";
import { answerFeedback } from "../feedback";
import { confirmAsk } from "../confirm";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

type Ans = { q: BankQ; ok: boolean; pick: number | string | null };
type Props = {
  primary: string; title: string; mode: RoundMode; questions: BankQ[]; onExit: () => void; onAgain?: () => void;
  feedback?: "instant" | "end"; // "end" = no answers shown until the quiz is over (exam style)
  perQ?: number;                // seconds allowed for each question (timed rounds only move forward)
  resume?: { selections: (number | string | null)[]; locked: boolean[]; currentIndex: number }; // picks up a saved quiz
};

export default function QuizScreen({ primary, title, mode, questions, onExit, onAgain, feedback = "instant", perQ, resume }: Props) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { recordRound, progress, toggleStar } = useProgress();
  const { profile } = useAuth();
  const fbOn = !profile?.feedbackOff; // You > Answer feedback
  const N = questions.length;
  const ok = !!resume && resume.selections.length === N && resume.locked.length === N;
  const [i, setI] = useState(() => (ok ? Math.min(Math.max(resume!.currentIndex, 0), N - 1) : 0));
  const [sel, setSel] = useState<(number | string | null)[]>(() => (ok ? resume!.selections : Array(N).fill(null))); // chosen option per question (-1 = out of time)
  const [locked, setLocked] = useState<boolean[]>(() => (ok ? resume!.locked : Array(N).fill(false)));    // confirmed
  const [shareResult, setShareResult] = useState<QuizResultData | null>(null); // set only when the user taps Share
  const [done, setDone] = useState<{ xp: number; info: RoundInfo; list: Ans[]; skipped: number } | null>(null);
  const [left, setLeft] = useState(perQ ?? 0);
  const [panel, setPanel] = useState(false); // question list on a phone
  const instant = feedback === "instant";
  const timed = !!perQ;
  const { desktop } = useLayout();

  // Android back: leave the quiz. Normal rounds save as you go, so it just leaves; a timed round that is
  // still running is not saved, so ask first. (Declared before the "no questions" early return below.)
  useScreenBack(true, () => {
    if (timed && !done) confirmAsk("Leave this timed round? Your progress in it won't be saved.", "Leave").then((yes) => { if (yes) onExit(); });
    else onExit();
  });

  // Save progress after every change (answer, confirm, or moving question) so nothing is lost if the
  // app is closed or the phone kills it in the background. Timed rounds are not saved.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; } // just opened (or just resumed): nothing new to save
    if (done || timed) return;
    const answered = sel.filter((x, n) => x !== null && (locked[n] || !instant)).length;
    if (answered === 0) return;
    saveQuizSession({ primary, title, mode, feedback, questions, selections: sel, locked, currentIndex: i, timestamp: Date.now() });
  }, [sel, locked, i]);

  const keys = useRef<(k: string) => void>(() => { });
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const h = (e: KeyboardEvent) => { if (e.metaKey || e.ctrlKey || e.altKey) return; keys.current(e.key); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // countdown for each question (stops once the answer is confirmed)
  const frozen = useRef(false); frozen.current = !!locked[i];
  useEffect(() => {
    if (!perQ || done) return;
    setLeft(perQ);
    const t = setInterval(() => setLeft((l) => (frozen.current ? l : l - 1)), 1000);
    return () => clearInterval(t);
  }, [i, perQ, !!done]);
  useEffect(() => { if (perQ && !done && left <= 0 && !locked[i]) timeUp(); }, [left]);

  if (N === 0) {
    return <View style={s.page}><Text style={s.q}>No questions here yet.</Text><Button title="Back" onPress={onExit} /></View>;
  }

  const letter = (n: number) => String.fromCharCode(65 + n);
  const wide = desktop ? { width: "100%" as const, maxWidth: 780, alignSelf: "center" as const } : null;

  // ---- results ----
  if (done) {
    const { xp: xpEarned, info, list, skipped } = done;
    const correct = list.filter((a) => a.ok).length;
    const pct = Math.round((correct / N) * 100);
    const missed = list.filter((a) => !a.ok);
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[s.page, { paddingTop: desktop ? 40 : 56 }, wide]}>
        <Text style={{ fontSize: 56, textAlign: "center" }}>{pct === 100 ? wi("💯") : pct >= 70 ? wi("🎉") : wi("💪")}</Text>
        <Text style={[s.q, { textAlign: "center" }]}>{correct} / {N} correct ({pct}%)</Text>
        <Text style={[s.small, { textAlign: "center", marginBottom: skipped ? 4 : 24 }]}>+{xpEarned} XP</Text>
        {skipped > 0 && <Text style={[s.small, { textAlign: "center", marginBottom: 24 }]}>{skipped} question{skipped === 1 ? "" : "s"} skipped</Text>}
        {info.pre && <Text style={[s.small, s.note]}>📏 Pre-test saved: {info.pre.c}/{info.pre.t}. Study this course, then take the post-test to see how much you improved.</Text>}
        {info.post && (() => {
          const a = Math.round((info.post.preC / info.post.preT) * 100), b = Math.round((info.post.c / info.post.t) * 100), d = b - a;
          return <Text style={[s.small, s.note, { color: d >= 0 ? COLORS.ok : COLORS.danger, fontWeight: "700" }]}>📈 Pre-test {a}% → Post-test {b}% ({d >= 0 ? "+" : ""}{d} points)</Text>;
        })()}
        {info.diff && <Text style={[s.small, s.note]}>{info.diff.to > info.diff.from ? wi(`⬆️ Level up! Next adaptive round: ${levelName(info.diff.to)}.`) : info.diff.to < info.diff.from ? `⬇️ Next adaptive round eases to ${levelName(info.diff.to)}.` : `Staying at ${levelName(info.diff.to)} for the next round.`}</Text>}
        {info.review && <Text style={[s.small, s.note]}>🔁 {info.review.fixed} mistake{info.review.fixed === 1 ? "" : "s"} fixed{info.review.still ? `, ${info.review.still} coming back soon` : ""}.</Text>}
        {info.newCards > 0 && <Text style={[s.small, s.note]}>🗂️ {info.newCards} new question{info.newCards === 1 ? "" : "s"} added to your review list.</Text>}
        <Button variant="ghost" title="📤 Share result" onPress={() => setShareResult({ mode: String(mode), title, correct, total: N, xp: xpEarned, accuracy: pct, emoji: pct === 100 ? "💯" : pct >= 70 ? "🎉" : "💪", pct })} />
        {onAgain && <Button title="Another round" onPress={onAgain} />}
        <Button variant="ghost" title="Back to course" onPress={onExit} />
        {!instant && missed.length > 0 && (
          <View style={{ marginTop: 18 }}>
            <Text style={[s.exHead, { fontSize: 15, marginBottom: 10 }]}><Em n="book" /> What you missed</Text>
            {missed.map((a, n) => (
              <View key={n} style={[s.example, { marginBottom: 12 }]}>
                <Text style={[s.small, { color: COLORS.text, fontWeight: "700", marginBottom: 6 }]}>{a.q.q}</Text>
                <Text style={[s.small, { color: COLORS.danger }]}>{isTyped(a.q) ? (typeof a.pick === "string" ? `You wrote: ${a.pick}` : "No answer") : (typeof a.pick === "number" && a.pick >= 0 ? `You chose ${letter(a.pick)}: ${a.q.o[a.pick]}` : "No answer (time ran out)")}</Text>
                <Text style={[s.small, { color: COLORS.ok, marginTop: 4 }]}>Correct: {isTyped(a.q) ? a.q.ans : `${letter(a.q.a)}: ${a.q.o[a.q.a]}`}</Text>
                {!!a.q.e && <Text style={[s.small, { color: COLORS.text, lineHeight: 20, marginTop: 6 }]}>{a.q.e}</Text>}
              </View>
            ))}
          </View>
        )}
        <ResultsShareSheet result={shareResult} onClose={() => setShareResult(null)} />
      </ScrollView>
    );
  }

  const q = questions[i];
  const cur = sel[i];
  const isLocked = locked[i];
  const starred = !!progress.stars?.[q.id]?.on; // bookmarked
  const last = i === N - 1;
  const answeredN = sel.filter((x, n) => x !== null && (locked[n] || !instant)).length;
  const showAnswer = instant && isLocked;
  const shownAnswer = isTyped(q) ? (q.ans ?? "") : letter(q.a);
  const shownFull = isTyped(q) ? (q.ans ?? "") : `${letter(q.a)}: ${q.o[q.a]}`;

  function finish() {
    clearQuizSession(primary, mode, title); // finished: nothing left to resume
    const list: Ans[] = [];
    questions.forEach((qq, n) => { const v = sel[n]; if (v !== null && (locked[n] || !instant)) list.push({ q: qq, ok: isRightAnswer(qq, v), pick: v }); });
    setDone({ ...recordRound(list.map(({ q, ok }) => ({ q, ok })), mode, primary), list, skipped: N - list.length });
  }
  const go = (n: number) => { if (timed || n < 0 || n >= N) return; setI(n); setPanel(false); };
  function pick(idx: number) {
    if (instant && isLocked) return;
    setSel((a) => a.map((v, n) => (n === i ? idx : v)));
    if (!instant) setLocked((a) => a.map((v, n) => (n === i ? false : v))); // exam style: changing your answer un-confirms it
  }
  function typeAnswer(text: string) {
    if (instant && isLocked) return;
    setSel((a) => a.map((v, n) => (n === i ? (text.trim() === "" ? null : text) : v)));
    if (!instant) setLocked((a) => a.map((v, n) => (n === i ? false : v)));
  }
  function confirm() {
    if (cur === null || isLocked) return;
    if (instant) answerFeedback(isRightAnswer(q, cur) ? "right" : "wrong", fbOn); // exam style hides answers until the end, so no sound there
    setLocked((a) => a.map((v, n) => (n === i ? true : v)));
  }
  function timeUp() {
    if (instant && !isLocked) answerFeedback(isRightAnswer(q, cur) ? "right" : "wrong", fbOn);
    if (cur === null) setSel((a) => a.map((v, n) => (n === i ? -1 : v)));
    setLocked((a) => a.map((v, n) => (n === i ? true : v)));
    if (!instant) { if (last) finish(); else setI(i + 1); }
  }
  function next() { if (last) finish(); else setI(i + 1); }

  keys.current = (k: string) => {
    if (isTyped(q) && k !== "Enter") return; // typing: letters, spaces and arrows belong to the text box
    if (k === "Enter" || k === " ") {
      if (cur !== null && !isLocked) confirm();
      else if (isLocked || (!instant && cur !== null)) next();
      return;
    }
    if (k === "ArrowRight") { if (timed ? isLocked : true) next(); return; }
    if (k === "ArrowLeft") { go(i - 1); return; }
    if (instant && isLocked) return;
    const n = /^[1-9]$/.test(k) ? Number(k) - 1 : k.length === 1 ? k.toLowerCase().charCodeAt(0) - 97 : -1;
    if (n >= 0 && n < q.o.length) pick(n);
  };

  // the numbered question picker
  const chip = (n: number) => {
    const done_ = sel[n] !== null && (locked[n] || !instant);
    const rightN = instant && locked[n] && isRightAnswer(questions[n], sel[n]), wrongN = instant && locked[n] && !isRightAnswer(questions[n], sel[n]);
    return (
      <TouchableOpacity key={n} onPress={() => go(n)} style={[s.chip, done_ && s.chipDone, rightN && s.chipRight, wrongN && s.chipWrong, n === i && s.chipNow]}>
        <Text style={[s.chipText, (done_ && !rightN && !wrongN) && { color: COLORS.onPrimary }]}>{n + 1}</Text>
      </TouchableOpacity>
    );
  };
  const picker = (
    <View>
      <Text style={[s.small, { marginBottom: 8, fontWeight: "700" }]}>Questions · {answeredN} / {N} answered</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{questions.map((_, n) => chip(n))}</View>
      <TouchableOpacity onPress={finish} style={{ marginTop: 12 }}><Text style={s.exit}>🏁 Finish now{answeredN < N ? ` (${N - answeredN} unanswered)` : ""}</Text></TouchableOpacity>
    </View>
  );

  // Progress is already saved after every change, so quitting just leaves.
  const handleQuit = () => onExit();

  const main = (
    <View style={{ flex: desktop ? 1 : undefined }}>
      <View style={s.top}>
        <TouchableOpacity onPress={handleQuit}><Text style={s.exit}><Em n="close" /> Quit</Text></TouchableOpacity>
        <Text style={s.small}>{i + 1} / {N}</Text>
        {!desktop && !timed && <TouchableOpacity onPress={() => setPanel(!panel)}><Text style={s.exit}><Em n="list" /> Questions</Text></TouchableOpacity>}
      </View>
      {!desktop && panel && <View style={[s.example, { marginBottom: 12 }]}>{picker}</View>}
      {timed && (
        <View style={{ marginBottom: 10 }}>
          <View style={s.timerTrack}><View style={[s.timerFill, { width: `${Math.max(0, Math.min(100, (left / perQ!) * 100))}%`, backgroundColor: left <= 5 ? COLORS.danger : COLORS.accent }]} /></View>
          <Text style={[s.small, { marginTop: 4, color: left <= 5 ? COLORS.danger : COLORS.muted, fontWeight: "700" }]}>⏱ {Math.max(0, left)}s</Text>
        </View>
      )}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={[s.small, { flex: 1 }]}>{title}{desktop && cur === null && !isTyped(q) ? "   ·   press A–E or 1–5 to choose" : ""}</Text>
        {/* ⭐ bookmark: saves the question to this course's Starred round (not for AI-made practice questions, which are not in the bank) */}
        {!String(q.id).startsWith("ai:") && (
          <TouchableOpacity onPress={() => toggleStar(q.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel={starred ? "Remove bookmark" : "Bookmark this question"} style={{ paddingHorizontal: 6 }}>
            <Text style={{ fontSize: 22, color: starred ? "#facc15" : COLORS.muted }}>{starred ? wi("★") : wi("☆")}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={[s.q, q.q.length > 140 && { fontSize: 16, lineHeight: 24, fontWeight: "600" }]}>{q.q}</Text>
      {isTyped(q) ? (
        <TextInput
          value={typeof cur === "string" ? cur : ""}
          onChangeText={typeAnswer}
          editable={!showAnswer}
          placeholder="Type your answer"
          placeholderTextColor={COLORS.muted}
          autoCorrect={false}
          autoCapitalize="none"
          style={[s.typed, showAnswer && (isRightAnswer(q, cur) ? s.right : s.wrong)]}
        />
      ) : q.o.map((opt, idx) => {
        const isRight = showAnswer && idx === q.a;
        const isWrong = showAnswer && cur === idx && idx !== q.a;
        const chosen = !showAnswer && cur === idx;
        return (
          <TouchableOpacity key={idx} onPress={() => pick(idx)} style={[s.opt, isRight && s.right, isWrong && s.wrong, chosen && s.sel]}>
            <Text style={s.optText}>{letter(idx)}.  {opt}</Text>
          </TouchableOpacity>
        );
      })}

      {/* confirm */}
      {!showAnswer && (
        <View style={{ marginTop: 6 }}>
          {instant || cur === null || !isLocked ? (
            <Button title="Confirm answer" onPress={confirm} disabled={cur === null} />
          ) : null}
          {!instant && isLocked && <Text style={[s.small, { textAlign: "center", color: COLORS.ok, fontWeight: "700" }]}><Em n="check" /> Answer saved</Text>}
          {desktop && cur !== null && !isLocked && <Text style={[s.small, { textAlign: "center", marginTop: 6 }]}>Press Enter to confirm</Text>}
        </View>
      )}

      {showAnswer && (
        <View style={{ marginTop: 8 }}>
          <Text style={[s.small, { color: isRightAnswer(q, cur) ? COLORS.ok : COLORS.danger, fontWeight: "700", marginBottom: 6 }]}>
            {isRightAnswer(q, cur) ? "Correct!" : cur === -1 ? `Time's up. The answer is ${shownAnswer}.` : `Not quite. The answer is ${shownAnswer}.`}
          </Text>
          <View style={s.example}>
            <Text style={s.exHead}><Em n="book" /> Worked example</Text>
            {!isRightAnswer(q, cur) && <Text style={[s.small, { color: COLORS.text, marginBottom: 6 }]}>{isTyped(q) ? (typeof cur === "string" ? `You wrote "${cur}". ` : "") : (typeof cur === "number" && cur >= 0 ? `You chose ${letter(cur)}. ` : "")}The right answer is {shownFull}</Text>}
            <Text style={[s.small, { color: COLORS.text, lineHeight: 20 }]}>{q.e || "No explanation written for this one yet."}</Text>
            {!isRightAnswer(q, cur) && <Text style={[s.small, { marginTop: 8 }]}><Em n="layers" /> Saved to your review list. It comes back in 2 days.</Text>}
          </View>
        </View>
      )}

      {/* previous / next */}
      <View style={{ flexDirection: "row", marginTop: 16 }}>
        {!timed && (
          <TouchableOpacity onPress={() => go(i - 1)} disabled={i === 0} style={[s.nav, { marginRight: 10 }, i === 0 && { opacity: 0.35 }]}>
            <Text style={s.navText}>‹ Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={next} disabled={timed && !isLocked} style={[s.nav, s.navMain, timed && !isLocked && { opacity: 0.35 }]}>
          <Text style={[s.navText, { color: COLORS.onPrimary }]}>{last ? "Finish" : "Next ›"}</Text>
        </TouchableOpacity>
      </View>
      {desktop && !timed && <Text style={[s.small, { textAlign: "center", marginTop: 8 }]}>← → to move between questions</Text>}
    </View>
  );

  if (desktop && !timed) {
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[s.page, { paddingTop: 20, width: "100%", maxWidth: 1060, alignSelf: "center" }]}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ flex: 1, maxWidth: 740, marginRight: 28 }}>{main}</View>
          <View style={[s.example, { width: 250, marginTop: 0 }]}>{picker}</View>
        </View>
      </ScrollView>
    );
  }
  return <ScrollView style={{ flex: 1 }} contentContainerStyle={[s.page, desktop ? { paddingTop: 20 } : { paddingTop: 20 }, wide]}>{main}</ScrollView>;
}

const makeStyles = (COLORS: Colors) => StyleSheet.create({
  page: { flexGrow: 1, padding: 20, paddingBottom: 140 },
  top: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  exit: { color: COLORS.muted, fontWeight: "700" },
  q: { color: COLORS.text, fontSize: 19, fontWeight: "700", lineHeight: 27, marginVertical: 14 },
  small: { color: COLORS.muted, fontSize: 14 },
  opt: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  typed: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10, color: COLORS.text, fontSize: 16 },
  optText: { color: COLORS.text, fontSize: 16, lineHeight: 22 },
  note: { textAlign: "center", marginBottom: 10, color: COLORS.text, lineHeight: 20 },
  example: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 4 },
  exHead: { color: COLORS.accent, fontWeight: "700", fontSize: 13, marginBottom: 6 },
  sel: { borderColor: COLORS.accent, backgroundColor: COLORS.card, borderWidth: 2 },
  timerTrack: { height: 6, borderRadius: 3, backgroundColor: COLORS.border, overflow: "hidden" },
  timerFill: { height: 6, borderRadius: 3 },
  chip: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, alignItems: "center", justifyContent: "center", marginRight: 6, marginBottom: 6 },
  chipDone: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipRight: { backgroundColor: COLORS.okBg, borderColor: COLORS.ok },
  chipWrong: { backgroundColor: COLORS.badBg, borderColor: COLORS.danger },
  chipNow: { borderWidth: 2, borderColor: "#ffd34d" },
  chipText: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  nav: { flex: 1, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, paddingVertical: 14, alignItems: "center" },
  navMain: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  navText: { color: COLORS.text, fontWeight: "700", fontSize: 15 },
  right: { borderColor: COLORS.ok, backgroundColor: COLORS.okBg },
  wrong: { borderColor: COLORS.danger, backgroundColor: COLORS.badBg },
});