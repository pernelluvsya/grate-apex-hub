import { useScreenBack } from "../backStack";
import { SkeletonGroup, SkeletonCard } from "../Skeleton";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import { Text, TextInput } from "../Text";
import { useAuth } from "../auth";
import { accessibleCourses } from "../data/catalog";
import { useColors, Colors } from "../theme";
import { Button } from "../ui";
import ScreenHeader from "../ScreenHeader";
import { AttachBar, MediaView } from "../MediaUI";
import { Media } from "../media";
import { Post, Reply, Me, listPosts, listMyPosts, createPost, deletePost, listReplies, addReply, deleteReply, timeAgo } from "../community";
import { EngageBar, useLike, useReshare } from "../PostCard";
import { refOfPost, origOfPost, thread } from "../engage";
import ShareSheet from "../ShareSheet";
import type { Share } from "../messages";
import MessagesView from "./Messages";
import { VerifiedBadge } from "../verified";
import { useUnreadChats } from "../messageHost";
import { confirmAsk } from "../confirm";
import { fetchFollowing, follow, unfollow, suggestFollows, Suggestion } from "../social";
import { Avatar } from "../MediaUI";
import { usePhotos } from "../photos";
import GroupsView from "./GroupsView";
import { useProfileHost } from "../profileHost";
import { useNavScroll } from "./Tabs";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

type Board = { id: string; label: string; desc: string };
const MINE = "__mine__";

export default function CommunityScreen() {
  const { onScroll } = useNavScroll();
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { user, profile } = useAuth();
  const me: Me | null = user && profile ? { uid: user.uid, username: profile.username } : null;
  const boards: Board[] = [
    { id: "general", label: "💬 General", desc: "Anything about studying, KNUST life, or the app." },
    { id: "senior", label: "🎓 Ask a Senior", desc: "Questions for upper-level students: courses, exams, tips." },
    ...accessibleCourses(profile?.hall, profile?.semester).map((c) => ({ id: c.id, label: `${c.icon} ${c.name}`, desc: c.desc })),
  ];

  const [board, setBoard] = useState<Board | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [groups, setGroups] = useState(false);
  const [messages, setMessages] = useState(false);
  const unread = useUnreadChats();

  // Android back: step up one level. Order matters: the deepest open view goes first.
  useScreenBack(groups || messages || !!post || !!board, () => {
    if (groups) setGroups(false);
    else if (messages) setMessages(false);
    else if (post) setPost(null);
    else setBoard(null);
  });

  if (!me) return null;
  if (groups) return <GroupsView onBack={() => setGroups(false)} />;
  if (messages) return <MessagesView onBack={() => setMessages(false)} />;
  if (post) return <PostView post={post} me={me} boardLabel={boards.find((b) => b.id === post.board)?.label ?? ""} onBack={() => setPost(null)} onDeleted={() => setPost(null)} />;
  if (board) return <BoardView board={board} me={me} onBack={() => setBoard(null)} onOpen={setPost} />;

  return (
    <ScrollView onScroll={onScroll} scrollEventThrottle={16} style={s.page} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}>
      <ScreenHeader title="Community" sub="Ask questions, help each other, and learn together." />
      <TouchableOpacity style={[s.card, { borderColor: COLORS.primary }]} onPress={() => setMessages(true)}>
        <Text style={s.cardTitle}>✉️ Messages{unread > 0 ? `  ·  ${unread} new` : ""}</Text>
        <Text style={s.small}>Chat one-to-one with your friends.</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.card, { borderColor: COLORS.primary }]} onPress={() => setGroups(true)}>
        <Text style={s.cardTitle}><Em n="users" /> Study groups</Text>
        <Text style={s.small}>Private group chats with your friends.</Text>
      </TouchableOpacity>
      <SuggestedFollows me={me} hall={profile?.hall} semester={profile?.semester} />
      {boards.map((b) => (
        <TouchableOpacity key={b.id} style={s.card} onPress={() => setBoard(b)}>
          <Text style={s.cardTitle}>{wi(b.label)}</Text>
          <Text style={s.small}>{b.desc}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[s.card, { borderColor: COLORS.accent }]} onPress={() => setBoard({ id: MINE, label: "📝 My posts", desc: "Everything you've started." })}>
        <Text style={s.cardTitle}><Em n="edit" /> My posts</Text>
        <Text style={s.small}>Everything you've started.</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------- people you might want to follow ----------
function SuggestedFollows({ me, hall, semester }: { me: Me; hall?: string; semester?: number }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { open } = useProfileHost();
  const [list, setList] = useState<Suggestion[] | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const photos = usePhotos((list ?? []).map((h) => h.uid));
  useEffect(() => { suggestFollows({ uid: me.uid, hall, semester }, 6).then(setList).catch(() => setList([])); }, [me.uid]);
  const toggle = async (h: Suggestion) => {
    const was = done.has(h.uid);
    setDone((d) => { const n = new Set(d); was ? n.delete(h.uid) : n.add(h.uid); return n; });
    try { was ? await unfollow(me.uid, h.uid) : await follow(me, { uid: h.uid, username: h.username }); }
    catch { setDone((d) => { const n = new Set(d); was ? n.add(h.uid) : n.delete(h.uid); return n; }); }
  };
  if (!list || list.length === 0) return null;
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}> Suggested for you</Text>
      {list.map((h) => (
        <View key={h.uid} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
          <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center" }} onPress={() => open(h.uid, h.username)}>
            <Avatar name={h.username} photo={photos[h.uid]} size={36} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: COLORS.text, fontWeight: "700" }}>@{h.username}<VerifiedBadge uid={h.uid} inline /></Text>
              <Text style={s.small}>{h.reason}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggle(h)} style={[s.fbtn, done.has(h.uid) && s.fbtnOn]}>
            <Text style={[s.fbtnText, done.has(h.uid) && { color: COLORS.muted }]}>{done.has(h.uid) ? "Following" : "Follow"}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ---------- list of posts on one board ----------
function BoardView({ board, me, onBack, onOpen }: { board: Board; me: Me; onBack: () => void; onOpen: (p: Post) => void }) {
  const { onScroll } = useNavScroll();
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setPosts(board.id === MINE ? await listMyPosts(me.uid) : await listPosts(board.id)); }
    catch (e: any) { setError(`Couldn't load (${e?.code ?? "unknown"}). ${e?.message ?? ""}`); }
    finally { setLoading(false); }
  }, [board.id, me.uid]);
  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (title.trim().length < 3 || body.trim().length < 3) { setError("Add a title and some details."); return; }
    setBusy(true); setError("");
    try {
      await createPost(board.id, title, body, me, media);
      setTitle(""); setBody(""); setMedia([]); setComposing(false);
      await load();
    } catch (e: any) { setError(`Couldn't post (${e?.code ?? "unknown"}). ${e?.message ?? ""}`); }
    finally { setBusy(false); }
  };

  return (
    <ScrollView onScroll={onScroll} scrollEventThrottle={16} style={s.page} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack}><Text style={s.back}>‹ All boards</Text></TouchableOpacity>
      <Text style={s.title}>{wi(board.label)}</Text>
      {board.id !== MINE && !composing && <Button title="＋ Start a discussion" onPress={() => setComposing(true)} />}
      {composing && (
        <View style={s.card}>
          <TextInput value={title} onChangeText={setTitle} placeholder="Title (your question or topic)" placeholderTextColor={COLORS.muted} maxLength={120} style={s.input} />
          <TextInput value={body} onChangeText={setBody} placeholder="Give some details…" placeholderTextColor={COLORS.muted} maxLength={2000} multiline style={[s.input, { minHeight: 90, textAlignVertical: "top" }]} />
          <AttachBar value={media} onChange={setMedia} />
          <View style={{ height: 10 }} />
          <Button title="Post" onPress={submit} loading={busy} />
          <Button variant="ghost" title="Cancel" onPress={() => { setComposing(false); setError(""); }} />
        </View>
      )}
      {!!error && <Text style={s.error}>{error}</Text>}
      {loading && posts.length === 0 && (
        <SkeletonGroup>{[0, 1, 2].map((i) => <SkeletonCard key={i} />)}</SkeletonGroup>
      )}
      {!loading && posts.length === 0 && !error && <Text style={[s.small, { marginTop: 14 }]}>No discussions yet. Be the first to start one!</Text>}
      <View style={{ height: 10 }} />
      {posts.map((p) => (
        <TouchableOpacity key={p.id} style={s.card} onPress={() => onOpen(p)}>
          <Text style={s.cardTitle}>{p.title}</Text>
          <Text style={s.small} numberOfLines={2}>{p.body}</Text>
          <Text style={[s.small, { marginTop: 8 }]}>@{p.authorName}<VerifiedBadge uid={p.authorUid} inline /> · {timeAgo(p.createdAt)} · {p.media?.length ? wi("📎 ") : ""} ♥ {p.likeCount ?? 0} · 💬 {p.replyCount} {p.replyCount === 1 ? "reply" : "replies"}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={load} style={{ marginTop: 6 }}><Text style={s.refresh}>↻ Refresh</Text></TouchableOpacity>
    </ScrollView>
  );
}

// ---------- one post with its replies ----------
function PostView({ post, me, boardLabel, onBack, onDeleted }: { post: Post; me: Me; boardLabel: string; onBack: () => void; onDeleted: () => void }) {
  const { onScroll } = useNavScroll();
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [share, setShare] = useState<Share | null>(null);
  const [count, setCount] = useState(post.replyCount);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const { open } = useProfileHost();
  const mine = post.authorUid === me.uid;
  const like = useLike(refOfPost(post), post.likeCount ?? 0);
  const rs = useReshare(() => origOfPost(post));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReplies(await listReplies(post.id));
      if (!mine) setFollowing((await fetchFollowing(me.uid)).includes(post.authorUid));
    } catch (e: any) { setError(`Couldn't load replies (${e?.code ?? "unknown"}). ${e?.message ?? ""}`); }
    finally { setLoading(false); }
  }, [post.id, post.authorUid, me.uid, mine]);
  useEffect(() => { load(); }, [load]);

  const [rmedia, setRMedia] = useState<Media[]>([]);
  const [to, setTo] = useState<{ parentId: string; authorUid: string; authorName: string } | null>(null);
  const send = async () => {
    if (!text.trim() && !rmedia.length) return;
    setBusy(true); setError("");
    try { await addReply(post.id, text, me, rmedia, post.authorUid, to); setText(""); setRMedia([]); setTo(null); setCount((c) => c + 1); setReplies(await listReplies(post.id)); }
    catch (e: any) { setError(`Couldn't reply (${e?.code ?? "unknown"}). ${e?.message ?? ""}`); }
    finally { setBusy(false); }
  };

  const toggleFollow = async () => {
    const was = following; setFollowing(!was);
    try { was ? await unfollow(me.uid, post.authorUid) : await follow(me, { uid: post.authorUid, username: post.authorName }); }
    catch { setFollowing(was); }
  };

  const removeReply = async (r: Reply) => {
    if (!(await confirmAsk("Delete this reply?"))) return;
    try { await deleteReply(post.id, r.id); setReplies((l) => l.filter((x) => x.id !== r.id)); setCount((c) => Math.max(0, c - 1)); }
    catch (e: any) { setError(`Couldn't delete (${e?.code ?? "unknown"}).`); }
  };
  const remove = async () => {
    if (!(await confirmAsk("Delete this post and its replies? This can't be undone."))) return;
    try { await deletePost(post.id); onDeleted(); }
    catch (e: any) { setError(`Couldn't delete (${e?.code ?? "unknown"}).`); }
  };

  const replyRow = (r: Reply, isReply: boolean) => (
    <View key={r.id} style={[s.reply, isReply && { marginLeft: 22 }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <TouchableOpacity onPress={() => open(r.authorUid, r.authorName)}><Text style={s.small}>@{r.authorName}<VerifiedBadge uid={r.authorUid} inline /> · {timeAgo(r.createdAt)}</Text></TouchableOpacity>
        {(r.authorUid === me.uid || mine) && <TouchableOpacity onPress={() => removeReply(r)}><Text style={{ color: COLORS.danger, fontSize: 12, fontWeight: "700" }}>Delete</Text></TouchableOpacity>}
      </View>
      {!!r.body && <Text style={s.bodyText}>{isReply && !!r.replyTo && <Text style={{ color: COLORS.accent, fontWeight: "700" }}>@{r.replyTo} </Text>}{r.body}</Text>}
      <MediaView media={r.media} width={260} />
      <TouchableOpacity onPress={() => setTo({ parentId: r.parentId || r.id, authorUid: r.authorUid, authorName: r.authorName })} style={{ alignSelf: "flex-start", paddingTop: 6 }}>
        <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: "800" }}>Reply</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView onScroll={onScroll} scrollEventThrottle={16} style={s.page} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack}><Text style={s.back}>‹ Back</Text></TouchableOpacity>
      <Text style={s.small}>{boardLabel}</Text>
      <Text style={[s.title, { fontSize: 22, marginTop: 4 }]}>{post.title}</Text>
      <View style={s.authorRow}>
        <TouchableOpacity onPress={() => open(post.authorUid, post.authorName)}><Text style={s.small}>@{post.authorName}<VerifiedBadge uid={post.authorUid} inline /> · {timeAgo(post.createdAt)}</Text></TouchableOpacity>
        {!mine && (
          <TouchableOpacity onPress={toggleFollow} style={[s.fbtn, following && s.fbtnOn]}>
            <Text style={[s.fbtnText, following && { color: COLORS.muted }]}>{following ? "Following" : "Follow"}</Text>
          </TouchableOpacity>
        )}
        {mine && <TouchableOpacity onPress={remove}><Text style={{ color: COLORS.danger, fontWeight: "700" }}>Delete</Text></TouchableOpacity>}
      </View>
      <Text style={s.bodyText}>{post.body}</Text>
      <MediaView media={post.media} width={Math.min(420, 320)} />
      <EngageBar liked={like.liked} likes={like.count} onLike={like.toggle} canReshare reshared={rs.done} onReshare={rs.go} onShare={() => setShare(origOfPost(post))} />
      <ShareSheet share={share} onClose={() => setShare(null)} />

      <Text style={[s.cardTitle, { marginTop: 22 }]}>{count} {count === 1 ? "reply" : "replies"}</Text>
      {loading && <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 12 }} />}
      {thread(replies).map((g) => (
        <View key={g.parentId}>
          {g.parent ? replyRow(g.parent, false) : <Text style={[s.small, { fontStyle: "italic", marginTop: 8 }]}>Reply deleted</Text>}
          {g.replies.map((r) => replyRow(r, true))}
        </View>
      ))}
      {!!to && (
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
          <Text style={{ color: COLORS.accent, fontWeight: "700", flex: 1 }}>↪ Replying to @{to.authorName}</Text>
          <TouchableOpacity onPress={() => setTo(null)}><Text style={{ color: COLORS.muted, fontWeight: "800" }}><Em n="close" /></Text></TouchableOpacity>
        </View>
      )}

      <TextInput value={text} onChangeText={setText} placeholder={to ? `Reply to @${to.authorName}…` : "Write a reply…"} placeholderTextColor={COLORS.muted} maxLength={1000} multiline style={[s.input, { minHeight: 70, textAlignVertical: "top", marginTop: 14 }]} />
      <AttachBar value={rmedia} onChange={setRMedia} />
      {!!error && <Text style={s.error}>{error}</Text>}
      <Button title="Reply" onPress={send} loading={busy} disabled={!text.trim() && !rmedia.length} />
    </ScrollView>
  );
}

const makeStyles = (COLORS: Colors) => StyleSheet.create({
  page: { flex: 1 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: "800", marginBottom: 6 },
  sub: { color: COLORS.muted, marginBottom: 16 },
  back: { color: COLORS.accent, fontWeight: "700", marginBottom: 12 },
  card: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700", marginBottom: 4 },
  small: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  bodyText: { color: COLORS.text, fontSize: 15, lineHeight: 22, marginTop: 6 },
  input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, color: COLORS.text, padding: 12, fontSize: 15, marginBottom: 10 },
  error: { color: COLORS.danger, marginVertical: 8 },
  refresh: { color: COLORS.accent, fontWeight: "700", textAlign: "center" },
  authorRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  reply: { backgroundColor: COLORS.card, borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: COLORS.border },
  fbtn: { backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  fbtnOn: { backgroundColor: "transparent", borderWidth: 1, borderColor: COLORS.border },
  fbtnText: { color: COLORS.onPrimary, fontWeight: "700", fontSize: 12 },
});