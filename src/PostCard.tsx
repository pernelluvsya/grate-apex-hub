import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "./Text";
import { useAuth } from "./auth";
import { useColors } from "./theme";
import Icon from "./Icon";
import { Avatar } from "./MediaUI";
import { ActivityLine } from "./ActivityLine";
import { Activity } from "./social";
import { timeAgo } from "./community";
import { confirmAsk } from "./confirm";
import ShareSheet from "./ShareSheet";
import { VerifiedBadge } from "./verified";
import type { Share } from "./messages";
import {
  Comment, Ref, Orig, refOf, hasLiked, setLike, listComments, addComment, deleteComment,
  deleteActivity, origOf, reshare, getUserInfo, thread, ReplyTarget,
} from "./engage";
import { Em } from "./components/em";

// Like state with instant feedback; rolls back if Firestore says no.
export function useLike(ref: Ref, initial = 0) {
  const { user, profile } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initial);
  useEffect(() => { if (user) hasLiked(ref, user.uid).then(setLiked); }, [ref.kind, ref.owner, ref.id, user?.uid]);
  const toggle = async () => {
    if (!user || !profile) return;
    const was = liked;
    setLiked(!was); setCount((c) => Math.max(0, c + (was ? -1 : 1)));
    try { await setLike(ref, { uid: user.uid, username: profile.username }, !was); }
    catch { setLiked(was); setCount((c) => Math.max(0, c + (was ? 1 : -1))); }
  };
  return { liked, count, toggle };
}

export function useReshare(getOrig: () => Orig | null) {
  const { user, profile } = useAuth();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const go = async () => {
    const o = getOrig();
    if (!user || !profile || !o || done || busy) return;
    if (!(await confirmAsk("Share this to your followers?", "Reshare"))) return;
    setBusy(true);
    try { await reshare({ uid: user.uid, username: profile.username }, o); setDone(true); } catch { /* ignore */ }
    setBusy(false);
  };
  return { done, busy, go };
}

export function EngageBar({ liked, likes, onLike, comments, onComment, canReshare, reshared, onReshare, onShare }: {
  liked: boolean; likes: number; onLike: () => void;
  comments?: number; onComment?: () => void;
  canReshare?: boolean; reshared?: boolean; onReshare?: () => void; onShare?: () => void;
}) {
  const COLORS = useColors();
  const btn = { flexDirection: "row" as const, alignItems: "center" as const, paddingVertical: 6, paddingRight: 14 };
  const num = (c: string) => ({ color: c, marginLeft: 6, fontSize: 13, fontWeight: "700" as const });
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 6 }}>
      <TouchableOpacity style={btn} onPress={onLike} accessibilityLabel="Like">
        <Icon name="heart" size={19} color={liked ? "#ef4444" : COLORS.muted} fill={liked ? "#ef4444" : "none"} />
        <Text style={num(liked ? "#ef4444" : COLORS.muted)}>{likes > 0 ? likes : "Like"}</Text>
      </TouchableOpacity>
      {onComment && (
        <TouchableOpacity style={btn} onPress={onComment} accessibilityLabel="Comment">
          <Icon name="chat" size={19} color={COLORS.muted} />
          <Text style={num(COLORS.muted)}>{comments ? comments : "Comment"}</Text>
        </TouchableOpacity>
      )}
      {onShare && (
        <TouchableOpacity style={btn} onPress={onShare} accessibilityLabel="Send to a friend or group">
          <Icon name="send" size={19} color={COLORS.muted} />
          <Text style={num(COLORS.muted)}>Send</Text>
        </TouchableOpacity>
      )}
      {canReshare && (
        <TouchableOpacity style={btn} onPress={onReshare} disabled={reshared} accessibilityLabel="Reshare">
          <Icon name="repeat" size={19} color={reshared ? COLORS.accent : COLORS.muted} />
          <Text style={num(reshared ? COLORS.accent : COLORS.muted)}>{reshared ? "Reshared" : "Reshare"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// One item of the feed: who, what, and the like / comment / reshare / delete actions.
export default function PostCard({ a, onRemoved, onOpenUser, compact }: {
  a: Activity; onRemoved: (a: Activity) => void; onOpenUser: (uid: string, name: string) => void; compact?: boolean;
}) {
  const COLORS = useColors();
  const { user, profile } = useAuth();
  const mine = user?.uid === a.uid;
  const ref = useMemo(() => refOf(a), [a.uid, a.id]);
  const like = useLike(ref, a.likeCount ?? 0);
  const rs = useReshare(() => origOf(a));
  const [photo, setPhoto] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(a.commentCount ?? 0);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [to, setTo] = useState<ReplyTarget | null>(null);
  const [share, setShare] = useState<Share | null>(null);

  useEffect(() => { getUserInfo(a.uid).then((u) => setPhoto(u?.photo)); }, [a.uid]);

  const toggleComments = async () => {
    const next = !open; setOpen(next);
    if (next) {
      setLoading(true);
      try { setComments(await listComments(ref)); } catch (e: any) { setErr(`Couldn't load comments (${e?.code ?? "unknown"}).`); }
      setLoading(false);
    }
  };
  const send = async () => {
    if (!user || !profile || !text.trim()) return;
    setBusy(true); setErr("");
    try {
      await addComment(ref, { uid: user.uid, username: profile.username }, text, to);
      setText(""); setTo(null); setCount((c) => c + 1); setComments(await listComments(ref));
    } catch (e: any) { setErr(`Couldn't comment (${e?.code ?? "unknown"}).`); }
    setBusy(false);
  };
  const removeComment = async (c: Comment) => {
    if (!(await confirmAsk("Delete this comment?"))) return;
    try { await deleteComment(ref, c.id); setComments((l) => l.filter((x) => x.id !== c.id)); setCount((n) => Math.max(0, n - 1)); }
    catch { setErr("Couldn't delete that comment."); }
  };
  const removePost = async () => {
    if (!(await confirmAsk("Delete this post? This can't be undone."))) return;
    try { await deleteActivity(a); onRemoved(a); } catch (e: any) { setErr(`Couldn't delete (${e?.code ?? "unknown"}).`); }
  };

  // One comment; replies are indented and can be answered too (they all hang under the same top-level comment).
  const commentRow = (c: Comment, isReply: boolean) => (
    <View key={c.id} style={{ flexDirection: "row", marginTop: 8, marginLeft: isReply ? 22 : 0 }}>
      <View style={{ flex: 1, backgroundColor: COLORS.bg, borderRadius: 12, padding: 10 }}>
        <TouchableOpacity onPress={() => onOpenUser(c.authorUid, c.authorName)}>
          <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: "700" }}>@{c.authorName}<VerifiedBadge uid={c.authorUid} inline /> · {timeAgo(c.createdAt)}</Text>
        </TouchableOpacity>
        <Text style={{ color: COLORS.text, lineHeight: 20, marginTop: 2 }}>{isReply && !!c.replyTo && <Text style={{ color: COLORS.accent, fontWeight: "700" }}>@{c.replyTo} </Text>}{c.body}</Text>
        <TouchableOpacity onPress={() => setTo({ parentId: c.parentId || c.id, authorUid: c.authorUid, authorName: c.authorName })} style={{ alignSelf: "flex-start", paddingTop: 6 }}>
          <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: "800" }}>Reply</Text>
        </TouchableOpacity>
      </View>
      {(c.authorUid === user?.uid || mine) && (
        <TouchableOpacity onPress={() => removeComment(c)} style={{ paddingLeft: 8, justifyContent: "center" }} accessibilityLabel="Delete comment">
          <Icon name="close" size={16} color={COLORS.muted} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <TouchableOpacity onPress={() => onOpenUser(a.uid, a.username)} style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Avatar name={a.username} photo={photo} size={compact ? 30 : 36} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={{ color: COLORS.text, fontWeight: "800" }}>@{a.username}<VerifiedBadge uid={a.uid} inline /></Text>
            <Text style={{ color: COLORS.muted, fontSize: 12 }}>{timeAgo(a.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        {mine && (
          <TouchableOpacity onPress={removePost} accessibilityLabel="Delete post" style={{ padding: 6 }}>
            <Icon name="trash" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        )}
      </View>
      <ActivityLine a={a} hideName compact={false} />
      <EngageBar
        liked={like.liked} likes={like.count} onLike={like.toggle}
        comments={count} onComment={toggleComments}
        canReshare={!!origOf(a)} reshared={rs.done} onReshare={rs.go}
        onShare={origOf(a) ? () => setShare(origOf(a)) : undefined}
      />
      <ShareSheet share={share} onClose={() => setShare(null)} />
      {open && (
        <View style={{ marginTop: 8 }}>
          {loading && <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 8 }} />}
          {thread(comments).map((g) => (
            <View key={g.parentId}>
              {g.parent ? commentRow(g.parent, false) : <Text style={{ color: COLORS.muted, fontStyle: "italic", marginTop: 8 }}>Comment deleted</Text>}
              {g.replies.map((c) => commentRow(c, true))}
            </View>
          ))}
          {!!to && (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
              <Text style={{ color: COLORS.accent, fontWeight: "700", flex: 1 }}>↪ Replying to @{to.authorName}</Text>
              <TouchableOpacity onPress={() => setTo(null)}><Text style={{ color: COLORS.muted, fontWeight: "800" }}><Em n="close" /></Text></TouchableOpacity>
            </View>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
            <TextInput value={text} onChangeText={setText} placeholder={to ? `Reply to @${to.authorName}…` : "Write a comment…"} placeholderTextColor={COLORS.muted} maxLength={500}
              style={{ flex: 1, minWidth: 0, backgroundColor: COLORS.bg, borderColor: COLORS.border, borderWidth: 1, borderRadius: 999, color: COLORS.text, paddingHorizontal: 14, paddingVertical: 9, fontSize: 14 }} onSubmitEditing={send} />
            <TouchableOpacity onPress={send} disabled={busy || !text.trim()} style={{ marginLeft: 8, backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16, opacity: busy || !text.trim() ? 0.5 : 1 }}>
              <Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {!!err && <Text style={{ color: COLORS.danger, marginTop: 6, fontSize: 13 }}>{err}</Text>}
    </View>
  );
}
