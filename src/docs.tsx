import React from "react";
import { Linking, Platform, TouchableOpacity, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Text } from "./Text";
import { useColors } from "./theme";
import { CLOUDINARY } from "./config";
import { safeUrl, uploadsReady } from "./media";
import { withIcons as wi } from "./components/em";

// Documents (PDF, Word, PowerPoint, Excel, text, zip…) sent in chats. Uploaded to Cloudinary, opened/downloaded by link.
export type Doc = { url: string; name: string; size: number };
export const MAX_DOC_BYTES = 10 * 1024 * 1024; // Cloudinary's free-plan limit for non-image files

export const fmtSize = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const ext = (n: string) => (n.split(".").pop() || "").toLowerCase();
const icon = (n: string) => ({ pdf: "📕", doc: "📘", docx: "📘", ppt: "📙", pptx: "📙", xls: "📗", xlsx: "📗", csv: "📗", zip: "🗜️", txt: "📄" } as Record<string, string>)[ext(n)] ?? "📄";

export const cleanDoc = (d?: Doc) => (d && safeUrl(d.url) ? { url: d.url, name: String(d.name || "document").slice(0, 100), size: Math.max(0, Math.round(d.size || 0)) } : undefined);

export async function pickAndUploadDoc(onProgress?: (p: number) => void): Promise<Doc | null> {
  if (!uploadsReady()) throw new Error("Uploads aren't set up yet. The app owner needs to add the Cloudinary details (see README).");
  const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  if (a.size && a.size > MAX_DOC_BYTES) throw new Error("That file is too big. Max 10 MB.");
  const name = a.name || "document";
  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = a.file ?? (await (await fetch(a.uri)).blob());
    if (blob.size > MAX_DOC_BYTES) throw new Error("That file is too big. Max 10 MB.");
    form.append("file", blob, name);
  } else form.append("file", { uri: a.uri, name, type: a.mimeType || "application/octet-stream" } as any);
  form.append("upload_preset", CLOUDINARY.uploadPreset);
  form.append("public_id_prefix", "docs");
  const data: any = await new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/auto/upload`);
    x.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
    x.onload = () => { try { const j = JSON.parse(x.responseText); x.status < 300 ? resolve(j) : reject(new Error(j?.error?.message || "Upload failed.")); } catch { reject(new Error("Upload failed.")); } };
    x.onerror = () => reject(new Error("Couldn't reach the upload server. Check your connection."));
    x.send(form);
  });
  if (!safeUrl(data.secure_url)) throw new Error("Upload failed.");
  return { url: data.secure_url, name, size: a.size ?? data.bytes ?? 0 };
}

export function DocCard({ d, mine }: { d: Doc; mine?: boolean }) {
  const COLORS = useColors();
  return (
    <TouchableOpacity onPress={() => Linking.openURL(d.url)} style={{ flexDirection: "row", alignItems: "center", minWidth: 190, paddingVertical: 4 }}>
      <Text style={{ fontSize: 30, marginRight: 10 }}>{wi(icon(d.name))}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: mine ? COLORS.onPrimary : COLORS.text, fontWeight: "700" }} numberOfLines={2}>{d.name}</Text>
        <Text style={{ color: mine ? COLORS.onPrimary : COLORS.muted, opacity: 0.75, fontSize: 12 }}>{fmtSize(d.size)} · tap to open</Text>
      </View>
    </TouchableOpacity>
  );
}
