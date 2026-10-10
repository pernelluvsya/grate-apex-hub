import { Icon, type IconName } from "@/components/ui/icon";

// The five destinations of the Hub, in one place.
//
// The phone's floating bar and the desktop rail both read this list, so the two navigations can
// never drift apart. `route` is the React Navigation tab name (and its URL, see App.tsx).
export type NavItem = {
  route: "Feed" | "Compete" | "Study" | "Community" | "You";
  label: string;
  icon: IconName;
  accessibilityLabel: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { route: "Feed", label: "Home", icon: "home", accessibilityLabel: "Home: your feed and daily question" },
  { route: "Compete", label: "Compete", icon: "achievement", accessibilityLabel: "Compete: battles, leaderboards and challenges" },
  { route: "Study", label: "Study", icon: "learn", accessibilityLabel: "Study: courses, lessons and quizzes" },
  { route: "Community", label: "Connect", icon: "social", accessibilityLabel: "Connect: messages, groups and community" },
  { route: "You", label: "Profile", icon: "profile", accessibilityLabel: "Profile: your progress and settings" },
];

/** The raised centre destination of the phone bar. */
export const CENTER_ROUTE: NavItem["route"] = "Study";

export function NavIconView({ icon, color, size, active = false }: { icon: IconName; color: string; size: number; active?: boolean }) {
  return <Icon name={icon} color={color} size={size} filled={active} strokeWidth={active ? 2 : 1.8} />;
}
