import React from "react";
import { Modal } from "react-native";

// Native fallback. (Calls only run on the web build today; the web version is CallOverlay.web.tsx.)
export function CallOverlay({ visible, onRequestClose, passThrough, children }: { visible: boolean; onRequestClose?: () => void; passThrough?: boolean; children: React.ReactNode }) {
  if (passThrough) return visible ? <>{children}</> : null;
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>{children}</Modal>;
}
