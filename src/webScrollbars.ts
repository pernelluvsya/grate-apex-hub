// Web only: hides the browser's scrollbars everywhere (scrolling with wheel, trackpad, touch and
// keyboard still works). Stops the scrollbar taking layout width or jumping while the navbar
// animates. Native phones are untouched.
import { Platform } from "react-native";

const ID = "gah-scrollbars";

export function installWebScrollbars() {
    if (Platform.OS !== "web" || typeof document === "undefined" || document.getElementById(ID)) return;
    const el = document.createElement("style");
    el.id = ID;
    el.textContent = `
    * { scrollbar-width: none; -ms-overflow-style: none; }
    ::-webkit-scrollbar { display: none; width: 0; height: 0; background: transparent; }
  `;
    document.head.appendChild(el);
}