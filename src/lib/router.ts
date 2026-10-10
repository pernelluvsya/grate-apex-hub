import { createNavigationContainerRef } from "@react-navigation/native";

// Master's screens were written for Expo Router. This hub uses React Navigation, so this shim keeps
// their `router.push("/path")` calls working by translating the path to a tab (or an overlay).
export type Href = string | { pathname: string; params?: Record<string, unknown> };

export const navRef = createNavigationContainerRef<any>();

type Overlay = "goals";
let overlayHandler: ((o: Overlay | null) => void) | null = null;
let overlayOpen = false;
/** HomeScreen registers here so "/goals" opens as a full-screen sheet over Home. */
export function registerOverlayHandler(fn: ((o: Overlay | null) => void) | null) { overlayHandler = fn; }
export function setOverlayOpen(open: boolean) { overlayOpen = open; }

const pathOf = (href: Href) => (typeof href === "string" ? href : href.pathname).split("?")[0];

function go(href: Href) {
  const p = pathOf(href);
  if (p === "/goals" && overlayHandler) { overlayHandler("goals"); return; }
  if (!navRef.isReady()) return;
  let tab = "Study";
  if (p === "/" ) tab = "Feed";
  else if (p.startsWith("/settings") || p.startsWith("/profile") || p.startsWith("/progress")) tab = "You";
  else if (p.startsWith("/social")) tab = "Community";
  else if (p.startsWith("/explore")) tab = "Compete";
  navRef.navigate(tab);
}

export const router = {
  push: (href: Href) => go(href),
  navigate: (href: Href) => go(href),
  replace: (href: Href) => go(href),
  canGoBack: () => overlayOpen || (navRef.isReady() && navRef.canGoBack()),
  back: () => {
    if (overlayOpen && overlayHandler) { overlayHandler(null); return; }
    if (navRef.isReady() && navRef.canGoBack()) navRef.goBack();
  },
};
export const useRouter = () => router;
