import React, { createContext, useContext, useState } from "react";
import { Modal } from "react-native";
import { useAuth } from "./auth";
import { UserHit } from "./social";
import { ChatView } from "./screens/Messages";
import Background from "./Background";
import { Column } from "./ui";
import { ProfileHost } from "./profileHost";

// Lets any screen (e.g. a profile) open a private chat with a friend on top of whatever is showing.
const Ctx = createContext<{ open: (peer: UserHit) => void }>({ open: () => { } });
export const useChatHost = () => useContext(Ctx);
// The profile screen is drawn by ProfileHost's own modal, which sits OUTSIDE ChatHost, so useChatHost() gives it the empty default.
// This bridge always points at the live ChatHost, whoever calls it.
export const chatBridge: { open: (peer: UserHit) => void } = { open: () => { } };

export function ChatHost({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [peer, setPeer] = useState<UserHit | null>(null);
  const me = user && profile ? { uid: user.uid, username: profile.username } : null;
  chatBridge.open = setPeer;
  return (
    <Ctx.Provider value={{ open: setPeer }}>
      {children}
      <Modal visible={!!peer && !!me} animationType="slide" onRequestClose={() => setPeer(null)}>
        {peer && me && <ProfileHost><Background><Column max={980}><ChatView key={peer.uid} me={me} peer={peer} onBack={() => setPeer(null)} /></Column></Background></ProfileHost>}
      </Modal>
    </Ctx.Provider>
  );
}