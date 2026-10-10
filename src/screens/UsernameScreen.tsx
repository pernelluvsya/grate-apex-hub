import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Text } from "../Text";
import { useAuth, cleanUsername, validateUsername } from "../auth";
import { Button, Field, Logo, useScreen } from "../ui";

// Shown once, right after a first Google sign-in: pick the name other students will see.
export default function UsernameScreen() {
  const screen = useScreen();
  const { chooseUsername, signOut } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    const bad = validateUsername(cleanUsername(name));
    if (bad) return setError(bad);
    setBusy(true);
    try { await chooseUsername(name); }
    catch (e: any) { setError(e?.message ?? "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={[screen.root, { flexGrow: 1 }]} keyboardShouldPersistTaps="handled">
        <Logo />
        <Text style={screen.title}>Pick a username</Text>
        <Text style={screen.sub}>This is the name other students see on leaderboards, the feed and discussions. Your Google name and email stay private.</Text>
        <Field label="Username" value={name} onChangeText={setName} placeholder="e.g. kofi_a" maxLength={20} autoCapitalize="none" />
        {!!error && <Text style={screen.error}>{error}</Text>}
        <Button title="Continue" onPress={submit} loading={busy} />
        <View style={{ height: 8 }} />
        <Button variant="ghost" title="Use a different account" onPress={signOut} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
