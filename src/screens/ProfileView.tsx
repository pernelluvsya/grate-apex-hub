import React, { useCallback, useEffect, useState, useMemo } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "../Text";
import { useAuth } from "../auth";
import { COURSES } from "../data/catalog";
import { useColors, Colors } from "../theme";
import { ScoreRow, UserHit, Activity, fetchScores, fetchUser, fetchEdges, listActivity, follow, unfollow } from "../social";
import PostCard from "../PostCard";
import { useBattles } from "../battleHost";
import { Avatar } from "../MediaUI";
import { VerifiedBadge } from "../verified";
import { PhotoZoom, ZoomAvatar, usePhotos } from "../photos";
import Icon from "../Icon";
import { chatBridge } from "../chatHost";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

const LIST_LIMIT = 30;

type Props = { uid: string; username: string; onClose: () => void; closeAllThen: (then: () => void) => void; onOpen: (uid: string, username?: string) => void };

export default function ProfileView({ uid, username, onClose, closeAllThen, onOpen }: Props) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { user, profile } = useAuth();
  const isMe = user?.uid === uid;
  const battles = useBattles();
  const [score, setScore] = useState<ScoreRow | null>(null);
  const [info, setInfo] = useState<{ username: string; displayName?: string; hall?: string; semester?: number; photo?: string; bio?: string } | null>(null);
  const [followers, setFollowers] = useState<UserHit[]>([]);
  const [following, setFollowing] = useState<UserHit[]>([]);
  const [myFollowing, setMyFollowing] = useState<Set<string>>(new Set());
  const [activity, setActivity] = useState<Activity[]>([]);
  const [list, setList] = useState<null | "followers" | "following">(null);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState<{ name: string; photo: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [sc, u, fr, fg, act, mine] = await Promise.all([
        fetchScores([uid]), fetchUser(uid), fetchEdges(uid, "followers"), fetchEdges(uid, "following"),
        listActivity(uid, 6).catch(() => []), user ? fetchEdges(user.uid, "following") : Promise.resolve([]),
      ]);
      setScore(sc[0] ?? null); setInfo(u); setFollowers(fr); setFollowing(fg); setActivity(act);
      setMyFollowing(new Set(mine.map((m) => m.uid)));
    } catch (e: any) { setError(`Couldn't load profile (${e?.code ?? "unknown"}).`); }
    finally { setLoading(false); }
  }, [uid, user]);
  useEffect(() => { load(); }, [load]);

  const name = info?.username || username;
  const iFollow = myFollowing.has(uid);
  const theyFollowMe = following.some((f) => f.uid === user?.uid); // they follow me back
  const friends = iFollow && theyFollowMe;

  const toggle = async () => {
    if (!user || !profile) return;
    const was = iFollow;
    const next = new Set(myFollowing); was ? next.delete(uid) : next.add(uid); setMyFollowing(next);
    // keep the follower count in step on screen
    setFollowers((f) => (was ? f.filter((x) => x.uid !== user.uid) : [...f, { uid: user.uid, username: profile.username }]));
    try { was ? await unfollow(user.uid, uid) : await follow({ uid: user.uid, username: profile.username }, { uid, username: name }); }
    catch { load(); }
  };

  // Message / battle buttons: close every profile first, wait until the sheet has really gone, then open the next
  // screen. (Opening a modal while another one is still on screen is dropped on phones, and the profile
  // modal is drawn on top of the chat / battle modals, so doing it the other way round shows nothing.)
  const closeThen = closeAllThen;
  const handleMessageClick = useCallback(() => closeThen(() => chatBridge.open({ uid, username: name })), [uid, name, closeThen]);
  const handleBattleClick = useCallback(() => closeThen(() => battles.open({ uid, username: name })), [uid, name, battles, closeThen]);

  const courseRows = score?.courseXp ? Object.entries(score.courseXp).sort((a, b) => b[1] - a[1]) : [];
  const maxCourse = courseRows.length ? courseRows[0][1] : 1;
  const shown = list === "followers" ? followers : list === "following" ? following : [];
  // Long lists show the first few rows (and only fetch those pictures); "Show all" reveals the rest.
  const visible = showAll ? shown : shown.slice(0, LIST_LIMIT);
  const photos = usePhotos(visible.map((u) => u.uid));
  const pick = (k: "followers" | "following") => { setList(list === k ? null : k); setShowAll(false); };

  return (
    <ScrollView style={s.page} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 }}>
      <TouchableOpacity onPress={onClose}><Text style={s.back}><Em n="close" /> Close</Text></TouchableOpacity>
      <View style={{ alignSelf: "center" }}><ZoomAvatar name={name} photo={isMe ? profile?.photo ?? info?.photo : info?.photo} size={76} onZoom={setZoom} /></View>
      <Text style={s.name}>{info?.displayName?.trim() || `@${name}`}{isMe ? " (you)" : ""}<VerifiedBadge uid={uid} size={20} inline /></Text>
      {info?.displayName?.trim() ? <Text style={{ color: COLORS.muted, textAlign: "center", marginTop: 2 }}>@{name}</Text> : null}
      {!!(isMe ? profile?.bio ?? info?.bio : info?.bio) && <Text style={{ color: COLORS.text, textAlign: "center", marginTop: 8, lineHeight: 21, paddingHorizontal: 12 }}>{isMe ? profile?.bio ?? info?.bio : info?.bio}</Text>}
      {!!score && <Text style={s.rank}>{score.title} · Level {score.level}</Text>}
      {!!info?.hall && <Text style={s.small}>{info.hall} · Semester {info.semester}</Text>}
      {!isMe && (
        <TouchableOpacity onPress={toggle} style={[s.fbtn, iFollow && s.fbtnOn]}>
          <Text style={[s.fbtnText, iFollow && { color: COLORS.muted }]}>{friends ? wi("Friends ✓") : iFollow ? "Following" : "Follow"}</Text>
        </TouchableOpacity>
      )}
      {!isMe && (
        friends ? (
          <TouchableOpacity onPress={handleMessageClick} style={[s.fbtn, { backgroundColor: "transparent", borderWidth: 1, borderColor: COLORS.primary, marginTop: 8 }]}>
            <Text style={[s.fbtnText, { color: COLORS.primary }]}><Em n="mail" /> Message</Text>
          </TouchableOpacity>
        ) : <Text style={[s.small, { textAlign: "center", marginTop: 8 }]}><Em n="mail" /> You can message each other once you both follow each other.</Text>
      )}
      {!isMe && (
        <TouchableOpacity onPress={handleBattleClick} style={[s.fbtn, { backgroundColor: "transparent", borderWidth: 1, borderColor: COLORS.accent, marginTop: 8 }]}>
          <Text style={[s.fbtnText, { color: COLORS.accent }]}><Em n="swords" /> Challenge to a battle</Text>
        </TouchableOpacity>
      )}
      {loading && <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 16 }} />}
      {!!error && <Text style={s.error}>{error}</Text>}

      <View style={s.counts}>
        <TouchableOpacity style={[s.count, list === "followers" && s.countOn]} onPress={() => pick("followers")}>
          <Text style={[s.countN, list === "followers" && { color: COLORS.accent }]}>{followers.length}</Text><Text style={s.small}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.count, list === "following" && s.countOn]} onPress={() => pick("following")}>
          <Text style={[s.countN, list === "following" && { color: COLORS.accent }]}>{following.length}</Text><Text style={s.small}>Following</Text>
        </TouchableOpacity>
      </View>
      {list && (
        <View style={s.card}>
          <Text style={s.h}>{list === "followers" ? "Followers" : "Following"} · {shown.length}</Text>
          {shown.length === 0 && <Text style={[s.small, { marginTop: 12 }]}>{list === "followers" ? "No followers yet." : "Not following anyone yet."}</Text>}
          {visible.map((u, i) => (
            <TouchableOpacity key={u.uid} activeOpacity={0.7} onPress={() => onOpen(u.uid, u.username)} style={[s.row, i > 0 && s.rowLine]}>
              <Avatar name={u.username} photo={photos[u.uid]} size={40} />
              <View style={s.rowName}>
                <Text numberOfLines={1} style={s.rowText}>@{u.username}</Text>
                <VerifiedBadge uid={u.uid} />
              </View>
              {u.uid === user?.uid ? <Text style={s.tag}>You</Text> : myFollowing.has(u.uid) ? <Text style={s.tag}>Following</Text> : null}
              <Icon name="chevron" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
          {!showAll && shown.length > LIST_LIMIT && (
            <TouchableOpacity onPress={() => setShowAll(true)} style={{ alignItems: "center", paddingTop: 14 }}>
              <Text style={{ color: COLORS.accent, fontWeight: "700" }}>Show all {shown.length}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {score ? (
        <>
          <View style={s.stats}>
            <Stat label="XP" value={String(score.xp)} />
            <Stat label="Streak" value={String(score.streak)} />
            <Stat label="Answered" value={String(score.answered)} />
            <Stat label="Accuracy" value={`${score.accuracy}%`} />
          </View>
          {courseRows.length > 0 && (
            <View style={s.card}>
              <Text style={s.h}>Courses</Text>
              {courseRows.map(([id, xp]) => {
                const c = COURSES.find((x) => x.id === id);
                return (
                  <View key={id} style={{ marginTop: 10 }}>
                    <Text style={{ color: COLORS.text }}>{c ? `${c.icon} ${c.name}` : id} <Text style={s.small}>· {xp} XP</Text></Text>
                    <View style={s.bar}><View style={[s.fill, { width: `${Math.max(6, (xp / maxCourse) * 100)}%` }]} /></View>
                  </View>
                );
              })}
            </View>
          )}
        </>
      ) : !loading && <Text style={[s.small, { marginTop: 14 }]}>This student hasn't earned any XP yet.</Text>}

      {activity.length > 0 && (
        <View style={s.card}>
          <Text style={s.h}>Recent activity</Text>
          {activity.map((a) => <PostCard key={a.id} a={a} compact onOpenUser={onOpen} onRemoved={(x) => setActivity((l) => l.filter((y) => y.id !== x.id))} />)}
        </View>
      )}
      <PhotoZoom pic={zoom} onClose={() => setZoom(null)} />
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  return <View style={s.stat}><Text style={s.statV}>{value}</Text><Text style={s.small}>{label}</Text></View>;
}

const makeStyles = (COLORS: Colors) => StyleSheet.create({
  page: { flex: 1 },
  back: { color: COLORS.accent, fontWeight: "700", marginBottom: 14 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  avatarText: { color: COLORS.onPrimary, fontSize: 32, fontWeight: "800" },
  name: { color: COLORS.text, fontSize: 22, fontWeight: "800", textAlign: "center", marginTop: 10 },
  rank: { color: COLORS.accent, fontWeight: "700", textAlign: "center", marginTop: 2 },
  small: { color: COLORS.muted, fontSize: 13, textAlign: "center" },
  error: { color: COLORS.danger, marginVertical: 8, textAlign: "center" },
  fbtn: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 28, borderRadius: 12, alignSelf: "center", marginTop: 12 },
  fbtnOn: { backgroundColor: "transparent", borderWidth: 1, borderColor: COLORS.border },
  fbtnText: { color: COLORS.onPrimary, fontWeight: "700" },
  counts: { flexDirection: "row", justifyContent: "center", marginVertical: 16 },
  count: { alignItems: "center", marginHorizontal: 16, paddingHorizontal: 12, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: "transparent" },
  countOn: { borderBottomColor: COLORS.accent },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  rowLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
  rowName: { flex: 1, flexDirection: "row", alignItems: "center", marginLeft: 12, marginRight: 8 },
  rowText: { color: COLORS.text, fontWeight: "700", flexShrink: 1 },
  tag: { color: COLORS.muted, fontSize: 12, fontWeight: "700", borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8, overflow: "hidden" },
  countN: { color: COLORS.text, fontSize: 20, fontWeight: "800" },
  stats: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  stat: { width: "48%", backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10, alignItems: "center" },
  statV: { color: COLORS.text, fontSize: 20, fontWeight: "800" },
  card: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  h: { color: COLORS.text, fontWeight: "800", fontSize: 16 },
  bar: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, marginTop: 6, overflow: "hidden" },
  fill: { height: 8, backgroundColor: COLORS.accent },
});