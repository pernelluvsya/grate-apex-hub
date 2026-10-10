import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TouchableOpacity, View, StyleSheet, Platform } from "react-native";
import { Text } from "../Text";
import { useColors, Colors } from "../theme";
import { Button, Hover } from "../ui";
import { useLayout } from "../responsive";
import { useProgress } from "../progress";
import { Lesson, LessonMeta, fetchLesson, termsOf, plain } from "../lessons";
import { queueCounts } from "../srs";
import { Glossary, Flashcards, GroupList, Steps } from "./LessonTools";
import AICards from "./AICards";
import CardsHub from "./CardsHub";
import { Blocks, Rich, TipCtx } from "./LessonBlocks";
import { shareLink } from "../deeplink";
import AITutor from "./AITutor";
import { aiQuestions, toBank } from "../ai";
import { BankQ } from "../learning";
import { useScreenBack } from "../backStack";
import { SkeletonLessonPage } from "../Skeleton";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

// Reads one lesson, one section at a time. Remembers how far you got.
type Panel = "ai" | "aicards" | "read" | "menu" | "glossary" | "cards" | "mnem" | "facts" | "steps";

export default function LessonScreen({ meta, onClose, onPractice, onAiPractice }: { meta: LessonMeta; onClose: () => void; onPractice: (m: LessonMeta) => void; onAiPractice?: (m: LessonMeta, qs: BankQ[]) => void }) {
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState("");
  const aiPractice = async () => {
    if (aiBusy) return;
    setAiErr(""); setAiBusy(true);
    try { const r = await aiQuestions(meta.id, 5); onAiPractice?.(meta, toBank(r.questions, meta)); }
    catch (e: any) { setAiErr(e?.message ?? "Couldn't make questions."); setTimeout(() => setAiErr(""), 4000); }
    finally { setAiBusy(false); }
  };
  const [shareMsg, setShareMsg] = useState("");
  const share = async () => {
    const r = await shareLink({ kind: "lesson", id: meta.id }, meta.title, `${meta.title} on GrAte Apex`);
    setShareMsg(r === "copied" ? "✓ Link copied" : r === "failed" ? "Couldn't share" : "");
    if (r !== "shared") setTimeout(() => setShareMsg(""), 2500);
  };
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { progress, markLesson } = useProgress();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [err, setErr] = useState("");
  const [idx, setIdx] = useState(0);
  const [panel, setPanel] = useState<Panel>("read");
  // The Ask AI chat stays mounted (just hidden) once opened, so switching tabs doesn't wipe the conversation or a reply that's still loading.
  const [aiOpened, setAiOpened] = useState(false);
  useEffect(() => { if (panel === "ai") setAiOpened(true); }, [panel]);
  const [aiSec, setAiSec] = useState<{ id: string; title: string } | null>(null);
  const [tip, setTip] = useState<{ word: string; meaning: string } | null>(null);
  const scroller = useRef<ScrollView>(null);
  const started = useRef(false);
  const { desktop } = useLayout();
  const keys = useRef<(e: KeyboardEvent) => void>(() => { });
  // Computer keyboard: left / right arrows move between sections.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const h = (e: KeyboardEvent) => keys.current(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const load = () => {
    setErr(""); setLesson(null);
    fetchLesson(meta).then(setLesson).catch((e) => setErr(e?.message || "Couldn't load this lesson. Check your internet."));
  };
  useEffect(load, [meta.id]);

  // Pick up where the student stopped.
  useEffect(() => {
    if (lesson && !started.current) {
      started.current = true;
      const done = progress.lessons[meta.id] || 0;
      if (done > 0 && done < lesson.sections.length) setIdx(done);
    }
  }, [lesson]);

  const terms = useMemo(() => (lesson ? termsOf(lesson) : []), [lesson]); // before any early return: hooks must always run
  useScreenBack(true, () => { if (panel !== "read") setPanel("read"); else onClose(); }); // Android back
  const go = (n: number) => { setIdx(n); setTip(null); setPanel("read"); scroller.current?.scrollTo({ y: 0, animated: false }); };

  if (err) return (
    <View style={s.center}><Text style={s.h}></Text><Text style={s.msg}>{err}</Text><Button title="Try again" onPress={load} /><Button variant="ghost" title="Back" onPress={onClose} /></View>
  );
  if (!lesson) return <SkeletonLessonPage onBack={onClose} />;

  const ex = lesson.extras || {};
  const dueCards = queueCounts(terms, progress.terms).total;
  const nQ = meta.qids?.length || 0;
  const tools: { id: Panel; label: string }[] = [
    { id: "cards" as Panel, label: `🃏 Flashcards${dueCards ? ` (${dueCards})` : ""}` },
    ...(terms.length ? [{ id: "glossary" as Panel, label: "📖 Glossary" }] : []),
    ...(ex.mnemonics ? [{ id: "mnem" as Panel, label: "🧠 Mnemonics" }] : []),
    ...(ex.facts ? [{ id: "facts" as Panel, label: "📏 Key facts" }] : []),
    ...(ex.steps ? [{ id: "steps" as Panel, label: "🔄 " + ex.steps.title }] : []),
  ];

  const total = lesson.sections.length;
  const sec = lesson.sections[idx];
  const last = idx === total - 1;
  const done = progress.lessons[meta.id] || 0;

  const next = () => {
    markLesson(meta.id, idx + 1);
    if (last) { onClose(); return; }
    go(idx + 1);
  };

  keys.current = (e) => {
    const t = e.target as HTMLElement | null;
    if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
    if (panel !== "read") return;
    if (e.key === "ArrowRight" && !last) go(idx + 1);
    else if (e.key === "ArrowLeft" && idx > 0) go(idx - 1);
  };

  const rail = (
    <View style={s.rail}>
      <TouchableOpacity onPress={onClose}><Text style={s.exit}>‹ Back to course</Text></TouchableOpacity>
      <TouchableOpacity onPress={share}><Text style={[s.exit, { marginTop: 6 }]}>{shareMsg || wi("🔗 Share this lesson")}</Text></TouchableOpacity>
      <Text style={s.railTitle}>{wi(meta.icon)} {meta.title}</Text>
      {!!meta.sub && <Text style={s.railSub}>{meta.sub}</Text>}
      <View style={[s.bar, { marginHorizontal: 0, marginTop: 12 }]}><View style={[s.fill, { width: `${Math.round(((Math.max(done, idx + 1)) / total) * 100)}%` }]} /></View>
      <Text style={[s.crumb, { marginHorizontal: 0 }]}>{Math.min(done, total)} of {total} sections finished · ~{meta.minutes} min</Text>
      <ScrollView style={{ flex: 1, marginTop: 12 }}>
        {lesson.sections.map((x, i) => (
          <Hover key={x.id + i} style={[s.railRow, i === idx && panel === "read" && s.railRowOn]} onPress={() => go(i)}>
            <Text style={[s.menuNum, { width: 28 }]}>{i < done ? wi("✓") : i + 1}</Text>
            <Rich x={x.title} style={s.railText} />
          </Hover>
        ))}
      </ScrollView>
      <Text style={s.railHint}>Tip: use the ← → arrow keys</Text>
    </View>
  );

  return (
    <TipCtx.Provider value={(word, meaning) => setTip({ word, meaning })}>
      <View style={{ flex: 1, flexDirection: desktop ? "row" : "column" }}>
        {desktop && rail}
        <View style={{ flex: 1 }}>
          {!desktop && (
            <View style={s.top}>
              <TouchableOpacity onPress={onClose}><Text style={s.exit}><Em n="close" /> Close</Text></TouchableOpacity>
              <TouchableOpacity onPress={share}><Text style={s.exit}>{shareMsg || wi("🔗 Share")}</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setPanel(panel === "menu" ? "read" : "menu")}><Text style={s.exit}><Em n="list" /> Sections</Text></TouchableOpacity>
            </View>
          )}
          {!desktop && <View style={s.bar}><View style={[s.fill, { width: `${Math.round(((idx + 1) / total) * 100)}%` }]} /></View>}
          <Text style={[s.crumb, desktop && { marginTop: 24, marginHorizontal: 36 }]} numberOfLines={1}>{desktop ? `Section ${idx + 1} of ${total}` : `${meta.icon} ${meta.title} · ${idx + 1} / ${total}`}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.toolRow} contentContainerStyle={{ paddingHorizontal: desktop ? 36 : 20 }}>
            <TouchableOpacity onPress={() => setPanel("read")} style={[s.tool, panel === "read" && s.toolOn]}><Text style={[s.toolText, panel === "read" && { color: COLORS.onPrimary }]}><Em n="file" /> Read</Text></TouchableOpacity>
            {tools.map((t) => (
              <TouchableOpacity key={t.id} onPress={() => { setPanel(t.id); setTip(null); }} style={[s.tool, panel === t.id && s.toolOn]}>
                <Text style={[s.toolText, panel === t.id && { color: COLORS.onPrimary }]} numberOfLines={1}>{wi(t.label)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => { setPanel("ai"); setTip(null); }} style={[s.tool, panel === "ai" && s.toolOn]}><Text style={[s.toolText, panel === "ai" && { color: COLORS.onPrimary }]}><Em n="sparkle" /> Ask AI</Text></TouchableOpacity>
            {!!onAiPractice && <TouchableOpacity onPress={aiPractice} disabled={aiBusy} style={s.tool}><Text style={s.toolText}>{aiBusy ? "Making questions…" : wi("✨ AI practice")}</Text></TouchableOpacity>}
            {nQ > 0 && <TouchableOpacity onPress={() => onPractice(meta)} style={s.tool}><Text style={s.toolText}>✏️ Practice ({nQ})</Text></TouchableOpacity>}
          </ScrollView>

          {!!aiErr && <Text style={{ color: COLORS.danger, marginHorizontal: desktop ? 36 : 20, marginTop: 8 }}>{aiErr}</Text>}
          {aiOpened && (
            <View style={{ flex: 1, display: panel === "ai" ? "flex" : "none" }}>
              <AITutor key={meta.id} lessonId={meta.id} title={meta.title} section={lesson.sections[idx]?.title.replace(/<[^>]+>/g, "")} />
            </View>
          )}
          {panel === "ai" ? null
            : panel === "aicards" && aiSec ? <AICards key={aiSec.id} lessonId={meta.id} sectionId={aiSec.id} title={aiSec.title} onBack={() => setPanel("read")} />
              : panel === "glossary" ? <Glossary terms={terms} />
                : panel === "cards" ? <CardsHub lessonId={meta.id} terms={terms} sections={lesson.sections.map((x) => ({ id: x.id, title: plain(x.title) }))} />
                  : panel === "mnem" && ex.mnemonics ? <GroupList title="🧠 Mnemonics" groups={ex.mnemonics} accent />
                    : panel === "facts" && ex.facts ? <GroupList title="📏 Key facts" groups={ex.facts} />
                      : panel === "steps" && ex.steps ? <Steps data={ex.steps} />
                        : panel === "menu" ? (
                          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
                            <Text style={s.h}>Sections</Text>
                            {lesson.sections.map((x, i) => (
                              <TouchableOpacity key={x.id + i} style={[s.menuRow, i === idx && { borderColor: COLORS.accent }]} onPress={() => go(i)}>
                                <Text style={s.menuNum}>{i < done ? wi("✓") : i + 1}</Text>
                                <Rich x={x.title} style={s.menuTitle} />
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        ) : (
                          <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={desktop ? { padding: 36, paddingBottom: tip ? 190 : 80, width: "100%", maxWidth: 820 } : { padding: 20, paddingBottom: tip ? 190 : 120 }}>
                            {!!sec.kicker && <Text style={s.kicker}>{sec.kicker}</Text>}
                            <Rich x={sec.title} style={s.title} />
                            <Blocks blocks={sec.blocks} />
                            <View style={{ height: 8 }} />
                            <Button variant="ghost" title="✨ AI flashcards for this topic (10)" onPress={() => { setAiSec({ id: sec.id, title: plain(sec.title) }); setPanel("aicards"); setTip(null); }} />
                            {last && (
                              <View style={{ backgroundColor: COLORS.card, borderColor: COLORS.accent, borderWidth: 1.5, borderRadius: 16, padding: 16, marginTop: 14, marginBottom: 6 }}>
                                <Text style={{ color: COLORS.accent, fontWeight: "800", fontSize: 12, letterSpacing: 0.6 }}>LESSON COMPLETE · QUIZ TIME</Text>
                                <Text style={{ color: COLORS.text, fontWeight: "800", fontSize: 17, marginTop: 4 }}>Test yourself on this lesson</Text>
                                <Text style={{ color: COLORS.muted, marginTop: 4, marginBottom: 12, lineHeight: 19 }}>
                                  {nQ > 0 ? `${Math.min(nQ, 10)} questions from this lesson, with the answer explained after each one. Your XP counts.` : "No saved questions for this lesson yet, but the AI can quiz you on it."}
                                </Text>
                                {nQ > 0
                                  ? <Button title={`Take the lesson quiz (${nQ} questions)`} onPress={() => { markLesson(meta.id, total); onPractice(meta); }} />
                                  : !!onAiPractice && <Button title={aiBusy ? "Making questions…" : "✨ Quiz me with AI"} onPress={() => { markLesson(meta.id, total); aiPractice(); }} />}
                                {!!aiErr && <Text style={{ color: COLORS.danger, marginTop: 6 }}>{aiErr}</Text>}
                              </View>
                            )}
                            <Button variant={last ? "ghost" : "primary"} title={last ? "Finish lesson without the quiz ✓" : "Next section →"} onPress={next} />
                            {idx > 0 && <Button variant="ghost" title="← Previous" onPress={() => go(idx - 1)} />}
                          </ScrollView>
                        )}

          {tip && panel !== "menu" && (
            <View style={s.tip}>
              <View style={{ flex: 1 }}>
                <Text style={s.tipWord}>{tip.word}</Text>
                <Text style={s.tipText}>{tip.meaning}</Text>
              </View>
              <TouchableOpacity onPress={() => setTip(null)}><Text style={s.exit}><Em n="close" /></Text></TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TipCtx.Provider>
  );
}

const makeStyles = (C: Colors) => StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  h: { color: C.text, fontSize: 20, fontWeight: "800", marginBottom: 12 },
  msg: { color: C.text, textAlign: "center", marginBottom: 16, fontSize: 15 },
  top: { flexDirection: "row", justifyContent: "space-between", paddingLeft: 20, paddingRight: 72, paddingTop: 20, paddingBottom: 10 },
  exit: { color: C.muted, fontWeight: "700" },
  bar: { height: 5, backgroundColor: C.light ? "rgba(10,31,160,0.1)" : "rgba(255,255,255,0.14)", marginHorizontal: 20, borderRadius: 999, overflow: "hidden" },
  fill: { height: 5, backgroundColor: C.accent, borderRadius: 999 },
  toolRow: { flexGrow: 0, marginTop: 10, marginBottom: 2 },
  tool: { borderColor: C.border, borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, backgroundColor: C.card, maxWidth: 260 },
  toolOn: { backgroundColor: C.primary, borderColor: C.primary },
  toolText: { color: C.text, fontSize: 13, fontWeight: "600" },
  rail: { width: 300, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 20, borderRightWidth: 1, borderRightColor: C.border, backgroundColor: C.light ? "rgba(255,255,255,0.45)" : "rgba(0,0,40,0.28)" },
  railTitle: { color: C.text, fontSize: 19, fontWeight: "800", marginTop: 18, lineHeight: 25 },
  railSub: { color: C.muted, fontSize: 12.5, marginTop: 4, lineHeight: 18 },
  railRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: "transparent", marginBottom: 2 },
  railRowOn: { backgroundColor: C.card, borderColor: C.border },
  railText: { color: C.text, fontSize: 13.5, lineHeight: 19, flex: 1 },
  railHint: { color: C.muted, fontSize: 11.5, marginTop: 10 },
  crumb: { color: C.muted, fontSize: 12.5, marginHorizontal: 20, marginTop: 8 },
  kicker: { color: C.accent, fontSize: 12, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 4 },
  title: { color: C.text, fontSize: 24, fontWeight: "800", lineHeight: 31, marginBottom: 14 },
  menuRow: { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  menuNum: { color: C.accent, fontWeight: "800", width: 32, fontSize: 15 },
  menuTitle: { color: C.text, fontSize: 15, flex: 1 },
  tip: { position: "absolute", left: 16, right: 16, bottom: 24, flexDirection: "row", backgroundColor: C.light ? "#ffffff" : "#0b1466", borderColor: C.accent, borderWidth: 1.5, borderRadius: 16, padding: 14, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  tipWord: { color: C.accent, fontWeight: "700", marginBottom: 4 },
  tipText: { color: C.text, fontSize: 14, lineHeight: 20 },
});