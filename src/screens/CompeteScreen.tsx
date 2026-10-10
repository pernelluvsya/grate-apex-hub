import { usePullToRefresh } from "../pullRefresh";
import { useScreenBack } from "../backStack";
import { VerifiedBadge } from "../verified";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import { Text, TextInput } from "../Text";
import { useAuth } from "../auth";
import { useProgress } from "../progress";
import { accessibleCourses } from "../data/catalog";
import { useColors, Colors } from "../theme";
import ScreenHeader from "../ScreenHeader";
import { useRoute } from "@react-navigation/native";
import { useLayout } from "../responsive";
import Svg, { Circle } from "react-native-svg";
import { rankFor, streakOf } from "../progress";
import { Avatar } from "../MediaUI";
import { usePhotos } from "../photos";
import { AchievementChips } from "../AchievementsUI";
import { useProfileHost } from "../profileHost";
import { useBattles } from "../battleHost";
import { useNavScroll } from "./Tabs";
import { ScoreRow, UserHit, fetchTop, fetchScores, fetchFollowing, fetchFollowers, follow, unfollow, searchUsers, suggestFollows, Suggestion } from "../social";
import { Em } from "../components/em";
import { withIcons as wi } from "../components/em";

type Tab = "global" | "course" | "friends" | "find";
export default function CompeteScreen() {
  const { onScroll } = useNavScroll();
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { user, profile } = useAuth();
  const battles = useBattles();
  const { progress } = useProgress(); // when my XP changes, reload so the board is fresh
  const { open } = useProfileHost();
  const courses = accessibleCourses(profile?.hall, profile?.semester);
  const [tab, setTab] = useState<Tab>("global");
  const [courseId, setCourseId] = useState<string>(courses[0]?.id ?? "");
  useScreenBack(tab !== "global", () => setTab("global")); // Android back
  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [hits, setHits] = useState<UserHit[]>([]);
  const [text, setText] = useState("");
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [followers, setFollowers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sugg, setSugg] = useState<Suggestion[] | null>(null);
  const suggPhotos = usePhotos([...(sugg ?? []), ...hits].map((h) => h.uid)); // suggestions and search results share one map
  const { desktop } = useLayout();
  const route: any = useRoute();
  const findKey = route?.params?.find;
  useEffect(() => { if (findKey) setTab("find"); }, [findKey]);
  const me: UserHit | null = user && profile ? { uid: user.uid, username: profile.username } : null;
  useEffect(() => {
    if (tab !== "find" || !user || !profile) return;
    suggestFollows({ uid: user.uid, hall: profile.hall, semester: profile.semester }).then(setSugg).catch(() => setSugg([]));
  }, [tab, user?.uid]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError("");
    try {
      const [fg, fr] = await Promise.all([fetchFollowing(user.uid), fetchFollowers(user.uid)]);
      setFollowing(new Set(fg)); setFollowers(new Set(fr));
      if (tab === "global") setRows(await fetchTop("xp", 50, profile?.hall));
      else if (tab === "course" && courseId) setRows(await fetchTop(`courseXp.${courseId}`, 50, profile?.hall));
      else if (tab === "friends") {
        const list = await fetchScores([user.uid, ...fg]);
        setRows(list.sort((a, b) => b.xp - a.xp));
      }
    } catch (e: any) {
      setError(`Couldn't load (${e?.code ?? "unknown"}). ${e?.message ?? ""}`);
    } finally { setLoading(false); }
  }, [user, tab, courseId, profile?.hall]);

  useEffect(() => { load(); }, [load]);

  // Pull down to refresh (native: RefreshControl; web/PWA: touch handler in pullRefresh.tsx).
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => { setRefreshing(true); try { await load(); } finally { setRefreshing(false); } };
  const { scrollRef, indicator } = usePullToRefresh(onRefresh); // web / PWA

  // Search as the student types (waits a moment after the last keystroke).
  useEffect(() => {
    if (tab !== "find") return;
    const t = setTimeout(async () => {
      try { setHits((await searchUsers(text)).filter((h) => h.uid !== user?.uid)); setError(""); }
      catch (e: any) { setError(`Search failed (${e?.code ?? "unknown"}).`); }
    }, 350);
    return () => clearTimeout(t);
  }, [text, tab, user]);

  const toggle = async (target: UserHit) => {
    if (!me) return;
    const was = following.has(target.uid);
    const next = new Set(following);
    was ? next.delete(target.uid) : next.add(target.uid);
    setFollowing(next); // update the screen right away
    try { was ? await unfollow(me.uid, target.uid) : await follow(me, target); }
    catch (e: any) { setFollowing(following); setError(`Couldn't update (${e?.code ?? "unknown"}).`); }
  };

  const FollowBtn = ({ target }: { target: UserHit }) => {
    if (target.uid === me?.uid) return null;
    const f = following.has(target.uid);
    const friend = f && followers.has(target.uid);
    return (
      <TouchableOpacity onPress={() => toggle(target)} style={[s.fbtn, f && s.fbtnOn]}>
        <Text style={[s.fbtnText, f && { color: COLORS.muted }]}>{friend ? wi("Friends ✓") : f ? "Following" : followers.has(target.uid) ? "Follow back" : "Follow"}</Text>
      </TouchableOpacity>
    );
  };

  const value = (r: ScoreRow) => (tab === "course" ? r.courseXp?.[courseId] ?? 0 : r.xp);

  const { progress: prog, streak } = useProgress();
  const rk = rankFor(prog.xp);
  const R = 36, CIRC = 2 * Math.PI * R;
  const medalColor = (i: number) => (i === 0 ? "#F5B82E" : i === 1 ? "#C0C7D6" : i === 2 ? "#CD8B54" : COLORS.muted);
  const chips: { id: string; label: string; on: boolean; go: () => void }[] = [
    { id: "global", label: profile?.hall ? `${profile.hall} class` : "Global", on: tab === "global", go: () => setTab("global") },
    { id: "friends", label: "Friends", on: tab === "friends", go: () => setTab("friends") },
    ...courses.map((c) => ({ id: c.id, label: c.name, on: tab === "course" && courseId === c.id, go: () => { setCourseId(c.id); setTab("course"); } })),
  ];

  return (
    <View style={{ flex: 1 }}>{indicator}<ScrollView ref={scrollRef} refreshControl={Platform.OS === "web" ? undefined : <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} colors={[COLORS.accent]} />} onScroll={onScroll} scrollEventThrottle={16} style={s.page} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }} keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Compete" sub="Leaderboards, streaks and your trophies" />
      <TouchableOpacity onPress={() => battles.open()} activeOpacity={0.85} style={{ flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, borderColor: COLORS.accent, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 }}>
        <Text style={{ fontSize: 28, marginRight: 12 }}><Em n="swords" /></Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.text, fontSize: 17, fontWeight: "800" }}>XP Battles</Text>
          <Text style={{ color: COLORS.muted, marginTop: 2 }}>{battles.invites > 0 ? `${battles.invites} challenge${battles.invites === 1 ? "" : "s"} waiting for you!` : "Go head-to-head live and stake XP."}</Text>
        </View>
        {battles.invites > 0 && <View style={{ backgroundColor: COLORS.danger, borderRadius: 999, minWidth: 24, height: 24, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 }}><Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>{battles.invites}</Text></View>}
      </TouchableOpacity>

      {desktop ? (
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ width: 440, marginRight: 36 }}>
            <View style={s.rankCard}>
              <View style={{ width: 84, height: 84, alignItems: "center", justifyContent: "center" }}>
                <Svg width={84} height={84} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
                  <Circle cx={42} cy={42} r={R} stroke={COLORS.border} strokeWidth={7} fill="none" />
                  <Circle cx={42} cy={42} r={R} stroke={COLORS.accent} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={`${CIRC}`} strokeDashoffset={CIRC * (1 - rk.pct / 100)} />
                </Svg>
                <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: "800" }}>{rk.level}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: "800" }}>{rk.title}</Text>
                <Text style={{ color: COLORS.muted, marginTop: 4 }}>{Math.round(prog.xp)} XP · {rk.need - rk.into} to next</Text>
              </View>
              <Text style={{ color: COLORS.accent, fontSize: 20, fontWeight: "800" }}>🔥 {streak}</Text>
            </View>

            <Text style={s.h2}>Trophy case</Text>
            <AchievementChips wrap />
          </View>
          <View style={{ flex: 1 }}>
            {tab === "find" ? (
              <>
                <Text style={s.h2}>Find students</Text>
                <TextInput value={text} onChangeText={setText} placeholder="Search a username…" placeholderTextColor={COLORS.muted}
                  autoCapitalize="none" autoCorrect={false} autoFocus style={s.input} />
                {!!error && <Text style={s.error}>{error}</Text>}
                {text.trim().length < 2 && <Text style={s.small}>Type at least 2 letters of a username.</Text>}
                {text.trim().length < 2 && sugg === null && <Text style={s.small}>Finding people for you…</Text>}
                {text.trim().length < 2 && sugg && sugg.length === 0 && <Text style={s.small}>No suggestions yet — as more students join and score, they'll show up here.</Text>}
                {text.trim().length < 2 && sugg && sugg.length > 0 && (
                  <>
                    <Text style={[s.h2, { marginTop: 14 }]}>Suggested for you</Text>
                    {sugg.map((h) => (
                      <View key={h.uid} style={s.row}>
                        <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center" }} onPress={() => open(h.uid, h.username)}>
                          <Avatar name={h.username} photo={suggPhotos[h.uid]} size={36} />
                          <View style={{ marginLeft: 12, flex: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}><Text style={s.name}>@{h.username}</Text><VerifiedBadge uid={h.uid} /></View>
                            <Text style={s.small}>{h.reason}</Text>
                          </View>
                        </TouchableOpacity>
                        <FollowBtn target={h} />
                      </View>
                    ))}
                  </>
                )}
                {text.trim().length >= 2 && hits.length === 0 && <Text style={s.small}>No students found.</Text>}
                {hits.map((h) => (
                  <View key={h.uid} style={s.row}>
                    <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center" }} onPress={() => open(h.uid, h.username)}>
                      <Avatar name={h.username} photo={suggPhotos[h.uid]} size={36} /><Text style={[s.name, { marginLeft: 12 }]}>@{h.username}</Text><VerifiedBadge uid={h.uid} />
                    </TouchableOpacity>
                    <FollowBtn target={h} />
                  </View>
                ))}
                <TouchableOpacity onPress={() => setTab("global")} style={{ marginTop: 14 }}><Text style={s.refresh}>← Back to leaderboard</Text></TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[s.h2, { marginTop: 0 }]}>Leaderboard</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  {chips.map((c) => (
                    <TouchableOpacity key={c.id} onPress={c.go} style={[s.chip, c.on && s.chipOn]}>
                      <Text style={[s.chipText, c.on && { color: COLORS.onPrimary }]}>{c.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {!!error && <Text style={s.error}>{error}</Text>}
                {loading && !refreshing && <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 16 }} />}
                {!loading && rows.length === 0 && !error && (
                  <Text style={s.small}>{tab === "friends" ? "Follow classmates (search icon) to see them here." : "Nobody on this board yet. Finish a quiz round to get on it!"}</Text>
                )}
                {rows.map((r, i) => {
                  const you = r.uid === user?.uid;
                  return (
                    <TouchableOpacity key={r.uid} onPress={() => open(r.uid, r.username)} style={[s.lbRow, you && s.me]}>
                      <Text style={[s.pos, { color: medalColor(i) }]} font="Montserrat">{i + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={s.name} font="Montserrat">{you ? "You" : r.username}</Text>
                        <Text style={s.small} font="Montserrat">{r.title}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end", marginRight: 8 }}>
                        <Text style={s.xpLarge} font="Montserrat">{value(r)}</Text>
                        <Text style={s.xpSub} font="Montserrat">XP</Text>
                      </View>
                      <View style={{ alignItems: "center" }}>
                        <Text style={s.accuracyLarge} font="Montserrat">{r.accuracy}</Text>
                        <Text style={s.accuracySub} font="Montserrat">%</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity onPress={load} style={{ marginTop: 10 }}><Text style={s.refresh} font="Montserrat">↻ Refresh</Text></TouchableOpacity>
              </>
            )}

          </View>
        </View>
      ) : (
        <>
          <View style={s.rankCard}>
            <View style={{ width: 84, height: 84, alignItems: "center", justifyContent: "center" }}>
              <Svg width={84} height={84} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
                <Circle cx={42} cy={42} r={R} stroke={COLORS.border} strokeWidth={7} fill="none" />
                <Circle cx={42} cy={42} r={R} stroke={COLORS.accent} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={`${CIRC}`} strokeDashoffset={CIRC * (1 - rk.pct / 100)} />
              </Svg>
              <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: "800" }}>{rk.level}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: "800" }}>{rk.title}</Text>
              <Text style={{ color: COLORS.muted, marginTop: 4 }}>{Math.round(prog.xp)} XP · {rk.need - rk.into} to next</Text>
            </View>
            <Text style={{ color: COLORS.accent, fontSize: 20, fontWeight: "800" }}>🔥 {streak}</Text>
          </View>

          {tab === "find" ? (
            <>
              <Text style={s.h2}>Find students</Text>
              <TextInput value={text} onChangeText={setText} placeholder="Search a username…" placeholderTextColor={COLORS.muted}
                autoCapitalize="none" autoCorrect={false} autoFocus style={s.input} />
              {!!error && <Text style={s.error}>{error}</Text>}
              {text.trim().length < 2 && <Text style={s.small}>Type at least 2 letters of a username.</Text>}
              {text.trim().length < 2 && sugg === null && <Text style={s.small}>Finding people for you…</Text>}
              {text.trim().length < 2 && sugg && sugg.length === 0 && <Text style={s.small}>No suggestions yet — as more students join and score, they'll show up here.</Text>}
              {text.trim().length < 2 && sugg && sugg.length > 0 && (
                <>
                  <Text style={[s.h2, { marginTop: 14 }]}>Suggested for you</Text>
                  {sugg.map((h) => (
                    <View key={h.uid} style={s.row}>
                      <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center" }} onPress={() => open(h.uid, h.username)}>
                        <Avatar name={h.username} photo={suggPhotos[h.uid]} size={36} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <View style={{ flexDirection: "row", alignItems: "center" }}><Text style={s.name}>@{h.username}</Text><VerifiedBadge uid={h.uid} /></View>
                          <Text style={s.small}>{h.reason}</Text>
                        </View>
                      </TouchableOpacity>
                      <FollowBtn target={h} />
                    </View>
                  ))}
                </>
              )}
              {text.trim().length >= 2 && hits.length === 0 && <Text style={s.small}>No students found.</Text>}
              {hits.map((h) => (
                <View key={h.uid} style={s.row}>
                  <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center" }} onPress={() => open(h.uid, h.username)}>
                    <Avatar name={h.username} photo={suggPhotos[h.uid]} size={36} /><Text style={[s.name, { marginLeft: 12 }]}>@{h.username}</Text><VerifiedBadge uid={h.uid} />
                  </TouchableOpacity>
                  <FollowBtn target={h} />
                </View>
              ))}
              <TouchableOpacity onPress={() => setTab("global")} style={{ marginTop: 14 }}><Text style={s.refresh}>← Back to leaderboard</Text></TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.h2}>Leaderboard</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {chips.map((c) => (
                  <TouchableOpacity key={c.id} onPress={c.go} style={[s.chip, c.on && s.chipOn]}>
                    <Text style={[s.chipText, c.on && { color: COLORS.onPrimary }]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {!!error && <Text style={s.error}>{error}</Text>}
              {loading && !refreshing && <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 16 }} />}
              {!loading && rows.length === 0 && !error && (
                <Text style={s.small}>{tab === "friends" ? "Follow classmates (search icon) to see them here." : "Nobody on this board yet. Finish a quiz round to get on it!"}</Text>
              )}
              {rows.map((r, i) => {
                const you = r.uid === user?.uid;
                return (
                  <TouchableOpacity key={r.uid} onPress={() => open(r.uid, r.username)} style={[s.lbRow, you && s.me]}>
                    <Text style={[s.pos, { color: medalColor(i) }]} font="Montserrat">{i + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.name} font="Montserrat">{you ? "You" : r.username}</Text>
                      <Text style={s.small} font="Montserrat">{r.title}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end", marginRight: 8 }}>
                      <Text style={s.xpLarge} font="Montserrat">{value(r)}</Text>
                      <Text style={s.xpSub} font="Montserrat">XP</Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <Text style={s.accuracyLarge} font="Montserrat">{r.accuracy}</Text>
                      <Text style={s.accuracySub} font="Montserrat">%</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity onPress={load} style={{ marginTop: 10 }}><Text style={s.refresh} font="Montserrat">↻ Refresh</Text></TouchableOpacity>
            </>
          )}

          <Text style={s.h2}>Trophy case</Text>
          <AchievementChips />
        </>
      )}
    </ScrollView>
    </View>
  );
}

const makeStyles = (COLORS: Colors) => StyleSheet.create({
  page: { flex: 1 },
  h2: { color: COLORS.text, fontSize: 20, fontWeight: "800", marginTop: 24, marginBottom: 12 },
  rankCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 22, padding: 16 },
  chip: { paddingVertical: 11, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, marginRight: 10 },
  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.silver, fontWeight: "700", fontSize: 15 },
  lbRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: "transparent" },
  pct: { color: COLORS.text, fontWeight: "800", fontSize: 18 },
  xpLarge: { color: COLORS.accent, fontWeight: "800", fontSize: 20 },
  xpSub: { color: COLORS.muted, fontSize: 10, fontWeight: "600" },
  accuracyLarge: { color: COLORS.accent, fontWeight: "800", fontSize: 16 },
  accuracySub: { color: COLORS.muted, fontSize: 9, fontWeight: "600" },
  tabs: { flexDirection: "row", backgroundColor: COLORS.card, borderRadius: 14, padding: 4, marginBottom: 14 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabOn: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.muted, fontWeight: "700" },
  input: { backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, color: COLORS.text, padding: 14, fontSize: 16, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 8 },
  me: { borderColor: COLORS.accent, backgroundColor: COLORS.card },
  pos: { width: 40, color: COLORS.text, fontWeight: "800", fontSize: 18 },
  name: { color: COLORS.text, fontWeight: "700", fontSize: 15 },
  small: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  xp: { color: COLORS.accent, fontWeight: "800", marginBottom: 4 },
  fbtn: { backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  fbtnOn: { backgroundColor: "transparent", borderWidth: 1, borderColor: COLORS.border },
  fbtnText: { color: COLORS.onPrimary, fontWeight: "700", fontSize: 12 },
  error: { color: COLORS.danger, marginBottom: 10 },
  refresh: { color: COLORS.accent, fontWeight: "700", textAlign: "center" },
});