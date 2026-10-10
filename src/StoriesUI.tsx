import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Modal, PanResponder, Platform, Pressable, ScrollView, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Text, TextInput } from "./Text";
import { useAuth } from "./auth";
import { useColors } from "./theme";
import Icon from "./Icon";
import { Avatar } from "./MediaUI";
import { usePhotos } from "./photos";
import { Media, optimized, pickAndUpload, poster } from "./media";
import { confirmAsk } from "./confirm";
import { timeAgo } from "./community";
import { getUserInfo } from "./engage";
import {
  Story, StoryGroup, STORY_BGS, addStory, deleteStory, fetchStories, fetchViewers, loadSeen, markSeen, recordView,
} from "./stories";
import { withIcons as wi } from "./components/em";

// Starts with sound. Opening a story is a tap, so browsers normally allow that; if one refuses, it falls back to muted with a "tap for sound" button.
function StoryVideo({ url, onReady }: { url: string; onReady?: (ms: number) => void }) {
  const player = useVideoPlayer(url, (p) => { p.loop = false; p.muted = false; p.play(); });
  const [muted, setMuted] = useState(false);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  useEffect(() => {
    const sub = player.addListener("statusChange", (e: any) => {
      if (e.status === "readyToPlay") {
        setState("ok"); player.play();
        // if the browser blocked playing with sound, play muted instead so the story still moves
        setTimeout(() => { if (!player.playing) { player.muted = true; setMuted(true); player.play(); } }, 800);
        const d = player.duration; if (d && isFinite(d)) onReady?.(Math.min(60, Math.max(3, d)) * 1000);
      } else if (e.status === "error") setState("error");
    });
    return () => sub.remove();
  }, [player]);
  const toggle = () => { player.muted = !muted; setMuted(!muted); };
  return (
    <View style={{ width: "100%", height: "100%" }}>
      <VideoView player={player} style={{ width: "100%", height: "100%" }} contentFit="contain" nativeControls={false} />
      {state === "loading" && <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" }} pointerEvents="none"><ActivityIndicator color="#fff" size="large" /></View>}
      {state === "error" && <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", padding: 30 }} pointerEvents="none"><Text style={{ color: "#fff", textAlign: "center" }}>This video can't be played on this device.</Text></View>}
      <TouchableOpacity onPress={toggle} style={{ position: "absolute", right: 14, bottom: 110, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, zIndex: 5 }}>
        <Text style={{ color: "#fff", fontWeight: "800" }}>{muted ? wi("🔇 Tap for sound") : wi("🔊 Sound on")}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------- the row of circles at the top of the feed ----------------
export function StoriesBar({ uids, reloadKey }: { uids: string[]; reloadKey?: number }) {
  const COLORS = useColors();
  const { user, profile } = useAuth();
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [photos, setPhotos] = useState<Record<string, string | undefined>>({});
  const [viewer, setViewer] = useState<number | null>(null);
  const [composer, setComposer] = useState(false);
  const [tick, setTick] = useState(0);
  const key = uids.join(",");

  useEffect(() => {
    if (!user) return;
    let on = true;
    (async () => {
      const [g, sn] = await Promise.all([fetchStories(uids.length ? uids : [user.uid], user.uid), loadSeen()]);
      if (!on) return;
      setGroups(g); setSeen(sn);
      g.forEach((x) => getUserInfo(x.uid).then((u) => on && setPhotos((p) => ({ ...p, [x.uid]: u?.photo }))));
    })();
    return () => { on = false; };
  }, [user?.uid, key, reloadKey, tick]);
  useEffect(() => { if (user) getUserInfo(user.uid).then((u) => setPhotos((p) => ({ ...p, [user.uid]: u?.photo }))); }, [user?.uid]);

  if (!user || !profile) return null;
  const allSeen = (g: StoryGroup) => g.stories.every((s) => seen.has(s.id));
  const mine = groups.find((g) => g.uid === user.uid);
  // me first, then people with something new, then the rest
  const others = groups.filter((g) => g.uid !== user.uid).sort((a, b) => Number(allSeen(a)) - Number(allSeen(b)));
  const ordered = [...(mine ? [mine] : []), ...others];
  const label = { color: COLORS.muted, fontSize: 12, marginTop: 6, maxWidth: 68, textAlign: "center" as const };

  const ring = (unseen: boolean, children: React.ReactNode) => (
    <View style={{ width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: unseen ? COLORS.accent : COLORS.border, alignItems: "center", justifyContent: "center" }}>{children}</View>
  );

  return (
    <View style={{ marginBottom: 12 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
        <View style={{ alignItems: "center", marginRight: 14 }}>
          <TouchableOpacity onPress={() => (mine ? setViewer(0) : setComposer(true))} accessibilityLabel="Your story">
            {ring(!!mine && !allSeen(mine), <Avatar name={profile.username} photo={photos[user.uid]} size={54} />)}
            <TouchableOpacity onPress={() => setComposer(true)} accessibilityLabel="Add to your story"
              style={{ position: "absolute", right: -2, bottom: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, borderWidth: 2, borderColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
              <Icon name="plus" size={14} color={COLORS.onPrimary} stroke={3} />
            </TouchableOpacity>
          </TouchableOpacity>
          <Text style={label} numberOfLines={1}>Your story</Text>
        </View>
        {ordered.filter((g) => g.uid !== user.uid).map((g) => (
          <TouchableOpacity key={g.uid} style={{ alignItems: "center", marginRight: 14 }} onPress={() => setViewer(ordered.indexOf(g))}>
            {ring(!allSeen(g), <Avatar name={g.username} photo={photos[g.uid]} size={54} />)}
            <Text style={label} numberOfLines={1}>{g.username}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {viewer !== null && ordered[viewer] && (
        <StoryViewer groups={ordered} start={viewer} meUid={user.uid} meName={profile.username}
          onClose={() => { setViewer(null); loadSeen().then(setSeen); }} onChanged={() => setTick((t) => t + 1)} />
      )}
      <StoryComposer visible={composer} onClose={() => setComposer(false)} onPosted={() => { setComposer(false); setTick((t) => t + 1); }} />
    </View>
  );
}

// ---------------- full-screen viewer ----------------
function StoryViewer({ groups, start, meUid, meName, onClose, onChanged }: {
  groups: StoryGroup[]; start: number; meUid: string; meName: string; onClose: () => void; onChanged: () => void;
}) {
  const COLORS = useColors();
  const { width, height } = useWindowDimensions();
  const [gi, setGi] = useState(start);
  const [si, setSi] = useState(0);
  const [pct, setPct] = useState(0);
  const [paused, setPaused] = useState(false);
  const [viewers, setViewers] = useState<string[] | null>(null);
  const [showViewers, setShowViewers] = useState(false);
  const g = groups[gi];
  const authorPhoto = usePhotos(g ? [g.uid] : [])[g?.uid ?? ""];
  const st: Story | undefined = g?.stories[si];
  const isMine = g?.uid === meUid;
  const [vdur, setVdur] = useState<number | null>(null);
  const dur = st?.kind === "media" && st.media?.t === "video" ? vdur ?? 15000 : 5000;
  const pausedRef = useRef(false); pausedRef.current = paused || showViewers;

  const next = useCallback(() => {
    if (!g) return onClose();
    if (si < g.stories.length - 1) setSi(si + 1);
    else if (gi < groups.length - 1) { setGi(gi + 1); setSi(0); }
    else onClose();
  }, [g, si, gi, groups.length, onClose]);
  const prev = () => {
    if (si > 0) setSi(si - 1);
    else if (gi > 0) { setGi(gi - 1); setSi(groups[gi - 1].stories.length - 1); }
    else setPct(0);
  };

  // Swipe left = the next person's stories, swipe right = the previous person's, swipe down = close. (Taps still go story by story.)
  const nav = useRef({ gi, n: groups.length, onClose }); nav.current = { gi, n: groups.length, onClose };
  const swipe = useRef(PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, g) => (Math.abs(g.dx) > 18 && Math.abs(g.dx) > Math.abs(g.dy) * 1.4) || (g.dy > 28 && g.dy > Math.abs(g.dx) * 1.4),
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_, g) => {
      const { gi: cur, n, onClose: close } = nav.current;
      if (g.dy > 90 && g.dy > Math.abs(g.dx)) return close();
      if (g.dx < -60) { if (cur < n - 1) { setGi(cur + 1); setSi(0); } else close(); }
      else if (g.dx > 60 && cur > 0) { setGi(cur - 1); setSi(0); }
      setPaused(false);
    },
    onPanResponderTerminate: () => setPaused(false),
  })).current;

  // on each new story: reset, mark seen, tell the owner, load viewers if it's mine
  useEffect(() => {
    if (!st) return;
    setPct(0); setVdur(null); setViewers(null); setShowViewers(false);
    markSeen(st.id);
    if (st.uid !== meUid) recordView(st.uid, st.id, { uid: meUid, username: meName });
    else fetchViewers(st.uid, st.id).then(setViewers);
  }, [st?.id]);

  useEffect(() => {
    if (!st) return;
    const t = setInterval(() => {
      if (pausedRef.current) return;
      setPct((p) => { const n = p + 50 / dur; return n; });
    }, 50);
    return () => clearInterval(t);
  }, [st?.id, dur]);
  useEffect(() => { if (pct >= 1) next(); }, [pct]);

  const remove = async () => {
    if (!st) return;
    setPaused(true);
    if (!(await confirmAsk("Delete this story?"))) { setPaused(false); return; }
    try { await deleteStory(st.uid, st.id); } catch { setPaused(false); return; }
    onChanged(); onClose();
  };

  if (!g || !st) return null;
  const boxW = Platform.OS === "web" ? Math.min(width, 460) : width;
  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center" }}>
        <View {...swipe.panHandlers} style={{ width: boxW, height, backgroundColor: st.kind === "text" ? st.bg || STORY_BGS[0] : "#000" }}>
          {/* the story itself */}
          <View style={{ ...({ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 } as any), alignItems: "center", justifyContent: "center" }}>
            {st.kind === "text" && <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800", textAlign: "center", padding: 32, lineHeight: 36 }}>{st.text}</Text>}
            {st.kind === "media" && st.media?.t === "image" && <Image source={{ uri: optimized(st.media.url, 1200) }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />}
            {st.kind === "media" && st.media?.t === "video" && <StoryVideo key={st.id} url={st.media.url} onReady={setVdur} />}
          </View>
          {st.kind === "media" && !!st.text && (
            <View style={{ position: "absolute", left: 0, right: 0, bottom: isMine ? 90 : 50, padding: 20, backgroundColor: "rgba(0,0,0,0.45)" }}>
              <Text style={{ color: "#fff", fontSize: 17, textAlign: "center" }}>{st.text}</Text>
            </View>
          )}
          {/* tap zones: left = back, right = next, hold = pause */}
          <View style={{ position: "absolute", left: 0, right: 0, top: 90, bottom: 150, flexDirection: "row" }}>
            <Pressable style={{ flex: 1 }} onPress={prev} onPressIn={() => setPaused(true)} onPressOut={() => setPaused(false)} />
            <Pressable style={{ flex: 2 }} onPress={next} onPressIn={() => setPaused(true)} onPressOut={() => setPaused(false)} />
          </View>
          {/* progress + header */}
          <View style={{ position: "absolute", left: 0, right: 0, top: 0, paddingTop: Platform.OS === "web" ? 14 : 48, paddingHorizontal: 12 }} pointerEvents="box-none">
            <View style={{ flexDirection: "row", gap: 4 }}>
              {g.stories.map((x, i) => (
                <View key={x.id} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)", overflow: "hidden" }}>
                  <View style={{ width: `${i < si ? 100 : i === si ? Math.min(100, pct * 100) : 0}%`, height: "100%", backgroundColor: "#fff" }} />
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
              <Avatar name={g.username} photo={authorPhoto} size={34} />
              <Text style={{ color: "#fff", fontWeight: "800", marginLeft: 10 }}>{isMine ? "Your story" : `@${g.username}`}</Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", marginLeft: 8, fontSize: 12 }}>{timeAgo(st.createdAt)}</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={onClose} style={{ padding: 8 }} accessibilityLabel="Close"><Icon name="close" size={24} color="#fff" /></TouchableOpacity>
            </View>
          </View>
          {isMine && (
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.55)" }}>
              <TouchableOpacity onPress={() => setShowViewers(!showViewers)} style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>👁 {viewers ? viewers.length : "…"} {viewers?.length === 1 ? "view" : "views"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={remove} style={{ padding: 6 }} accessibilityLabel="Delete story"><Icon name="trash" size={22} color="#fff" /></TouchableOpacity>
            </View>
          )}
          {isMine && showViewers && (
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 56, maxHeight: height * 0.4, backgroundColor: COLORS.card, padding: 14, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              <Text style={{ color: COLORS.text, fontWeight: "800", marginBottom: 6 }}>Seen by</Text>
              <ScrollView>{(viewers ?? []).length ? viewers!.map((v, i) => <Text key={i} style={{ color: COLORS.text, paddingVertical: 4 }}>@{v}</Text>) : <Text style={{ color: COLORS.muted }}>Nobody yet.</Text>}</ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ---------------- add a story ----------------
function StoryComposer({ visible, onClose, onPosted }: { visible: boolean; onClose: () => void; onPosted: () => void }) {
  const COLORS = useColors();
  const { user, profile } = useAuth();
  const [mode, setMode] = useState<"media" | "text">("media");
  const [media, setMedia] = useState<Media | null>(null);
  const [pct, setPct] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [bg, setBg] = useState(STORY_BGS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const reset = () => { setMedia(null); setText(""); setErr(""); setPct(null); setMode("media"); };
  const pick = async () => {
    setErr(""); setPct(0);
    try { const m = await pickAndUpload({ onProgress: setPct }); if (m) setMedia(m); }
    catch (e: any) { setErr(e?.message ?? "Upload failed."); }
    setPct(null);
  };
  const post = async () => {
    if (!user || !profile) return;
    setBusy(true); setErr("");
    try {
      await addStory({ uid: user.uid, username: profile.username }, mode === "media" ? { media: media!, text } : { text, bg });
      reset(); onPosted();
    } catch (e: any) { setErr(e?.message || `Couldn't post (${e?.code ?? "unknown"}).`); }
    setBusy(false);
  };
  const ok = mode === "media" ? !!media : text.trim().length > 0;
  const tab = (m: "media" | "text", label: string) => (
    <TouchableOpacity onPress={() => setMode(m)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: mode === m ? COLORS.primary : "transparent", alignItems: "center" }}>
      <Text style={{ color: mode === m ? COLORS.onPrimary : COLORS.text, fontWeight: "800" }}>{wi(label)}</Text>
    </TouchableOpacity>
  );
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { reset(); onClose(); }}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 }}>
        <View style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, borderWidth: 1, borderRadius: 18, padding: 16, width: "100%", maxWidth: 460, alignSelf: "center" }}>
          <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "800", marginBottom: 4 }}>Add to your story</Text>
          <Text style={{ color: COLORS.muted, marginBottom: 12 }}>Disappears after 24 hours.</Text>
          <View style={{ flexDirection: "row", backgroundColor: COLORS.card, borderRadius: 12, padding: 4, marginBottom: 12 }}>{tab("media", "📷 Photo / video")}{tab("text", "Aa Text")}</View>
          {mode === "media" ? (
            <View>
              {media ? (
                <View>
                  <Image source={{ uri: media.t === "video" ? poster(media.url, 600) : optimized(media.url, 600) }} resizeMode="cover" style={{ width: "100%", height: 260, borderRadius: 14, backgroundColor: COLORS.card }} />
                  <TouchableOpacity onPress={() => setMedia(null)} style={{ position: "absolute", right: 8, top: 8, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 999, padding: 6 }}><Icon name="close" size={16} color="#fff" /></TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={pick} disabled={pct !== null} style={{ height: 160, borderRadius: 14, borderWidth: 1, borderStyle: "dashed", borderColor: COLORS.border, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.card }}>
                  {pct !== null ? <><ActivityIndicator color={COLORS.primary} /><Text style={{ color: COLORS.muted, marginTop: 6 }}>{Math.round(pct * 100)}%</Text></> : <Text style={{ color: COLORS.text, fontWeight: "700" }}>Choose a photo or video</Text>}
                </TouchableOpacity>
              )}
              <TextInput value={text} onChangeText={setText} maxLength={200} placeholder="Add a caption (optional)" placeholderTextColor={COLORS.muted}
                style={{ marginTop: 10, backgroundColor: COLORS.card, borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, color: COLORS.text, padding: 12 }} />
            </View>
          ) : (
            <View>
              <View style={{ height: 200, borderRadius: 14, backgroundColor: bg, justifyContent: "center", padding: 16 }}>
                <TextInput value={text} onChangeText={setText} maxLength={200} multiline placeholder="Type something…" placeholderTextColor="rgba(255,255,255,0.6)"
                  style={{ color: "#fff", fontSize: 22, fontWeight: "800", textAlign: "center" }} />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 12 }}>
                {STORY_BGS.map((c) => (
                  <TouchableOpacity key={c} onPress={() => setBg(c)} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c, borderWidth: 3, borderColor: bg === c ? COLORS.text : "transparent" }} />
                ))}
              </View>
            </View>
          )}
          {!!err && <Text style={{ color: COLORS.danger, marginTop: 10 }}>{err}</Text>}
          <View style={{ flexDirection: "row", marginTop: 14, gap: 10 }}>
            <TouchableOpacity onPress={() => { reset(); onClose(); }} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: "center" }}><Text style={{ color: COLORS.text, fontWeight: "700" }}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={post} disabled={!ok || busy} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center", opacity: !ok || busy ? 0.5 : 1 }}>
              {busy ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={{ color: COLORS.onPrimary, fontWeight: "800" }}>Share story</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}