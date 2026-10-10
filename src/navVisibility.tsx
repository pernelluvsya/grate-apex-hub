import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useLayout } from "./responsive";
import { Animated } from "react-native";

type NavVisibilityState = {
  isVisible: boolean;
  toggleVisibility: () => void;
  show: () => void;
  hide: () => void;
  opacity: Animated.Value;
};

const Ctx = createContext<NavVisibilityState | null>(null);

export function NavVisibilityProvider({ children }: { children: React.ReactNode }) {
  const { desktop } = useLayout();
  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const opacityRef = useRef(new Animated.Value(1));

  const hide = () => {
    Animated.timing(opacityRef.current, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => setIsVisible(false), 200);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  };

  const show = () => {
    setIsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    Animated.timing(opacityRef.current, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 5 seconds of inactivity on mobile
    if (!desktop) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }
  };

  const toggleVisibility = () => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  return (
    <Ctx.Provider value={{ isVisible, toggleVisibility, show, hide, opacity: opacityRef.current }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNavVisibility() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNavVisibility must be used within NavVisibilityProvider");
  return ctx;
}