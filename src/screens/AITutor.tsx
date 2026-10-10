import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "../Text";
import { useColors } from "../theme";
import { ChatMsg, askTutor } from "../ai";
import Markdown from "../Markdown";
import { useAuth } from "../auth";
import { chatKey, clearChat, epochOf, getChat, loadChat, saveChat, subscribeChat } from "../aiChat";
import { confirmAsk } from "../confirm";
import { Em } from "../components/em";

// A tutor chat for one lesson. The server answers from the lesson text. The chat is saved on the device per lesson.
const IDEAS = ["Explain this section simply", "Give me an example", "What are the key points to remember?", "Quiz me with a question"];

export default function AITutor({ lessonId, title, section }: { lessonId: string; title: string; section?: string }) {
  const COLORS = useColors();
  const { user } = useAuth();
  const key = chatKey(user?.uid, lessonId);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [left, setLeft] = useState<number | null>(null);
  const scroller = useRef<ScrollView>(null);

  // Load the saved chat for this lesson and stay in sync with it.
  useEffect(() => {
    let live = true;
    setReady(false); setMsgs([]);
    const off = subscribeChat(key, (m) => { if (live) setMsgs(m); });
    loadChat(key).then((m) => { if (live) { setMsgs(m); setReady(true); } });
    return () => { live = false; off(); };
  }, [key]);

  const send = async (t0?: string) => {
    const t = (t0 ?? text).trim();
    if (!t || busy || !ready) return;
    const prev = getChat(key);
    const mine: ChatMsg = { role: "user", content: section && !prev.length ? `(I'm reading the section "${section}".) ${t}` : t };
    const next: ChatMsg[] = [...prev, mine];
    const epoch = epochOf(key);
    saveChat(key, next); setText(""); setErr(""); setBusy(true);
    try {
      const r = await askTutor(lessonId, next);
      if (epochOf(key) === epoch) saveChat(key, [...getChat(key), { role: "assistant", content: r.reply }]); // skipped if the chat was cleared meanwhile
      setLeft(r.left);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong."); if (e?.left === 0) setLeft(0);
      if (epochOf(key) === epoch) { const cur = getChat(key); if (cur[cur.length - 1] === mine) saveChat(key, cur.slice(0, -1)); setText(t); }
    }
    finally { setBusy(false); }
  };

  const clear = async () => {
    if (!(await confirmAsk("Clear this chat? The conversation will be deleted.", "Clear"))) return;
    clearChat(key); setErr(""); setBusy(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 20 }} onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "800", flex: 1 }}><Em n="sparkle" /> Ask the AI tutor</Text>
          {msgs.length > 0 && (
            <TouchableOpacity onPress={clear} accessibilityLabel="Clear chat" style={{ borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, marginLeft: 8 }}>
              <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: "700" }}><Em n="trash" /> Clear chat</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={{ color: COLORS.muted, marginTop: 4, marginBottom: 12, lineHeight: 20 }}>Answers come from "{title}". It can make mistakes, so check anything important against your lesson.</Text>
        {msgs.length === 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {IDEAS.map((i) => (
              <TouchableOpacity key={i} onPress={() => send(i)} style={{ borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14, marginRight: 8, marginBottom: 8 }}>
                <Text style={{ color: COLORS.text, fontSize: 13 }}>{i}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {msgs.map((m, i) => (
          <View key={i} style={{ alignItems: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            <View style={{ maxWidth: "88%", padding: 12, borderRadius: 16, backgroundColor: m.role === "user" ? COLORS.primary : COLORS.card, borderWidth: m.role === "user" ? 0 : 1, borderColor: COLORS.border }}>
              {m.role === "user" ? <Text style={{ color: COLORS.onPrimary, lineHeight: 22 }} selectable>{m.content}</Text> : <Markdown text={m.content} color={COLORS.text} accent={COLORS.accent} />}
            </View>
          </View>
        ))}
        {busy && <View style={{ alignItems: "flex-start" }}><View style={{ padding: 12, borderRadius: 16, backgroundColor: COLORS.card }}><ActivityIndicator color={COLORS.accent} /></View></View>}
        {!!err && <Text style={{ color: COLORS.danger, marginTop: 6 }}>{err}</Text>}
        {left !== null && <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 8, textAlign: "center" }}>{left} AI {left === 1 ? "use" : "uses"} left today</Text>}
      </ScrollView>
      <View style={{ flexDirection: "row", padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: "center" }}>
        <TextInput value={text} onChangeText={setText} placeholder="Ask about this lesson…" placeholderTextColor={COLORS.muted} maxLength={500}
          onSubmitEditing={() => send()} returnKeyType="send" style={{ flex: 1, backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 999, color: COLORS.text, paddingHorizontal: 16, paddingVertical: 11, fontSize: 15 }} />
        <TouchableOpacity onPress={() => send()} disabled={busy || !text.trim()} style={{ marginLeft: 8, backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 11, paddingHorizontal: 18, opacity: busy || !text.trim() ? 0.5 : 1 }}>
          <Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>Ask</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}