// Time helpers shared by the learning engine. Pure — no React.
//
// "Days" are the learner's LOCAL calendar days, so "due today", streaks
// and the review calendar follow their own midnight, not UTC's.

// The current time. Event handlers use this instead of calling Date.now()
// inline, which keeps components pure for the React Compiler.
export function nowMs() {
  return Date.now();
}

export function secondsSince(start: number) {
  return Math.max(0, Math.floor((Date.now() - start) / 1000));
}

export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

// YYYY-MM-DD in local time.
export function dayKey(time: number | Date) {
  const date = typeof time === 'number' ? new Date(time) : time;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfDay(time: number) {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function endOfDay(time: number) {
  return startOfDay(time) + DAY_MS - 1;
}

export function addDays(time: number, days: number) {
  const date = new Date(time);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

// Whole calendar days from `from` to `to` (local midnights), e.g.
// yesterday 23:00 → today 01:00 is 1 day.
export function calendarDaysBetween(from: number, to: number) {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS);
}

// "today", "yesterday", "5 days ago", "3 weeks ago"
export function describeAgo(time: number, now: number) {
  const days = calendarDaysBetween(time, now);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}

// "now", "today", "tomorrow", "in 3 days", "in 2 weeks"
export function describeDue(time: number, now: number) {
  if (time <= now) return 'now';
  const days = calendarDaysBetween(now, time);
  if (days <= 0) return 'later today';
  if (days === 1) return 'tomorrow';
  if (days < 14) return `in ${days} days`;
  if (days < 60) return `in ${Math.round(days / 7)} weeks`;
  return `in ${Math.round(days / 30)} months`;
}

// "Mon 6", used by the review calendar.
export function shortDayLabel(time: number) {
  const date = new Date(time);
  const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });
  return `${weekday} ${date.getDate()}`;
}

// "2:05" / "45s"
export function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  if (minutes === 0) return `${rest}s`;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
