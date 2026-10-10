import { resolveNames } from '@/names';
import { deleteDoc, doc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import { addComment, hasLiked, listComments, origOf, reshare, setLike, type Ref } from '@/engage';
import { cleanMedia, uploadAsset, type Media } from '@/media';
import { fetchFeed, fetchFollowing, fetchUser, postActivity, type Activity } from '@/social';
import { addStory, deleteStory, fetchStories, STORY_MS } from '@/stories';

// Home's posts and stories, stored in the hub's own collections:
//   users/{uid}/activity   posts and reshares (type "post" / "reshare"), with likes + comments underneath
//   users/{uid}/stories    24-hour stories
// Ids handed to the UI are "<ownerUid>:<docId>" so a post can always be found again.

export type CommunityMedia = { uri: string; type: 'image' | 'video'; mimeType: string; size?: number; filename: string; width?: number; height?: number };

export type CommunityStory = {
  id: string; author_id: string; body: string | null; media_path: string | null;
  media_url?: string | null; media_type?: 'image' | 'video' | null; created_at: string; expires_at: string;
};

export type CommunityPost = {
  id: string; author_id: string; author_name?: string | null; author_avatar?: string | null; body: string;
  media_path: string | null; media_type: 'image' | 'video' | null; media_url?: string | null; media_width?: number | null; media_height?: number | null;
  reshared_post_id: string | null; reshared_author_id?: string | null; reshared_body?: string | null;
  reshared_media_url?: string | null; reshared_media_type?: string | null; reshared_media_width?: number | null; reshared_media_height?: number | null;
  created_at: string; reactions: number; comments: number; reshares: number; my_reaction: 'like' | null;
};

const ms = (t: any): number => (t?.toMillis ? t.toMillis() : typeof t === 'number' ? t : Date.now());
const iso = (t: any) => new Date(ms(t)).toISOString();
const pack = (owner: string, id: string) => `${owner}:${id}`;
const unpack = (key: string): { owner: string; id: string } => {
  const i = key.indexOf(':');
  return { owner: key.slice(0, i), id: key.slice(i + 1) };
};

async function me(): Promise<{ uid: string; username: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to use community features.');
  const profile = await fetchUser(user.uid);
  if (!profile?.username) throw new Error('Pick a username first.');
  return { uid: user.uid, username: profile.username };
}

async function circle(uid: string): Promise<string[]> {
  return [uid, ...(await fetchFollowing(uid).catch(() => [] as string[]))];
}

async function upload(media?: CommunityMedia): Promise<Media | null> {
  if (!media) return null;
  return uploadAsset({ uri: media.uri, fileName: media.filename, mimeType: media.mimeType, fileSize: media.size, isVideo: media.type === 'video' });
}

// ---- stories ----
export async function listLiveStories(): Promise<CommunityStory[]> {
  const user = auth.currentUser;
  if (!user) return [];
  const groups = await fetchStories(await circle(user.uid), user.uid);
  return groups.flatMap((g) =>
    g.stories.map((s): CommunityStory => ({
      id: pack(g.uid, s.id), author_id: g.uid, body: s.text ?? null, media_path: null,
      media_url: s.media?.url ?? null, media_type: s.media?.t ?? null,
      created_at: iso(s.createdAt), expires_at: new Date(ms(s.createdAt) + STORY_MS).toISOString(),
    }))
  );
}

export async function createCommunityStory(body: string, media?: CommunityMedia): Promise<CommunityStory> {
  const who = await me();
  const uploaded = await upload(media);
  const text = body.trim();
  if (!uploaded && !text) throw new Error('Add a photo, a video or some text.');
  await addStory(who, { media: uploaded ?? undefined, text: text || undefined });
  const now = Date.now();
  return {
    id: pack(who.uid, `new_${now}`), author_id: who.uid, body: text || null, media_path: null,
    media_url: uploaded?.url ?? null, media_type: uploaded?.t ?? null,
    created_at: new Date(now).toISOString(), expires_at: new Date(now + STORY_MS).toISOString(),
  };
}

export async function deleteCommunityStory(storyId: string, _mediaPath: string | null) {
  const { owner, id } = unpack(storyId);
  if (owner !== auth.currentUser?.uid) return;
  await deleteStory(owner, id);
}

// ---- posts ----
function toPost(a: Activity, liked: boolean): CommunityPost {
  const d = a.data ?? {};
  const first: Media | undefined = Array.isArray(d.media) ? d.media[0] : undefined;
  const orig = a.type === 'reshare' ? d.orig : null;
  const origMedia: Media | undefined = orig && Array.isArray(orig.media) ? orig.media[0] : undefined;
  return {
    id: pack(a.uid, a.id), author_id: a.uid, author_name: a.username, author_avatar: null,
    body: typeof d.text === 'string' ? d.text : '',
    media_path: null, media_type: first?.t ?? null, media_url: first?.url ?? null, media_width: first?.w ?? null, media_height: first?.h ?? null,
    reshared_post_id: orig ? pack(orig.uid, orig.id) : null, reshared_author_id: orig?.uid ?? null,
    reshared_body: orig?.text ?? null, reshared_media_url: origMedia?.url ?? null, reshared_media_type: origMedia?.t ?? null, reshared_media_width: origMedia?.w ?? null, reshared_media_height: origMedia?.h ?? null,
    created_at: iso(a.createdAt), reactions: a.likeCount ?? 0, comments: a.commentCount ?? 0, reshares: 0,
    my_reaction: liked ? 'like' : null,
  };
}
const refFor = (key: string): Ref => { const { owner, id } = unpack(key); return { kind: 'activity', owner, id }; };

export async function listCommunityFeed(limitCount = 50): Promise<CommunityPost[]> {
  const user = auth.currentUser;
  if (!user) return [];
  const items = (await fetchFeed(await circle(user.uid), 10, 120))
    .filter((a) => a.type === 'post' || a.type === 'reshare')
    .slice(0, limitCount);
  const liked = await Promise.all(items.map((a) => hasLiked({ kind: 'activity', owner: a.uid, id: a.id }, user.uid).catch(() => false)));
  const names = await resolveNames(items.map((a) => a.uid));
  return items.map((a, i) => ({ ...toPost(a, liked[i]), author_name: names.get(a.uid) ?? a.username }));
}

export async function createCommunityPost(body: string, media?: CommunityMedia, resharedPostId?: string | null): Promise<CommunityPost> {
  const who = await me();
  const text = body.trim().slice(0, 280);
  const now = Date.now();
  if (resharedPostId) {
    const { owner, id } = unpack(resharedPostId);
    const source = (await fetchFeed([owner], 20, 40)).find((a) => a.id === id);
    const orig = source ? origOf(source) : null;
    if (!orig) throw new Error('That post is no longer available.');
    await reshare(who, orig, text);
    return { ...toPost({ id: `new_${now}`, uid: who.uid, type: 'reshare', username: who.username, data: { orig, text }, createdAt: now } as Activity, false) };
  }
  const uploaded = await upload(media);
  if (!text && !uploaded) throw new Error('Write something or add a photo.');
  const data: Record<string, any> = { text };
  if (uploaded) data.media = cleanMedia([uploaded]);
  await postActivity(who.uid, who.username, 'post', data, true);
  return toPost({ id: `new_${now}`, uid: who.uid, type: 'post', username: who.username, data, createdAt: now } as Activity, false);
}

export async function deleteCommunityPost(postId: string) {
  const { owner, id } = unpack(postId);
  if (owner !== auth.currentUser?.uid) return;
  await deleteDoc(doc(db, 'users', owner, 'activity', id));
}

export async function togglePostLike(postId: string): Promise<boolean> {
  const who = await me();
  const ref = refFor(postId);
  const was = await hasLiked(ref, who.uid);
  await setLike(ref, who, !was);
  return !was;
}

export async function addPostComment(postId: string, body: string) {
  const who = await me();
  const text = body.trim();
  if (!text) return;
  await addComment(refFor(postId), who, text);
}

export async function listPostComments(postId: string) {
  const list = await listComments(refFor(postId));
  const names = await resolveNames(list.map((c) => c.authorUid));
  return list.map((c) => ({ id: c.id, author_id: c.authorUid, author_name: names.get(c.authorUid) ?? c.authorName, body: c.body, created_at: iso(c.createdAt) }));
}

// Reports go to the same support inbox the rest of the hub uses once that endpoint is wired; for now the report is accepted quietly.
export async function reportCommunityContent(
  _targetType: 'post' | 'comment' | 'user' | 'group' | 'message', _targetId: string, _reason = 'Reported for review'
) {}
export async function blockCommunityUser(_blockedId: string, _friendshipId?: string | null) {}
