import { router } from '@/lib/router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { useEffect, useId, useMemo, useState } from 'react';
import { Alert, Linking, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Card } from '@/components/ui/interactive';
import { SectionHeader } from '@/components/ui/screen';
import { Sheet } from '@/components/ui/sheet';
import { createCommunityStory, deleteCommunityStory, listLiveStories, type CommunityMedia, type CommunityStory } from '@/data/community';
import { personName, refreshSocial, type FriendActivity, type SocialPerson, useSocial } from '@/data/social';
import { useAvatarUrl, useDisplayName } from '@/data/user';
import { type ThemeColors, Type } from '@/constants/theme';
import { useTheme, useThemedStyles } from '@/hooks/use-theme';

/** Feed built only from friend profiles and activity. */
export function SocialActivityFeed({ children }: { children?: ReactNode }) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const social = useSocial();
  const displayName = useDisplayName();
  const avatarUrl = useAvatarUrl();
  const insets = useSafeAreaInsets();
  const [stories, setStories] = useState<CommunityStory[]>([]);
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyDraft, setStoryDraft] = useState('');
  const [storyMedia, setStoryMedia] = useState<CommunityMedia | undefined>();
  const [storyBusy, setStoryBusy] = useState(false);
  const [storyDeleting, setStoryDeleting] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [storySequence, setStorySequence] = useState<CommunityStory[]>([]);
  const [storyIndex, setStoryIndex] = useState(0);
  const friends = social.people.filter((person) => person.relationship === 'friends');
  const myStories = useMemo(() => stories.filter((story) => story.author_id === social.userId).sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)), [stories, social.userId]);
  const myStory = myStories[myStories.length - 1];
  const friendStoryGroups = useMemo(() => {
    const groups = new Map<string, CommunityStory[]>();
    for (const story of stories) {
      if (story.author_id === social.userId) continue;
      const group = groups.get(story.author_id) ?? [];
      group.push(story);
      groups.set(story.author_id, group);
    }
    return [...groups.entries()]
      .map(([authorId, items]) => ({ authorId, items: items.sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)) }))
      .sort((a, b) => Date.parse(b.items[b.items.length - 1].created_at) - Date.parse(a.items[a.items.length - 1].created_at));
  }, [stories, social.userId]);
  const selectedStory = storySequence[storyIndex] ?? null;

  async function refreshStories() {
    setStoryError(null);
    try {
      setStories(await listLiveStories());
    } catch (caught) {
      setStoryError(caught instanceof Error ? caught.message : 'Stories need the community database migration.');
    }
  }

  useEffect(() => { queueMicrotask(() => { void refreshStories(); }); }, []);

  useEffect(() => {
    if (!selectedStory || selectedStory.media_type === 'video') return;
    const timer = setTimeout(() => {
      if (storyIndex + 1 < storySequence.length) setStoryIndex((index) => index + 1);
      else { setStorySequence([]); setStoryIndex(0); }
    }, 6000);
    return () => clearTimeout(timer);
  }, [selectedStory, storyIndex, storySequence.length]);

  function openStorySequence(sequence: CommunityStory[]) {
    setStorySequence(sequence);
    setStoryIndex(0);
  }

  function closeStorySequence() {
    setStorySequence([]);
    setStoryIndex(0);
  }

  function stepStory(direction: -1 | 1) {
    const next = storyIndex + direction;
    if (next < 0) return;
    if (next >= storySequence.length) closeStorySequence();
    else setStoryIndex(next);
  }

  async function publishStory() {
    if ((!storyDraft.trim() && !storyMedia) || storyBusy) return;
    setStoryBusy(true);
    setStoryError(null);
    try {
      await createCommunityStory(storyDraft, storyMedia);
      setStoryDraft('');
      setStoryMedia(undefined);
      setStoryOpen(false);
      await refreshStories();
    } catch (caught) {
      setStoryError(caught instanceof Error ? caught.message : 'Could not share your story.');
    } finally {
      setStoryBusy(false);
    }
  }

  async function deleteStory(story: CommunityStory) {
    if (storyDeleting) return;
    setStoryDeleting(true);
    setStoryError(null);
    try {
      await deleteCommunityStory(story.id, story.media_path);
      setStories((all) => all.filter((item) => item.id !== story.id));
      const remaining = storySequence.filter((item) => item.id !== story.id);
      if (!remaining.length) closeStorySequence();
      else {
        setStorySequence(remaining);
        setStoryIndex((index) => Math.min(index, remaining.length - 1));
      }
    } catch (caught) {
      setStoryError(caught instanceof Error ? caught.message : 'Could not delete this story.');
    } finally {
      setStoryDeleting(false);
    }
  }

  function confirmDeleteStory(story: CommunityStory) {
    if (Platform.OS === 'web') {
      if (globalThis.confirm('Delete this story and its attached photo or video?')) void deleteStory(story);
      return;
    }
    Alert.alert('Delete this story?', 'This removes the story and its attached photo or video.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void deleteStory(story); } },
    ]);
  }

  async function chooseStoryMedia() {
    // On web, open the file chooser directly from the click handler. Awaiting a
    // permission promise first loses the browser's user-gesture activation.
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setStoryError('Allow photo library access to add a photo or video to your story.');
        return;
      }
    }
    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.85, videoMaxDuration: 60 });
    } catch (caught) {
      setStoryError(caught instanceof Error ? caught.message : 'Could not open your photo library.');
      return;
    }
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const type = asset.type === 'video' ? 'video' : 'image';
    const fallbackExtension = type === 'video' ? 'mp4' : 'jpg';
    setStoryMedia({
      uri: asset.uri,
      type,
      mimeType: asset.mimeType ?? (type === 'video' ? 'video/mp4' : 'image/jpeg'),
      filename: asset.fileName ?? `grateapex-story-${Date.now()}.${fallbackExtension}`,
      size: asset.fileSize,
      width: asset.width,
      height: asset.height,
    });
    setStoryError(null);
  }

  return (
    <View style={styles.feed}>
      <View style={styles.storiesSection}>
        <SectionHeader
          title="Stories"
          subtitle="Quick moments from your circle"
          style={styles.noMargin}
          right={<Button label="Add story" size="sm" onPress={() => setStoryOpen(true)} />}
        />
        {storyError ? <Text style={styles.errorText}>{storyError}</Text> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendStrip}>
          <Pressable
            onPress={() => myStories.length ? openStorySequence(myStories) : setStoryOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={myStory ? 'View your posted story' : 'Add a story'}
            style={styles.friendItem}
          >
            <View style={styles.storyAvatarWrap}>
              <StoryAvatar uri={avatarUrl} name={displayName || 'You'} hasStory={Boolean(myStory)} />
              {myStory ? <View style={styles.postedMark}><Icon name="check" size={10} color={colors.onPrimary} /></View> : <View style={styles.addBadge}><Icon name="plus" size={12} color={colors.primaryText} /></View>}
            </View>
            <Text style={styles.friendName} numberOfLines={1}>Your story</Text>
            <Text style={styles.storyMeta} numberOfLines={1}>{myStory ? 'Posted · tap to view' : 'Add a moment'}</Text>
          </Pressable>
          {friendStoryGroups.map(({ authorId, items }) => {
            const friend = social.people.find((person) => person.userId === authorId);
            const name = friend ? personName(friend) : 'Username pending';
            return (
              <Pressable key={authorId} onPress={() => openStorySequence(items)} accessibilityRole="button" accessibilityLabel={`View ${items.length} ${items.length === 1 ? 'story' : 'stories'} from ${name}`} style={styles.friendItem}>
                <StoryAvatar uri={friend?.avatarUrl ?? null} name={name} hasStory />
                <Text style={styles.friendName} numberOfLines={1}>{name}</Text>
                {items.length > 1 ? <Text style={styles.storyMeta}>{items.length} stories</Text> : <Text style={styles.storyMeta}>View story</Text>}
              </Pressable>
            );
          })}
        </ScrollView>
        {!friends.length ? (
          <View style={styles.emptyRow}>
            <Text style={styles.muted}>
              {social.status === 'loading'
                ? 'Loading your real friend list…'
                : social.status === 'error'
                  ? social.error ?? 'Could not load your friend list.'
                  : social.userId
                    ? 'No friends are connected yet. This row will fill with real classmates when you connect.'
                    : 'Sign in and connect with classmates to see your circle here.'}
            </Text>
            {social.userId ? <Button label="Find classmates" variant="secondary" size="sm" onPress={() => router.push('/social/friends')} /> : null}
          </View>
        ) : null}
      </View>

      {children}

      <SectionHeader title="From your people" subtitle="Recent study activity shared by your actual friends." style={styles.feedHeader} />

      {social.status === 'error' ? (
        <Card style={styles.card}>
          <Text style={styles.errorTitle}>Couldn’t load your social feed</Text>
          <Text style={styles.muted}>{social.error ?? 'Check your connection and try again.'}</Text>
          <Button label="Try again" variant="secondary" size="sm" onPress={() => void refreshSocial()} />
        </Card>
      ) : social.activityError ? (
        <Card style={styles.card}>
          <Text style={styles.errorTitle}>Friend activity is unavailable</Text>
          <Text style={styles.muted}>{social.activityError}</Text>
          <Text style={styles.muted}>No sample activity is shown. Try refreshing your social data.</Text>
          <Button label="Try again" variant="secondary" size="sm" onPress={() => void refreshSocial()} />
        </Card>
      ) : social.activity.length ? (
        <View style={styles.activityGrid}>
          {social.activity.slice(0, 12).map((item) => (
            <View key={item.id} style={styles.activityTile}>
              <ActivityCard item={item} />
            </View>
          ))}
        </View>
      ) : (
        <Card style={styles.card}>
          <View style={styles.emptyMark}><Icon name="social" size={21} color={colors.primaryText} /></View>
          <Text style={styles.emptyTitle}>{social.status === 'loading' ? 'Loading friend activity…' : 'No shared activity yet'}</Text>
          <Text style={styles.muted}>
            {friends.length
              ? 'When your friends share a lesson, topic, or Apex Challenge milestone, it will appear here.'
              : 'Connect with classmates to see their real shared activity here.'}
          </Text>
          {!friends.length && social.userId ? <Button label="Find classmates" variant="secondary" size="sm" onPress={() => router.push('/social/friends')} /> : null}
        </Card>
      )}

      <Sheet visible={storyOpen} onClose={() => setStoryOpen(false)} title="Share a story" subtitle="Add text, a photo or a video. Stories expire after 24 hours.">
        <View style={styles.composer}>
          <TextInput value={storyDraft} onChangeText={setStoryDraft} multiline maxLength={500} placeholder="What would you like your friends to see?" placeholderTextColor={colors.textTertiary} accessibilityLabel="Write a story" style={styles.storyInput} />
          {storyMedia ? (
            <View style={styles.previewWrap}>
              {storyMedia.type === 'image'
                ? <Image source={{ uri: storyMedia.uri }} contentFit="cover" style={[styles.preview, { aspectRatio: previewRatio(storyMedia.width, storyMedia.height) }]} accessibilityLabel="Selected photo" />
                : <View style={[styles.preview, styles.previewVideo]}><Icon name="play" size={28} color={colors.onPrimary} filled /><Text style={styles.muted} numberOfLines={1}>{storyMedia.filename}</Text></View>}
              <Pressable onPress={() => setStoryMedia(undefined)} accessibilityRole="button" accessibilityLabel="Remove attachment" style={styles.previewRemove}><Icon name="close" size={16} color="#fff" strokeWidth={2.4} /></Pressable>
            </View>
          ) : null}
          {storyError ? <Text style={styles.errorText}>{storyError}</Text> : null}
          <View style={styles.storyActions}>
            <Button label="Add photo or video" variant="secondary" size="sm" onPress={() => void chooseStoryMedia()} disabled={storyBusy} />
            <Button label="Share story" onPress={() => void publishStory()} loading={storyBusy} disabled={(!storyDraft.trim() && !storyMedia) || storyBusy} />
          </View>
        </View>
      </Sheet>
      <Modal visible={selectedStory !== null} transparent animationType="fade" onRequestClose={closeStorySequence}>
        {selectedStory ? (
          <View style={[styles.storyModal, { paddingTop: Math.max(insets.top, 14), paddingBottom: Math.max(insets.bottom, 14) }]}>
            <View style={styles.storyProgress}>{storySequence.map((item, index) => <View key={item.id} style={styles.storyProgressTrack}><View style={[styles.storyProgressFill, index < storyIndex && styles.storyProgressDone, index === storyIndex && styles.storyProgressCurrent]} /></View>)}</View>
            <View style={styles.storyModalHeader}>
              <Avatar uri={selectedStory.author_id === social.userId ? avatarUrl : social.people.find((person) => person.userId === selectedStory.author_id)?.avatarUrl} name={storyAuthorName(selectedStory, social.people, social.userId, displayName)} size={38} />
              <View style={styles.storyModalByline}><Text style={styles.storyModalName}>{storyAuthorName(selectedStory, social.people, social.userId, displayName)}</Text><Text style={styles.storyModalTime}>{timeAgo(new Date(selectedStory.created_at).getTime())}</Text></View>
              {selectedStory.author_id === social.userId ? <Button label="Delete" variant="ghost" size="sm" icon={<Icon name="trash" size={16} color={colors.error} />} onPress={() => confirmDeleteStory(selectedStory)} disabled={storyDeleting} /> : null}
              <Pressable onPress={closeStorySequence} accessibilityRole="button" accessibilityLabel="Close story" style={styles.storyClose}><Icon name="close" size={20} color={colors.text} /></Pressable>
            </View>
            <View style={styles.storyModalBody}>
              {selectedStory.media_url && selectedStory.media_type === 'image' ? <Image source={{ uri: selectedStory.media_url }} contentFit="contain" style={styles.storyImage} accessibilityLabel="Story photo" /> : null}
              {selectedStory.media_url && selectedStory.media_type === 'video' ? <Button label="Play story video" variant="secondary" icon={<Icon name="play" size={16} color={colors.primaryText} filled />} onPress={() => void Linking.openURL(selectedStory.media_url!).catch(() => setStoryError('Could not open this story video.'))} /> : null}
              {selectedStory.body ? <Text style={styles.storyText}>{selectedStory.body}</Text> : null}
            </View>
            <View style={styles.storyPager}><Button label="Previous" size="sm" variant="secondary" onPress={() => stepStory(-1)} disabled={storyIndex === 0} /><Text style={styles.storyModalTime}>{storyIndex + 1} of {storySequence.length}</Text><Button label={storyIndex + 1 === storySequence.length ? 'Done' : 'Next'} size="sm" onPress={() => stepStory(1)} /></View>
          </View>
        ) : null}
      </Modal>
    </View>
  );
}

// Follow the photo's own shape, between a tall 4:5 and a wide 1.91:1.
const previewRatio = (w?: number | null, h?: number | null) => (w && h ? Math.min(1.91, Math.max(0.8, w / h)) : 16 / 9);

function storyAuthorName(story: CommunityStory, people: readonly SocialPerson[], userId: string | null, displayName: string | null) {
  const friend = people.find((person) => person.userId === story.author_id);
  if (friend) return personName(friend);
  return story.author_id === userId ? displayName || 'Your story' : 'Username pending';
}

function StoryAvatar({ uri, name, hasStory }: { uri?: string | null; name: string; hasStory: boolean }) {
  const styles = useThemedStyles(createStyles);
  const colors = useTheme();
  const ringId = `storyRing${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View style={styles.storyAvatarOuter}>
      {hasStory ? (
        <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={ringId} x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.accent} />
              <Stop offset="0.5" stopColor={colors.warning} />
              <Stop offset="1" stopColor={colors.primary} />
            </LinearGradient>
          </Defs>
          <Circle cx="32" cy="32" r="29" fill="none" stroke={`url(#${ringId})`} strokeWidth="4" />
        </Svg>
      ) : <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.storyEmptyRing]} />}
      <Avatar uri={uri} name={name} size={52} />
    </View>
  );
}

function ActivityCard({ item }: { item: FriendActivity }) {
  const styles = useThemedStyles(createStyles);
  return (
    <Card style={styles.activityCard}>
      <Avatar uri={item.avatarUrl} name={item.name} size={42} ring="subtle" />
      <View style={styles.activityBody}>
        <Text style={styles.activityText}><Text style={styles.name}>{item.name}</Text> {activityText(item)}</Text>
        <Text style={styles.when}>{timeAgo(item.at)}</Text>
      </View>
    </Card>
  );
}

function activityText(item: FriendActivity) {
  return `${item.title}${item.subtitle ? ` · ${item.subtitle}` : ''}.`;
}

function timeAgo(at: number) {
  const minutes = Math.max(1, Math.floor((Date.now() - at) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    feed: { gap: 14, marginBottom: 20 },
    storiesSection: { gap: 10, paddingTop: 2, paddingBottom: 3 },
    card: { gap: 12 },
    noMargin: { marginBottom: 0 },
    feedHeader: { marginTop: 4, marginBottom: -2 },
    friendStrip: { flexDirection: 'row', gap: 14, paddingVertical: 2 },
    storyAvatarWrap: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center' },
    storyAvatarOuter: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
    storyEmptyRing: { borderRadius: 32, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.borderStrong },
    postedMark: { position: 'absolute', right: 0, bottom: 0, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successText, borderWidth: 2, borderColor: colors.background },
    addBadge: { position: 'absolute', right: 0, bottom: 0, width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySubtle, borderWidth: 2, borderColor: colors.background },
    storyMeta: { fontSize: 9.5, fontWeight: '700', color: colors.textTertiary, textAlign: 'center', width: 80 },
    addStory: { width: 54, height: 54, borderRadius: 27, borderWidth: 1.5, borderColor: colors.primaryBorder, borderStyle: 'dashed', backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' },
    friendItem: { width: 68, alignItems: 'center', gap: 6 },
    friendName: { fontSize: 11.5, fontWeight: '700', color: colors.textSecondary, textAlign: 'center', width: 68 },
    emptyRow: { gap: 10, alignItems: 'flex-start' },
    muted: { ...Type.callout, color: colors.textSecondary },
    errorTitle: { ...Type.headline, color: colors.error },
    activityGrid: { gap: 12, width: '100%' },
    activityTile: { width: '100%' },
    activityCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, height: '100%' },
    activityBody: { flex: 1, minWidth: 0, gap: 5 },
    activityText: { ...Type.callout, color: colors.text, lineHeight: 21 },
    name: { fontWeight: '800', color: colors.text },
    when: { ...Type.caption, color: colors.textTertiary },
    emptyMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { ...Type.title3, color: colors.text },
    storyModal: { flex: 1, justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, backgroundColor: colors.background },
    storyModalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    storyModalByline: { flex: 1, gap: 2 },
    storyModalName: { ...Type.callout, color: colors.text, fontWeight: '800' },
    storyModalTime: { ...Type.caption, color: colors.textSecondary },
    storyClose: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: colors.surfaceMuted },
    storyModalBody: { flex: 1, minHeight: 220, justifyContent: 'center', alignItems: 'center', gap: 14, paddingVertical: 8 },
    storyImage: { width: '100%', flex: 1, maxHeight: '84%', borderRadius: 16, backgroundColor: colors.surfaceMuted },
    storyProgress: { width: '100%', flexDirection: 'row', gap: 4 },
    storyProgressTrack: { height: 3, flex: 1, overflow: 'hidden', borderRadius: 2, backgroundColor: colors.track },
    storyProgressFill: { width: '0%', height: '100%', backgroundColor: colors.accent },
    storyProgressDone: { width: '100%' },
    storyProgressCurrent: { width: '45%' },
    storyPager: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    storyText: { ...Type.title3, color: colors.text, textAlign: 'center' },
    composer: { gap: 12 },
    storyActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    mediaSelected: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    previewWrap: { width: '100%', maxWidth: 260, alignSelf: 'flex-start' },
    preview: { width: '100%', borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surfaceMuted, maxHeight: 220 },
    previewVideo: { aspectRatio: 16 / 9, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', gap: 6 },
    previewRemove: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
    storyInput: { minHeight: 120, textAlignVertical: 'top', padding: 13, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 14, backgroundColor: colors.surfaceSunken, color: colors.text, fontSize: 15 },
    errorText: { ...Type.caption, color: colors.error },
  });
}

export const SupabaseSocialFeed = SocialActivityFeed;
