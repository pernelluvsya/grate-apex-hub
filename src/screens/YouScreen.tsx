import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { TextInput } from "../Text";
import { useNavigation } from "@react-navigation/native";
import { Text } from "../Text";
import { useAuth } from "../auth";
import { useProgress, rankFor } from "../progress";
import { clearMyData } from "../clearData";
import { useColors, THEMES, useThemeCtl } from "../theme";
import { useProfileHost } from "../profileHost";
import { useAfterDismiss } from "../afterDismiss";
import { usePhotos } from "../photos";
import { Avatar } from "../MediaUI";
import { AchievementChips, AchievementShelf } from "../AchievementsUI";
import { pickAndUpload } from "../media";
import { Post, listMyPosts, timeAgo } from "../community";
import { Activity, UserHit, fetchEdges, fetchFollowers, fetchFollowing, listActivity } from "../social";
import PostCard from "../PostCard";
import { VerifiedBadge } from "../verified";
import PremiumScreen from "./PremiumScreen";
import HelpScreen from "./HelpScreen";
import { PushState, disablePush, enablePush, pushState } from "../push";
import { usePremium } from "../premium";
import { doc as fsDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import ScreenHeader from "../ScreenHeader";
import Icon, { IconName } from "../Icon";
import ThemePicker from "./ThemePicker";
import Background from "../Background";
import { useLayout } from "../responsive";
import { Column } from "../ui";
import StudyStreakHeatmap from "../StudyStreakHeatmap";
import { useNavScroll } from "./Tabs";
import { Em } from "../components/em";
import { Avatar as KitAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon as KitIcon, type IconName as KitIconName } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Card, Interactive } from "@/components/ui/interactive";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Columns, PageHeader, Screen, SectionHeader } from "@/components/ui/screen";
import { webStyle } from "@/components/ui/web";
import { RankProgressCard } from "@/components/rank-progress";
import { elevation, isDesktopWidth, Radius, Type, type ThemeColors } from "@/constants/theme";
import { useHomeLearning } from "@/home/bridge";
import { useTheme, useThemedStyles } from "@/hooks/use-theme";

// The legacy tab icons that the kit does not draw map to their nearest kit icon.
const KIT_ICON: Record<string, string> = { user: "profile", moon: "palette", replay: "repeat", chevron: "chevronRight" };

export default function YouScreen() {
  const { onScroll } = useNavScroll();
  const COLORS = useColors();
  const styles = useThemedStyles(createStyles);
  const tc = useTheme();
  const { width: winW } = useWindowDimensions();
  const wide = isDesktopWidth(winW);
  const learning = useHomeLearning();
  const nav = useNavigation<any>();
  const { desktop } = useLayout();
  // Phone: the Settings button in the header scrolls straight down to the Settings block.
  const scrollRef = useRef<ScrollView>(null);
  const settingsY = useRef(0);
  const jumpToSettings = () => scrollRef.current?.scrollTo({ y: Math.max(0, settingsY.current - 12), animated: true });
  const { user, profile, signOut, replayTutorial, setPhoto, setBio, setDisplayName, changeUsername, setReminders, setAutoHideNav, setFeedback } = useAuth();
  const { premium } = usePremium();
  const [premOpen, setPremOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => { if (user) getDoc(fsDoc(db, "admins", user.uid)).then((d) => setIsAdmin(d.exists())).catch(() => { }); }, [user]);
  const [editName, setEditName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [savingName, setSavingName] = useState(false);
  const saveName = async () => {
    setNameErr(""); setSavingName(true);
    try { await changeUsername(nameDraft); setEditName(false); }
    catch (e: any) { setNameErr(e?.message ?? "Couldn't change your username."); }
    finally { setSavingName(false); }
  };
  const [editDisplay, setEditDisplay] = useState(false);
  const [displayDraft, setDisplayDraft] = useState("");
  const [displayErr, setDisplayErr] = useState("");
  const [savingDisplay, setSavingDisplay] = useState(false);
  const openDisplay = () => { setDisplayDraft(profile?.displayName ?? ""); setDisplayErr(""); setEditDisplay(true); };
  const saveDisplay = async () => {
    setDisplayErr(""); setSavingDisplay(true);
    try { await setDisplayName(displayDraft); setEditDisplay(false); }
    catch (e: any) { setDisplayErr(e?.message ?? "Couldn't save your display name."); }
    finally { setSavingDisplay(false); }
  };
  const [editBio, setEditBio] = useState(false);
  const [draft, setDraft] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const saveBio = async () => { setSavingBio(true); try { await setBio(draft); setEditBio(false); } catch (e: any) { setErr("Couldn't save your bio (" + (e?.code ?? "error") + ")."); } finally { setSavingBio(false); } };
  const { progress, resetProgress } = useProgress();
  const [clearOpen, setClearOpen] = useState(false);
  const [clearTyped, setClearTyped] = useState("");
  const [clearing, setClearing] = useState(false);
  const [clearErr, setClearErr] = useState("");
  const [cleared, setCleared] = useState(false);
  const typedOk = !!profile?.username && clearTyped.trim().toLowerCase() === profile.username.toLowerCase();
  const openClear = () => { setClearTyped(""); setClearErr(""); setCleared(false); setClearOpen(true); };
  const doClear = async () => {
    if (!user || !typedOk || clearing) return;
    setClearErr(""); setClearing(true);
    try { await clearMyData(user.uid, resetProgress); setCleared(true); }
    catch (e: any) { setClearErr(`Couldn't clear everything (${e?.code ?? e?.message ?? "error"}). Check your connection and try again.`); }
    finally { setClearing(false); }
  };
  const { themeId } = useThemeCtl();
  const { open } = useProfileHost();
  const { onDismiss: onPeopleDismiss, closeThen } = useAfterDismiss();
  const [themes, setThemes] = useState(false);
  const [all, setAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [fr, setFr] = useState(0);
  const [fg, setFg] = useState(0);
  const [acts, setActs] = useState<Activity[]>([]);
  const [push, setPush] = useState<PushState>("unsupported");
  useEffect(() => { pushState().then(setPush); }, []);
  const togglePush = async () => {
    if (!user) return;
    setErr("");
    try {
      if (push === "on") await disablePush(user.uid);
      else if (push === "needs-install") { setErr("On iPhone: tap Share, then Add to Home Screen, open the app from there, and turn this on."); return; }
      else if (push === "unsupported") { setErr("This browser doesn't support push notifications."); return; }
      else if (push === "blocked") { setErr("Notifications are blocked. Allow them in your browser's site settings for this site, then try again."); return; }
      else await enablePush(user.uid);
    } catch (e: any) { setErr(e?.message || "Couldn't change that."); }
    setPush(await pushState());
  };
  const pushLabel = push === "on" ? "On" : push === "off" ? "Off" : push === "blocked" ? "Blocked" : push === "needs-install" ? "Install first" : push === "not-configured" ? "Not set up" : "Unavailable";
  const [people, setPeople] = useState<null | { title: string; list: UserHit[] }>(null);
  const peoplePhotos = usePhotos((people?.list ?? []).map((u) => u.uid));
  const r = rankFor(progress.xp);
  const theme = THEMES.find((t) => t.id === themeId);

  useEffect(() => {
    if (!user) return;
    listMyPosts(user.uid).then(setPosts).catch(() => { });
    fetchFollowers(user.uid).then((x) => setFr(x.length)).catch(() => { });
    fetchFollowing(user.uid).then((x) => setFg(x.length)).catch(() => { });
    listActivity(user.uid, 8).then(setActs).catch(() => { });
  }, [user]);

  const changePhoto = async () => {
    setErr(""); setBusy(true);
    try { const m = await pickAndUpload({ video: false }); if (m) await setPhoto(m.url); }
    catch (e: any) { setErr(e?.message ?? "Upload failed."); }
    finally { setBusy(false); }
  };

  const Row = ({ icon, label, value, onPress, danger, last, soon }: { icon: IconName; label: string; value?: string; onPress: () => void; danger?: boolean; last?: boolean; soon?: boolean }) => (
    <Interactive onPress={onPress} disabled={soon} accessibilityRole="button" accessibilityLabel={label}
      style={({ hovered }: any) => [styles.menuItem, !last && styles.menuDivider, hovered && styles.menuHover]}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}><KitIcon name={(KIT_ICON[icon as string] ?? icon) as KitIconName} size={18} color={danger ? tc.error : tc.primaryText} /></View>
      <View style={styles.flex}><Text style={[styles.menuText, danger && { color: tc.error }]}>{label}</Text></View>
      {soon ? <View style={styles.soon}><Text style={styles.soonText}>COMING SOON</Text></View> : <>
        {!!value && <Text style={styles.menuValue} numberOfLines={1}>{value}</Text>}
        <KitIcon name="chevronRight" size={18} color={tc.textTertiary} />
      </>}
    </Interactive>
  );
  // tap Followers / Following to see who they are (and open their profiles)
  const showPeople = async (dir: "followers" | "following") => {
    if (!user) return;
    setPeople({ title: dir === "followers" ? "Followers" : "Following", list: [] });
    try { setPeople({ title: dir === "followers" ? "Followers" : "Following", list: await fetchEdges(user.uid, dir) }); } catch { /* keep empty */ }
  };

  // ---- derived record (all from the hub's own progress, never invented) ----
  const concepts = [...learning.memory.concepts.values()];
  const mastered = concepts.filter((c) => c.state === "mastered").length;
  const dueNow = concepts.filter((c) => c.due).length;
  const reviewDays = Object.values(progress.termDays ?? {}).filter((n) => n > 0).length;
  const stats: { icon: KitIconName; value: number; label: string; gold?: boolean }[] = [
    { icon: "xp", value: progress.xp, label: "Lifetime XP", gold: true },
    { icon: "level", value: r.level, label: "Level" },
    { icon: "streak", value: learning.streak, label: "Day streak", gold: true },
    { icon: "lesson", value: learning.lessonsDone, label: "Lessons" },
    { icon: "mastery", value: mastered, label: "Mastered" },
    { icon: "reinforce", value: dueNow, label: "Due now" },
  ];
  const milestones: { icon: KitIconName; title: string; detail: string; earned: boolean }[] = [
    { icon: "lesson", title: "First lesson", detail: "Complete a lesson", earned: learning.lessonsDone >= 1 },
    { icon: "streak", title: "Week warrior", detail: "Reach a 7-day streak", earned: learning.streak >= 7 },
    { icon: "mastery", title: "First mastery", detail: "Master a flashcard", earned: mastered >= 1 },
    { icon: "reinforce", title: "Consistent reviewer", detail: "Review on 5 different days", earned: reviewDays >= 5 },
    { icon: "chat", title: "First post", detail: "Share something on your Feed", earned: acts.some((a: any) => a.type === "post") || posts.length > 0 },
    { icon: "social", title: "Making friends", detail: "Get your first follower", earned: fr >= 1 },
  ];
  const earnedCount = milestones.filter((m) => m.earned).length;

  const identity = (
    <View style={[styles.identity, elevation(tc, 2)]}>
      <View style={styles.profileAvatar}>
        <KitAvatar uri={profile?.photo ?? null} name={profile?.username ?? "?"} size={84} ring="gold" />
        <Interactive onPress={changePhoto} disabled={busy} accessibilityLabel="Change profile picture" style={styles.changeAvatar}>
          <KitIcon name="camera" size={15} color={tc.onPrimary} />
        </Interactive>
      </View>
      <View style={styles.identityText}>
        <View style={styles.nameRow}><Text style={styles.name} numberOfLines={1}>{profile?.displayName || profile?.username}</Text><VerifiedBadge uid={user?.uid} size={22} /></View>
        <Text style={styles.username}>@{profile?.username} · {profile?.hall} · Semester {profile?.semester}</Text>
        <View style={styles.badges}>
          <View style={styles.rankBadge}><KitIcon name="rank" size={14} color="#0A1F5C" strokeWidth={2.2} /><Text style={styles.rankBadgeText}>{r.title}</Text></View>
          <View style={styles.levelBadge}><KitIcon name="level" size={13} color={tc.primaryText} /><Text style={styles.levelBadgeText}>Level {r.level}</Text></View>
        </View>
        <Interactive onPress={() => { setDraft(profile?.bio ?? ""); setEditBio(true); }} accessibilityLabel="Edit bio">
          {profile?.bio ? <Text style={styles.bio}>{profile.bio} <Text style={styles.bioEdit}>Edit</Text></Text> : <Text style={styles.bioEdit}>+ Add a bio</Text>}
        </Interactive>
        {!!err && <Text style={styles.error}>{err}</Text>}
        <View style={styles.identityActions}>
          <Button label={profile?.displayName ? "Edit display name" : "Set display name"} size="sm" variant="ghost" onPress={openDisplay} />
          <Button label="Change picture" size="sm" variant="ghost" onPress={changePhoto} />
          <Button label="Change username" size="sm" variant="ghost" onPress={() => { setNameDraft(""); setNameErr(""); setEditName(true); }} />
        </View>
      </View>
      <View style={styles.followRow}>
        <Interactive style={styles.followStat} accessibilityRole="button" accessibilityLabel="Posts"><Text style={styles.followValue}>{posts.length}</Text><Text style={styles.followLabel}>Posts</Text></Interactive>
        <View style={styles.followDivider} />
        <Interactive style={styles.followStat} onPress={() => showPeople("followers")} accessibilityRole="button" accessibilityLabel="Followers"><Text style={styles.followValue}>{fr}</Text><Text style={styles.followLabel}>Followers</Text></Interactive>
        <View style={styles.followDivider} />
        <Interactive style={styles.followStat} onPress={() => showPeople("following")} accessibilityRole="button" accessibilityLabel="Following"><Text style={styles.followValue}>{fg}</Text><Text style={styles.followLabel}>Following</Text></Interactive>
      </View>
    </View>
  );

  const statGrid = (
    <View style={styles.statGrid}>
      {stats.map((st) => (
        <View key={st.label} style={[styles.stat, wide ? styles.statDesktop : styles.statMobile]}>
          <KitIcon name={st.icon} size={16} color={st.gold ? tc.accentText : tc.primaryText} filled={st.gold} />
          <AnimatedNumber value={st.value} style={styles.statValue} />
          <Text style={styles.statLabel}>{st.label}</Text>
        </View>
      ))}
    </View>
  );

  const milestonesCard = (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Milestones</Text>
        <Text style={styles.cardMeta}>{earnedCount} of {milestones.length} earned</Text>
      </View>
      <View style={styles.achievementGrid}>
        {milestones.map((m) => (
          <View key={m.title} style={[styles.achievement, !m.earned && styles.achievementLocked]} accessibilityLabel={`${m.title}: ${m.detail}. ${m.earned ? "Earned" : "Not yet earned"}`}>
            <View style={[styles.achievementMark, m.earned && styles.achievementMarkEarned]}>
              <KitIcon name={m.earned ? m.icon : "lock"} size={18} color={m.earned ? "#0A1F5C" : tc.textTertiary} />
            </View>
            <Text style={styles.achievementTitle} numberOfLines={1}>{m.title}</Text>
            <Text style={styles.achievementDetail} numberOfLines={2}>{m.detail}</Text>
          </View>
        ))}
      </View>
      <Button label="All achievements" variant="secondary" size="sm" onPress={() => setAll(true)} />
    </Card>
  );

  const heatmapCard = <Card style={styles.card}><StudyStreakHeatmap progress={progress} /></Card>;

  const circleCard = (
    <Card style={styles.card}>
      <SectionHeader title="Your circle" subtitle="Followers and the people you follow." style={styles.noMargin} right={<Text style={styles.cardMeta}>{fg} following</Text>} />
      <View style={styles.circleBtns}>
        <Button label={`${fr} followers`} variant="secondary" size="sm" onPress={() => showPeople("followers")} />
        <Button label={`${fg} following`} variant="secondary" size="sm" onPress={() => showPeople("following")} />
      </View>
    </Card>
  );

  const activityBlock = (
    <View style={styles.block}>
      <SectionHeader title="Your activity" style={styles.noMargin} />
      {acts.length === 0 && <Card><Text style={styles.cardMeta}>Nothing yet. Post on your Feed or finish a quiz round.</Text></Card>}
      {acts.map((a) => <PostCard key={a.id} a={a} compact onOpenUser={open} onRemoved={(x) => setActs((l) => l.filter((y) => y.id !== x.id))} />)}
    </View>
  );

  const postsBlock = (
    <View style={styles.block}>
      <SectionHeader title="Discussion posts" style={styles.noMargin} />
      {posts.length === 0 && <Card><Text style={styles.cardMeta}>You haven't posted yet. Start a discussion in Community.</Text></Card>}
      {posts.slice(0, 5).map((p) => (
        <Interactive key={p.id} onPress={() => nav.navigate("Community")} accessibilityRole="button">
          <Card style={styles.postRow}>
            <Text style={styles.postTitle}>"{p.title}"</Text>
            <View style={styles.postMeta}><Text style={[styles.cardMeta, styles.flex]}>{timeAgo(p.createdAt)}</Text><KitIcon name="chat" size={15} color={tc.textTertiary} /><Text style={styles.cardMeta}>{p.replyCount}</Text></View>
          </Card>
        </Interactive>
      ))}
    </View>
  );

  const settingsMenu = (
    <View onLayout={(e) => { settingsY.current = e.nativeEvent.layout.y; }} style={styles.block}>
      <SectionHeader title="Settings" style={styles.noMargin} />
      <View style={[styles.menu, elevation(tc, 1)]}>
        <Row icon="trophy" label={isAdmin ? "Premium and payments (admin)" : "Premium"} soon={!isAdmin && !premium} value={premium ? "Active" : undefined} onPress={() => setPremOpen(true)} />
        <Row icon="user" label="Display name" value={profile?.displayName || "Not set"} onPress={openDisplay} />
        <Row icon="user" label="Edit bio" onPress={() => { setDraft(profile?.bio ?? ""); setEditBio(true); }} />
        <Row icon="camera" label={busy ? "Uploading…" : "Change photo"} onPress={changePhoto} />
        <Row icon="bell" label="Push notifications" value={pushLabel} onPress={togglePush} />
        <Row icon="bell" label="Daily streak reminder" value={profile?.remindersOff ? "Off" : push === "on" ? "On (5 pm)" : "On (needs push)"} onPress={() => setReminders(!!profile?.remindersOff).catch(() => setErr("Couldn't save that."))} />
        <Row icon="user" label="Change username" onPress={() => { setNameDraft(""); setNameErr(""); setEditName(true); }} />
        <Row icon="chat" label="Help & support" onPress={() => setHelpOpen(true)} />
        <Row icon="moon" label="Appearance" value={theme?.name} onPress={() => setThemes(true)} />
        <Row icon="eye" label="Auto-hide navigation" value={profile?.autoHideNav ? "On" : "Off"} onPress={() => setAutoHideNav(!profile?.autoHideNav).catch(() => setErr("Couldn't save that."))} />
        <Row icon="bell" label="Answer feedback" value={profile?.feedbackOff ? "Off" : "On"} onPress={() => setFeedback(!!profile?.feedbackOff).catch(() => setErr("Couldn't save that."))} />
        <Row icon="lock" label="Your class" value={`${profile?.hall} · Semester ${profile?.semester}`} onPress={() => setErr("Your class was locked in when you signed up, so it can't be changed.")} />
        <Row icon="replay" label="Replay tutorial" onPress={replayTutorial} />
        <Row icon="trash" label="Clear my data" danger onPress={openClear} />
        <Row icon="logout" label="Log out" danger last onPress={signOut} />
      </View>
    </View>
  );

  return (
    <Screen ref={scrollRef} width="content">
      <PageHeader title="Profile" subtitle="Your identity, progress and achievements." right={<IconButton icon="settings" label="Jump to settings" onPress={jumpToSettings} />} />
      {identity}
      <View style={styles.gap} />
      {wide ? (
        <Columns sideWidth={360}
          main={<View style={styles.column}>{statGrid}{milestonesCard}{heatmapCard}{activityBlock}{postsBlock}</View>}
          side={<View style={styles.column}><RankProgressCard lifetimeXp={progress.xp} />{circleCard}{settingsMenu}</View>} />
      ) : (
        <View style={styles.column}>
          <RankProgressCard lifetimeXp={progress.xp} />
          {statGrid}{milestonesCard}{heatmapCard}{circleCard}{activityBlock}{postsBlock}{settingsMenu}
        </View>
      )}

      <Modal visible={editName} transparent animationType="fade" onRequestClose={() => setEditName(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderColor: COLORS.border, borderWidth: 1, borderRadius: 22, padding: 20, width: "100%", maxWidth: 480, alignSelf: "center" }}>
            <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "800" }}>Change username</Text>
            <Text style={{ color: COLORS.muted, marginTop: 4, marginBottom: 12 }}>You are @{profile?.username}. You can change it once every 30 days. Your old posts keep the old name, and you can still sign in with either name.</Text>
            <TextInput value={nameDraft} onChangeText={setNameDraft} autoFocus autoCapitalize="none" autoCorrect={false} maxLength={20} placeholder="new_username" placeholderTextColor={COLORS.muted}
              style={{ color: COLORS.text, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 16 }} />
            <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 6 }}>3–20 letters, numbers or underscores.</Text>
            {!!nameErr && <Text style={{ color: "#ff8a8a", marginTop: 8, fontWeight: "600" }}>{nameErr}</Text>}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <TouchableOpacity onPress={() => setEditName(false)} style={{ paddingVertical: 12, paddingHorizontal: 18 }}><Text style={{ color: COLORS.muted, fontWeight: "700" }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveName} disabled={savingName} style={{ backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 22, opacity: savingName ? 0.6 : 1 }}><Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>{savingName ? "Saving…" : "Change"}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={editDisplay} transparent animationType="fade" onRequestClose={() => setEditDisplay(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderColor: COLORS.border, borderWidth: 1, borderRadius: 22, padding: 20, width: "100%", maxWidth: 480, alignSelf: "center" }}>
            <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "800" }}>Display name</Text>
            <Text style={{ color: COLORS.muted, marginTop: 4, marginBottom: 12 }}>The name people see on your posts and profile. Your @{profile?.username} stays the same and is how friends find you. You can change this any time.</Text>
            <TextInput value={displayDraft} onChangeText={setDisplayDraft} autoFocus maxLength={40} placeholder="e.g. Kofi Mensah" placeholderTextColor={COLORS.muted}
              style={{ color: COLORS.text, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 16 }} />
            <Text style={{ color: COLORS.muted, fontSize: 12, textAlign: "right", marginTop: 6 }}>{displayDraft.length}/40 · leave empty to show your @username</Text>
            {!!displayErr && <Text style={{ color: "#ff8a8a", marginTop: 8, fontWeight: "600" }}>{displayErr}</Text>}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <TouchableOpacity onPress={() => setEditDisplay(false)} style={{ paddingVertical: 12, paddingHorizontal: 18 }}><Text style={{ color: COLORS.muted, fontWeight: "700" }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveDisplay} disabled={savingDisplay} style={{ backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 22, opacity: savingDisplay ? 0.6 : 1 }}><Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>{savingDisplay ? "Saving…" : "Save"}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={editBio} transparent animationType="fade" onRequestClose={() => setEditBio(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderColor: COLORS.border, borderWidth: 1, borderRadius: 22, padding: 20, width: "100%", maxWidth: 480, alignSelf: "center" }}>
            <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "800" }}>Your bio</Text>
            <Text style={{ color: COLORS.muted, marginTop: 4, marginBottom: 12 }}>A line or two about you. Everyone on the app can see it.</Text>
            <TextInput value={draft} onChangeText={setDraft} maxLength={160} multiline autoFocus placeholder="e.g. Level 100 Med Sci · coffee and anatomy" placeholderTextColor={COLORS.muted}
              style={{ color: COLORS.text, borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, minHeight: 90, textAlignVertical: "top", fontSize: 15 }} />
            <Text style={{ color: COLORS.muted, fontSize: 12, textAlign: "right", marginTop: 6 }}>{draft.length}/160</Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <TouchableOpacity onPress={() => setEditBio(false)} style={{ paddingVertical: 12, paddingHorizontal: 18 }}><Text style={{ color: COLORS.muted, fontWeight: "700" }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveBio} disabled={savingBio} style={{ backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 22, opacity: savingBio ? 0.6 : 1 }}><Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>{savingBio ? "Saving…" : "Save"}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={clearOpen} transparent animationType="fade" onRequestClose={() => !clearing && setClearOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: COLORS.light ? "#ffffff" : "#0b1466", borderColor: COLORS.border, borderWidth: 1, borderRadius: 22, padding: 20, width: "100%", maxWidth: 480, alignSelf: "center" }}>
            {cleared ? (
              <>
                <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "800" }}>Your data was cleared</Text>
                <Text style={{ color: COLORS.muted, marginTop: 8, lineHeight: 21 }}>Your study progress and saved study data are gone. Your account is still here.</Text>
                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
                  <TouchableOpacity onPress={() => setClearOpen(false)} style={{ backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 22 }}><Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>Done</Text></TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={{ color: COLORS.danger, fontSize: 20, fontWeight: "800" }}>Clear my data</Text>
                <Text style={{ color: COLORS.muted, marginTop: 8, lineHeight: 21 }}>This permanently deletes, on all your devices:</Text>
                <Text style={{ color: COLORS.text, marginTop: 6, lineHeight: 22 }}>{"•  XP, level, streak and quiz stats\n•  Flashcard and review progress, lesson progress, exam date\n•  AI flashcard sets and Ask AI chats\n•  Unfinished quizzes"}</Text>
                <Text style={{ color: COLORS.muted, marginTop: 8, lineHeight: 21 }}>Your account, posts, friends, groups and messages stay. XP won or lost in battles is kept by the server. This can't be undone.</Text>
                <Text style={{ color: COLORS.text, marginTop: 14, fontWeight: "700" }}>Type <Text style={{ color: COLORS.danger, fontWeight: "800" }}>{profile?.username}</Text> to confirm</Text>
                <TextInput value={clearTyped} onChangeText={setClearTyped} editable={!clearing} autoCapitalize="none" autoCorrect={false} placeholder={profile?.username} placeholderTextColor={COLORS.muted}
                  style={{ color: COLORS.text, borderColor: typedOk ? COLORS.danger : COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 16, marginTop: 8 }} />
                {!!clearErr && <Text style={{ color: COLORS.danger, marginTop: 8, fontWeight: "600" }}>{clearErr}</Text>}
                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 14 }}>
                  <TouchableOpacity onPress={() => setClearOpen(false)} disabled={clearing} style={{ paddingVertical: 12, paddingHorizontal: 18 }}><Text style={{ color: COLORS.muted, fontWeight: "700" }}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={doClear} disabled={!typedOk || clearing} style={{ backgroundColor: COLORS.danger, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 22, opacity: !typedOk || clearing ? 0.4 : 1 }}><Text style={{ color: "#ffffff", fontWeight: "800" }}>{clearing ? "Clearing…" : "Clear my data"}</Text></TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Modal visible={!!people} transparent animationType="fade" onRequestClose={() => setPeople(null)} onDismiss={onPeopleDismiss}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, borderWidth: 1, borderRadius: 18, padding: 16, maxHeight: "70%", width: "100%", maxWidth: 420, alignSelf: "center" }}>
            <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "800", marginBottom: 10 }}>{people?.title}</Text>
            <ScrollView>
              {people && people.list.length === 0 && <Text style={{ color: COLORS.muted }}>Nobody yet.</Text>}
              {people?.list.map((u) => (
                <TouchableOpacity key={u.uid} onPress={() => closeThen(() => setPeople(null), () => open(u.uid, u.username))} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
                  <Avatar name={u.username} photo={peoplePhotos[u.uid]} size={36} /><Text style={{ color: COLORS.text, fontWeight: "700", marginLeft: 12 }}>@{u.username}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setPeople(null)} style={{ marginTop: 10, alignItems: "center", padding: 10 }}><Text style={{ color: COLORS.accent, fontWeight: "800" }}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
      <HelpScreen visible={helpOpen} onClose={() => setHelpOpen(false)} isAdmin={isAdmin} />
      <PremiumScreen visible={premOpen} onClose={() => setPremOpen(false)} isAdmin={isAdmin} />
      <ThemePicker visible={themes} onClose={() => setThemes(false)} />
      <Modal visible={all} animationType="slide" onRequestClose={() => setAll(false)}>
        <Background><Column>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>
            <TouchableOpacity onPress={() => setAll(false)} style={{ marginBottom: 14 }}><Text style={{ color: COLORS.accent, fontWeight: "700" }}><Em n="close" /> Close</Text></TouchableOpacity>
            <AchievementShelf />
          </ScrollView>
        </Column></Background>
      </Modal>
    </Screen>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    flex: { flex: 1, minWidth: 0 }, gap: { height: 16 }, column: { gap: 16 }, block: { gap: 10 },
    identity: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 20, padding: 22, borderRadius: Radius.xl, backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.hairline, overflow: "hidden",
      ...webStyle({ backgroundImage: `radial-gradient(90% 140% at 100% 0%, ${c.accent}1F, transparent 55%)` }) },
    profileAvatar: { position: "relative", alignItems: "center", justifyContent: "center" },
    changeAvatar: { position: "absolute", right: -2, bottom: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: c.primary, borderWidth: 2, borderColor: c.surfaceElevated, alignItems: "center", justifyContent: "center" },
    identityText: { flex: 1, minWidth: 220, gap: 8 },
    nameRow: { flexDirection: "row", alignItems: "center" }, name: { ...Type.title1, color: c.text, flexShrink: 1 },
    username: { fontSize: 13, fontWeight: "700", color: c.textSecondary },
    badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    rankBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.accent },
    rankBadgeText: { fontSize: 12, fontWeight: "800", color: "#0A1F5C" },
    levelBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.primarySubtle, borderWidth: 1, borderColor: c.primaryBorder },
    levelBadgeText: { fontSize: 12, fontWeight: "800", color: c.primaryText },
    bio: { ...Type.callout, color: c.text }, bioEdit: { fontSize: 13, fontWeight: "700", color: c.accentText }, error: { fontSize: 12, color: c.error },
    identityActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    followRow: { flexDirection: "row", alignItems: "center", width: "100%", borderTopWidth: 1, borderTopColor: c.divider, paddingTop: 14 },
    followStat: { flex: 1, alignItems: "center", gap: 2 }, followDivider: { width: 1, height: 28, backgroundColor: c.divider },
    followValue: { ...Type.numeral, fontSize: 22, color: c.text }, followLabel: { fontSize: 12, fontWeight: "700", color: c.textSecondary },
    statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    stat: { gap: 4, padding: 14, borderRadius: Radius.md, backgroundColor: c.surface, borderWidth: 1, borderColor: c.hairline },
    statDesktop: { width: "31.8%", flexGrow: 1 }, statMobile: { width: "30%", flexGrow: 1, minWidth: 96 },
    statValue: { ...Type.numeral, fontSize: 22, color: c.text, marginTop: 4 }, statLabel: { fontSize: 12, fontWeight: "700", color: c.textSecondary },
    card: { gap: 14 }, noMargin: { marginBottom: 0 }, circleBtns: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    cardHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }, cardTitle: { ...Type.title3, color: c.text }, cardMeta: { fontSize: 12, fontWeight: "700", color: c.textTertiary },
    achievementGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    achievement: { width: "31%", flexGrow: 1, minWidth: 96, alignItems: "center", gap: 4, padding: 12, borderRadius: 14, backgroundColor: c.surfaceMuted }, achievementLocked: { opacity: 0.6 },
    achievementMark: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: c.surfaceSunken, borderWidth: 1, borderColor: c.border, marginBottom: 4 },
    achievementMarkEarned: { backgroundColor: c.accent, borderColor: c.accent },
    achievementTitle: { fontSize: 12.5, fontWeight: "800", color: c.text, textAlign: "center" }, achievementDetail: { fontSize: 11, lineHeight: 15, color: c.textTertiary, textAlign: "center" },
    postRow: { gap: 8 }, postTitle: { ...Type.callout, color: c.text }, postMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
    menu: { backgroundColor: c.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: c.hairline, overflow: "hidden" },
    menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14 }, menuDivider: { borderBottomWidth: 1, borderBottomColor: c.divider }, menuHover: { backgroundColor: c.surfaceMuted },
    menuIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: c.primarySubtle, alignItems: "center", justifyContent: "center" }, menuIconDanger: { backgroundColor: c.surfaceMuted },
    menuText: { fontSize: 15, fontWeight: "700", color: c.text }, menuValue: { fontSize: 12.5, color: c.textTertiary, maxWidth: 140 },
    soon: { backgroundColor: c.accent, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }, soonText: { color: "#0A1F5C", fontSize: 11, fontWeight: "800" },
  });
}
