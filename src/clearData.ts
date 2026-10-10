// "Clear my data": wipes a student's study data, but keeps the account itself
// (username, profile, posts, friends, groups and messages are NOT touched).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { delItem, keysWithPrefix } from "./store";
import { clearAllChats } from "./aiChat";

export async function clearMyData(uid: string, resetProgress: () => Promise<void>) {
    // 1. Cloud: AI flashcard decks, then progress + leaderboard entry (the XP won or lost in battles is kept by the server and stays).
    const decks = await getDocs(collection(db, "users", uid, "aiDecks"));
    await Promise.all(decks.docs.map((d) => deleteDoc(d.ref)));
    await resetProgress();

    // 2. This device: AI decks, old AI card sets, Ask AI chats, unfinished quizzes, achievement toasts already shown.
    await AsyncStorage.removeItem(`aidecks:${uid}`).catch(() => { });
    try {
        const old = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(`aicards:${uid}:`));
        await Promise.all(old.map((k) => AsyncStorage.removeItem(k)));
    } catch { /* ignore */ }
    await clearAllChats(uid);
    for (const k of await keysWithPrefix("quiz_session_")) await delItem(k);
    await delItem(`ach:${uid}`);
}