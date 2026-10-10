import React, { createContext, useContext } from "react";
import { Text } from "react-native";
import { Icon, type IconName } from "@/components/ui/icon";
import { useColors } from "@/theme";

// An icon that sits inside a line of text, in place of an emoji. It takes its size and colour from the
// <Text> around it (see Text.tsx), so it reads as part of the sentence:
//   <Text>Weekly challenge <Em n="target" /></Text>
export const TextStyleCtx = createContext<{ size: number; color?: string }>({ size: 15 });

export function Em({ n, size, color, filled }: { n: IconName; size?: number; color?: string; filled?: boolean }) {
  const ctx = useContext(TextStyleCtx);
  const colors = useColors();
  const px = size ?? Math.round(ctx.size * 1.22);
  return <Icon name={n} size={px} color={color ?? ctx.color ?? colors.text} filled={filled} style={{ marginBottom: -Math.round(px * 0.2) } as any} />;
}

// ---------------------------------------------------------------------------------------------
// Interface text that was written with an emoji ("🔥 3-day streak") is shown with the matching
// GRATEAPEX icon instead. Use it ONLY on text the app itself writes, never on what people type
// (messages, posts), where an emoji is the person's own content.
// ---------------------------------------------------------------------------------------------
const EMOJI_ICON: Record<string, IconName> = {
  "✓": "check", "✔": "check", "✅": "check", "✕": "close", "✗": "close", "❌": "close", "✖": "close",
  "📞": "phone", "📵": "phoneOff", "🔥": "streak", "💬": "chat", "📝": "edit", "✏": "edit", "✍": "edit", "🗑": "trash",
  "👥": "users", "⭐": "star", "★": "star", "☆": "star", "✨": "sparkle", "🎉": "sparkle", "⚡": "challenge", "🏆": "trophy", "🏅": "achievement",
  "🔁": "repeat", "🔄": "repeat", "✉": "mail", "📄": "file", "📘": "file", "📗": "file", "📙": "file", "📕": "file", "📎": "paperclip",
  "📖": "book", "⚔": "swords", "📅": "calendar", "🗓": "calendar", "🎯": "target", "🔒": "lock", "📷": "camera", "🖼": "image",
  "🔀": "shuffle", "🎤": "mic", "🎙": "mic", "🗂": "layers", "📚": "learn", "📏": "ruler", "📣": "announcement", "📤": "upload",
  "📋": "list", "💯": "sparkle", "💪": "sparkle", "🧠": "brain", "🔔": "bell", "🔇": "volumeOff", "🔊": "volume", "❤": "heart", "♥": "heart",
  "👤": "profile", "🤖": "sparkle", "📈": "trend", "☰": "list", "🔗": "link", "🏁": "flag", "🛟": "help", "➕": "plus", "👁": "eye",
  "🌍": "globe", "👑": "crown", "🚪": "logout", "🎓": "course", "☁": "cloud", "📴": "cloudOff", "🎛": "settings", "🎨": "palette",
  "⬆": "arrowUp", "🩸": "drop", "❓": "help", "🤝": "social", "🧭": "explore", "🗜": "file", "🧪": "biochemistry", "🫀": "physiology",
  "🩻": "anatomy", "🦟": "bug", "⏳": "clock", "⏱": "timer", "○": "dot", "🧬": "biochemistry", "⚗": "biochemistry", "💻": "grid", "➗": "level", "📊": "chart", "🗣": "chat", "🧫": "research", "🔬": "research",
};
const DROPPED = new Set(["👋", "😤", "😕", "🙂"]);
const EMOJI_RX = new RegExp("(" + Object.keys(EMOJI_ICON).concat([...DROPPED]).join("|") + ")\\uFE0F?", "g");

/** "🏆 Won" → [<Em trophy/>, " Won"]; a string with no known emoji is returned unchanged. */
export function withIcons(text: string | undefined | null, opts?: { size?: number; color?: string }): React.ReactNode {
  if (typeof text !== "string" || !text) return text;
  EMOJI_RX.lastIndex = 0;
  if (!EMOJI_RX.test(text)) return text;
  const out: React.ReactNode[] = [];
  let last = 0, i = 0;
  text.replace(EMOJI_RX, (m, e: string, offset: number) => {
    if (offset > last) out.push(text.slice(last, offset));
    if (!DROPPED.has(e)) out.push(<Em key={"e" + i++} n={EMOJI_ICON[e]} size={opts?.size} color={opts?.color} />);
    last = offset + m.length;
    return m;
  });
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
export const iconForEmoji = (e: string): IconName | undefined => EMOJI_ICON[e.replace(/️/g, "")];

/** A data-driven emoji (a course or lesson icon) drawn as a GRATEAPEX icon; unknown ones fall back to the emoji. */
export function Glyph({ e, size = 24, color }: { e?: string; size?: number; color?: string }) {
  const colors = useColors();
  const name = e ? iconForEmoji(e) : undefined;
  if (name) return <Icon name={name} size={size} color={color ?? colors.text} />;
  return <Text style={{ fontSize: size * 0.9 }}>{e ?? ""}</Text>;
}
