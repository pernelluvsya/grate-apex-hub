import type { Href } from '@/lib/router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useSyncExternalStore } from 'react';

import type { AppNotification } from '@/data/notifications';
import { auth } from '@/lib/firebase';
import { describeNotif, markRead, watchNotifs, type Notif } from '@/notifications';
import { resolveNames } from '@/names';
import { fetchEdges, fetchFeed, fetchScores, fetchUser, follow, searchUsers, suggestFollows, unfollow } from '@/social';

// Home's view of the hub's social graph, built from the hub's own collections:
//   follows/{follower_followee}          who follows whom
//   users/{uid}                          name, photo
//   scores/{uid}                         public XP and streak
//   users/{uid}/activity                 the feed (levels, streaks, weekly recaps, posts)
//   users/{uid}/notifications            likes, comments, follows...
// Everyone I follow counts as my circle ("friends" here), so the Home feed matches the Feed the hub always had.

export type Relationship = 'none' | 'friends' | 'outgoing' | 'incoming';

export type SocialPerson = {
  userId: string;
  friendshipId: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  relationship: Relationship;
  totalXp: number | null;
  weeklyXp: number | null;
  streak: number | null;
  since: number | null;
  isOnline: boolean;
};

export type SocialRecommendation = SocialPerson & { sameClass: boolean; sharedConnections: number };

export type SocialActivity = {
  id: string;
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  type: string;
  name: string;
  at: number;
  title: string;
  subtitle: string;
  xpEarned: number;
  occurredAt: number;
  topicId?: string;
  lessonId?: string;
};
export type FriendActivity = SocialActivity;

export type SocialNotification = {
  id: string;
  type: string;
  actorName: string;
  actorAvatarUrl: string | null;
  readAt: number | null;
  createdAt: number;
  title: string;
  body: string;
  href: Href;
};

type State = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  userId: string | null;
  username: string | null;
  shareActivity: boolean;
  people: SocialPerson[];
  activity: SocialActivity[];
  activityError: string | null;
  notifications: SocialNotification[];
};

const EMPTY: State = { status: 'idle', error: null, userId: null, username: null, shareActivity: true, people: [], activity: [], activityError: null, notifications: [] };
let state: State = EMPTY;
const listeners = new Set<() => void>();
function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function personName(person: { username?: string | null; displayName?: string | null } | null | undefined): string {
  if (!person) return 'Learner';
  return person.displayName?.trim() || person.username?.trim() || 'Learner';
}

const ms = (t: any): number => (t?.toMillis ? t.toMillis() : typeof t === 'number' ? t : Date.now());

function describeActivity(a: { type: string; data: any }): { title: string; subtitle: string } | null {
  const d = a.data ?? {};
  if (a.type === 'level') return { title: `reached Level ${d.level ?? ''}${d.title ? ` · ${d.title}` : ''}`.trim(), subtitle: '' };
  if (a.type === 'streak') return { title: `is on a ${d.streak ?? d.days ?? ''}-day study streak`.replace('  ', ' '), subtitle: '' };
  if (a.type === 'recap') return { title: `answered ${d.answered ?? 0} questions over ${d.activeDays ?? 0} day${d.activeDays === 1 ? '' : 's'} this week`, subtitle: d.streak ? `${d.streak}-day streak` : '' };
  return null; // posts and reshares are shown by the posts feed; quiz scores stay private
}

async function loadSocial(userId: string) {
  try {
    const [me, following, followers] = await Promise.all([
      fetchUser(userId).catch(() => null),
      fetchEdges(userId, 'following'),
      fetchEdges(userId, 'followers').catch(() => []),
    ]);
    const followingIds = following.map((f) => f.uid);
    const incomingOnly = followers.filter((f) => !followingIds.includes(f.uid));
    const ids = [...followingIds, ...incomingOnly.map((f) => f.uid)].slice(0, 60);
    const [profiles, scores] = await Promise.all([
      Promise.all(ids.map((u) => fetchUser(u).catch(() => null))),
      fetchScores(ids).catch(() => []),
    ]);
    const scoreOf = new Map(scores.map((s) => [s.uid, s]));
    const shown = new Map(ids.map((u, i) => [u, ((profiles[i] as any)?.displayName as string | undefined)?.trim() || null]));
    const names = new Map([...following, ...incomingOnly].map((p) => [p.uid, p.username]));
    const photoOf = new Map(ids.map((u, i) => [u, profiles[i]?.photo ?? null]));
    const people: SocialPerson[] = ids.map((u) => {
      const s = scoreOf.get(u);
      const isFollowing = followingIds.includes(u);
      return {
        userId: u, friendshipId: isFollowing ? `${userId}_${u}` : `${u}_${userId}`,
        username: names.get(u) ?? profiles[ids.indexOf(u)]?.username ?? null, displayName: shown.get(u) ?? names.get(u) ?? null,
        avatarUrl: photoOf.get(u) ?? null, relationship: isFollowing ? 'friends' : 'incoming',
        totalXp: s?.xp ?? null, weeklyXp: null, streak: s?.streak ?? null, since: null, isOnline: false,
      };
    });
    setState({ status: 'ready', error: null, username: me?.username ?? null, people });

    // Activity of the people I follow (and mine), newest first.
    try {
      const raw = await fetchFeed([userId, ...followingIds], 6, 60);
      const photos = new Map<string, string | null>([[userId, me?.photo ?? null], ...photoOf]);
      const activity: SocialActivity[] = [];
      const feedNames = await resolveNames(raw.map((a) => a.uid));
      for (const a of raw) {
        const text = describeActivity(a);
        if (!text) continue;
        activity.push({
          id: `${a.uid}_${a.id}`, userId: a.uid, username: a.username, displayName: feedNames.get(a.uid) ?? a.username, avatarUrl: photos.get(a.uid) ?? null,
          type: a.type, name: a.uid === userId ? 'You' : feedNames.get(a.uid) ?? a.username, at: ms(a.createdAt), occurredAt: ms(a.createdAt),
          title: text.title, subtitle: text.subtitle, xpEarned: 0,
        });
      }
      setState({ activity, activityError: null });
    } catch (e: any) {
      setState({ activity: [], activityError: `Couldn't load friend activity (${e?.code ?? 'unknown'}).` });
    }
  } catch (e: any) {
    setState({ status: 'error', error: `Couldn't load your circle (${e?.code ?? 'unknown'}).` });
  }
}

export async function refreshSocial() {
  if (!state.userId) return;
  await loadSocial(state.userId);
}
export async function refreshFriendPresence() {}

// ---- notifications (users/{uid}/notifications) ----
const prefixed = (n: Notif) => (n.type === 'follow' ? `social:${n.id}` : `inapp:${n.id}`);
const rawId = (id: string) => id.replace(/^(social|inapp):/, '');
function toSocialNotification(n: Notif): SocialNotification {
  return { id: prefixed(n), type: n.type, actorName: n.fromName, actorAvatarUrl: null, readAt: n.read ? n.createdAt : null, createdAt: n.createdAt, title: describeNotif(n), body: '', href: '/social' as Href };
}

let stopNotifs: (() => void) | null = null;
function startFor(userId: string | null) {
  if (userId === state.userId) return;
  stopNotifs?.(); stopNotifs = null;
  state = { ...EMPTY, userId };
  listeners.forEach((l) => l());
  if (!userId) return;
  setState({ status: 'loading' });
  void loadSocial(userId);
  stopNotifs = watchNotifs(userId, (list) => setState({ notifications: list.map(toSocialNotification) }));
}

let started = false;
function ensureStarted() {
  if (started) return;
  started = true;
  onAuthStateChanged(auth, (u) => startFor(u?.uid ?? null));
  startFor(auth.currentUser?.uid ?? null);
}

function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }

export function useSocial(): State {
  useEffect(ensureStarted, []);
  return useSyncExternalStore(subscribe, () => state, () => state);
}
export function useSocialUsername(): string | null { return useSocial().username; }
export function useFriendList(): SocialPerson[] { return useSocial().people; }

export async function sendFriendRequest(targetUserId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid || !state.username) throw new Error('Sign in to follow classmates.');
  const target = await fetchUser(targetUserId);
  if (!target) throw new Error('That student no longer exists.');
  await follow({ uid, username: state.username }, { uid: targetUserId, username: target.username });
  await refreshSocial();
}
export async function respondToFriendRequest(_friendshipId: string, _accept: boolean) { await refreshSocial(); }
export async function removeFriendship(friendshipId: string) {
  const [a, b] = friendshipId.split('_');
  if (a && b) await unfollow(a, b);
  await refreshSocial();
}

export async function searchLearners(searchQuery: string): Promise<SocialPerson[]> {
  const hits = await searchUsers(searchQuery).catch(() => []);
  const mine = new Set(state.people.map((p) => p.userId));
  const found = await resolveNames(hits.map((h) => h.uid));
  return hits.filter((h) => h.uid !== state.userId).map((h) => ({
    userId: h.uid, friendshipId: null, username: h.username, displayName: found.get(h.uid) ?? h.username, avatarUrl: null,
    relationship: mine.has(h.uid) ? 'friends' : 'none', totalXp: null, weeklyXp: null, streak: null, since: null, isOnline: false,
  }));
}
export async function getRecommendedFriends(): Promise<SocialRecommendation[]> {
  if (!state.userId) return [];
  const me = await fetchUser(state.userId).catch(() => null);
  const list = await suggestFollows({ uid: state.userId, hall: me?.hall, semester: me?.semester }).catch(() => []);
  const found = await resolveNames(list.map((s) => s.uid));
  return list.map((s) => ({
    userId: s.uid, friendshipId: null, username: s.username, displayName: found.get(s.uid) ?? s.username, avatarUrl: null, relationship: 'none' as Relationship,
    totalXp: null, weeklyXp: null, streak: null, since: null, isOnline: false, sameClass: /classmate|hall/i.test(s.reason), sharedConnections: 0,
  }));
}

export function toAppNotification(n: SocialNotification): AppNotification {
  return { id: n.id, group: 'updates', title: n.title, body: n.body, at: n.createdAt, href: n.href, icon: n.type === 'follow' ? 'social' : 'bell', tone: 'primary' };
}
export function markSocialNotificationsRead(ids: string[]) {
  const uid = state.userId;
  const mine = ids.filter((i) => /^(social|inapp):/.test(i)).map(rawId);
  if (!uid || !mine.length) return;
  void markRead(uid, mine);
}
export function readSocialNotificationIds(records: SocialNotification[] = state.notifications): string[] {
  return records.filter((n) => n.readAt !== null).map((n) => n.id);
}
export function socialAppNotifications(records: SocialNotification[] = state.notifications): AppNotification[] {
  return records.map(toAppNotification);
}
