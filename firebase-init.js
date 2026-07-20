/* GrAte Apex Hub — class leaderboard (Firebase Firestore)
   ----------------------------------------------------------------
   One-time setup:
     1. https://console.firebase.google.com/ -> Add project. You can pick
        the SAME Google Cloud project you already created for Google
        Sign-In from the dropdown instead of making a new one.
     2. Build > Firestore Database -> Create database -> start in
        **production mode** -> choose a location close to your students.
     3. Firestore -> Rules tab -> replace the rules with the contents of
        firestore.rules (included alongside this file) -> Publish.
     4. Project settings (gear icon, top left) -> scroll to "Your apps" ->
        Add app -> Web (</>) -> register (name doesn't matter, skip
        Hosting) -> copy the firebaseConfig object it shows you.
     5. Paste that config into FIREBASE_CONFIG below.
   The class leaderboard only ever includes students who've signed in
   with Google (the ☁️ button) — Local-only sync mode never sends
   anything here, and nothing is sent until sign-in succeeds.
   ---------------------------------------------------------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore, doc, setDoc, getDocs, collection, query, orderBy, limit, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

var FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

var configured = FIREBASE_CONFIG.apiKey.indexOf("YOUR_API_KEY") === -1;
var db = null;
if(configured){
  try{
    var app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
  }catch(e){ console.warn("Firebase init failed:", e); db=null; }
}

function pushScore(id, data){
  if(!db) return Promise.reject(new Error("not-configured"));
  var payload = {
    name: String(data.name||"Student").slice(0,40),
    xp: Math.max(0, Math.min(1000000, data.xp|0)),
    level: Math.max(1, Math.min(500, data.level|0)),
    title: String(data.title||"").slice(0,30),
    totalAnswered: Math.max(0, data.totalAnswered|0),
    avgAccuracy: Math.max(0, Math.min(100, data.avgAccuracy|0)),
    streak: Math.max(0, data.streak|0),
    updatedAt: serverTimestamp()
  };
  return setDoc(doc(db, "leaderboard", id), payload);
}

function fetchLeaderboard(max){
  if(!db) return Promise.reject(new Error("not-configured"));
  var q = query(collection(db, "leaderboard"), orderBy("xp", "desc"), limit(max||50));
  return getDocs(q).then(function(snap){
    var out=[];
    snap.forEach(function(d){ out.push(d.data()); });
    return out;
  });
}

window.GAFirebase = { configured: configured, pushScore: pushScore, fetchLeaderboard: fetchLeaderboard };
