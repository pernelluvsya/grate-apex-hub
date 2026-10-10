// Settings you may want to change later live here, not inside the app logic.
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCy4HizcdGEYEMC45mbrq4S4U2znUM9k6I",
  authDomain: "grate-apex.firebaseapp.com",
  projectId: "grate-apex",
  storageBucket: "grate-apex.firebasestorage.app",
  messagingSenderId: "24083972640",
  appId: "1:24083972640:web:3d01b201dfc51be7b93245",
};

// Classes. HB2 and everything after it can also open the HB1 and HB2 courses (see canSee in data/catalog.ts).
export const HALLS = ["HB1", "HB2", "HB3", "MB1", "MB2", "MB3"] as const;
export type Hall = (typeof HALLS)[number];
export const SEMESTERS = [1, 2] as const;

// Prices shown in the app. The server decides what is actually charged (api/_lib.js PLANS), so keep them in step.
export { PLANS } from "./plans";
export type { PlanId } from "./plans";

// Manual Mobile Money: the number students send money to (set in Vercel as EXPO_PUBLIC_MOMO_*).
export { MOMO } from "./plans";

// Firebase logins need an email, but students pick a username.
// We quietly turn "kofi_a" into "kofi_a@grateapex.app" behind the scenes.
export const USERNAME_EMAIL_DOMAIN = "grateapex.app";

export const COLORS = {
  bg: "#0B0D1A",
  card: "#161A2E",
  border: "#252A45",
  text: "#FFFFFF",
  muted: "#8B92B5",
  primary: "#1F44C8", // GrAte Apex blue from the logo
  accent: "#F5B82E", // the gold star
  danger: "#FF6B6B",
};

// Photo/video uploads (Cloudinary free tier). See README "Uploads".
export const CLOUDINARY = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD || "",
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_PRESET || "",
};
