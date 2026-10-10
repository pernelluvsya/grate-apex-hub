import { usePullToRefresh } from "../pullRefresh";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Platform, RefreshControl, ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "../Text";
import { useAuth } from "../auth";
import { useProgress, rankFor } from "../progress";
import { useProfileHost } from "../profileHost";
import { useColors, Colors } from "../theme";
import { Button } from "../ui";
import { Activity, fetchFeed, fetchFollowing, postActivity } from "../social";
import PostCard from "../PostCard";
import { StoriesBar } from "../StoriesUI";
import { AttachBar } from "../MediaUI";
import { SkeletonGroup, SkeletonPost } from "../Skeleton";
import { Media, cleanMedia } from "../media";
import { TextInput } from "../Text";
import { useNavScroll } from "./Tabs";
import { withIcons as wi } from "../components/em";
import { useNavigation } from "@react-navigation/native";
import { useLayout } from "../responsive";
import { BellButton } from "../notifHost";
import QotdCard from "./QotdCard";
import { LogoMark } from "../components/logo-mark";
import { Icon } from "../components/ui/icon";
import { IconButton } from "../components/ui/icon-button";
import { Card } from "../components/ui/interactive";
import { ProgressRing } from "../components/ui/progress-ring";
import { AnimatedNumber } from "../components/ui/animated-number";
import { AnimatedContent } from "../components/motion";
import { Type } from "../constants/theme";

export default function FeedScreen() {
  const { onScroll } = useNavScroll();
  const COLORS = useColors();
  const s = useMemo(() => makeStyles(COLORS), [COLORS]);
  const { user, profile } = useAuth();
  const { progress, streak } = useProgress();
  const { open } = useProfileHost();
  const nav = useNavigation<any>();
  const { desktop } = useLayout();
  const rank = rankFor(progress.xp);
  const week = useMemo(() => {
    const out: { label: string; n: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      out.push({ label: "SMTWTFS"[d.getDay()], n: progress.days[key] || 0 });
    }
    return out;
  }, [progress.days]);
  const weekTotal = week.reduce((a, d) => a + d.n, 0);
  const weekMax = Math.max(5, ...week.map((d) => d.n));
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shared, setShared] = useState(false);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [posting, setPosting] = useState(false);
  const [uids, setUids] = useState<string[]>([]);

  const post = async () => {
    if (!user || !profile || (!text.trim() && !media.length)) return;
    setPosting(true);
    await postActivity(user.uid, profile.username, "post", { text: text.trim().slice(0, 280), media: cleanMedia(media) });
    setText(""); setMedia([]); setPosting(false); load();
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError("");
    try {
      const fg = await fetchFollowing(user.uid);
      setUids([user.uid, ...fg]);
      setItems(await fetchFeed([user.uid, ...fg]));
    } catch (e: any) { setError(`Couldn't load the feed (${e?.code ?? "unknown"}). ${e?.message ?? ""}`); }
    finally { setLoading(false); }
  }, [user]);
  useEffect(() => { load(); }, [load]);

  // Pull down to refresh (native: RefreshControl; web/PWA: touch handler in pullRefresh.tsx).
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => { setRefreshing(true); try { await load(); } finally { setRefreshing(false); } };
  const { scrollRef, indicator } = usePullToRefresh(onRefresh); // web / PWA

  // Build a "my week" card from the last 7 days of study, and post it to the feed.
  const shareWeek = async () => {
    if (!user || !profile) return;
    let answered = 0, activeDays = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (progress.days[key]) { answered += progress.days[key]; activeDays++; }
    }
    await postActivity(user.uid, profile.username, "recap", { answered, activeDays, streak, title: rankFor(progress.xp).title });
    setShared(true); load();
  };

  const feedCol = (
    <View style={{ width: "100%" }}>
      <StoriesBar uids={uids} />
      <Card style={s.compose}>
        <TextInput value={text} onChangeText={setText} maxLength={280} multiline placeholder="Share something with your classmates…" placeholderTextColor={COLORS.textTertiary} style={s.input} />
        <AttachBar value={media} onChange={setMedia} />
        <View style={s.composeRow}>
          <Button variant="ghost" title={shared ? "Shared ✓" : "Share my week"} onPress={shareWeek} disabled={shared} />
          <Button title="Post" onPress={post} loading={posting} disabled={!text.trim() && !media.length} />
        </View>
      </Card>
      {!!error && <Text style={s.error} font="Roboto">{error}</Text>}
      {loading && !refreshing && items.length === 0 && (
        <SkeletonGroup>{[0, 1, 2].map((i) => <SkeletonPost key={i} />)}</SkeletonGroup>
      )}
      {!loading && items.length === 0 && !error && (
        <Card tone="muted" style={{ marginTop: 6 }}><Text style={s.sub} font="Roboto">Nothing here yet. Finish a quiz round, or follow classmates in Compete → Find to see their activity.</Text></Card>
      )}
      <View style={{ height: 6 }} />
      {items.map((a) => (
        <PostCard key={a.uid + a.id} a={a} onOpenUser={open} onRemoved={(x) => setItems((l) => l.filter((y) => !(y.uid === x.uid && y.id === x.id)))} />
      ))}
      <TouchableOpacity onPress={load} style={{ marginTop: 6 }}><Text style={s.refresh} font="Roboto">Refresh</Text></TouchableOpacity>
    </View>
  );

  const rail = (
    <View style={s.rail}>
      <Card tone="reward" style={{ gap: 14 }}>
        <View style={s.rankRow}>
          <ProgressRing value={rank.pct / 100} size={74} thickness={6} gradient={["#FFD54A", "#E3A400"]} trackColor={COLORS.track} label={`${rank.pct}% of the way to the next level`}>
            <Icon name="rank" size={26} color={COLORS.accentText} strokeWidth={2.1} />
          </ProgressRing>
          <View style={{ flex: 1 }}>
            <Text style={s.eyebrow}>CURRENT RANK</Text>
            <Text style={s.rankName} numberOfLines={2}>{rank.title}</Text>
            <View style={s.xpRow}>
              <Icon name="xp" size={14} color={COLORS.accent} filled />
              <AnimatedNumber value={progress.xp} style={s.xpValue} />
              <Text style={s.xpLabel}>lifetime XP</Text>
            </View>
          </View>
        </View>
        <View style={s.divider} />
        <View style={s.rankRow}>
          <Text style={[s.caption, { flex: 1 }]}><Text style={s.captionStrong}>{rank.need - rank.into} XP</Text> to Level {rank.level + 1}</Text>
          <View style={s.streak}><Icon name="streak" size={14} color={COLORS.accent} filled /><Text style={s.captionStrong}>{streak} day{streak === 1 ? "" : "s"}</Text></View>
        </View>
      </Card>
      <QotdCard />
      <Card style={{ gap: 12 }}>
        <View>
          <Text style={s.sectionTitle}>Your week</Text>
          <Text style={s.sub} font="Roboto">{weekTotal} question{weekTotal === 1 ? "" : "s"} answered in the last 7 days</Text>
        </View>
        <View style={s.bars}>
          {week.map((d, i) => (
            <View key={i} style={s.barCol}>
              <View style={s.barTrack}><View style={[s.barFill, { height: `${Math.max(d.n ? 12 : 0, (d.n / weekMax) * 100)}%`, backgroundColor: i === 6 ? COLORS.accent : COLORS.primary }]} /></View>
              <Text style={s.barLabel}>{d.label}</Text>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>{indicator}<ScrollView ref={scrollRef} refreshControl={Platform.OS === "web" ? undefined : <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} colors={[COLORS.accent]} />} onScroll={onScroll} scrollEventThrottle={16} style={s.page} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View style={s.brand}>
          <LogoMark height={28} />
          <Text style={s.wordmark}>GrAteApex Hub</Text>
        </View>
        <View style={s.actions}>
          <IconButton icon="search" label="Find students" onPress={() => nav.navigate("Compete", { find: Date.now() })} />
          {!desktop && <BellButton size={40} />}
        </View>
      </View>
      <AnimatedContent style={s.welcome}>
        <Text style={s.eyebrowPrimary}>YOUR STUDY SPACE</Text>
        <Text style={s.title} accessibilityRole="header">Welcome to the community</Text>
        <Text style={s.subtitle}>Study alongside fellow learners, share your progress and cheer each other on.</Text>
      </AnimatedContent>
      {desktop ? (
        <View style={s.cols}>
          <View style={{ flex: 1, minWidth: 0 }}>{feedCol}</View>
          <View style={{ width: 360 }}>{rail}</View>
        </View>
      ) : (
        <>{feedCol}{rail}</>
      )}
      <Text style={s.motto}>Reach the Apex of GrAteness</Text>
    </ScrollView>
    </View>
  );
}

const makeStyles = (COLORS: Colors) => StyleSheet.create({
  page: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  wordmark: { fontSize: 20, fontWeight: "800", letterSpacing: 0.9, color: COLORS.logoLetters },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  welcome: { alignItems: "flex-start", marginBottom: 16, minHeight: 96, justifyContent: "center" },
  eyebrowPrimary: { ...Type.overline, color: COLORS.primaryText },
  title: { ...Type.display, color: COLORS.text, marginTop: 2 },
  subtitle: { ...Type.callout, color: COLORS.textSecondary, marginTop: 4 },
  cols: { flexDirection: "row", alignItems: "flex-start", gap: 24 },
  rail: { gap: 12, marginTop: 18 },
  compose: { gap: 10, marginBottom: 12 },
  composeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  input: { color: COLORS.text, minHeight: 56, fontSize: 15 },
  sub: { color: COLORS.textSecondary, lineHeight: 20, fontSize: 13 },
  error: { color: COLORS.danger, marginVertical: 10 },
  refresh: { color: COLORS.accent, fontWeight: "700", textAlign: "center" },
  rankRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  eyebrow: { ...Type.overline, color: COLORS.textTertiary },
  rankName: { ...Type.title2, color: COLORS.text, marginTop: 2 },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  xpValue: { ...Type.headline, color: COLORS.text },
  xpLabel: { ...Type.caption, color: COLORS.textSecondary },
  divider: { height: 1, backgroundColor: COLORS.border },
  caption: { ...Type.callout, color: COLORS.textSecondary },
  captionStrong: { fontWeight: "800", color: COLORS.text },
  streak: { flexDirection: "row", alignItems: "center", gap: 5 },
  sectionTitle: { ...Type.headline, color: COLORS.text },
  bars: { flexDirection: "row", gap: 8, height: 86, alignItems: "flex-end" },
  barCol: { flex: 1, alignItems: "center", gap: 6, height: "100%" },
  barTrack: { flex: 1, width: "100%", borderRadius: 8, backgroundColor: COLORS.track, justifyContent: "flex-end", overflow: "hidden" },
  barFill: { width: "100%", borderRadius: 8 },
  barLabel: { ...Type.caption, color: COLORS.textTertiary },
  motto: { textAlign: "center", ...Type.overline, letterSpacing: 1.6, color: COLORS.textTertiary, marginTop: 28 },
});
