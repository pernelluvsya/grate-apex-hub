// Where saved lessons live on this device.
// Web: IndexedDB (localStorage is capped near 5 MB, too small for lesson pictures).
// Phone: AsyncStorage.
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const web = Platform.OS === "web" && typeof indexedDB !== "undefined";
let dbp: Promise<IDBDatabase> | null = null;
const open = () => dbp ||= new Promise<IDBDatabase>((res, rej) => {
  const r = indexedDB.open("grateapex", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("kv");
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
const tx = async <T,>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) => {
  const db = await open();
  return new Promise<T>((res, rej) => { const r = fn(db.transaction("kv", mode).objectStore("kv")); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
};

export async function getItem<T = any>(k: string): Promise<T | null> {
  try {
    if (web) { const v = await tx<T>("readonly", (s) => s.get(k)); return (v as T) ?? null; }
    const r = await AsyncStorage.getItem(k); return r ? JSON.parse(r) : null;
  } catch { return null; }
}
export async function setItem(k: string, v: unknown): Promise<void> {
  try { if (web) await tx("readwrite", (s) => s.put(v, k)); else await AsyncStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ }
}
export async function hasKey(k: string): Promise<boolean> {
  try { if (web) return (await tx("readonly", (s) => s.count(k))) > 0; return (await AsyncStorage.getItem(k)) != null; } catch { return false; }
}

export async function delItem(k: string): Promise<void> {
  try { if (web) await tx("readwrite", (st) => st.delete(k)); else await AsyncStorage.removeItem(k); } catch { /* ignore */ }
}

export async function keysWithPrefix(prefix: string): Promise<string[]> {
  try {
    const all: string[] = web ? ((await tx<IDBValidKey[]>("readonly", (st) => st.getAllKeys())) as IDBValidKey[]).map(String) : [...(await AsyncStorage.getAllKeys())];
    return all.filter((k) => k.startsWith(prefix));
  } catch { return []; }
}