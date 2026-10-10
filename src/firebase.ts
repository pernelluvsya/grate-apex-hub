import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
// @ts-ignore - this export exists at runtime in React Native; its type is only in a different build
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { FIREBASE_CONFIG } from "./config";

const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);

// AsyncStorage remembers the login on the phone, so students stay signed in
// when they close and reopen the app.
export const auth = (() => {
  // In a web browser, Firebase already remembers the login by itself.
  if (Platform.OS === "web") return getAuth(app);
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app); // already initialised (e.g. after a fast refresh)
  }
})();

export const db = getFirestore(app);
