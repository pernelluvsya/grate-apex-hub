import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { NunitoSans_700Bold, NunitoSans_800ExtraBold } from "@expo-google-fonts/nunito-sans";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { navRef } from "./src/lib/router";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useColors } from "./src/theme";
import Background, { AtmosphereMoodPin } from "./src/Background";
import { AnimatedSplashOverlay } from "./src/components/animated-icon";
import { loadWebFonts } from "./src/lib/web-fonts";
import { Column } from "./src/ui";
import { AuthProvider, useAuth } from "./src/auth";
import AuthScreen from "./src/screens/AuthScreen";
import UsernameScreen from "./src/screens/UsernameScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import TutorialScreen from "./src/screens/TutorialScreen";
import { ProgressProvider } from "./src/progress";
import { PremiumProvider } from "./src/premium";
import { ProfileHost } from "./src/profileHost";
import { CallHost } from "./src/calls";
import { ChatHost } from "./src/chatHost";
import { BattleHost } from "./src/battleHost";
import { NotifBridge } from "./src/notifHost";
import Tabs from "./src/screens/Tabs";
import { PreviewProviders } from "./src/preview";
import { installWebScrollbars } from "./src/webScrollbars";
import { UpdateBanner } from "./src/updatePrompt";

installWebScrollbars();
loadWebFonts();
SplashScreen.preventAutoHideAsync().catch(() => { });

// The "gate": decides which screen a person sees based on how far they've got.
function Gate() {
  const COLORS = useColors();
  const { user, profile, loading } = useAuth();
  if (loading) {
    return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator color={COLORS.accent} /></View>;
  }
  // Sign-up style screens sit in a centred column on a computer. The main app (Tabs) uses the whole window.
  // They get the brighter "auth" atmosphere; the app proper follows the focused tab.
  if (!user) return <><AtmosphereMoodPin mood="auth" /><AuthScreen /></>;
  if (profile?.needsUsername) return <><AtmosphereMoodPin mood="auth" /><Column max={520}><UsernameScreen /></Column></>;
  if (!profile?.classLocked) return <><AtmosphereMoodPin mood="auth" /><Column max={560}><OnboardingScreen /></Column></>;
  if (!profile.tutorialDone) return <><AtmosphereMoodPin mood="auth" /><Column max={560}><TutorialScreen /></Column></>;
  return <ProgressProvider><PremiumProvider>{PREVIEW_SCREEN === "auth" ? <AuthScreen /> : PREVIEW_SCREEN === "onboarding" ? <OnboardingScreen /> : PREVIEW_SCREEN === "tutorial" ? <TutorialScreen /> : <BattleHost><ProfileHost><CallHost><ChatHost><NotifBridge><Tabs /></NotifBridge></ChatHost></CallHost></ProfileHost></BattleHost>}</PremiumProvider></ProgressProvider>;
}

function Shell() {
  const COLORS = useColors();

  // Deep linking (handles the browser address bar and back button on web).
  // Tabs.tsx is itself the bottom-tab navigator, so these are its screen names directly, with no wrapper screen in between.
  // The auth / onboarding screens are swapped in by Gate, not by the navigator, so they have no URL.
  const linking = {
    prefixes: [Linking.createURL("/"), "https://grate-apex.com", "http://localhost:3000"],
    config: {
      screens: {
        Study: "study",
        Feed: "feed",
        Compete: "compete",
        Community: "community",
        You: "you",
      },
    },
  };

  return (
    <Background>
      <NavigationContainer
        ref={navRef}
        linking={linking}
        fallback={<View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator color={COLORS.accent} /></View>}
        documentTitle={{ formatter: () => "Grate Apex Hub" }}
        theme={{
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: "transparent",
            card: "transparent",
            text: COLORS.text,
            border: COLORS.border
          }
        }}
      >
        <StatusBar style={COLORS.light ? "dark" : "light"} />
        <Gate />
      </NavigationContainer>
      <UpdateBanner />
    </Background>
  );
}

// Developer preview (no login): start with EXPO_PUBLIC_PREVIEW=1
const PREVIEW = process.env.EXPO_PUBLIC_PREVIEW === "1";
const PREVIEW_SCREEN = process.env.EXPO_PUBLIC_PREVIEW_SCREEN || "tabs";
const PREVIEW_LEVEL = parseInt(process.env.EXPO_PUBLIC_PREVIEW_LEVEL || "1", 10);

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, NunitoSans_700Bold, NunitoSans_800ExtraBold });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: "#1436B8", justifyContent: "center" }}><ActivityIndicator color="#FDC00A" /></View>;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AnimatedSplashOverlay appReady={fontsLoaded} />
        {PREVIEW ? (
          <PreviewProviders level={PREVIEW_LEVEL}>
            <Background>
              <NavigationContainer ref={navRef} documentTitle={{ formatter: () => "Grate Apex Hub" }} theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: "transparent", card: "transparent" } }}>
                {PREVIEW_SCREEN === "auth" ? <AuthScreen /> : PREVIEW_SCREEN === "onboarding" ? <Column max={560}><OnboardingScreen /></Column> : PREVIEW_SCREEN === "tutorial" ? <Column max={560}><TutorialScreen /></Column> : <BattleHost><ProfileHost><CallHost><ChatHost><NotifBridge><Tabs /></NotifBridge></ChatHost></CallHost></ProfileHost></BattleHost>}
              </NavigationContainer>
            </Background>
          </PreviewProviders>
        ) : (
          <AuthProvider>
            <Shell />
          </AuthProvider>
        )}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}