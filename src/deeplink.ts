// Links people share: /l/<lesson id> opens a lesson, /c/<course id> opens a course.
import { Platform } from "react-native";

export type Link = { kind: "lesson" | "course"; id: string };
const isWeb = Platform.OS === "web" && typeof window !== "undefined";

const parse = (): Link | null => {
  if (!isWeb) return null;
  const m = window.location.pathname.match(/^\/(l|c)\/([a-z0-9-]+)\/?$/i);
  return m ? { kind: m[1] === "l" ? "lesson" : "course", id: m[2].toLowerCase() } : null;
};

let pending: Link | null = parse(); // read once, when the page loads
export const peekLink = () => pending;
export const takeLink = () => { const p = pending; pending = null; return p; };

export const linkPath = (l: Link) => `/${l.kind === "lesson" ? "l" : "c"}/${l.id}`;
export const linkUrl = (l: Link) => (isWeb ? window.location.origin : "https://grateapex.vercel.app") + linkPath(l);

// Keep the address bar in step with what is open, so the URL can always be shared.
export function setPath(path: string) {
  if (isWeb && window.location.pathname !== path) { try { window.history.replaceState(null, "", path); } catch { /* ignore */ } }
}

export async function shareLink(l: Link, title: string, text: string): Promise<"shared" | "copied" | "failed"> {
  const url = linkUrl(l);
  try {
    const nav: any = isWeb ? navigator : null;
    if (nav?.share) { await nav.share({ title, text, url }); return "shared"; }
    if (nav?.clipboard) { await nav.clipboard.writeText(url); return "copied"; }
  } catch (e: any) { if (e?.name === "AbortError") return "shared"; }
  return "failed";
}
