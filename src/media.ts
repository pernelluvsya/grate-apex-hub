import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { CLOUDINARY } from "./config";

export type Media = { t: "image" | "video"; url: string; w?: number; h?: number };

export const MAX_MEDIA = 3;
const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_VIDEO = 50 * 1024 * 1024;
export const CDN = "https://res.cloudinary.com/";

export const uploadsReady = () => !!CLOUDINARY.cloudName && !!CLOUDINARY.uploadPreset;
export const safeUrl = (u?: string) => typeof u === "string" && u.startsWith(CDN);

// Cloudinary resizes and compresses on the fly when asked in the URL.
export function optimized(url: string, w = 800) {
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`);
}
export function poster(url: string, w = 800) {
  return url.replace("/upload/", `/upload/so_0,f_jpg,q_auto,w_${w}/`).replace(/\.[a-z0-9]+$/i, ".jpg");
}

export async function pickAndUpload(
  opts: { video?: boolean; onProgress?: (p: number) => void } = {}
): Promise<Media | null> {
  if (!uploadsReady()) throw new Error("Uploads aren't set up yet. The app owner needs to add the Cloudinary details (see README).");
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: opts.video === false ? ["images"] : ["images", "videos"],
    quality: 0.8,
    allowsEditing: false,
  });
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  return uploadAsset({ uri: a.uri, fileName: a.fileName, mimeType: a.mimeType, fileSize: a.fileSize, isVideo: a.type === "video" }, opts.onProgress);
}

// Uploads one already-chosen local file (a picker result) to Cloudinary and returns its public Media entry.
export async function uploadAsset(
  a: { uri: string; fileName?: string | null; mimeType?: string | null; fileSize?: number | null; isVideo: boolean },
  onProgress?: (p: number) => void
): Promise<Media> {
  if (!uploadsReady()) throw new Error("Uploads aren't set up yet. The app owner needs to add the Cloudinary details (see README).");
  const isVideo = a.isVideo;
  const limit = isVideo ? MAX_VIDEO : MAX_IMAGE;
  if (a.fileSize && a.fileSize > limit) {
    throw new Error(`That file is too big. Max ${isVideo ? "50" : "10"} MB.`);
  }

  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await (await fetch(a.uri)).blob();
    if (blob.size > limit) throw new Error(`That file is too big. Max ${isVideo ? "50" : "10"} MB.`);
    form.append("file", blob, a.fileName || (isVideo ? "video.mp4" : "photo.jpg"));
  } else {
    form.append("file", { uri: a.uri, name: a.fileName || (isVideo ? "video.mp4" : "photo.jpg"), type: a.mimeType || (isVideo ? "video/mp4" : "image/jpeg") } as any);
  }
  form.append("upload_preset", CLOUDINARY.uploadPreset);

  const data: any = await new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/auto/upload`);
    x.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
    x.onload = () => {
      try {
        const j = JSON.parse(x.responseText);
        if (x.status >= 200 && x.status < 300) resolve(j);
        else reject(new Error(j?.error?.message || "Upload failed."));
      } catch { reject(new Error("Upload failed.")); }
    };
    x.onerror = () => reject(new Error("Couldn't reach the upload server. Check your connection."));
    x.send(form);
  });
  if (!safeUrl(data.secure_url)) throw new Error("Upload failed.");
  return { t: data.resource_type === "video" ? "video" : "image", url: data.secure_url, w: data.width, h: data.height };
}

// Firestore rejects undefined, so strip anything optional that's missing.
export const cleanMedia = (m?: Media[]) =>
  (m ?? []).filter((x) => safeUrl(x.url)).slice(0, MAX_MEDIA).map((x) => {
    const o: any = { t: x.t, url: x.url };
    if (x.w) o.w = x.w; if (x.h) o.h = x.h;
    return o as Media;
  });
