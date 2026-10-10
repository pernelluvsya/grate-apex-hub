import React, { useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, TouchableOpacity, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Text } from "./Text";
import { useColors } from "./theme";
import { Media, MAX_MEDIA, optimized, pickAndUpload, poster, safeUrl } from "./media";
import { Em } from "./components/em";
import { withIcons as wi } from "./components/em";

function Video({ url, w, h }: { url: string; w: number; h: number }) {
  const player = useVideoPlayer(url, (p) => { p.loop = false; p.muted = false; p.volume = 1; });
  return <VideoView player={player} style={{ width: w, height: h, borderRadius: 12, backgroundColor: "#000" }} nativeControls contentFit="contain" />;
}

export function MediaView({ media, width = 320 }: { media?: Media[]; width?: number }) {
  const COLORS = useColors();
  const [open, setOpen] = useState<string | null>(null);
  const list = (media ?? []).filter((m) => safeUrl(m.url));
  if (!list.length) return null;
  const h = Math.round(width * 0.66);
  return (
    <View style={{ marginTop: 8, gap: 8 }}>
      {list.map((m) =>
        m.t === "video" ? (
          <Video key={m.url} url={m.url} w={width} h={h} />
        ) : (
          <Pressable key={m.url} onPress={() => setOpen(m.url)}>
            <Image source={{ uri: optimized(m.url, width * 2) }} resizeMode="cover" style={{ width, height: m.w && m.h ? Math.min(width * 1.2, Math.round(width * m.h / m.w)) : h, borderRadius: 12, backgroundColor: COLORS.card }} />
          </Pressable>
        )
      )}
      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <Pressable onPress={() => setOpen(null)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center", padding: 12 }}>
          {!!open && <Image source={{ uri: optimized(open, 1600) }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />}
          <Text style={{ position: "absolute", top: 24, right: 24, color: "#fff", fontSize: 28 }}><Em n="close" /></Text>
        </Pressable>
      </Modal>
    </View>
  );
}

// Attach button + previews of what's been uploaded so far.
export function AttachBar({ value, onChange, allowVideo = true }: { value: Media[]; onChange: (m: Media[]) => void; allowVideo?: boolean }) {
  const COLORS = useColors();
  const [pct, setPct] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const add = async () => {
    setErr(""); setPct(0);
    try {
      const m = await pickAndUpload({ video: allowVideo, onProgress: setPct });
      if (m) onChange([...value, m]);
    } catch (e: any) { setErr(e?.message ?? "Upload failed."); }
    finally { setPct(null); }
  };
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        {value.length < MAX_MEDIA && (
          <TouchableOpacity onPress={add} disabled={pct !== null} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card }}>
            {pct !== null
              ? <View style={{ flexDirection: "row", alignItems: "center" }}><ActivityIndicator size="small" color={COLORS.primary} /><Text style={{ color: COLORS.muted, marginLeft: 8, fontSize: 13 }}>{Math.round(pct * 100)}%</Text></View>
              : <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: "700" }}>{allowVideo ? wi("📎 Photo / video") : wi("📷 Photo")}</Text>}
          </TouchableOpacity>
        )}
        {value.map((m, i) => (
          <View key={m.url}>
            <Image source={{ uri: m.t === "video" ? poster(m.url, 200) : optimized(m.url, 200) }} style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: COLORS.card }} />
            {m.t === "video" && <Text style={{ position: "absolute", left: 20, top: 16, fontSize: 18 }}>▶️</Text>}
            <TouchableOpacity onPress={() => onChange(value.filter((_, j) => j !== i))} style={{ position: "absolute", right: -6, top: -6, backgroundColor: COLORS.border, borderRadius: 999, width: 20, height: 20, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: COLORS.text, fontSize: 11 }}><Em n="close" /></Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      {!!err && <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 6 }}>{err}</Text>}
    </View>
  );
}

export function Avatar({ name, photo, size = 40, bg, color }: { name: string; photo?: string; size?: number; bg?: string; color?: string }) {
  const COLORS = useColors();
  if (safeUrl(photo)) {
    return <Image source={{ uri: photo!.replace("/upload/", `/upload/c_fill,g_auto,f_auto,q_auto,h_${size * 3},w_${size * 3}/`) }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg ?? COLORS.primary, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: color ?? COLORS.onPrimary, fontWeight: "800", fontSize: size * 0.42 }}>{(name || "?").charAt(0).toUpperCase()}</Text>
    </View>
  );
}
