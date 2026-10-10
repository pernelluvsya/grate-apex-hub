import { useScreenBack } from "../backStack";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "../Text";
import { useAuth } from "../auth";
import { useColors } from "../theme";
import { Term } from "../lessons";
import { Flashcards } from "./LessonTools";
import AICards from "./AICards";
import ReviewCalendar from "./ReviewCalendar";
import MissedCards from "./MissedCards";
import { Deck, deckTerms, listDecks } from "../aiDecks";
import { useProgress } from "../progress";
import { queueCounts } from "../srs";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";


// The Flashcards tab of a lesson: "Grate Apex flashcards" (ours) and "AI generated flashcards"
// (10 per topic, made on request and saved so they're here next time).
export default function CardsHub({ lessonId, terms, sections }: { lessonId: string; terms: Term[]; sections: { id: string; title: string }[] }) {
  const COLORS = useColors();
  const { user } = useAuth();
  const [tab, setTab] = useState<"ga" | "ai" | "missed">(terms.length ? "ga" : "ai");
  const [open, setOpen] = useState<{ id: string; title: string } | null>(null);
  const [sets, setSets] = useState<Deck[]>([]); // every AI set the student has, from all lessons
  const [review, setReview] = useState(false);
  const [cal, setCal] = useState(false);
  const { progress } = useProgress();
  useScreenBack(tab === "ai" && (cal || review || !!open), () => { if (cal) setCal(false); else if (review) setReview(false); else setOpen(null); }); // Android back
  const saved: Record<string, number> = {};
  sets.filter((x) => x.lessonId === lessonId).forEach((x) => { saved[x.sectionId] = x.cards.length; });
  const allTerms = sets.flatMap(deckTerms);
  const dueN = queueCounts(allTerms, progress.terms).total;

  const refresh = useCallback(async () => { if (user) setSets(await listDecks(user.uid)); }, [user?.uid, lessonId]);
  useEffect(() => { if (!open) refresh(); }, [open, refresh]);

  const Seg = ({ id, label }: { id: "ga" | "ai" | "missed"; label: string }) => (
    <TouchableOpacity onPress={() => { setTab(id); setOpen(null); setReview(false); setCal(false); }} style={{ flex: 1, paddingVertical: 11, borderRadius: 999, alignItems: "center", backgroundColor: tab === id ? COLORS.primary : "transparent" }}>
      <Text style={{ color: tab === id ? COLORS.onPrimary : COLORS.text, fontWeight: "800", fontSize: 13 }}>{wi(label)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", margin: 16, marginBottom: 4, padding: 4, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card }}>
        <Seg id="ga" label="🃏 Grate Apex" />
        <Seg id="ai" label="✨ AI" />
        <Seg id="missed" label="❌ Missed" />
      </View>
      {tab === "missed"
        ? <MissedCards />
        : tab === "ga"
        ? (terms.length ? <Flashcards terms={terms} /> : <Text style={{ color: COLORS.muted, padding: 24, textAlign: "center" }}>This lesson has no Grate Apex flashcards yet. Try the AI generated ones.</Text>)
        : cal ? <ReviewCalendar terms={allTerms} studyCount={dueN} onStudy={() => { setCal(false); setReview(true); }} onBack={() => setCal(false)} />
        : review ? (
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => setReview(false)} style={{ paddingHorizontal: 20, paddingTop: 8 }}><Text style={{ color: COLORS.accent, fontWeight: "800" }}>← Back to topics</Text></TouchableOpacity>
            <Flashcards terms={allTerms} />
          </View>
        )
        : open
          ? <AICards key={open.id} lessonId={lessonId} sectionId={open.id} title={open.title} onBack={() => setOpen(null)} />
          : (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
              {allTerms.length > 0 && (
                <TouchableOpacity onPress={() => setReview(true)} style={{ padding: 16, marginBottom: 14, borderRadius: 18, backgroundColor: COLORS.primary }}>
                  <Text style={{ color: COLORS.onPrimary, fontWeight: "800", fontSize: 16 }}>🔁 Spaced review ({dueN} due, all your AI sets)</Text>
                  <Text style={{ color: COLORS.onPrimary, opacity: 0.85, marginTop: 2, fontSize: 12 }}>{dueN ? "Anki-style: the easier a card is, the longer it waits before it comes back." : "All caught up. Come back tomorrow."}</Text>
                </TouchableOpacity>
              )}
              {allTerms.length > 0 && (
                <TouchableOpacity onPress={() => setCal(true)} style={{ padding: 14, marginBottom: 14, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card }}>
                  <Text style={{ color: COLORS.text, fontWeight: "800" }}><Em n="calendar" /> Review calendar</Text>
                  <Text style={{ color: COLORS.muted, marginTop: 2, fontSize: 12 }}>See which days your cards are due.</Text>
                </TouchableOpacity>
              )}
              <Text style={{ color: COLORS.muted, marginBottom: 12 }}>Pick a topic and the AI makes 10 flashcards from it. They're saved to your account, so you can open them again on any device for free. Making a new set uses one of your daily AI uses.</Text>
              {sections.map((x, i) => (
                <TouchableOpacity key={x.id + i} onPress={() => setOpen(x)} style={{ flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 8, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.text, fontWeight: "700" }} numberOfLines={2}>{x.title}</Text>
                    <Text style={{ color: saved[x.id] ? COLORS.accent : COLORS.muted, fontSize: 12, marginTop: 2 }}>{saved[x.id] ? wi(`✓ ${saved[x.id]} cards saved`) : "Not made yet"}</Text>
                  </View>
                  <Text style={{ color: COLORS.accent, fontWeight: "800" }}>{saved[x.id] ? "Open" : "Make 10"}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
    </View>
  );
}
