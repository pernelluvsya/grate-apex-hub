import React, { createContext, useContext, useState } from "react";
import { Modal } from "react-native";
import ProfileView from "./screens/ProfileView";
import Background from "./Background";
import { Column } from "./ui";
import { useAfterDismiss } from "./afterDismiss";

type Target = { uid: string; username: string };
const Ctx = createContext<{ open: (uid: string, username?: string) => void }>({ open: () => { } });
export const useProfileHost = () => useContext(Ctx);

// Lets any screen call open(uid) to show that student's profile on top of
// whatever they are looking at. Opening someone from a profile stacks; Close goes back.
export function ProfileHost({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<Target[]>([]);
  const top = stack[stack.length - 1];
  const push = (uid: string, username = "") => setStack((s) => [...s, { uid, username }]);
  const pop = () => setStack((s) => s.slice(0, -1));
  const { onDismiss, closeThen } = useAfterDismiss();
  // Close every profile, and only once the sheet is fully gone run `then` (e.g. open a chat or a battle).
  const closeAllThen = (then: () => void) => closeThen(() => setStack([]), then);
  return (
    <Ctx.Provider value={{ open: push }}>
      {children}
      <Modal visible={!!top} animationType="slide" onRequestClose={pop} onDismiss={onDismiss}>
        {top && <Background><Column><ProfileView key={top.uid + stack.length} uid={top.uid} username={top.username} onClose={pop} closeAllThen={closeAllThen} onOpen={push} /></Column></Background>}
      </Modal>
    </Ctx.Provider>
  );
}