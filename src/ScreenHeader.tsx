import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text } from "./Text";
import Icon from "./Icon";
import { useColors } from "./theme";
import { useLayout } from "./responsive";
import { BellButton } from "./notifHost";

// Title on the left, round search and (on a phone) notification bell buttons on the right. On a computer the bell lives in the sidebar.
export default function ScreenHeader({ title, sub, bell = true, search = true, extra }: { title: string; sub?: string; bell?: boolean; search?: boolean; extra?: React.ReactNode }) {
  const COLORS = useColors();
  const nav = useNavigation<any>();
  const { desktop } = useLayout();
  const btn = { width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, alignItems: "center" as const, justifyContent: "center" as const, marginLeft: 10 };
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 16 }}>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ color: COLORS.text, fontSize: 30, fontWeight: "800", letterSpacing: -0.5 }}>{title}</Text>
        {!!sub && <Text style={{ color: COLORS.muted, marginTop: 4, lineHeight: 20 }}>{sub}</Text>}
      </View>
      {extra}
      {search && <TouchableOpacity style={btn} onPress={() => nav.navigate("Compete", { find: Date.now() })} accessibilityLabel="Find students"><Icon name="search" size={20} color={COLORS.text} /></TouchableOpacity>}
      {bell && !desktop && <View style={{ marginLeft: 10 }}><BellButton /></View>}
    </View>
  );
}