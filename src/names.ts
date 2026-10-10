import { fetchUser } from "./social";

// Display names: a friendly, non-unique name ("Kofi Mensah") shown next to the unique @username.
// It lives in users/{uid}.displayName. Everything that shows a person resolves it through here so a
// rename shows up everywhere without rewriting old posts.
export const DISPLAY_NAME_MAX = 40;

export function cleanDisplayName(raw: string): string {
  // eslint-disable-next-line no-control-regex
  return raw.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, DISPLAY_NAME_MAX);
}

// Returns an error message, or null when the name is fine. An empty name is allowed (it clears the
// display name and the @username is shown instead).
export function validateDisplayName(raw: string): string | null {
  const name = cleanDisplayName(raw);
  if (!name) return null;
  if (name.length < 2) return "Use at least 2 characters.";
  if (/^@/.test(name)) return "Leave out the @, that is for usernames.";
  if (/https?:\/\/|www\./i.test(name)) return "A display name can't contain a link.";
  return null;
}

const TTL = 5 * 60 * 1000;
const cache = new Map<string, { at: number; name: string | null }>();

export function forgetName(uid?: string | null) { if (uid) cache.delete(uid); else cache.clear(); }
export function rememberName(uid: string, name: string | null) { cache.set(uid, { at: Date.now(), name }); }

// uid -> display name (people without one are simply absent from the map).
export async function resolveNames(uids: readonly string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const missing: string[] = [];
  for (const uid of new Set(uids.filter(Boolean))) {
    const hit = cache.get(uid);
    if (hit && Date.now() - hit.at < TTL) { if (hit.name) out.set(uid, hit.name); } else missing.push(uid);
  }
  await Promise.all(missing.slice(0, 80).map(async (uid) => {
    try {
      const u = (await fetchUser(uid)) as any;
      const name = typeof u?.displayName === "string" && u.displayName.trim() ? u.displayName.trim() : null;
      cache.set(uid, { at: Date.now(), name });
      if (name) out.set(uid, name);
    } catch { /* leave the @username */ }
  }));
  return out;
}
