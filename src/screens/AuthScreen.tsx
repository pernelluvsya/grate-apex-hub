import React, { useState, useMemo } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import Svg, { Path as SvgPath } from "react-native-svg";
import { Text, TextInput } from "../Text";
import { useAuth, friendlyAuthError, cleanUsername, validateUsername } from "../auth";
import { useColors } from "../theme";
import { useLayout } from "../responsive";
import { Button } from "../components/ui/button";
import { Icon, type IconName } from "../components/ui/icon";
import { Interactive } from "../components/ui/interactive";
import { LogoMark } from "../components/logo-mark";
import { elevation, Radius, Type, type ThemeColors } from "../constants/theme";
import { useThemedStyles } from "../hooks/use-theme";

type Styles = ReturnType<typeof createStyles>;

export default function AuthScreen() {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { desktop, width } = useLayout();
  const isWide = desktop || width >= 960;
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const signup = mode === "signup";
  const canSubmit = !!username.trim() && !!password && (!signup || !!confirm);

  const submit = async () => {
    setError("");
    const u = cleanUsername(username);
    const bad = validateUsername(u);
    if (bad) return setError(bad);
    if (signup && password !== confirm) return setError("Passwords don't match.");
    setBusy(true);
    try {
      if (signup) await signUp(u, password, displayName);
      else await signIn(u, password);
    } catch (e: any) {
      setError(e?.code ? friendlyAuthError(e) : e?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(""); setGoogleBusy(true);
    try { await signInWithGoogle(); }
    catch (e: any) { setError(e?.code ? friendlyAuthError(e) : e?.message ?? "Something went wrong."); }
    finally { setGoogleBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.container, isWide && styles.containerWide]} keyboardShouldPersistTaps="handled">
        <View style={[styles.layout, isWide && styles.layoutWide]}>
          {isWide ? (
            <BrandPanel styles={styles} colors={colors} />
          ) : (
            <View style={styles.mobileBrand}>
              <LogoMark height={52} />
              <Text style={styles.brandName}>GrAte Apex Hub</Text>
            </View>
          )}

          <View style={[styles.formPanel, isWide && styles.formPanelWide]}>
            <View style={[styles.card, elevation(colors, 3)]}>
              <Text style={styles.eyebrow}>{signup ? "NEW TO GrAte Apex Hub" : "WELCOME BACK"}</Text>
              <Text style={styles.title} accessibilityRole="header">{signup ? "Create your account" : "Sign in"}</Text>
              <Text style={styles.subtitle}>{signup ? "Pick a username and start studying." : "Log in to pick up where you left off."}</Text>

              <GoogleButton loading={googleBusy} disabled={busy} onPress={google} styles={styles} />
              <View style={styles.or} aria-hidden>
                <View style={styles.orLine} /><Text style={styles.orText}>or use a username</Text><View style={styles.orLine} />
              </View>

              <FieldShell label="Username" icon="profile" styles={styles} colors={colors}>
                <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="e.g. kofi_a" placeholderTextColor={colors.textTertiary} maxLength={20} autoCapitalize="none" autoCorrect={false} accessibilityLabel="Username" />
              </FieldShell>
              {signup ? <FieldShell label="Display name (optional)" icon="profile" styles={styles} colors={colors}>
                <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholder="e.g. Kofi Mensah" placeholderTextColor={colors.textTertiary} maxLength={40} autoCorrect={false} accessibilityLabel="Display name" />
              </FieldShell> : null}
              <FieldShell label="Password" icon="key" styles={styles} colors={colors}>
                <TextInput style={styles.input} value={password} onChangeText={setPassword} onSubmitEditing={signup ? undefined : submit} placeholder="At least 6 characters" placeholderTextColor={colors.textTertiary} secureTextEntry={!show} autoCapitalize="none" autoCorrect={false} accessibilityLabel="Password" />
                <Interactive onPress={() => setShow((v) => !v)} accessibilityLabel={show ? "Hide password" : "Show password"} style={({ hovered }) => [styles.reveal, hovered && styles.revealHover]}>
                  <Icon name={show ? "eyeOff" : "eye"} size={18} color={colors.textSecondary} />
                  <Text style={styles.revealText}>{show ? "Hide" : "Show"}</Text>
                </Interactive>
              </FieldShell>
              {signup ? (
                <FieldShell label="Confirm password" icon="key" styles={styles} colors={colors}>
                  <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} onSubmitEditing={submit} placeholder="Type it again" placeholderTextColor={colors.textTertiary} secureTextEntry={!show} autoCapitalize="none" autoCorrect={false} accessibilityLabel="Confirm password" />
                </FieldShell>
              ) : null}

              {error ? (
                <View style={styles.error} accessibilityRole="alert">
                  <Icon name="warning" size={17} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Button label={signup ? "Create account" : "Log in"} size="lg" fullWidth loading={busy} disabled={!canSubmit} onPress={submit} style={styles.submit} />

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>{signup ? "Already have an account?" : "New to GrAte Apex Hub?"}</Text>
                <Interactive onPress={() => { setError(""); setMode(signup ? "login" : "signup"); }} accessibilityLabel={signup ? "Log in instead" : "Create an account"} style={styles.switchLink}>
                  <Text style={styles.linkText}>{signup ? "Log in" : "Create an account"}</Text>
                </Interactive>
              </View>
            </View>
            {!isWide ? <Text style={styles.mobileMotto}>Learn together. You've got this.</Text> : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Desktop: the brand side of the split screen, on the shared atmosphere.
function BrandPanel({ styles, colors }: { styles: Styles; colors: ThemeColors }) {
  const points: { icon: IconName; title: string; text: string }[] = [
    { icon: "learn", title: "Lessons with built-in practice", text: "Study your KNUST courses and test yourself as you go." },
    { icon: "reinforce", title: "Review that remembers your mistakes", text: "Wrong answers come back just before you would forget them." },
    { icon: "trophy", title: "Compete with your classmates", text: "Leaderboards, battles and study groups keep you going." },
  ];
  return (
    <View style={styles.brandPanel}>
      <View style={styles.brandHeader}>
        <LogoMark height={68} />
        <Text style={styles.brandName}>GrAte Apex Hub</Text>
      </View>
      <View style={styles.brandStatement}>
        <View style={styles.brandAccent} />
        <Text style={styles.brandMotto}>Study together. Score higher.</Text>
        <Text style={styles.brandSubjects}>KNUST LEVEL 100 · MEDICAL SCIENCES</Text>
      </View>
      <View style={styles.points}>
        {points.map((p) => (
          <View key={p.title} style={styles.point}>
            <View style={styles.pointIcon}><Icon name={p.icon} size={18} color={colors.accentText} /></View>
            <View style={styles.pointText}>
              <Text style={styles.pointTitle}>{p.title}</Text>
              <Text style={styles.pointBody}>{p.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function FieldShell({ label, icon, styles, colors, children }: { label: string; icon?: IconName; styles: Styles; colors: ThemeColors; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        {icon ? <Icon name={icon} size={18} color={colors.textTertiary} style={styles.inputIcon} /> : null}
        {children}
      </View>
    </View>
  );
}

// "Continue with Google": the standard white button with Google's mark.
function GoogleButton({ loading, disabled, onPress, styles }: { loading: boolean; disabled: boolean; onPress: () => void; styles: Styles }) {
  return (
    <Interactive onPress={onPress} disabled={disabled || loading} accessibilityLabel="Continue with Google" style={({ hovered, pressed }) => [styles.google, hovered && styles.googleHover, pressed && styles.googlePressed]}>
      {loading ? <ActivityIndicator size="small" color="#1F1F1F" /> : (
        <Svg width={18} height={18} viewBox="0 0 48 48" aria-hidden>
          <SvgPath fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z" />
          <SvgPath fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <SvgPath fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <SvgPath fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z" />
        </Svg>
      )}
      <Text style={styles.googleText}>{loading ? "Opening Google…" : "Continue with Google"}</Text>
    </Interactive>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: "transparent" },
    container: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, paddingTop: 40, paddingBottom: 60 },
    containerWide: { paddingHorizontal: 48, paddingVertical: 48 },
    layout: { width: "100%", maxWidth: 440, alignSelf: "center", gap: 22 },
    layoutWide: { maxWidth: 1240, flexDirection: "row", alignItems: "center", gap: 64 },
    brandPanel: { flex: 1.1, minWidth: 0, gap: 36, justifyContent: "center" },
    brandHeader: { flexDirection: "row", alignItems: "center", gap: 18, alignSelf: "flex-start" },
    brandName: { fontSize: 26, fontWeight: "800", letterSpacing: 1.2, color: colors.logoLetters },
    brandStatement: { gap: 12 },
    brandAccent: { width: 44, height: 4, borderRadius: 2, backgroundColor: colors.accent },
    brandMotto: { ...Type.display, fontSize: 46, lineHeight: 52, color: colors.text, maxWidth: 520 },
    brandSubjects: { ...Type.overline, letterSpacing: 2.2, color: colors.textTertiary },
    points: { gap: 18, maxWidth: 460 },
    point: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
    pointIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentSubtle, borderWidth: 1, borderColor: colors.accent + "44" },
    pointText: { flex: 1, minWidth: 0 },
    pointTitle: { ...Type.headline, color: colors.text },
    pointBody: { fontSize: 13.5, lineHeight: 20, color: colors.textSecondary, marginTop: 2 },
    mobileBrand: { alignItems: "flex-start", gap: 10, marginBottom: 4, paddingLeft: 8 },
    mobileMotto: { ...Type.overline, letterSpacing: 1.6, color: colors.textTertiary, textAlign: "center", marginTop: 18 },
    formPanel: { width: "100%" },
    formPanelWide: { width: 440, flexShrink: 0 },
    card: { backgroundColor: colors.surfaceElevated, borderRadius: Radius.xl, padding: 28, borderWidth: 1, borderColor: colors.hairline },
    eyebrow: { ...Type.overline, color: colors.accentText, marginBottom: 8 },
    title: { ...Type.title1, color: colors.text },
    subtitle: { ...Type.callout, color: colors.textSecondary, marginTop: 4, marginBottom: 22 },
    field: { marginBottom: 14 },
    label: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, marginBottom: 6 },
    inputShell: { flexDirection: "row", alignItems: "center", minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSunken, paddingHorizontal: 12, gap: 8 },
    inputIcon: { marginRight: 2 },
    input: { flex: 1, minWidth: 0, fontSize: 15, color: colors.text, paddingVertical: 12, ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : null) },
    reveal: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 10 },
    revealHover: { backgroundColor: colors.surfaceMuted },
    revealText: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
    linkText: { fontSize: 13.5, fontWeight: "700", color: colors.primaryText },
    submit: { marginTop: 8 },
    error: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 12, backgroundColor: colors.errorSubtle, borderWidth: 1, borderColor: colors.errorBorder, marginBottom: 8 },
    errorText: { flex: 1, fontSize: 13.5, lineHeight: 19, color: colors.text },
    or: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 16 },
    orLine: { flex: 1, height: 1, backgroundColor: colors.divider },
    orText: { fontSize: 12, fontWeight: "700", color: colors.textTertiary, textTransform: "uppercase", letterSpacing: 1 },
    google: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DADCE0", paddingHorizontal: 16 },
    googleHover: { backgroundColor: "#F7F8FA" },
    googlePressed: { transform: [{ scale: 0.98 }] },
    googleText: { fontSize: 15, fontWeight: "700", color: "#1F1F1F" },
    switchRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 18 },
    switchText: { fontSize: 13.5, color: colors.textSecondary },
    switchLink: { borderRadius: 6, paddingHorizontal: 2, paddingVertical: 2 },
  });
}
