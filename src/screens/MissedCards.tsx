import React, { useMemo } from "react";
import { View } from "react-native";
import { Text } from "../Text";
import { useColors } from "../theme";
import { COURSES } from "../data/catalog";
import { Card, bankFor, isTyped } from "../learning";
import { Term } from "../lessons";
import { useProgress } from "../progress";
import { Flashcards } from "./LessonTools";
import { Em } from "../components/em";

// The card text is shown with the lesson mini-markup, so < and & must be escaped.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Every quiz question the student got wrong (and hasn't mastered yet) becomes a flashcard:
// the question on the front, the right answer and the explanation on the back.
// The cards come straight from the question bank, so nothing extra is saved. Their schedule lives in the usual flashcard data.
export function missedTerms(cards: Record<string, Card>): Term[] {
  const open = Object.entries(cards).filter(([, c]) => !c.g);
  if (!open.length) return [];
  const ids = new Set(open.map(([id]) => id));
  const courses = new Set(open.map(([, c]) => c.c));
  const out: Term[] = [];
  for (const course of COURSES) {
    if (!courses.has(course.id)) continue;
    for (const q of bankFor(course)) {
      if (!ids.has(q.id)) continue;
      const right = isTyped(q) ? (q.ans ?? "") : (q.o[q.a] ?? "");
      out.push({ id: "q:" + q.id, name: q.q, def: esc(isTyped(q) ? right : `${"ABCDEFGH"[q.a] ?? ""}. ${right}`) + (q.e ? "\n\n" + esc(q.e) : "") });
    }
  }
  return out;
}

export default function MissedCards() {
  const COLORS = useColors();
  const { progress } = useProgress();
  const terms = useMemo(() => missedTerms(progress.cards), [progress.cards]);
  if (!terms.length) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 28 }}>
        <Text style={{ fontSize: 44 }}><Em n="check" /></Text>
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "800", marginTop: 8 }}>No missed questions</Text>
        <Text style={{ color: COLORS.muted, textAlign: "center", marginTop: 6, lineHeight: 21 }}>When you get a quiz question wrong it turns into a flashcard here, and comes back on a spaced schedule until you know it.</Text>
      </View>
    );
  }
  return <Flashcards terms={terms} title="❌ Missed questions" labels={["QUESTION", "ANSWER"]} intro="Questions you got wrong in quizzes. Read the question, say the answer, flip, then tell it how it went. Cards that you keep getting right wait longer and longer." />;
}
