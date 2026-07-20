/* GrAte Apex Hub — Firebase (Auth + Firestore)
   ----------------------------------------------------------------
   One-time setup:
     1. https://console.firebase.google.com/ -> Add project. You can pick
        an existing Google Cloud project from the dropdown, or create a
        fresh one — either works, this no longer needs to share a project
        with anything else.
     2. Build > Authentication -> Get started -> Sign-in method -> enable
        "Google" as a provider -> Save.
     3. Authentication -> Settings -> Authorized domains -> add every
        domain this app is served from (localhost is included by
        default; add things like yourname.github.io and
        your-project.vercel.app).
     4. Build > Firestore Database -> Create database -> start in
        **production mode** -> pick a location near your students.
     5. Firestore -> Rules tab -> replace the rules with the contents of
        firestore.rules (included alongside this file) -> Publish.
     6. Project settings (gear icon, top left) -> scroll to "Your apps" ->
        Add app -> Web (</>) -> register (name doesn't matter, skip
        Hosting) -> copy the firebaseConfig object it shows you.
     7. Paste that config into FIREBASE_CONFIG below.
   Personal progress lives in Firestore at progress/{uid}, readable and
   writable only by that signed-in user. The class leaderboard lives at
   leaderboard/{uid} — publicly readable, but still only writable by that
   same uid, and only in the shape firestore.rules allows.
   ---------------------------------------------------------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, getDocs, collection, query, orderBy, limit, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

var FIREBASE_CONFIG = {
  aapiKey: "AIzaSyCy4HizcdGEYEMC45mbrq4S4U2znUM9k6I",
  authDomain: "grate-apex.firebaseapp.com",
  projectId: "grate-apex",
  storageBucket: "grate-apex.firebasestorage.app",
  messagingSenderId: "24083972640",
  appId: "1:24083972640:web:3d01b201dfc51be7b93245",
  measurementId: "G-V1QW3SBBPT"
};

var configured = FIREBASE_CONFIG.apiKey.indexOf("YOUR_API_KEY") === -1;
var auth=null, db=null, provider=null;
if(configured){
  try{
    var app = initializeApp(FIREBASE_CONFIG);
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();
  }catch(e){ console.warn("Firebase init failed:", e); auth=null; db=null; }
}

function userToProfile(u){
  if(!u) return null;
  return { uid:u.uid, email:u.email||"", name:u.displayName||"", picture:u.photoURL||"" };
}

function signIn(){
  if(!auth) return Promise.reject(new Error("not-configured"));
  return signInWithPopup(auth, provider).then(function(result){ return userToProfile(result.user); });
}
function signOutUser(){
  if(!auth) return Promise.resolve();
  return signOut(auth);
}
// Fires immediately with the current session (or null) if already known,
// then again on any future sign-in/out — this is what lets students stay
// signed in across visits with no popup needed on return trips.
function onAuthChange(cb){
  if(!auth){ cb(null); return function(){}; }
  return onAuthStateChanged(auth, function(u){ cb(userToProfile(u)); });
}

function getProgress(uid){
  if(!db) return Promise.reject(new Error("not-configured"));
  return getDoc(doc(db,"progress",uid)).then(function(snap){ return snap.exists() ? snap.data() : null; });
}
function setProgress(uid, data){
  if(!db) return Promise.reject(new Error("not-configured"));
  var clean = JSON.parse(JSON.stringify(data)); // strip undefined/functions, guarantee plain serializable shape
  clean.savedAt = serverTimestamp();
  return setDoc(doc(db,"progress",uid), clean);
}

function pushScore(uid, data){
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
  return setDoc(doc(db, "leaderboard", uid), payload);
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

window.GAFirebase = {
  configured: configured,
  signIn: signIn,
  signOutUser: signOutUser,
  onAuthChange: onAuthChange,
  getProgress: getProgress,
  setProgress: setProgress,
  pushScore: pushScore,
  fetchLeaderboard: fetchLeaderboard
};
