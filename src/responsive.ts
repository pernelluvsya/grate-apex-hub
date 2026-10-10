import { Platform, useWindowDimensions } from "react-native";

// "desktop" = a wide browser window. Phones and narrow windows keep the phone layout.
export const DESKTOP_MIN = 1200;
export function useLayout() {
  const { width, height } = useWindowDimensions();
  const web = Platform.OS === "web";
  return { width, height, desktop: web && width >= DESKTOP_MIN, wide: web && width >= 700 };
}
