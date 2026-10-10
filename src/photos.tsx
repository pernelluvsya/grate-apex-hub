import React, { useEffect, useState } from "react";
import { Image, Modal, TouchableOpacity, View } from "react-native";
import { Text } from "./Text";
import { safeUrl } from "./media";
import { fetchUser } from "./social";
import { Avatar } from "./MediaUI";

// Profile pictures for people in the inbox, cached so each profile is read once.
const cache = new Map<string, string | undefined>();
export function usePhotos(uids: string[]): Record<string, string | undefined> {
  const [, bump] = useState(0);
  const key = uids.join(",");
  useEffect(() => {
    let live = true;
    Array.from(new Set(uids)).filter((u) => u && !cache.has(u)).forEach((u) => {
      cache.set(u, undefined);
      fetchUser(u).then((p) => { cache.set(u, p?.photo); if (live) bump((n) => n + 1); }).catch(() => { });
    });
    return () => { live = false; };
  }, [key]);
  return Object.fromEntries(uids.map((u) => [u, cache.get(u)]));
}

// Avatar that opens a full-size view of the picture when tapped (does nothing if they have no picture).
export function ZoomAvatar({ name, photo, size, onZoom }: { name: string; photo?: string; size: number; onZoom: (p: { name: string; photo: string }) => void }) {
  return (
    <TouchableOpacity activeOpacity={0.8} disabled={!safeUrl(photo)} onPress={() => onZoom({ name, photo: photo! })}>
      <Avatar name={name} photo={photo} size={size} />
    </TouchableOpacity>
  );
}

export function PhotoZoom({ pic, onClose }: { pic: { name: string; photo: string } | null; onClose: () => void }) {
  return (
    <Modal visible={!!pic} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center", padding: 20 }}>
        {!!pic && <Image source={{ uri: pic.photo.replace("/upload/", "/upload/c_limit,f_auto,q_auto,w_1000,h_1000/") }} style={{ width: "100%", maxWidth: 520, aspectRatio: 1, borderRadius: 16 }} resizeMode="contain" />}
        {!!pic && <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18, marginTop: 14 }}>@{pic.name}</Text>}
        <Text style={{ color: "#fff", opacity: 0.6, marginTop: 6 }}>Tap anywhere to close</Text>
      </TouchableOpacity>
    </Modal>
  );
}