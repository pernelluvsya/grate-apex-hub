import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TouchableOpacity, View, StyleSheet, Image } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../Text";
import { SkeletonGroup, SkeletonInfoCard, SkeletonLesson } from "../Skeleton";
import { useAuth } from "../auth";
import { useProgress, rankFor, RoundMode } from "../progress";
import { coursesFor, extraCoursesFor, Course } from "../data/catalog";
import { BankQ, bankFor, mockExam, mockSize, MOCK_COUNT, pastQuestions, pastPapers, pastIdsForLesson, isPredictedSet, shuffle, ROUND, adaptiveRound, levelName, reviewRound, weakTopics, weakRound, testRound, todayKey } from "../learning";
import { LearnPanel, StartRound } from "./LearnPanel";
import QuizResumeDialog from "../QuizResumeDialog";
import { loadQuizSession, clearQuizSession, listQuizSessions, answeredIn, SavedSession } from "../quizSession";
import { useColors, Colors } from "../theme";
import { Panel, Hover } from "../ui";
import { useLayout } from "../responsive";
import { BellButton } from "../notifHost";
import QuizScreen from "./QuizScreen";
import { useScreenBack } from "../backStack";
import Builder from "./Builder";
import LessonScreen from "./LessonScreen";
import { LessonMeta, fetchLessonList, savedLessonIds, downloadLessons } from "../lessons";
import { takeLink, peekLink, setPath } from "../deeplink";
import ThemePicker from "./ThemePicker";
import QotdCard from "./QotdCard";
import ReviewCalendar from "./ReviewCalendar";
import CourseExtras, { ExtraKind, EXTRA_LABELS } from "./CourseExtras";
import { extrasFor, typeinBankFor } from "../data/extras";
import MissedCards from "./MissedCards";
import { useNavScroll } from "./Tabs";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";
import { Glyph } from "../components/em";

const ROUND_SIZE = ROUND;
const WEEK_GOAL = 150; // same weekly challenge as the original hub

// The coloured icon behind each course, from the original hub.
const GRADS: Record<string, [string, string]> = {
  biochemistry: ["#10b981", "#047857"], physiology: ["#f43f5e", "#b91c3c"], anatomy: ["#3b82f6", "#1d4ed8"],
  behavioural: ["#a855f7", "#7c3aed"], entomology: ["#f59e0b", "#d97706"],
  biolchem: ["#14b8a6", "#0f766e"],
  medgen: ["#ec4899", "#be185d"],
  compapp: ["#0ea5e9", "#0369a1"],
  algebra: ["#6366f1", "#4338ca"],
  stats: ["#8b5cf6", "#6d28d9"],
  commskills: ["#f97316", "#c2410c"],
  bmc: ["#84cc16", "#4d7c0f"],
  cellstruct: ["#06b6d4", "#0e7490"],

};

const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

// Questions answered since Monday.
function answeredThisWeek(days: Record<string, number>) {
  const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    n += days[key] || 0; d.setDate(d.getDate() + 1);
  }
  return n;
}

function RankRing({ level, pct }: { level: number; pct: number }) {
  const COLORS = useColors();
  const size = 76, stroke = 7, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.14)" strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={COLORS.accent} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${c}`} strokeDashoffset={c * (1 - pct / 100)} />
      </Svg>
      <View style={{ width: size - 22, height: size - 22, borderRadius: size, backgroundColor: COLORS.light ? "#fff" : COLORS.bg, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: COLORS.text, fontWeight: "800", fontSize: 19 }}>{level}</Text>
      </View>
    </View>
  );
}

function Hud({ onCalendar, onMissed }: { onCalendar: () => void; onMissed: () => void }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { progress, streak, syncState } = useProgress();
  const r = rankFor(progress.xp);
  const subs = Object.values(progress.subjects);
  const answered = subs.reduce((n, x) => n + x.answered, 0);
  const correct = subs.reduce((n, x) => n + x.correct, 0);
  const acc = answered ? Math.round((correct / answered) * 100) : null;
  const week = answeredThisWeek(progress.days);
  const wpct = Math.min(100, Math.round((week / WEEK_GOAL) * 100));
  const today = todayKey();
  const missedN = Object.values(progress.cards).filter((c) => !c.g).length;
  const cardsDue = Object.values(progress.terms).filter((c) => c.d <= today).length;
  return (
    <>
      <Panel>
        <View style={s.rankRow}>
          <RankRing level={r.level} pct={r.pct} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={s.rtitle}>{r.title}</Text>
            <Text style={s.rxp}>{progress.xp} XP · {r.need - r.into} to next</Text>
            <Text style={s.sync}>{syncState === "synced" ? wi("☁️ saved") : syncState === "offline" ? wi("📴 offline") : syncState === "syncing" ? wi("⏳ syncing…") : ""}</Text>
          </View>
        </View>
        <View style={s.statRow}>
          <View style={s.stat}><Text style={s.statN}>{answered}</Text><Text style={s.statL}>Answered</Text></View>
          <View style={s.stat}><Text style={s.statN}>{acc === null ? "—" : acc + "%"}</Text><Text style={s.statL}>Avg score</Text></View>
          <View style={s.stat}><Text style={[s.statN, { color: "#ff8a3d" }]}>{streak}</Text><Text style={s.statL}>Day streak</Text></View>
        </View>
      </Panel>
      <Panel>
        <Text style={s.h}><Em n="target" /> Weekly challenge</Text>
        <View style={s.bar}><View style={[s.fill, { width: `${wpct}%`, backgroundColor: COLORS.primary }]} /></View>
        <Text style={s.muted}>{week} / {WEEK_GOAL} this week{wpct >= 100 ? wi("  ·  Done! 🏆") : ""}</Text>
      </Panel>
      <TouchableOpacity activeOpacity={0.85} onPress={onCalendar}>
        <Panel>
          <Text style={s.h}><Em n="calendar" /> Flashcard calendar</Text>
          <Text style={s.muted}>{cardsDue ? `${cardsDue} card${cardsDue === 1 ? "" : "s"} due today · see your review schedule` : "See what's due each day and how much you've reviewed"}</Text>
        </Panel>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.85} onPress={onMissed}>
        <Panel>
          <Text style={s.h}><Em n="close" /> Missed questions</Text>
          <Text style={s.muted}>{missedN ? `${missedN} question${missedN === 1 ? "" : "s"} you got wrong, as flashcards` : "Questions you get wrong turn into flashcards here"}</Text>
        </Panel>
      </TouchableOpacity>
      <QotdCard />
    </>
  );
}

type Active = { title: string; mode: RoundMode; primary: string; make?: () => BankQ[]; questions: BankQ[]; feedback?: "instant" | "end"; perQ?: number; resume?: { selections: (number | string | null)[]; locked: boolean[]; currentIndex: number } };
type StartArgs = Parameters<StartRound>[0];

export default function StudyScreen() {
  const { onScroll } = useNavScroll();
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { profile } = useAuth();
  const { progress } = useProgress();
  const { desktop } = useLayout();
  const pr = useRef(progress); pr.current = progress; // so "Another round" sees the latest progress
  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<Active | null>(null);
  const [unfinished, setUnfinished] = useState<SavedSession[]>([]);
  const [resumeAsk, setResumeAsk] = useState<{ r: StartArgs; saved: SavedSession } | null>(null);
  const [themes, setThemes] = useState(false);
  const [lessons, setLessons] = useState<LessonMeta[] | null>(null);
  const [lessonErr, setLessonErr] = useState("");
  const [reading, setReading] = useState<LessonMeta | null>(null);
  const [tool, setTool] = useState<null | "mocks" | "custom" | "drill" | "past">(null);
  const [extraKind, setExtraKind] = useState<ExtraKind | null>(null); // glossary / quick reference / formula sheet / type-in / study cards
  const [calOpen, setCalOpen] = useState(false);
  const [missedOpen, setMissedOpen] = useState(false);

  // Android back. The quiz and the lesson reader handle their own back press (they are children, so they run first);
  // this covers everything else on this tab, one level at a time.
  useScreenBack(!!resumeAsk || missedOpen || calOpen || (!reading && !quiz && (!!tool || !!course)), () => {
    if (resumeAsk) setResumeAsk(null);
    else if (missedOpen) setMissedOpen(false);
    else if (calOpen) setCalOpen(false);
    else if (extraKind) setExtraKind(null);
    else if (tool) setTool(null);
    else setCourse(null);
  });

  // Lessons come from Firebase (and are kept on the phone for offline use).
  const loadLessons = () => { setLessonErr(""); fetchLessonList().then((r) => setLessons(r.lessons)).catch((e: any) => setLessonErr(`Couldn't load lessons${e?.code ? ` (${e.code})` : ""}. Check your internet${e?.code === "permission-denied" ? ", and make sure the latest Firestore rules are published" : ""}.`)); };
  useEffect(() => { if (course && !lessons) loadLessons(); }, [course]);

  useEffect(() => { setTool(null); setExtraKind(null); }, [course]);
  const own = useMemo(() => coursesFor(profile?.hall, profile?.semester), [profile?.hall, profile?.semester]);
  const extra = useMemo(() => extraCoursesFor(profile?.hall, profile?.semester), [profile?.hall, profile?.semester]);
  // Previous courses: the whole list can be hidden, and each class + semester group can be hidden on its own.
  // Default: hidden, unless the class has no courses of its own (then there is nothing else to show, so start open).
  // The student can still hide it either way.
  const [extraTap, setExtraTap] = useState<boolean | null>(null);
  const showExtra = extraTap ?? own.length === 0;
  const [closedGroups, setClosedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (k: string) => setClosedGroups((old) => { const n = new Set(old); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const groups = useMemo(() => (["HB2", "HB1"] as const).flatMap((hall) => [2, 1].map((sem) => ({
    key: hall + sem, hall, sem, list: extra.filter((c) => c.semesters.includes(sem as 1 | 2) && c.halls.includes(hall)),
  }))).filter((g) => g.list.length > 0), [extra]);
  const available = useMemo(() => [...own, ...extra], [own, extra]); // everything this student may open (links, lessons)
  // what the practice tools may draw questions from: own courses plus any previous courses currently showing
  const listed = useMemo(() => {
    if (!showExtra) return own;
    const seen = new Set(own.map((c) => c.id)), out = [...own];
    for (const g of groups) if (!closedGroups.has(g.key)) for (const c of g.list) if (!seen.has(c.id)) { seen.add(c.id); out.push(c); }
    return out;
  }, [own, groups, showExtra, closedGroups]);

  // A shared link (/l/<lesson> or /c/<course>) opens straight to that lesson or course.
  useEffect(() => {
    const link = peekLink(); if (!link) return;
    takeLink();
    if (link.kind === "course") { const c = available.find((x) => x.id === link.id); if (c) setCourse(c); return; }
    fetchLessonList().then((r) => {
      setLessons(r.lessons);
      const m = r.lessons.find((x) => x.id === link.id); if (!m) return;
      const c = available.find((x) => x.id === m.course) ?? null;
      if (c) setCourse(c);
      setReading(m);
    }).catch(() => { });
  }, []);
  // Keep the address bar pointing at what is open, so "copy the link" always works.
  useEffect(() => { setPath(reading ? `/l/${reading.id}` : course ? `/c/${course.id}` : "/"); }, [reading, course]);

  // Saving a course's lessons for offline reading.
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [dl, setDl] = useState<{ done: number; total: number } | null>(null);
  const [dlMsg, setDlMsg] = useState("");
  useEffect(() => {
    if (!course || !lessons) return;
    savedLessonIds(lessons.filter((l) => l.course === course.id)).then(setSaved);
  }, [course, lessons, dl]);
  const saveOffline = async () => {
    if (!course || !lessons || dl) return;
    setDlMsg("");
    const mine = lessons.filter((l) => l.course === course.id);
    const failed = await downloadLessons(mine, (done, total) => setDl({ done, total }));
    setDl(null);
    setDlMsg(failed ? `Saved, but ${failed} lesson${failed === 1 ? "" : "s"} didn't download. Check your internet and try again.` : "All lessons saved. You can read them with no internet.");
  };
  // Starting a round: if the student left this same quiz unfinished, offer to continue it first.
  const start: StartRound = async (r) => {
    if (!r.perQ) {
      const saved = await loadQuizSession(r.primary, r.mode, r.title);
      if (saved && answeredIn(saved.session) > 0) { setResumeAsk({ r, saved }); return; }
    }
    setQuiz({ ...r, questions: r.make() });
  };
  // Unfinished quizzes for the open course (refreshed whenever you come back from a quiz).
  useEffect(() => {
    if (!course || quiz || resumeAsk) return;
    let live = true;
    listQuizSessions(course.id).then((l) => { if (live) setUnfinished(l); });
    return () => { live = false; };
  }, [course, quiz, resumeAsk]);
  const continueSaved = (sv: SavedSession) => {
    const ss = sv.session;
    setQuiz({ title: ss.title, mode: ss.mode as RoundMode, primary: ss.primary, feedback: ss.feedback, questions: ss.questions, resume: { selections: ss.selections, locked: ss.locked, currentIndex: ss.currentIndex } });
  };
  const discardSaved = async (sv: SavedSession) => {
    await clearQuizSession(sv.session.primary, sv.session.mode, sv.session.title);
    setUnfinished((l) => l.filter((x) => x !== sv));
  };
  const startCourse = (c: Course, title: string, mode: RoundMode, make: () => BankQ[]) => start({ title: `${c.name} · ${title}`, mode, primary: c.id, make });

  // Start a practice round from a lesson's questions (new ones first).
  const practice = (l: LessonMeta) => {
    const c = available.find((x) => x.id === l.course); if (!c) return;
    setReading(null); setCourse(c);
    start({
      title: `${l.title} · Practice`, mode: "normal", primary: l.course, make: () => {
        const bank = bankFor(c), ids = new Set(l.qids || []);
        const pool = bank.filter((q) => ids.has(q.id)), seen = new Set(pr.current.seen[l.course] || []);
        return [...shuffle(pool.filter((q) => !seen.has(q.id))), ...shuffle(pool.filter((q) => seen.has(q.id)))].slice(0, ROUND_SIZE);
      }
    });
  };

  const aiPractice = (l: LessonMeta, qs: BankQ[]) => {
    const c = available.find((x) => x.id === l.course); if (!c) return;
    setReading(null); setCourse(c);
    start({ title: `${l.title} · ✨ AI practice`, mode: "normal", primary: l.course, make: () => qs });
  };

  if (resumeAsk) {
    const { r, saved } = resumeAsk, ss = saved.session;
    return (
      <View style={{ flex: 1 }}>
        <QuizResumeDialog
          session={ss}
          elapsed={saved.elapsed}
          onCancel={() => setResumeAsk(null)}
          onRestart={() => { clearQuizSession(r.primary, r.mode, r.title); setResumeAsk(null); setQuiz({ ...r, questions: r.make() }); }}
          onContinue={() => { setResumeAsk(null); setQuiz({ ...r, feedback: ss.feedback ?? r.feedback, questions: ss.questions, resume: { selections: ss.selections, locked: ss.locked, currentIndex: ss.currentIndex } }); }}
        />
      </View>
    );
  }

  if (missedOpen) return <View style={{ flex: 1 }}><TouchableOpacity onPress={() => setMissedOpen(false)} style={{ paddingHorizontal: 20, paddingTop: 20 }}><Text style={s.back}>‹ Back</Text></TouchableOpacity><MissedCards /></View>;
  if (calOpen) return <View style={{ flex: 1 }}><ReviewCalendar terms={[]} backLabel="‹ Back" onBack={() => setCalOpen(false)} /></View>;

  if (reading) return <LessonScreen meta={reading} onClose={() => setReading(null)} onPractice={practice} onAiPractice={aiPractice} />;

  if (quiz) {
    return <QuizScreen feedback={quiz.feedback} perQ={quiz.perQ} key={quiz.questions.map((q) => q.id).join("").slice(0, 40) + quiz.questions.length} primary={quiz.primary} title={quiz.title} mode={quiz.mode} questions={quiz.questions} resume={quiz.resume} onExit={() => setQuiz(null)}
      onAgain={quiz.mode === "pre" || quiz.mode === "post" || !quiz.make ? undefined : () => setQuiz({ ...quiz, resume: undefined, questions: quiz.make!() })} />;
  }

  const pad = desktop ? { padding: 32, paddingTop: 28, paddingBottom: 80 } : { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 140 };
  // A row of columns on a computer, one stacked column on a phone.
  // (plain functions, not components, so React does not remount their contents on every render)
  const cols = (left: React.ReactNode, right: React.ReactNode, ratio = 1.15) =>
    desktop ? (
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: ratio, marginRight: 24 }}>{left}</View>
        <View style={{ flex: 1 }}>{right}</View>
      </View>
    ) : <>{left}{right}</>;
  const grid = (items: React.ReactNode[]) => (desktop ? <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -8 }}>{items.map((c, i) => <View key={i} style={{ width: "50%", paddingHorizontal: 8 }}>{c}</View>)}</View> : <>{items}</>);

  if (course && extraKind) return <CourseExtras course={course} kind={extraKind} onBack={() => setExtraKind(null)} />;

  if (course) {
    const bank = bankFor(course);
    const ex = extrasFor(course.id);
    const extraDesc: Record<ExtraKind, string> = {
      glossary: ex ? `${ex.glossary.length} terms with meanings. Search or filter by topic.` : "",
      quickref: ex ? `${ex.quickref.length} comparison tables for the things most often mixed up.` : "",
      formulas: ex ? `${ex.formulas.length} key equations, each with a worked example.` : "",
      typein: ex ? `${ex.typein.length} questions where you type the answer instead of picking an option.` : "",
      cards: ex ? `${ex.cards.length} reveal card${ex.cards.length === 1 ? "" : "s"} from past papers (written answers).` : "",
    };
    const extraTools = ex ? (["glossary", "quickref", "formulas", "typein", "cards"] as ExtraKind[]).filter((k) => (k === "glossary" ? ex.glossary : k === "quickref" ? ex.quickref : k === "formulas" ? ex.formulas : k === "typein" ? ex.typein : ex.cards).length > 0) : [];
    const past = pastQuestions(bank), papers = pastPapers(bank);
    const g = GRADS[course.id] ?? ["#3b82f6", "#1d4ed8"];
    const level = progress.diff[course.id] ?? 2;
    const today = todayKey();
    const dueN = reviewRound(bank, progress.cards, today).length;
    const tests = progress.tests[course.id];
    const weak = weakTopics(progress.topics, [course.id]);
    const starAll = [...bank, ...(ex ? typeinBankFor(course.id, ex.typein) : [])]; // type-in questions can be bookmarked too
    const starredN = starAll.filter((q) => progress.stars?.[q.id]?.on).length; // bookmarked with the ⭐ in a quiz
    const seenN = progress.seen[course.id]?.length ?? 0;
    const myLessons = (lessons || []).filter((l) => l.course === course.id);
    const topics = myLessons.map((l) => ({ id: l.id, title: l.title, qids: l.qids ?? [], pastQids: pastIdsForLesson(bank, course.id, l.id, l.qids) }))
      .filter((t) => t.qids.length || t.pastQids.length);
    const pctOf = (c: number, t: number) => Math.round((c / t) * 100);

    const lessonsCol = (
      <>
        <Text style={s.section}><Em n="learn" /> Lessons</Text>
        {lessonErr ? (
          <View style={s.card}><Text style={s.desc}>{lessonErr}</Text><TouchableOpacity onPress={loadLessons}><Text style={[s.back, { marginTop: 10, marginBottom: 0 }]}>Try again</Text></TouchableOpacity></View>
        ) : !lessons ? (
          <SkeletonGroup><SkeletonInfoCard />{[0, 1, 2].map((i) => <SkeletonLesson key={i} />)}</SkeletonGroup>
        ) : myLessons.length === 0 ? (
          <View style={s.card}><Text style={s.desc}>No lessons for this course yet.{lessons.length > 0 ? ` (${lessons.length} lessons loaded in total, none for this course. If it should have lessons, the content needs to be published with the seed script.)` : ""}</Text></View>
        ) : (
          <>
            <View style={s.card}>
              <Text style={s.cardTitle}>⬇️ Read offline</Text>
              <Text style={s.desc}>{saved.size >= myLessons.length ? "All lessons in this course are saved on this device." : `${saved.size} of ${myLessons.length} lessons saved on this device. Save the rest while you have good internet.`}</Text>
              {dl ? <Text style={[s.muted, { marginTop: 8 }]}>Saving… {dl.done} / {dl.total}</Text>
                : saved.size < myLessons.length ? <TouchableOpacity onPress={saveOffline}><Text style={[s.back, { marginTop: 10, marginBottom: 0 }]}>Save this course for offline</Text></TouchableOpacity> : null}
              {!!dlMsg && !dl && <Text style={[s.muted, { marginTop: 8 }]}>{dlMsg}</Text>}
            </View>
            {myLessons.map((l) => {
              const done = Math.min(l.sections.length, progress.lessons[l.id] || 0);
              const pct = pctOf(done, l.sections.length);
              return (
                <Hover key={l.id} style={s.card} onPress={() => setReading(l)}>
                  <Text style={s.cardTitle}>{wi(l.icon)} {l.order}. {l.title}</Text>
                  {!!l.sub && <Text style={s.desc}>{l.sub}</Text>}
                  <View style={s.bar}><View style={[s.fill, { width: `${pct}%`, backgroundColor: g[0] }]} /></View>
                  <Text style={s.muted}>{done >= l.sections.length ? wi("✓ Finished") : done > 0 ? `${done} / ${l.sections.length} sections · continue` : `${l.sections.length} sections`} · ~{l.minutes} min</Text>
                  {!!l.qids?.length && <TouchableOpacity onPress={() => practice(l)}><Text style={[s.back, { marginTop: 10, marginBottom: 0 }]}>✏️ Practice · {l.qids.length} questions</Text></TouchableOpacity>}
                </Hover>
              );
            })}
          </>
        )}
      </>
    );

    const toolView = tool === "mocks" ? (
      <>
        <TouchableOpacity onPress={() => setTool(null)}><Text style={s.back}>‹ Back to Practice</Text></TouchableOpacity>
        <Text style={s.section}><Em n="trophy" /> Predicted Tests</Text>
        <Text style={[s.desc, { marginBottom: 14 }]}>Each test has {mockSize(bank)} questions. You see the answers at the end. The tests are the same for everyone and don't repeat each other.</Text>
        {Array.from({ length: MOCK_COUNT }, (_, n) => (
          <Hover key={n} style={s.card} onPress={() => start({ title: `${course.name} · Predicted Test ${n + 1}`, mode: "normal", primary: course.id, feedback: "end", make: () => mockExam(bank, n, course.id) })}>
            <Text style={s.cardTitle}>Test {n + 1}</Text>
            <Text style={s.muted}>{mockSize(bank)} questions</Text>
          </Hover>
        ))}
      </>
    ) : tool === "past" ? (
      <>
        <TouchableOpacity onPress={() => setTool(null)}><Text style={s.back}>‹ Back to Practice</Text></TouchableOpacity>
        <Text style={s.section}><Em n="edit" /> Past questions</Text>
        <Text style={[s.desc, { marginBottom: 14 }]}>Choose a paper to work through, in order.</Text>
        {papers.map((p) => (
          <Hover key={p.name} style={s.card} onPress={() => start({ title: `${course.name} · ${p.name}`, mode: "normal", primary: course.id, make: () => p.qs.slice() })}>
            <Text style={s.cardTitle}>{p.name}</Text>
            {!!course.paperLabels?.[p.name] && <Text style={[s.desc, { color: COLORS.accent, fontWeight: "700", marginTop: 2 }]}>{course.paperLabels[p.name]}</Text>}
            <Text style={s.muted}>{p.qs.length} questions</Text>
          </Hover>
        ))}
        <Hover style={[s.card, { borderColor: COLORS.accent, borderWidth: 2 }]} onPress={() => startCourse(course, "Past questions mix", "normal", () => shuffle(past).slice(0, ROUND_SIZE))}>
          <Text style={s.cardTitle}><Em n="shuffle" /> Mixed from all papers</Text>
          <Text style={s.muted}>{ROUND_SIZE} random questions</Text>
        </Hover>
      </>
    ) : tool ? (
      <Builder kind={tool} bank={bank} topics={topics} onBack={() => setTool(null)}
        onStart={(o) => start({ title: `${course.name} · ${o.title}`, mode: "normal", primary: course.id, make: o.make, feedback: o.feedback, perQ: o.perQ })} />
    ) : null;

    const practiceCol = toolView ?? (
      <>
        <Text style={s.section}><Em n="edit" /> Practice</Text>
        <Text style={[s.desc, { marginBottom: 14 }]}>Each round has up to {ROUND_SIZE} questions.</Text>
        <Hover style={[s.card, { borderColor: COLORS.accent, borderWidth: 2 }]} onPress={() => startCourse(course, "Mixed", "normal", () => shuffle(bank).slice(0, ROUND_SIZE))}>
          <Text style={s.cardTitle}><Em n="challenge" /> Mixed round</Text>
          <Text style={s.desc}>{ROUND_SIZE} random questions from the whole course</Text>
        </Hover>
        <Hover style={s.card} onPress={() => startCourse(course, "Adaptive", "adaptive", () => adaptiveRound(bank, pr.current.diff[course.id] ?? 2, new Set(pr.current.seen[course.id] || [])))}>
          <Text style={s.cardTitle}>📈 Adaptive · {levelName(level)}</Text>
          <Text style={s.desc}>Gets harder when you score 80%+ and easier under 50%. Prefers questions you haven't seen. Difficulty is estimated from how each question is worded.</Text>
        </Hover>
        <Hover disabled={!dueN} style={[s.card, !dueN && { opacity: 0.55 }]} onPress={() => startCourse(course, "Review", "review", () => reviewRound(bank, pr.current.cards, todayKey()))}>
          <Text style={s.cardTitle}>🔁 Review ({dueN} due)</Text>
          <Text style={s.desc}>{dueN ? "Mistakes ready to retry" : "Nothing due yet"}</Text>
        </Hover>
        <Hover disabled={!starredN} style={[s.card, !starredN && { opacity: 0.55 }]} onPress={() => startCourse(course, "Starred", "normal", () => shuffle(starAll.filter((q) => pr.current.stars?.[q.id]?.on)))}>
          <Text style={s.cardTitle}>⭐ Starred ({starredN})</Text>
          <Text style={s.desc}>{starredN ? "Every question you bookmarked, shuffled. Good for revising before an exam." : wi("Tap ☆ on any question during a quiz to save it here.")}</Text>
        </Hover>
        {weak.length > 0 && (
          <Hover style={s.card} onPress={() => startCourse(course, "Weak spots", "weak", () => weakRound(bank, weakTopics(pr.current.topics, [course.id]), pr.current.seen))}>
            <Text style={s.cardTitle}><Em n="target" /> Weak spots</Text>
            {weak.slice(0, 4).map((w) => <Text key={w.topic} style={s.desc} numberOfLines={1}>{w.pct}% · {w.topic}</Text>)}
          </Hover>
        )}
        <Text style={[s.section, { marginTop: 18 }]}><Em n="target" /> Practice Center</Text>
        <Hover style={s.card} onPress={() => setTool("mocks")}>
          <Text style={s.cardTitle}><Em n="trophy" /> Predicted Tests</Text>
          <Text style={s.desc}>Sit one of {MOCK_COUNT} full mock exams of {mockSize(bank)} questions. Answers are shown at the end, like the real paper.</Text>
        </Hover>
        <Hover style={s.card} onPress={() => setTool("custom")}>
          <Text style={s.cardTitle}><Em n="settings" /> Custom Quiz Builder</Text>
          <Text style={s.desc}>Pick your topics, number of questions, timing and when you see the answers.</Text>
        </Hover>
        <Hover style={s.card} onPress={() => setTool("drill")}>
          <Text style={s.cardTitle}>⏱️ Timed Drill</Text>
          <Text style={s.desc}>Rapid fire with a countdown on every question. Beat the clock.</Text>
        </Hover>
        {past.length > 0 && (
          <Hover style={s.card} onPress={() => setTool("past")}>
            <Text style={s.cardTitle}><Em n="edit" /> Past questions</Text>
            <Text style={s.desc}>{papers.length > 1 ? `${papers.length} papers, ` : ""}{past.length} questions from {papers.some((p) => isPredictedSet(p.name)) ? "past and predicted papers" : "real past papers"}.</Text>
          </Hover>
        )}
        {extraTools.length > 0 && (
          <>
            <Text style={[s.section, { marginTop: 18 }]}><Em n="learn" /> Study tools</Text>
            {extraTools.map((k) => (
              <Hover key={k} style={s.card} onPress={() => setExtraKind(k)}>
                <Text style={s.cardTitle}>{wi(EXTRA_LABELS[k].icon)} {EXTRA_LABELS[k].title}</Text>
                <Text style={s.desc}>{extraDesc[k]}</Text>
              </Hover>
            ))}
          </>
        )}
        <View style={s.card}>
          <Text style={s.cardTitle}><Em n="ruler" /> Pre-test and post-test</Text>
          {tests?.pre && tests.post ? (
            <>
              <Text style={s.desc}>Pre {pctOf(tests.pre.c, tests.pre.t)}% → Post {pctOf(tests.post.c, tests.post.t)}% ({pctOf(tests.post.c, tests.post.t) - pctOf(tests.pre.c, tests.pre.t) >= 0 ? "+" : ""}{pctOf(tests.post.c, tests.post.t) - pctOf(tests.pre.c, tests.pre.t)} points)</Text>
              <TouchableOpacity onPress={() => startCourse(course, "Pre-test", "pre", () => testRound(bank))}><Text style={[s.back, { marginTop: 10, marginBottom: 0 }]}>Start a new pre-test</Text></TouchableOpacity>
            </>
          ) : tests?.pre ? (
            <>
              <Text style={s.desc}>Pre-test: {tests.pre.c}/{tests.pre.t} on {tests.pre.at}. Study, then take 10 new questions to see your improvement.</Text>
              <TouchableOpacity onPress={() => startCourse(course, "Post-test", "post", () => testRound(bank, tests.pre!.ids))}><Text style={[s.back, { marginTop: 10, marginBottom: 0 }]}>Take the post-test</Text></TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.desc}>Take 10 questions now, study, then 10 different ones later to measure your improvement.</Text>
              <TouchableOpacity onPress={() => startCourse(course, "Pre-test", "pre", () => testRound(bank))}><Text style={[s.back, { marginTop: 10, marginBottom: 0 }]}>Take the pre-test</Text></TouchableOpacity>
            </>
          )}
        </View>
      </>
    );

    return (
      <ScrollView key={"course-" + course.id} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={pad}>
        <TouchableOpacity onPress={() => setCourse(null)}><Text style={s.back}>‹ All courses</Text></TouchableOpacity>
        <View style={[s.courseHead, desktop && { marginBottom: 18 }]}>
          <LinearGradient colors={g} style={[s.icon, { marginBottom: 0, marginRight: 14 }]}><Glyph e={course.icon} size={28} color="#fff" /></LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{course.name}</Text>
            <Text style={s.muted}>{bank.length} questions · {seenN} seen</Text>
          </View>
        </View>
        {unfinished.length > 0 && (
          <>
            <Text style={s.section}>▶️ Unfinished quizzes</Text>
            {unfinished.map((sv) => {
              const ss = sv.session, n = ss.questions.length, a = answeredIn(ss);
              const ago = sv.elapsed < 3600 ? `${Math.max(1, Math.floor(sv.elapsed / 60))}m ago` : sv.elapsed < 86400 ? `${Math.floor(sv.elapsed / 3600)}h ago` : `${Math.floor(sv.elapsed / 86400)}d ago`;
              return (
                <Hover key={ss.title + ss.mode} style={s.card} onPress={() => continueSaved(sv)}>
                  <Text style={s.cardTitle}>{ss.title}</Text>
                  <View style={s.bar}><View style={[s.fill, { width: `${Math.round((a / n) * 100)}%`, backgroundColor: g[0] }]} /></View>
                  <Text style={s.muted}>{a} / {n} answered · saved {ago}</Text>
                  <View style={{ flexDirection: "row", marginTop: 10 }}>
                    <Text style={[s.back, { marginBottom: 0, marginRight: 18 }]}>▶ Continue</Text>
                    <TouchableOpacity onPress={() => discardSaved(sv)}><Text style={{ color: COLORS.muted, fontWeight: "700" }}>Discard</Text></TouchableOpacity>
                  </View>
                </Hover>
              );
            })}
          </>
        )}
        {cols(lessonsCol, practiceCol)}
      </ScrollView>
    );
  }

  const courseCard = (c: Course) => {
    const st = progress.subjects[c.id];
    const g = GRADS[c.id] ?? ["#3b82f6", "#1d4ed8"];
    return (
      <Hover key={c.id} style={s.card} onPress={() => setCourse(c)}>
        <LinearGradient colors={g} style={s.icon}><Glyph e={c.icon} size={28} color="#fff" /></LinearGradient>
        <Text style={s.cardTitle}>{c.name}</Text>
        <Text style={s.desc}>{c.desc}</Text>
        <View style={s.bar}><View style={[s.fill, { width: `${st?.best ?? 0}%`, backgroundColor: g[0] }]} /></View>
        <Text style={s.muted}>{st ? `${st.answered} answered · best ${st.best}%` : "Not started"}</Text>
      </Hover>
    );
  };
  const coursesBlock = (
    <>
      <Text style={s.section}>Your courses</Text>
      {own.length === 0 ? (
        <Panel>
          <Text style={s.cardTitle}>No courses for your hall and semester yet</Text>
          <Text style={s.desc}>You chose {profile?.hall}, Semester {profile?.semester}. Courses for this are coming soon.{extra.length > 0 ? " Meanwhile you can revise the earlier courses below." : ""}</Text>
        </Panel>
      ) : grid(own.map(courseCard))}
      {extra.length > 0 && (
        <>
          <Hover style={[s.card, { flexDirection: "row", alignItems: "center", marginTop: 14 }]} onPress={() => setExtraTap(!showExtra)}>
            <Text style={{ fontSize: 26, marginRight: 12 }}><Em n="learn" /></Text>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>Previous courses ({extra.length})</Text>
              <Text style={s.desc}>{showExtra ? "Tap to hide them again." : "Courses from earlier classes and semesters, for revision."}</Text>
            </View>
            <Text style={{ color: COLORS.muted, fontSize: 18 }}>{showExtra ? "▲" : "▼"}</Text>
          </Hover>
          {/* grouped by class and semester, most recent first; each group hides on its own */}
          {showExtra && groups.map((g) => {
            const open = !closedGroups.has(g.key);
            return (
              <View key={g.key}>
                <TouchableOpacity onPress={() => toggleGroup(g.key)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                  <Text style={s.section}>{g.hall} · Semester {g.sem} <Text style={{ color: COLORS.muted, fontWeight: "600", fontSize: 14 }}>({g.list.length})</Text></Text>
                  <Text style={{ color: COLORS.muted, fontSize: 16, paddingHorizontal: 6 }}>{open ? "▲ Hide" : "▼ Show"}</Text>
                </TouchableOpacity>
                {open && grid(g.list.map(courseCard))}
              </View>
            );
          })}
        </>
      )}
    </>
  );

  return (
    <ScrollView key="study-home" onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={pad}>
      <View style={s.top}>
        <View style={{ flex: 1 }}>
          <Text style={s.hello}>{greeting()},</Text>
          <Text style={[s.name, desktop && { fontSize: 30 }]}>{profile?.username ?? "student"}</Text>
          {desktop && <Text style={[s.desc, { marginTop: 4 }]}>Pick up where you left off, or start something new.</Text>}
        </View>
        <TouchableOpacity style={s.iconBtn} onPress={() => setThemes(true)}><Text style={{ fontSize: 20 }}><Em n="palette" /></Text></TouchableOpacity>
        {!desktop && <View style={{ marginLeft: 10 }}><BellButton /></View>}
      </View>
      {!desktop && (
        <View style={s.brand}>
          <View style={s.logoWrap}><Image source={require("../../assets/logo.png")} style={s.logo} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.hero}>GrAte <Text style={[s.hero, { color: COLORS.id === "rainbow" ? COLORS.text : COLORS.primary }]}>Apex</Text> Hub</Text>
          </View>
        </View>
      )}
      {desktop ? (
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ flex: 1, marginRight: 28 }}>{coursesBlock}</View>
          <View style={{ width: 390 }}>
            <Hud onCalendar={() => setCalOpen(true)} onMissed={() => setMissedOpen(true)} />
            {listed.length > 0 && <LearnPanel courses={listed} start={start} />}
          </View>
        </View>
      ) : (
        <>
          <Hud onCalendar={() => setCalOpen(true)} onMissed={() => setMissedOpen(true)} />
          {listed.length > 0 && <LearnPanel courses={listed} start={start} />}
          {coursesBlock}
        </>
      )}
      <ThemePicker visible={themes} onClose={() => setThemes(false)} />
    </ScrollView>
  );
}

const makeStyles = (COLORS: Colors) => StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  hello: { color: COLORS.silver, fontSize: 15 },
  name: { color: COLORS.text, fontSize: 22, fontWeight: "800" },
  iconBtn: { width: 44, height: 44, borderRadius: 13, backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  brand: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  logoWrap: { marginRight: 14, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", overflow: "hidden" },
  logo: { width: 62, height: 62 },
  badge: { alignSelf: "flex-start", backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 6 },
  badgeText: { color: COLORS.silver, fontSize: 11, fontWeight: "600" },
  hero: { color: COLORS.text, fontSize: 30, fontWeight: "800", letterSpacing: -0.8, lineHeight: 34 },
  rankRow: { flexDirection: "row", alignItems: "center" },
  rtitle: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
  rxp: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  sync: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  statRow: { flexDirection: "row", marginTop: 16 },
  stat: { flex: 1, backgroundColor: COLORS.light ? "rgba(10,31,160,0.05)" : "rgba(255,255,255,0.05)", borderRadius: 14, paddingVertical: 12, marginHorizontal: 4, alignItems: "center" },
  statN: { color: COLORS.text, fontSize: 24, fontWeight: "800" },
  statL: { color: COLORS.muted, fontSize: 10, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.6 },
  h: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  bar: { height: 7, borderRadius: 999, backgroundColor: COLORS.light ? "rgba(10,31,160,0.1)" : "rgba(255,255,255,0.12)", overflow: "hidden", marginTop: 12 },
  fill: { height: 7, borderRadius: 999 },
  muted: { color: COLORS.muted, fontSize: 13, marginTop: 8 },
  section: { color: COLORS.text, fontSize: 18, fontWeight: "800", marginVertical: 8 },
  card: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 22, padding: 20, marginBottom: 14 },
  icon: { width: 54, height: 54, borderRadius: 15, alignItems: "center", justifyContent: "center", marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  cardTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700", marginBottom: 4 },
  desc: { color: COLORS.silver, fontSize: 14, lineHeight: 20 },
  back: { color: COLORS.accent, fontWeight: "700", marginBottom: 14 },
  courseHead: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  title: { color: COLORS.text, fontSize: 26, fontWeight: "800" },
});