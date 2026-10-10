import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  deleteUser,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { Platform } from "react-native";
import { collection, doc, getDoc, getDocs, limit, query, setDoc, updateDoc, serverTimestamp, where, writeBatch } from "firebase/firestore";
import { auth, db } from "./firebase";
import { USERNAME_EMAIL_DOMAIN, Hall } from "./config";
import { cleanDisplayName, forgetName, validateDisplayName } from "./names";

export type Profile = {
  username: string;
  displayName?: string; // friendly name shown next to the @username (not unique, up to 40 characters)
  hall?: Hall;
  semester?: 1 | 2;
  onboardingDone: boolean;
  classLocked?: boolean; // hall + semester confirmed; cannot be changed after this
  tutorialDone: boolean;
  photo?: string; // profile picture URL (Cloudinary)
  remindersOff?: boolean; // true = no daily streak reminder push
  bio?: string;   // short "about me", up to 160 characters
  usernameChangedAt?: any; // Firestore timestamp of the last username change (limit: once every 30 days)
  needsUsername?: boolean; // signed in with Google but has not picked a username yet (not saved)
  autoHideNav?: boolean; // true = auto-hide sidebar on PC / bottom bar on mobile
  feedbackOff?: boolean; // true = no sound / vibration on correct / wrong answers (default is on)
};

type AuthState = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (username: string, password: string, displayName?: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  chooseUsername: (username: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveOnboarding: (hall: Hall, semester: 1 | 2) => Promise<void>;
  finishTutorial: () => Promise<void>;
  replayTutorial: () => Promise<void>;
  setPhoto: (url: string) => Promise<void>;
  setReminders: (on: boolean) => Promise<void>;
  setBio: (bio: string) => Promise<void>;
  setDisplayName: (name: string) => Promise<void>;
  changeUsername: (username: string) => Promise<void>;
  setAutoHideNav: (enabled: boolean) => Promise<void>;
  setFeedback: (on: boolean) => Promise<void>;
};

export const USERNAME_COOLDOWN_DAYS = 30;

export const Ctx = createContext<AuthState | null>(null);

export function cleanUsername(raw: string) {
  return raw.trim().toLowerCase();
}
export function validateUsername(u: string): string | null {
  if (u.length < 3 || u.length > 20) return "Username must be 3–20 characters.";
  if (!/^[a-z0-9_]+$/.test(u)) return "Use only letters, numbers and underscores.";
  return null;
}
const toEmail = (u: string) => `${u}@${USERNAME_EMAIL_DOMAIN}`;

// Usernames are unique. Password accounts get that from the hidden email; Google accounts have no
// such thing, so every username is also written to usernames/{name}. First one to write it owns it.
async function claimUsername(uid: string, name: string): Promise<boolean> {
  const ref = doc(db, "usernames", name);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data().uid === uid;
    await setDoc(ref, { uid });
    return true;
  } catch (e: any) {
    if (e?.code === "permission-denied") return true; // the new rules are not published yet: do not block sign-up
    throw e;
  }
}
const TAKEN = "That username is taken. Try another one.";

// Turns Firebase's error codes into messages a student can understand.
export function friendlyAuthError(e: any): string {
  switch (e?.code) {
    case "auth/email-already-in-use": return "That username is taken. Try another one.";
    case "auth/weak-password": return "Password must be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password": return "Wrong username or password.";
    case "auth/network-request-failed": return "No internet connection. Please try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request": return "Google sign-in was cancelled.";
    case "auth/popup-blocked": return "Your browser blocked the Google window. Allow pop-ups and try again.";
    case "auth/unauthorized-domain": return "This website address isn't allowed for Google sign-in yet. Add it under Authentication > Settings > Authorized domains in Firebase.";
    case "auth/operation-not-allowed": return "Google sign-in isn't switched on in Firebase yet (Authentication > Sign-in method).";
    case "auth/too-many-requests": return "Too many attempts. Wait a bit and try again.";
    default: return "Something went wrong. Please try again.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User) => {
    const ref = doc(db, "users", u.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) { setProfile(snap.data() as Profile); return; }
    // Signed in with Google for the first time: they must pick a username before anything else.
    // (We never use the email name: usernames are shown to other students.)
    if (u.providerData.some((p) => p.providerId === "google.com")) {
      setProfile({ username: "", onboardingDone: false, tutorialDone: false, needsUsername: true });
      return;
    }
    // Account exists but its profile document is missing (e.g. an earlier save
    // failed). Create it now so the student isn't stuck.
    const username = (u.email ?? "student").split("@")[0];
    const p: Profile = { username, onboardingDone: false, tutorialDone: false };
    await setDoc(ref, { ...p, createdAt: serverTimestamp(), trialStartedAt: serverTimestamp() });
    setProfile(p);
  }, []);

  // Runs on app open and every time someone logs in or out.
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try { await loadProfile(u); } catch { setProfile(null); }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, [loadProfile]);

  const signUp = async (usernameRaw: string, password: string, displayNameRaw = "") => {
    const username = cleanUsername(usernameRaw);
    const bad = validateUsername(username);
    if (bad) throw new Error(bad);
    const badName = validateDisplayName(displayNameRaw);
    if (badName) throw new Error(badName);
    const displayName = cleanDisplayName(displayNameRaw);
    const cred = await createUserWithEmailAndPassword(auth, toEmail(username), password);
    if (!(await claimUsername(cred.user.uid, username))) {
      // a Google account already uses this name: undo the new account
      await deleteUser(cred.user).catch(() => { });
      throw new Error(TAKEN);
    }
    const p: Profile = { username, ...(displayName ? { displayName } : {}), onboardingDone: false, tutorialDone: false };
    await setDoc(doc(db, "users", cred.user.uid), { ...p, createdAt: serverTimestamp(), trialStartedAt: serverTimestamp() });
    setProfile(p);
  };

  const signIn = async (usernameRaw: string, password: string) => {
    const name = cleanUsername(usernameRaw);
    // a renamed account still logs in with its original hidden email; the registry says which one
    let login = name;
    try {
      const r = await getDoc(doc(db, "usernames", name));
      if (r.exists() && typeof r.data().login === "string") login = r.data().login;
    } catch { /* registry not readable yet: fall back to the name itself */ }
    await signInWithEmailAndPassword(auth, toEmail(login), password);
  };

  const signInWithGoogle = async () => {
    if (Platform.OS !== "web") {
      throw new Error("Google sign-in works in the web version of the app. On the phone app, use your username and password for now.");
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      // Some phone browsers and installed web apps cannot open pop-ups: use a full-page redirect instead.
      if (e?.code === "auth/popup-blocked" || e?.code === "auth/operation-not-supported-in-this-environment") { await signInWithRedirect(auth, provider); return; }
      throw e;
    }
  };

  const chooseUsername = async (raw: string) => {
    if (!user) throw new Error("Please sign in again.");
    const username = cleanUsername(raw);
    const bad = validateUsername(username);
    if (bad) throw new Error(bad);
    // names made before the registry existed only show up in users
    const dup = await getDocs(query(collection(db, "users"), where("username", "==", username), limit(1)));
    if (!dup.empty && dup.docs[0].id !== user.uid) throw new Error(TAKEN);
    if (!(await claimUsername(user.uid, username))) throw new Error(TAKEN);
    const p: Profile = { username, onboardingDone: false, tutorialDone: false };
    await setDoc(doc(db, "users", user.uid), { ...p, createdAt: serverTimestamp(), trialStartedAt: serverTimestamp() });
    setProfile(p);
  };

  const changeUsername = async (raw: string) => {
    if (!user || !profile) throw new Error("Please sign in again.");
    const name = cleanUsername(raw);
    const bad = validateUsername(name);
    if (bad) throw new Error(bad);
    if (name === profile.username) throw new Error("That is already your username.");
    const last = profile.usernameChangedAt?.toMillis?.() ?? (typeof profile.usernameChangedAt === "number" ? profile.usernameChangedAt : 0);
    const wait = last + USERNAME_COOLDOWN_DAYS * 86400000 - Date.now();
    if (last && wait > 0) throw new Error(`You can change your username again in ${Math.ceil(wait / 86400000)} day(s).`);
    const dup = await getDocs(query(collection(db, "users"), where("username", "==", name), limit(1)));
    if (!dup.empty && dup.docs[0].id !== user.uid) throw new Error(TAKEN);
    const reg = await getDoc(doc(db, "usernames", name));
    if (reg.exists() && reg.data().uid !== user.uid) throw new Error(TAKEN);
    // password accounts keep signing in through their original hidden email
    const email = user.email ?? "";
    const login = email.endsWith(`@${USERNAME_EMAIL_DOMAIN}`) ? email.split("@")[0] : null;
    const batch = writeBatch(db);
    if (!reg.exists()) batch.set(doc(db, "usernames", name), login ? { uid: user.uid, login } : { uid: user.uid });
    batch.update(doc(db, "users", user.uid), { username: name, usernameChangedAt: serverTimestamp() });
    try { await batch.commit(); }
    catch (e: any) {
      if (e?.code === "permission-denied") throw new Error("Couldn't change it. Someone may have just taken that name, or the change limit applies. Try again.");
      throw e;
    }
    setProfile((old) => (old ? { ...old, username: name, usernameChangedAt: Date.now() } : old));
  };

  const signOut = async () => { await fbSignOut(auth); };

  const patch = async (fields: Partial<Profile>) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { username: profile?.username ?? (user.email ?? "student").split("@")[0], ...fields }, { merge: true });
    setProfile((old) => (old ? { ...old, ...fields } : old));
  };

  // Locks in hall + semester. Writes ONLY those fields (never re-sends the username, which the rules
  // protect), and if the server refuses, checks whether the class was already locked (another tab or
  // device) and carries on with that instead of leaving the student stuck.
  const saveOnboarding = async (hall: Hall, semester: 1 | 2) => {
    if (!user) throw new Error("Please sign in again.");
    const fields = { hall, semester, onboardingDone: true, classLocked: true };
    const ref = doc(db, "users", user.uid);
    try {
      try { await updateDoc(ref, fields); }
      catch (e: any) {
        if (e?.code !== "not-found") throw e;
        // profile document missing: create it
        const username = profile?.username || (user.email ?? "student").split("@")[0];
        await setDoc(ref, { username, ...fields, createdAt: serverTimestamp(), trialStartedAt: serverTimestamp() });
      }
    } catch (e: any) {
      if (e?.code === "permission-denied") {
        try {
          const snap = await getDoc(ref);
          if (snap.exists() && snap.data().classLocked === true) { setProfile(snap.data() as Profile); return; }
        } catch { /* fall through to the friendly error */ }
        throw new Error("We couldn't lock your class just now (permission denied). Please sign out, sign back in and try again. If it keeps happening, contact support from the Help page with the hall and semester you picked.");
      }
      throw e;
    }
    setProfile((old) => (old ? { ...old, ...fields } : old));
  };

  return (
    <Ctx.Provider
      value={{
        user, profile, loading, signUp, signIn, signInWithGoogle, chooseUsername, signOut,
        saveOnboarding,
        finishTutorial: () => patch({ tutorialDone: true }),
        replayTutorial: () => patch({ tutorialDone: false }),
        setPhoto: (url) => patch({ photo: url }),
        setReminders: (on) => patch({ remindersOff: !on }),
        setBio: (bio) => patch({ bio: bio.trim().slice(0, 160) }),
        setDisplayName: async (name) => {
          const bad = validateDisplayName(name);
          if (bad) throw new Error(bad);
          await patch({ displayName: cleanDisplayName(name) });
          forgetName(user?.uid);
        },
        changeUsername,
        setAutoHideNav: (enabled) => patch({ autoHideNav: enabled }),
        setFeedback: (on) => patch({ feedbackOff: !on }),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}