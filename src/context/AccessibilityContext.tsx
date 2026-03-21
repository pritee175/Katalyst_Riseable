"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "high-contrast";
type TextSize = "normal" | "large" | "x-large";
type FontType = "default" | "dyslexia";

interface AccessibilityState {
  theme: Theme;
  textSize: TextSize;
  fontType: FontType;
  screenReaderMode: boolean;
  voiceNavigationEnabled: boolean;
  reducedMotion: boolean;
  gestureNavigationEnabled: boolean;
}

interface AccessibilityContextType extends AccessibilityState {
  setTheme: (theme: Theme) => void;
  setTextSize: (size: TextSize) => void;
  setFontType: (font: FontType) => void;
  toggleScreenReaderMode: () => void;
  toggleVoiceNavigation: () => void;
  toggleReducedMotion: () => void;
  toggleGestureNavigation: () => void;
  announceToScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccessibilityState>({
    theme: "dark",
    textSize: "normal",
    fontType: "default",
    screenReaderMode: false,
    voiceNavigationEnabled: false,
    reducedMotion: false,
    gestureNavigationEnabled: false,
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("riseable-accessibility");
      if (saved) {
        setState(JSON.parse(saved));
      }
      // Check system preference for reduced motion
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        setState(prev => ({ ...prev, reducedMotion: true }));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Persist preferences and apply to DOM
  useEffect(() => {
    try {
      localStorage.setItem("riseable-accessibility", JSON.stringify(state));
    } catch {
      // Ignore
    }
    document.documentElement.setAttribute("data-theme", state.theme);
    document.documentElement.setAttribute("data-text-size", state.textSize);
    document.documentElement.setAttribute("data-font", state.fontType);
  }, [state]);

  const setTheme = useCallback((theme: Theme) => {
    setState(prev => ({ ...prev, theme }));
  }, []);

  const setTextSize = useCallback((textSize: TextSize) => {
    setState(prev => ({ ...prev, textSize }));
  }, []);

  const setFontType = useCallback((fontType: FontType) => {
    setState(prev => ({ ...prev, fontType }));
  }, []);

  const toggleScreenReaderMode = useCallback(() => {
    setState(prev => ({ ...prev, screenReaderMode: !prev.screenReaderMode }));
  }, []);

  const toggleVoiceNavigation = useCallback(() => {
    setState(prev => ({ ...prev, voiceNavigationEnabled: !prev.voiceNavigationEnabled }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setState(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);

  const toggleGestureNavigation = useCallback(() => {
    setState(prev => ({ ...prev, gestureNavigationEnabled: !prev.gestureNavigationEnabled }));
  }, []);

  // Announce messages to screen readers via a live region
  const announceToScreenReader = useCallback((message: string) => {
    const el = document.getElementById("sr-announcer");
    if (el) {
      el.textContent = "";
      // Small delay to ensure screen reader picks up the change
      setTimeout(() => {
        el.textContent = message;
      }, 50);
    }
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        ...state,
        setTheme,
        setTextSize,
        setFontType,
        toggleScreenReaderMode,
        toggleVoiceNavigation,
        toggleReducedMotion,
        toggleGestureNavigation,
        announceToScreenReader,
      }}
    >
      {children}
      {/* Live region for screen reader announcements */}
      <div
        id="sr-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
