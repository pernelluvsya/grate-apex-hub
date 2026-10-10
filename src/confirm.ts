import { Alert, Platform } from "react-native";

// "Are you sure?" that works on web and phones.
export function confirmAsk(message: string, okLabel = "Delete"): Promise<boolean> {
  if (Platform.OS === "web") return Promise.resolve(typeof window !== "undefined" ? window.confirm(message) : true);
  return new Promise((resolve) =>
    Alert.alert(message, undefined, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: okLabel, style: "destructive", onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) })
  );
}
