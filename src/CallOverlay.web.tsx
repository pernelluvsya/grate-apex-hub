import React, { useEffect, useState } from "react";

// Why this exists: react-native-web adds every <Modal>'s container to the page the moment that Modal is created, and the
// containers all share one z-index, so whichever Modal was created LAST paints on top. The call screens used to be Modals
// created early (CallHost sits inside ProfileHost/BattleHost, and chat/messages/profile modals are created later), so a ring or an
// outgoing call could appear BEHIND an open chat or profile, which looks like "the call screen didn't show up".
// This draws the call UI in its own layer on <body> with the highest possible z-index, so nothing can cover it.
const { createPortal } = require("react-dom") as { createPortal: (child: React.ReactNode, node: Element) => React.ReactPortal };

export function CallOverlay({ visible, onRequestClose, passThrough, children }: { visible: boolean; onRequestClose?: () => void; passThrough?: boolean; children: React.ReactNode }) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  // Create the layer when it is first needed and remove it when it is not.
  useEffect(() => {
    if (!visible) return;
    const el = document.createElement("div");
    el.setAttribute("data-call-overlay", passThrough ? "note" : "call");
    if (!passThrough) { el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); }
    Object.assign(el.style, {
      position: "fixed", top: "0", left: "0", right: "0", bottom: "0", zIndex: "2147483647",
      display: "flex", flexDirection: "column", pointerEvents: passThrough ? "none" : "auto",
    });
    document.body.appendChild(el);
    setNode(el);
    return () => { setNode(null); try { document.body.removeChild(el); } catch { /* already gone */ } };
  }, [visible, passThrough]);

  // Escape = same as the back button on a phone (decline / hang up)
  useEffect(() => {
    if (!visible || passThrough || !onRequestClose) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onRequestClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [visible, passThrough, onRequestClose]);

  if (!visible || !node) return null;
  return createPortal(children, node);
}
