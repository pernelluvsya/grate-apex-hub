import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useReducedMotion } from "react-native-reanimated";
import { AdminVerifier } from "../verified";
import { AchievementWatcher } from "../AchievementsUI";
import { BellButton } from "../notifHost";
import PayReturn from "../PayReturn";
import { useAuth } from "../auth";
import { useProgress, rankFor, todayStr } from "../progress";
import { useLayout } from "../responsive";
import { useUnreadChats } from "../messageHost";
import StudyScreen from "./StudyScreen";
import CompeteScreen from "./CompeteScreen";
import CommunityScreen from "./CommunityScreen";
import HomeScreen from "./HomeScreen";
import YouScreen from "./YouScreen";
import { Wide } from "../ui";
import { Signature } from "../components/signature";
import { FloatingTabBar } from "../components/floating-tab-bar";
import { DesktopSidebar } from "../components/desktop-sidebar";
import { setAtmosphereTab } from "../components/atmosphere/config";
import { NAV_ITEMS } from "../components/nav-items";
import { useTabBarHidden } from "../components/tab-bar-visibility";
import { MOTION } from "../constants/motion";
import { SIDEBAR_WIDTH } from "../constants/theme";

// Older screens import the scroll hook from here.
export { useNavScroll } from "../components/tab-bar-visibility";

const Tab = createBottomTabNavigator();

// On a phone the floating bar sits over the bottom of the screen, so every tab reserves that strip
// (bar 64 + 12 gap + room for the raised Study button). It is fixed (not animated with the bar) so
// hiding/showing never resizes the scroll view.
const NAV_RESERVE = 96;
const withWidth = (Screen: React.ComponentType<any>, max = 1100) => function Themed(props: any) {
  const { desktop } = useLayout();
  return <Wide max={max}><View style={{ flex: 1, paddingBottom: desktop ? 0 : NAV_RESERVE }}><Screen {...props} /></View></Wide>;
};
// Study uses the full width (columns); the reading-style tabs stay a readable width.
const FeedTab = withWidth(HomeScreen, 1180), CompeteTab = withWidth(CompeteScreen, 1280), StudyTab = withWidth(StudyScreen, 1180),
  CommunityTab = withWidth(CommunityScreen, 860), YouTab = withWidth(YouScreen, 1280);

// The custom tab bar: the desktop rail on a wide window, the floating bar everywhere else.
function NavBar({ state, navigation, desktop }: any) {
  const { profile } = useAuth();
  const { progress, streak } = useProgress();
  const unread = useUnreadChats();
  const autoHide = !!profile?.autoHideNav;
  const active = state.routes[state.index]?.name as string;
  const go = (route: string) => { if (route !== active) navigation.navigate(route); };
  const badges = { Community: unread };

  useEffect(() => { setAtmosphereTab(active); }, [active]);

  if (!desktop) return <FloatingTabBar activeRoute={active} onNavigate={go} autoHide={autoHide} badges={badges} />;

  const r = rankFor(progress.xp);
  const answered = progress.days[todayStr()] || 0;
  // Docked: a placeholder that holds the rail's width. Auto-hide: zero width, the rail floats over the page.
  return (
    <View style={[styles.railSlot, { width: autoHide ? 0 : SIDEBAR_WIDTH }]}>
      <DesktopSidebar
        docked={!autoHide}
        activeRoute={active}
        onNavigate={go}
        badges={badges}
        bell={<BellButton size={36} />}
        identity={{
          name: profile?.username ?? "?", photo: profile?.photo, streak,
          subtitle: `Lv ${r.level} · ${r.title}`,
          todayLabel: answered ? `${answered} answered today` : undefined,
        }}
      />
    </View>
  );
}

export default function Tabs() {
  const { desktop } = useLayout();
  const { profile } = useAuth();
  const reduceMotion = useReducedMotion();
  const autoHide = !!profile?.autoHideNav;
  const barHidden = useTabBarHidden();
  return (
    <View style={styles.shell}>
      <AchievementWatcher />
      <AdminVerifier />
      <PayReturn />
      <Tab.Navigator
        initialRouteName="Study"
        backBehavior="history"
        tabBar={(props) => <NavBar {...props} desktop={desktop} />}
        screenOptions={{
          tabBarPosition: desktop ? "left" : "bottom",
          headerShown: false,
          sceneStyle: { backgroundColor: "transparent" }, // lets the atmosphere show through
          animation: "fade",
          transitionSpec: { animation: "timing", config: { duration: reduceMotion ? 0 : MOTION.standard - 40 } },
        } as any}
      >
        <Tab.Screen name="Feed" component={FeedTab} options={{ title: NAV_ITEMS[0].label }} />
        <Tab.Screen name="Compete" component={CompeteTab} options={{ title: NAV_ITEMS[1].label }} />
        <Tab.Screen name="Study" component={StudyTab} options={{ title: NAV_ITEMS[2].label }} />
        <Tab.Screen name="Community" component={CommunityTab} options={{ title: NAV_ITEMS[3].label }} />
        <Tab.Screen name="You" component={YouTab} options={{ title: NAV_ITEMS[4].label }} />
      </Tab.Navigator>
      <Signature aboveTabBar={!desktop} autoHide={autoHide && !desktop ? true : false} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  railSlot: { zIndex: 30, height: "100%" },
});
