import { useCallback, useRef } from "react";
import { Platform } from "react-native";

// "Close this modal, then open that next screen" without guessing how long the close animation takes.
// iOS drops a modal that is opened while another one is still animating out, and it (like web) tells us when the
// close has finished through the Modal's onDismiss. Android has no onDismiss but stacks dialogs fine, so there we just
// go ahead on the next frame.
//
// Usage: put `onDismiss` on the Modal you are closing, then call closeThen(() => hide it, () => open the next thing).
export function useAfterDismiss() {
  const next = useRef<(() => void) | null>(null);
  const onDismiss = useCallback(() => {
    const fn = next.current;
    next.current = null;
    fn?.();
  }, []);
  const closeThen = useCallback((close: () => void, then: () => void) => {
    if (Platform.OS === "android") { close(); requestAnimationFrame(() => then()); return; }
    next.current = then;
    close();
  }, []);
  return { onDismiss, closeThen };
}
