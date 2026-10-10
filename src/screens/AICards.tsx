import React, { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "../Text";
import { useAuth } from "../auth";
import { useColors } from "../theme";
import { Button } from "../ui";
import { AiCard, aiFlashcards } from "../ai";
import { Deck, deckId, deckTerms, listDecks, saveDeck } from "../aiDecks";
import { Flashcards } from "./LessonTools";
import { Em } from "../components/em";

// "✨ AI flashcards" for one topic of a lesson: 10 cards made from that topic's text.
// They're saved to your account, so opening them again is free (making new ones uses one AI use).
export default function AICards({ lessonId, sectionId, title, lessonTitle, course, onBack }: { lessonId: string; sectionId: string; title: string; lessonTitle?: string; course?: string; onBack: () => void }) {
  const COLORS = useColors();
  const { user } = useAuth();
  const id = deckId(lessonId, sectionId);
  const [cards, setCards] = useState<AiCard[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [left, setLeft] = useState<number | null>(null);
  const [ver, setVer] = useState(0); // new set = new deck state

  const make = async () => {
    setBusy(true); setErr("");
    try {
      const r = await aiFlashcards(lessonId, sectionId);
      setCards(r.cards); setLeft(r.left); setVer((v) => v + 1);
      if (user) saveDeck(user.uid, { id, lessonId, sectionId, title, lessonTitle: lessonTitle ?? "", course: course ?? "", cards: r.cards, at: Date.now() });
    } catch (e: any) { setErr(e?.message ?? "Something went wrong."); }
    setBusy(false);
  };

  // reopen the saved set if there is one, otherwise make a new one
  useEffect(() => {
    let on = true;
    (async () => {
      if (user) {
        const d = (await listDecks(user.uid)).find((x) => x.id === id);
        if (d && on) { setCards(d.cards); return; }
        // sets saved before this update lived only on the device
        try { const raw = await AsyncStorage.getItem(`aicards:${user.uid}:${lessonId}:${sectionId}`); const c = raw ? JSON.parse(raw) : null; if (Array.isArray(c) && c.length && on) { setCards(c); saveDeck(user.uid, { id, lessonId, sectionId, title, lessonTitle: lessonTitle ?? "", course: course ?? "", cards: c, at: Date.now() }); return; } } catch { /* none */ }
      }
      if (on) make();
    })();
    return () => { on = false; };
  }, [id, user?.uid]);

  const terms = deckTerms({ id, lessonId, sectionId, title, lessonTitle: "", course: "", cards: cards ?? [], at: 0 });

  if (!cards) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        {busy ? <><ActivityIndicator color={COLORS.accent} size="large" /><Text style={{ color: COLORS.text, marginTop: 14, fontWeight: "700" }}>Making 10 flashcards…</Text><Text style={{ color: COLORS.muted, marginTop: 4, textAlign: "center" }}>"{title}"</Text></>
          : <>
            <Text style={{ fontSize: 40 }}></Text>
            <Text style={{ color: COLORS.text, textAlign: "center", marginVertical: 12 }}>{err || "Couldn't make flashcards."}</Text>
            <Button title="Try again" onPress={make} />
            <Button variant="ghost" title="Back to the lesson" onPress={onBack} />
          </>}
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 20 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.accent, fontWeight: "800" }}><Em n="sparkle" /> AI flashcards</Text>
          <Text style={{ color: COLORS.muted, fontSize: 12 }} numberOfLines={1}>{title}</Text>
        </View>
        <TouchableOpacity onPress={make} disabled={busy} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, marginRight: 8, opacity: busy ? 0.5 : 1 }}>
          <Text style={{ color: COLORS.text, fontWeight: "700", fontSize: 12 }}>{busy ? "Making…" : "↻ New set"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack}><Text style={{ color: COLORS.muted, fontWeight: "700" }}><Em n="close" /></Text></TouchableOpacity>
      </View>
      {!!err && <Text style={{ color: COLORS.danger, marginHorizontal: 20, marginTop: 6 }}>{err}</Text>}
      {left !== null && <Text style={{ color: COLORS.muted, fontSize: 12, marginHorizontal: 20, marginTop: 4 }}>{left} AI {left === 1 ? "use" : "uses"} left today. AI can make mistakes, so check against your lesson.</Text>}
      <Flashcards key={ver} terms={terms} />
    </View>
  );
}
