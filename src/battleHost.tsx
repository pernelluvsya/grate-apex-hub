import React, { createContext, useContext, useEffect, useState } from "react";
import { Modal } from "react-native";
import { useAuth } from "./auth";
import Background from "./Background";
import { Column } from "./ui";
import BattleScreen from "./screens/BattleScreen";
import { watchMyBattles } from "./battle";
import { UserHit } from "./social";

const Ctx = createContext<{ open: (target?: UserHit | null) => void; invites: number }>({ open: () => {}, invites: 0 });
export const useBattles = () => useContext(Ctx);

// Lets any screen open the battles screen (optionally with someone already picked)
// and shows how many challenges are waiting for you.
export function BattleHost({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState<UserHit | null>(null);
  const [invites, setInvites] = useState(0);
  useEffect(() => {
    if (!user) { setInvites(0); return; }
    return watchMyBattles(user.uid, (bs) => setInvites(bs.filter((b) => b.status === "invited" && b.players[1] === user.uid && Date.now() - b.createdAt < 86400000).length));
  }, [user?.uid]);
  return (
    <Ctx.Provider value={{ open: (t) => { setTarget(t ?? null); setShow(true); }, invites }}>
      {children}
      <Modal visible={show} animationType="slide" onRequestClose={() => setShow(false)}>
        {show && !!user && <Background><Column><BattleScreen target={target} onClose={() => setShow(false)} /></Column></Background>}
      </Modal>
    </Ctx.Provider>
  );
}
