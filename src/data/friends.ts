// Real friends now come from Supabase — see data/social.ts. The sample
// friends that used to live here have been removed; only the initials
// helper (used by the Avatar component) remains.

// Initials for the avatar circle, e.g. "Amara Okafor" -> "AO".
export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
