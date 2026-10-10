import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "./Text";
import { useColors } from "./theme";

// Emoji reactions on chat messages: stored on the message as reactions: { [uid]: emoji } (one per person).
export const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

// A bigger set to pick from when the person taps ＋ (anything else can be typed or pasted).
const MORE = ("😀 😃 😄 😁 😆 😅 🤣 🙂 😉 😊 😇 🥰 😍 🤩 😘 😋 😛 😜 🤪 🤗 🤔 🤨 😐 😑 😶 🙄 😏 😬 😌 😔 😴 🤤 😷 🤒 🤯 🥳 😎 🤓 😕 😟 😳 🥺 😭 😤 😡 🤬 😱 😨 😰 🥵 🥶 🫡 🫶 " +
  "👍 👎 👏 🙌 🤝 🙏 💪 ✌️ 🤞 👌 🤌 👀 🧠 🔥 💯 ✨ 🎉 🎊 🏆 ⭐ ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💔 💕 💖 ✅ ❌ ❓ ❗ 💀 👻 🤡 💩 📚 ✏️ 🧪 🔬 💊 🩺 🦠 ☕ 🍕 🍔 🎓 🇬🇭").split(" ");

// Pulls the first emoji out of whatever was typed/pasted (handles flags, skin tones, ZWJ sequences). Returns null if there is none.
function firstEmoji(input: string): string | null {
  const t = input.trim();
  if (!t) return null;
  let first = t;
  const Seg = (Intl as any)?.Segmenter;
  if (Seg) { for (const g of new Seg(undefined, { granularity: "grapheme" }).segment(t)) { first = g.segment; break; } }
  else first = Array.from(t)[0];
  let ok = false;
  try { ok = /\p{Extended_Pictographic}|\p{Regional_Indicator}|[\u0023\u002A\u0030-\u0039]\uFE0F?\u20E3/u.test(first); } catch { ok = Array.from(first).some((c) => (c.codePointAt(0) ?? 0) > 0x2000); }
  return ok && Array.from(first).length <= 8 ? first : null;
}

// Row of emojis shown in the long-press / right-click menu. Tap ＋ for more, or type/paste ANY emoji. Tapping your current one removes it.
export function ReactionPicker({ current, onPick }: { current?: string; onPick: (emoji: string | null) => void }) {
  const COLORS = useColors();
  const [more, setMore] = useState(false);
  const [txt, setTxt] = useState("");
  const [bad, setBad] = useState(false);
  const pick = (e: string) => onPick(current === e ? null : e);
  const submit = () => { const e = firstEmoji(txt); if (e) pick(e); else setBad(true); };
  const cell = (e: string, size = 26) => (
    <TouchableOpacity key={e} onPress={() => pick(e)} style={{ padding: 6, borderRadius: 20, backgroundColor: current === e ? COLORS.card : "transparent" }}>
      <Text style={{ fontSize: size }}>{e}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 4, paddingVertical: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}>
        {REACTIONS.map((e) => cell(e))}
        <TouchableOpacity onPress={() => setMore(!more)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.card, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "800", marginTop: -2 }}>{more ? "–" : "+"}</Text>
        </TouchableOpacity>
      </View>
      {more && (
        <View style={{ marginTop: 8 }}>
          <ScrollView style={{ maxHeight: 190 }} nestedScrollEnabled>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>{MORE.map((e) => cell(e, 24))}</View>
          </ScrollView>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, paddingHorizontal: 6 }}>
            <TextInput value={txt} onChangeText={(v) => { setTxt(v); setBad(false); }} onSubmitEditing={submit} returnKeyType="done"
              placeholder="Type or paste any emoji" placeholderTextColor={COLORS.muted}
              style={{ flex: 1, backgroundColor: COLORS.card, borderColor: bad ? COLORS.danger : COLORS.border, borderWidth: 1, borderRadius: 12, color: COLORS.text, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16 }} />
            <TouchableOpacity onPress={submit} style={{ marginLeft: 8, backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
              <Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>React</Text>
            </TouchableOpacity>
          </View>
          {bad && <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4, paddingHorizontal: 8 }}>That doesn't look like an emoji.</Text>}
          <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 4, paddingHorizontal: 8 }}>On PC: Windows key + . (period) or Cmd + Ctrl + Space on Mac opens the emoji keyboard.</Text>
        </View>
      )}
    </View>
  );
}

// Small chips under a bubble: 👍 2  ❤️ 1. Tap a chip to react with that emoji (or remove yours).
export function ReactionChips({ reactions, meUid, onPick, mine }: { reactions?: Record<string, string>; meUid: string; onPick: (emoji: string | null) => void; mine?: boolean }) {
  const COLORS = useColors();
  const all = Object.entries(reactions ?? {}).filter(([, e]) => !!e);
  if (!all.length) return null;
  const counts = new Map<string, number>();
  all.forEach(([, e]) => counts.set(e, (counts.get(e) ?? 0) + 1));
  const my = reactions?.[meUid];
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: -6, marginBottom: 4, justifyContent: mine ? "flex-end" : "flex-start" }}>
      {[...counts.entries()].map(([e, n]) => (
        <TouchableOpacity key={e} onPress={() => onPick(my === e ? null : e)} style={{ flexDirection: "row", alignItems: "center", backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderColor: my === e ? COLORS.primary : COLORS.border, borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, marginRight: 4, marginTop: 2 }}>
          <Text style={{ fontSize: 14 }}>{e}</Text>
          {n > 1 && <Text style={{ color: COLORS.text, fontSize: 12, fontWeight: "700", marginLeft: 3 }}>{n}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}