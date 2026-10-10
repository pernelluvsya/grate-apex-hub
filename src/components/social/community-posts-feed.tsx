import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { optimized, poster } from '@/media';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform, Share, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Card, Interactive } from '@/components/ui/interactive';
import { Pill } from '@/components/ui/pill';
import { Sheet } from '@/components/ui/sheet';
import { addPostComment, createCommunityPost, deleteCommunityPost, listCommunityFeed, listPostComments, reportCommunityContent, togglePostLike, type CommunityMedia, type CommunityPost } from '@/data/community';
import { personName, type SocialPerson, useSocial } from '@/data/social';
import { useDisplayName } from '@/data/user';
import { useAuth } from '@/hooks/use-auth';
import { Radius, Type, type ThemeColors } from '@/constants/theme';
import { MentionInput } from '@/components/social/mention-input';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

// Twitter-style framing: follow the photo's own shape, but keep it between a tall 4:5 and a wide 1.91:1.
const ratioOf = (w?: number | null, h?: number | null) => (w && h ? Math.min(1.91, Math.max(0.8, w / h)) : 16 / 9);

type PostComment = { id: string; author_id: string; body: string; created_at: string };

export function CommunityPostsFeed() {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const social = useSocial();
  const { user } = useAuth();
  const displayName = useDisplayName();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [media, setMedia] = useState<CommunityMedia | undefined>();
  const [busy, setBusy] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [notice, setNotice] = useState('');
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const nextPosts = await listCommunityFeed();
      setPosts(nextPosts);
      setSelectedPost((current) => current ? nextPosts.find((post) => post.id === current.id) ?? current : current);
    }
    catch (caught) { setError(getErrorMessage(caught, 'Could not load posts.')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { queueMicrotask(() => { void refresh(); }); }, [refresh]);

  useEffect(() => {
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, []);

  async function chooseMedia() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { setError('Allow photo library access to attach media.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.85, videoMaxDuration: 60 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const type = asset.type === 'video' ? 'video' : 'image';
    setMedia({ uri: asset.uri, type, mimeType: asset.mimeType ?? (type === 'video' ? 'video/mp4' : 'image/jpeg'), filename: asset.fileName ?? `grateapex-${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`, size: asset.fileSize, width: asset.width, height: asset.height });
    setError(null);
  }

  async function publish(resharedPostId?: string) {
    if ((!draft.trim() && !media && !resharedPostId) || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createCommunityPost(draft, media, resharedPostId);
      setDraft('');
      setMedia(undefined);
      setComposeOpen(false);
      setNotice(resharedPostId ? 'Reposted to your feed.' : 'Your post is live for your friends.');
      await refresh();
    } catch (caught) { setError(getErrorMessage(caught, 'Could not publish this post.')); }
    finally { setBusy(false); }
  }

  async function like(post: CommunityPost) {
    try {
      const liked = await togglePostLike(post.id);
      setPosts((all) => all.map((item) => item.id === post.id ? { ...item, my_reaction: liked ? 'like' : null, reactions: Math.max(0, item.reactions + (liked ? 1 : -1)) } : item));
      setSelectedPost((item) => item?.id === post.id ? { ...item, my_reaction: liked ? 'like' : null, reactions: Math.max(0, item.reactions + (liked ? 1 : -1)) } : item);
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not update this reaction.'));
    }
  }

  async function sharePost(post: CommunityPost) {
    const appUrl = 'https://grateapex.vercel.app/';
    const message = `${post.body.trim() || 'A post from my GrAteApex Hub community'}\n\n${appUrl}`;
    try {
      if (Platform.OS === 'web') {
        const browserNavigator = globalThis.navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
        if (typeof browserNavigator.share === 'function') {
          await browserNavigator.share({ title: 'GrAteApex Hub', text: post.body.trim(), url: appUrl });
        } else if (browserNavigator.clipboard?.writeText) {
          await browserNavigator.clipboard.writeText(message);
          setNotice('Post text and app link copied.');
        } else {
          setNotice(message);
        }
        return;
      }
      const result = await Share.share({ message, title: 'GrAteApex Hub' });
      if (result.action === Share.sharedAction) setNotice('Post shared.');
    } catch (caught) {
      if (caught instanceof Error && caught.name === 'AbortError') return;
      setError(getErrorMessage(caught, 'Could not share this post.'));
    }
  }

  async function openPost(post: CommunityPost) {
    setSelectedPost(post);
    setComments([]);
    setCommentDraft('');
    try { setComments(await listPostComments(post.id) as PostComment[]); }
    catch (caught) { setError(getErrorMessage(caught, 'Could not load comments.')); }
  }

  async function sendComment() {
    if (!selectedPost || !commentDraft.trim()) return;
    setBusy(true);
    try {
      await addPostComment(selectedPost.id, commentDraft);
      setCommentDraft('');
      setComments(await listPostComments(selectedPost.id) as PostComment[]);
      setPosts((all) => all.map((post) => post.id === selectedPost.id ? { ...post, comments: post.comments + 1 } : post));
      setSelectedPost((post) => post?.id === selectedPost.id ? { ...post, comments: post.comments + 1 } : post);
    } catch (caught) { setError(getErrorMessage(caught, 'Could not add your comment.')); }
    finally { setBusy(false); }
  }

  async function report(targetType: 'post' | 'comment' | 'user', id: string) {
    try { await reportCommunityContent(targetType, id); setNotice('Thanks. Your report has been sent privately for review.'); }
    catch (caught) { setError(getErrorMessage(caught, 'Could not send the report.')); }
  }

  async function deletePost(post: CommunityPost) {
    try {
      await deleteCommunityPost(post.id);
      setPosts((all) => all.filter((item) => item.id !== post.id));
      setSelectedPost((current) => current?.id === post.id ? null : current);
      setNotice('Post and its attached upload were deleted.');
      setError(null);
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not delete this post.'));
    }
  }

  function confirmDeletePost(post: CommunityPost) {
    if (Platform.OS === 'web') {
      if (globalThis.confirm('Delete this post and its attached photo or video?')) void deletePost(post);
      return;
    }
    Alert.alert('Delete this post?', 'This removes the post and its attached photo or video from your feed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void deletePost(post); } },
    ]);
  }

  return (
    <View style={styles.feed}>
      <Card style={styles.composerCard}>
        <View style={styles.composerHeader}>
          <Avatar name={displayName || 'You'} size={40} ring="subtle" />
          <MentionInput people={social.people} value={draft} onChangeText={setDraft} multiline maxLength={5000} placeholder="Share what’s on your mind" placeholderTextColor={colors.textTertiary} accessibilityLabel="Write a post" style={[styles.postInput, styles.inlineInput]} />
        </View>
        {media ? (
          <View style={styles.previewWrap}>
            {media.type === 'image'
              ? <Image source={{ uri: media.uri }} contentFit="cover" style={[styles.preview, { aspectRatio: ratioOf(media.width, media.height) }]} accessibilityLabel="Selected photo" />
              : <View style={[styles.preview, styles.previewVideo]}><Icon name="play" size={28} color={colors.onPrimary} filled /><Text style={styles.videoText} numberOfLines={1}>{media.filename}</Text></View>}
            <Interactive onPress={() => setMedia(undefined)} accessibilityRole="button" accessibilityLabel="Remove attachment" style={styles.previewRemove}><Icon name="close" size={16} color="#fff" strokeWidth={2.4} /></Interactive>
          </View>
        ) : null}
        <View style={styles.actions}>
          <Button label="Add photo or video" variant="ghost" size="sm" icon={<Icon name="image" size={16} color={colors.primaryText} />} onPress={() => void chooseMedia()} />
          <Button label="Post" size="sm" onPress={() => void publish()} loading={busy} disabled={(!draft.trim() && !media) || busy} />
        </View>
      </Card>
      {notice ? <Text accessibilityRole="text" style={styles.notice}>{notice}</Text> : null}
      {error ? <Card style={styles.errorCard}><Text style={styles.errorTitle}>Community feed issue</Text><Text style={styles.muted}>{error}</Text><Button label="Try again" size="sm" variant="secondary" onPress={() => void refresh()} /></Card> : null}
      {loading ? <Text style={styles.muted}>Loading your friends’ posts…</Text> : null}
      {!loading && !posts.length && !error ? <Card style={styles.empty}><Icon name="social" size={22} color={colors.primaryText} /><Text style={styles.emptyTitle}>Your feed is ready for your circle</Text><Text style={styles.muted}>Posts from you and accepted friends will appear here.</Text></Card> : null}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} socialPeople={social.people} ownId={user?.id ?? social.userId} ownName={displayName || 'You'} onOpen={() => void openPost(post)} onLike={() => void like(post)} onComment={() => void openPost(post)} onReshare={() => void publish(post.id)} onShare={() => void sharePost(post)} onReport={() => void report('post', post.id)} onDelete={() => confirmDeletePost(post)} />
      ))}
      <Sheet visible={selectedPost !== null} onClose={() => setSelectedPost(null)} title="Post" width={640}>
        <View style={styles.postDetailSheet}>
          {selectedPost ? <PostCard post={selectedPost} socialPeople={social.people} ownId={user?.id ?? social.userId} ownName={displayName || 'You'} verticalActions onOpen={() => {}} onLike={() => void like(selectedPost)} onComment={() => void openPost(selectedPost)} onReshare={() => void publish(selectedPost.id)} onShare={() => void sharePost(selectedPost)} onReport={() => void report('post', selectedPost.id)} onDelete={() => confirmDeletePost(selectedPost)} /> : null}
          <View style={styles.replyBox}>
            <Avatar uri={null} name={displayName || 'You'} size={36} />
            <View style={styles.replyField}>
              <MentionInput people={social.people} value={commentDraft} onChangeText={setCommentDraft} maxLength={2000} placeholder="Post your reply" placeholderTextColor={colors.textTertiary} accessibilityLabel="Write a comment" style={styles.replyInput} />
            </View>
            <Button label="Reply" size="sm" onPress={() => void sendComment()} loading={busy} disabled={!commentDraft.trim() || busy} />
          </View>
          <View style={styles.commentList}>
            {comments.map((comment) => {
              const author = social.people.find((person) => person.userId === comment.author_id);
              const mine = comment.author_id === social.userId;
              const who = mine ? 'You' : author ? personName(author) : (comment as { author_name?: string }).author_name ?? 'Username pending';
              return (
                <View key={comment.id} style={styles.comment}>
                  <Avatar uri={author?.avatarUrl ?? null} name={who} size={34} />
                  <View style={styles.commentBody}>
                    <View style={styles.commentHead}>
                      <Text style={styles.commentAuthor} numberOfLines={1}>{who}</Text>
                      <Text style={styles.commentTime}>{new Date(comment.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</Text>
                      {!mine ? <Interactive onPress={() => void report('comment', comment.id)} accessibilityRole="button" accessibilityLabel="Report comment" style={styles.commentReport}><Icon name="warning" size={14} color={colors.textTertiary} /></Interactive> : null}
                    </View>
                    <Text style={styles.body}>{comment.body}</Text>
                  </View>
                </View>
              );
            })}
            {!comments.length ? <Text style={styles.noComments}>No replies yet. Start the conversation.</Text> : null}
          </View>
        </View>
      </Sheet>
    </View>
  );
}

function getErrorMessage(caught: unknown, fallback: string) {
  if (typeof caught === 'string' && caught.trim()) return caught;
  if (caught instanceof Error && caught.message) return caught.message;
  if (caught && typeof caught === 'object' && 'message' in caught && typeof caught.message === 'string' && caught.message.trim()) {
    const code = 'code' in caught && typeof caught.code === 'string' ? ` (${caught.code})` : '';
    return `${caught.message}${code}`;
  }
  return fallback;
}

function PostCard({ post, socialPeople, ownId, ownName, onOpen, onLike, onComment, onReshare, onShare, onReport, onDelete, verticalActions = false }: {
  post: CommunityPost; socialPeople: readonly SocialPerson[]; ownId: string | null; ownName: string;
  onOpen: () => void; verticalActions?: boolean;
  onLike: () => void; onComment: () => void; onReshare: () => void; onShare: () => void; onReport: () => void; onDelete: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const friend = socialPeople.find((person) => person.userId === post.author_id);
  const name = friend ? personName(friend) : post.author_id === ownId ? ownName : 'Username pending';
  const resharedFriend = socialPeople.find((person) => person.userId === post.reshared_author_id);
  const resharedName = post.reshared_author_id === ownId ? ownName : resharedFriend ? personName(resharedFriend) : 'Username pending';
  return (
    <Card style={[styles.postCard, verticalActions && styles.postDetailCard]}>
      <View style={verticalActions ? styles.postDetailLayout : undefined}>
      <View style={verticalActions ? styles.postDetailContent : styles.postContent}>
      <View style={styles.postHead}><Interactive onPress={onOpen} accessibilityRole="button" accessibilityLabel={`Open post by ${name}`} style={styles.postAuthor}><Avatar uri={friend?.avatarUrl ?? null} name={name} size={42} ring="subtle" /><View style={styles.flex}><Text style={styles.author}>{name}</Text><Text style={styles.muted}>{new Date(post.created_at).toLocaleString(undefined, verticalActions ? { dateStyle: 'medium', timeStyle: 'short' } : undefined)}</Text></View></Interactive>{post.reshared_post_id ? <Pill label="Reposted" /> : null}{post.author_id === ownId ? <Button label="Delete" size="sm" variant="ghost" icon={<Icon name="trash" size={16} color={colors.error} />} onPress={onDelete} accessibilityLabel="Delete post" /> : null}</View>
      {post.body ? <Interactive onPress={onOpen} accessibilityRole="button" accessibilityLabel="Open post" style={styles.postBodyOpen}><Text style={styles.body}>{post.body}</Text></Interactive> : null}
      {post.reshared_post_id ? (
        <View style={styles.reshareBox}>
          <Text style={styles.muted}>Original post by {resharedName}</Text>
          {post.reshared_body ? <Text style={styles.body}>{post.reshared_body}</Text> : null}
          {post.reshared_media_url && post.reshared_media_type === 'image' ? <Image source={{ uri: optimized(post.reshared_media_url, 800) }} contentFit="cover" style={[styles.image, { aspectRatio: ratioOf(post.reshared_media_width, post.reshared_media_height) }]} accessibilityLabel="Photo in the original post" /> : null}
          {post.reshared_media_url && post.reshared_media_type === 'video' ? <Interactive onPress={() => void Linking.openURL(post.reshared_media_url!).catch(() => {})} accessibilityRole="link" accessibilityLabel="Play video" style={styles.videoTile}><Image source={{ uri: poster(post.reshared_media_url, 800) }} contentFit="cover" style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} /><View style={styles.playBadge}><Icon name="play" size={26} color="#fff" filled /></View></Interactive> : null}
        </View>
      ) : null}
      {post.media_url && post.media_type === 'image' ? <Interactive onPress={onOpen} accessibilityRole="button" accessibilityLabel="Open photo post"><Image source={{ uri: optimized(post.media_url, 1000) }} contentFit="cover" style={[styles.image, { aspectRatio: ratioOf(post.media_width, post.media_height) }]} accessibilityLabel="Photo in community post" /></Interactive> : null}
      {post.media_url && post.media_type === 'video' ? <Interactive onPress={() => void Linking.openURL(post.media_url!).catch(() => {})} accessibilityRole="link" accessibilityLabel="Play video" style={styles.videoTile}><Image source={{ uri: poster(post.media_url, 1000) }} contentFit="cover" style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} /><View style={styles.playBadge}><Icon name="play" size={26} color="#fff" filled /></View></Interactive> : null}
      {!verticalActions ? <Text style={styles.counts}>{post.reactions} likes · {post.comments} comments</Text> : null}
      {!verticalActions ? <View style={styles.postActions}>
        <Interactive onPress={onLike} accessibilityRole="button" accessibilityLabel={post.my_reaction ? 'Unlike post' : 'Like post'} style={styles.action}><Icon name="heart" size={17} color={post.my_reaction ? colors.primaryText : colors.textSecondary} filled={Boolean(post.my_reaction)} /><Text style={[styles.actionText, post.my_reaction && { color: colors.primaryText }]}>Like</Text></Interactive>
        <Interactive onPress={onComment} accessibilityRole="button" accessibilityLabel={`Comment on post, ${post.comments} comments`} style={styles.action}><Icon name="mail" size={17} color={colors.textSecondary} /><Text style={styles.actionText}>Comment · {post.comments}</Text></Interactive>
        <Interactive onPress={onReshare} accessibilityRole="button" accessibilityLabel={`Repost, ${post.reshares} reshares`} style={styles.action}><Icon name="repost" size={19} color={colors.textSecondary} strokeWidth={2} /><Text style={styles.actionText}>{post.reshares > 0 ? post.reshares : 'Repost'}</Text></Interactive>
        <Interactive onPress={onShare} accessibilityRole="button" accessibilityLabel="Share post" style={styles.action}><Icon name="share" size={17} color={colors.textSecondary} /><Text style={styles.actionText}>Share</Text></Interactive>
        <Interactive onPress={onReport} accessibilityRole="button" accessibilityLabel="Report post" style={styles.action}><Icon name="warning" size={17} color={colors.textSecondary} /><Text style={styles.actionText}>Report</Text></Interactive>
      </View> : null}
      </View>
      {verticalActions ? <View style={styles.detailActions}>
        <Interactive onPress={onComment} accessibilityRole="button" accessibilityLabel={`Reply, ${post.comments} replies`} style={styles.detailAction}><Icon name="mail" size={20} color={colors.textSecondary} /><Text style={styles.detailCount}>{post.comments || ''}</Text></Interactive>
        <Interactive onPress={onReshare} accessibilityRole="button" accessibilityLabel="Repost" style={styles.detailAction}><Icon name="repost" size={21} color={colors.textSecondary} strokeWidth={2} /><Text style={styles.detailCount}>{post.reshares || ''}</Text></Interactive>
        <Interactive onPress={onLike} accessibilityRole="button" accessibilityLabel={`${post.my_reaction ? 'Unlike' : 'Like'} post, ${post.reactions} likes`} style={styles.detailAction}><Icon name="heart" size={20} color={post.my_reaction ? colors.primaryText : colors.textSecondary} filled={Boolean(post.my_reaction)} /><Text style={[styles.detailCount, post.my_reaction && { color: colors.primaryText }]}>{post.reactions || ''}</Text></Interactive>
        <Interactive onPress={onShare} accessibilityRole="button" accessibilityLabel="Share post" style={styles.detailAction}><Icon name="share" size={20} color={colors.textSecondary} /></Interactive>
        <Interactive onPress={onReport} accessibilityRole="button" accessibilityLabel="Report post" style={styles.detailAction}><Icon name="warning" size={19} color={colors.textTertiary} /></Interactive>
      </View> : null}
      </View>
    </Card>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    feed: { gap: 12, marginBottom: 16 },
    notice: { ...Type.caption, color: colors.successText },
    composerCard: { gap: 12, borderWidth: 0 },
    composerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    composerPrompt: { ...Type.callout, color: colors.textSecondary },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' },
    inlineInput: { flex: 1, minHeight: 48, paddingVertical: 10, borderWidth: 0, backgroundColor: 'transparent', ...(Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0, boxShadow: 'none' } as object) : null) },
    postCard: { gap: 11 },
    postDetailCard: { padding: 0, borderWidth: 0, backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0, shadowColor: 'transparent' as any, boxShadow: 'none' as any },
    postDetailLayout: { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
    postDetailContent: { flex: 1, minWidth: 0, gap: 11 },
    postContent: { gap: 11 },
    postBodyOpen: { alignSelf: 'stretch' },
    postHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    postAuthor: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
    flex: { flex: 1, minWidth: 0 },
    author: { ...Type.headline, color: colors.text },
    body: { ...Type.callout, color: colors.text, lineHeight: 21 },
    muted: { ...Type.caption, color: colors.textTertiary },
    counts: { ...Type.caption, color: colors.textTertiary },
    image: { width: '100%', maxWidth: 420, maxHeight: 360, alignSelf: 'flex-start', borderRadius: 16, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.hairline },
    videoTile: { width: '100%', maxWidth: 420, aspectRatio: 16 / 9, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
    playBadge: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
    previewWrap: { width: '100%', maxWidth: 260, alignSelf: 'flex-start' },
    preview: { width: '100%', borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surfaceMuted, maxHeight: 220 },
    previewVideo: { aspectRatio: 16 / 9, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', gap: 6 },
    previewRemove: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
    video: { minHeight: 180, borderRadius: 14, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', gap: 8 },
    videoText: { ...Type.caption, color: colors.onSecondary },
    reshareBox: { gap: 9, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, backgroundColor: colors.surfaceMuted },
    postActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 8, gap: 8 },
    postActionsVertical: { width: 62, alignItems: 'center', gap: 14, borderLeftWidth: 1, borderLeftColor: colors.divider, paddingLeft: 8, paddingTop: 8 },
    railAction: { minWidth: 48, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 3 },
    railCount: { ...Type.caption, fontWeight: '800', color: colors.textSecondary },
    railLabel: { ...Type.caption, color: colors.textSecondary },
    action: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 7 },
    actionText: { ...Type.caption, fontWeight: '700', color: colors.textSecondary },
    composeSheet: { gap: 12 },
    postInput: { minHeight: 140, textAlignVertical: 'top', padding: 13, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 14, backgroundColor: colors.surfaceSunken, color: colors.text, fontSize: 15 },
    mediaSelected: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    input: { minHeight: 42, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: Radius.md, backgroundColor: colors.surfaceSunken, paddingHorizontal: 12, color: colors.text, fontSize: 14 },
    postDetailSheet: { gap: 14 },
    detailActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.divider, paddingVertical: 4, marginTop: 2 },
    detailAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9 },
    detailCount: { ...Type.caption, fontWeight: '800', color: colors.textSecondary, minWidth: 8 },
    replyBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    replyField: { flex: 1, minWidth: 0 },
    replyInput: { minHeight: 40, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: colors.surfaceSunken, color: colors.text, fontSize: 15, borderWidth: 0, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as object) : null) },
    commentList: { gap: 2 },
    commentBody: { flex: 1, minWidth: 0, gap: 3 },
    commentTime: { ...Type.caption, color: colors.textTertiary },
    commentReport: { marginLeft: 'auto', padding: 4 },
    noComments: { ...Type.callout, color: colors.textSecondary, textAlign: 'center', paddingVertical: 18 },
    comment: { flexDirection: 'row', gap: 10, paddingVertical: 10 },
    commentAuthor: { ...Type.callout, fontWeight: '800', color: colors.text, flexShrink: 1 },
    commentHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    empty: { gap: 9, alignItems: 'center', padding: 20 },
    emptyTitle: { ...Type.title3, color: colors.text, textAlign: 'center' },
    errorCard: { gap: 8 },
    errorTitle: { ...Type.headline, color: colors.error },
  });
}
