import { useEffect, useRef } from "react";
import { BackHandler, Platform } from "react-native";
import { useIsFocused } from "@react-navigation/native";

// Back button / back gesture for views that are not navigator screens.
//
// Most of this app's "pages" are state inside a tab screen (a quiz, a lesson, a board, a course list), so they have
// no URL and no navigator entry. Without this, back skips straight past them: it leaves the app (Android app)
// or goes to the previous tab / closes the page (browser and installed PWA).
//
// Call useBackHandler(active, fn) from any view that has something to step back out of. While `active` is true,
// back runs `fn` instead of leaving. The most recently opened view goes first, so the deepest one (a flashcard deck
// inside a lesson inside a course) gets the press before the view that contains it.
//
//  - Android app: BackHandler.
//  - Web / PWA:   one browser-history entry per open view. Pressing back pops it and runs the handler.
//                 Closing a view with its own on-screen button removes that entry again so history stays in step.

type Entry = { fn: () => void };
const stack: Entry[] = [];

// ---------------- web: browser history ----------------
const web = Platform.OS === "web" && typeof window !== "undefined";
const KEY = "__gaDepth";
let pushed = 0;        // history entries we have pushed and not yet removed
let pos = 0;           // depth marker of the entry the browser is standing on (0 = not one of ours)
let ignore = 0;        // popstates caused by our own history.go()
let timer: ReturnType<typeof setTimeout> | null = null;

const depthOf = (s: any): number => (s && typeof s[KEY] === "number" ? s[KEY] : 0);

// Put history in step with the open views. Runs once, after the current batch of renders, so a view that closes and
// another that opens in the same moment (e.g. "Another round") cancel out instead of doing back-then-push.
function reconcile() {
  timer = null;
  const want = stack.length;
  if (pushed < want) {
    while (pushed < want) {
      pushed++;
      // keep React Navigation's own `id` in the state so it still recognises this as the same page
      window.history.pushState({ ...(window.history.state || {}), [KEY]: pushed }, "", window.location.href);
    }
    pos = pushed;
  } else if (pushed > want && pos === pushed) {
    // a view was closed with its own button: drop its entry(ies). Only when standing on our top entry;
    // otherwise (user is on another tab's entry) leave it, it is stepped over when reached.
    const n = pushed - want;
    ignore++;
    pushed = want;
    pos = want;
    window.history.go(-n);
  }
}
const schedule = () => { if (!timer) timer = setTimeout(reconcile, 0); };

if (web) {
  // React Navigation rewrites history.state with replaceState; keep our marker when it does.
  const orig = window.history.replaceState.bind(window.history);
  window.history.replaceState = (state: any, title: string, url?: string | URL | null) => {
    const cur: any = window.history.state;
    if (cur && typeof cur[KEY] === "number" && state && typeof state === "object" && state.id === cur.id && state[KEY] === undefined) {
      state = { ...state, [KEY]: cur[KEY] };
    }
    return orig(state, title, url);
  };

  window.addEventListener("popstate", () => {
    if (ignore > 0) { ignore--; pos = depthOf(window.history.state); return; }
    const prev = pos;
    pos = depthOf(window.history.state);
    // The user went back from our top entry: that is a "close the top view" request.
    if (prev === pushed && pushed > 0 && pos < prev) {
      pushed--;
      const top = stack[stack.length - 1];
      if (top) top.fn();
    }
    schedule(); // if the view stayed open (e.g. "leave this round?" answered No) the entry is pushed again
  });
}

export function useBackHandler(active: boolean, onBack: () => void) {
  const fn = useRef(onBack);
  fn.current = onBack; // always call the latest closure, without re-registering on every render

  useEffect(() => {
    if (!active) return;
    if (Platform.OS === "android") {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => { fn.current(); return true; });
      return () => sub.remove();
    }
    if (web) {
      const entry: Entry = { fn: () => fn.current() };
      stack.push(entry);
      schedule();
      return () => {
        const i = stack.indexOf(entry);
        if (i >= 0) stack.splice(i, 1);
        schedule();
      };
    }
  }, [active]);
}

// Same, for views inside a tab screen. On the Android app, tabs stay mounted when you switch away, so without the
// focus check a hidden Study screen would swallow the back press while you are on another tab.
// On web we do not gate on focus: a view you left open keeps its history entry, and back reaches it again naturally.
export function useScreenBack(active: boolean, onBack: () => void) {
  const focused = useIsFocused();
  useBackHandler(active && (Platform.OS === "web" || focused), onBack);
}
