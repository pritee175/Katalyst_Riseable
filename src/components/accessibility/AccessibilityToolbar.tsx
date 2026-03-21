"use client";

import React, { useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import {
  Settings,
  Sun,
  Moon,
  Contrast,
  Type,
  Mic,
  Eye,
  X,
  Minus,
  Hand,
} from "lucide-react";

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    theme,
    textSize,
    fontType,
    voiceNavigationEnabled,
    reducedMotion,
    gestureNavigationEnabled,
    setTheme,
    setTextSize,
    setFontType,
    toggleVoiceNavigation,
    toggleReducedMotion,
    toggleGestureNavigation,
    screenReaderMode,
    toggleScreenReaderMode,
  } = useAccessibility();

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110"
        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
        aria-label={isOpen ? "Close accessibility settings" : "Open accessibility settings"}
        aria-expanded={isOpen}
        aria-controls="a11y-panel"
      >
        {isOpen ? <X size={24} /> : <Settings size={24} />}
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div
          id="a11y-panel"
          role="dialog"
          aria-label="Accessibility Settings"
          aria-modal="false"
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-80 max-w-sm rounded-2xl shadow-2xl border p-4 sm:p-5 animate-fade-in-up"
          style={{
            backgroundColor: "var(--color-bg)",
            borderColor: "var(--color-border)",
          }}
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
            <Settings size={20} aria-hidden="true" />
            Accessibility Settings
          </h2>

          {/* Theme */}
          <fieldset className="mb-4">
            <legend className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>
              Theme
            </legend>
            <div className="flex gap-2">
              {[
                { value: "light" as const, icon: Sun, label: "Light" },
                { value: "dark" as const, icon: Moon, label: "Dark" },
                { value: "high-contrast" as const, icon: Contrast, label: "High Contrast" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className="flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-lg text-xs font-medium border-2 transition-colors"
                  style={{
                    borderColor: theme === opt.value ? "var(--color-primary)" : "var(--color-border)",
                    backgroundColor: theme === opt.value ? "var(--color-bg-secondary)" : "transparent",
                    color: "var(--color-text)",
                  }}
                  aria-pressed={theme === opt.value}
                >
                  <opt.icon size={18} aria-hidden="true" />
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Text Size */}
          <fieldset className="mb-4">
            <legend className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>
              Text Size
            </legend>
            <div className="flex gap-2">
              {[
                { value: "normal" as const, label: "A", desc: "Normal" },
                { value: "large" as const, label: "A+", desc: "Large" },
                { value: "x-large" as const, label: "A++", desc: "Extra Large" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTextSize(opt.value)}
                  className="flex-1 py-2 px-3 rounded-lg font-bold border-2 transition-colors"
                  style={{
                    borderColor: textSize === opt.value ? "var(--color-primary)" : "var(--color-border)",
                    backgroundColor: textSize === opt.value ? "var(--color-bg-secondary)" : "transparent",
                    color: "var(--color-text)",
                  }}
                  aria-pressed={textSize === opt.value}
                  aria-label={`Text size: ${opt.desc}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Font Type */}
          <fieldset className="mb-4">
            <legend className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>
              Font
            </legend>
            <div className="flex gap-2">
              <button
                onClick={() => setFontType("default")}
                className="flex-1 py-2 px-3 rounded-lg text-sm border-2 transition-colors"
                style={{
                  borderColor: fontType === "default" ? "var(--color-primary)" : "var(--color-border)",
                  backgroundColor: fontType === "default" ? "var(--color-bg-secondary)" : "transparent",
                  color: "var(--color-text)",
                }}
                aria-pressed={fontType === "default"}
              >
                <Type size={16} className="inline mr-1" aria-hidden="true" />
                Default
              </button>
              <button
                onClick={() => setFontType("dyslexia")}
                className="flex-1 py-2 px-3 rounded-lg text-sm border-2 transition-colors"
                style={{
                  borderColor: fontType === "dyslexia" ? "var(--color-primary)" : "var(--color-border)",
                  backgroundColor: fontType === "dyslexia" ? "var(--color-bg-secondary)" : "transparent",
                  color: "var(--color-text)",
                  fontFamily: "Comic Sans MS, cursive",
                }}
                aria-pressed={fontType === "dyslexia"}
              >
                Dyslexia
              </button>
            </div>
          </fieldset>

          {/* Toggle Options */}
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text)" }}>
                <Mic size={16} aria-hidden="true" /> Voice Navigation
              </span>
              <button
                role="switch"
                aria-checked={voiceNavigationEnabled}
                onClick={toggleVoiceNavigation}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ backgroundColor: voiceNavigationEnabled ? "var(--color-primary)" : "var(--color-border)" }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ transform: voiceNavigationEnabled ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text)" }}>
                <Hand size={16} aria-hidden="true" /> Gesture Navigation (ISL)
              </span>
              <button
                role="switch"
                aria-checked={gestureNavigationEnabled}
                onClick={toggleGestureNavigation}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ backgroundColor: gestureNavigationEnabled ? "var(--color-primary)" : "var(--color-border)" }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ transform: gestureNavigationEnabled ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text)" }}>
                <Minus size={16} aria-hidden="true" /> Reduced Motion
              </span>
              <button
                role="switch"
                aria-checked={reducedMotion}
                onClick={toggleReducedMotion}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ backgroundColor: reducedMotion ? "var(--color-primary)" : "var(--color-border)" }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ transform: reducedMotion ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text)" }}>
                <Eye size={16} aria-hidden="true" /> Screen Reader Mode
              </span>
              <button
                role="switch"
                aria-checked={screenReaderMode}
                onClick={toggleScreenReaderMode}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ backgroundColor: screenReaderMode ? "var(--color-primary)" : "var(--color-border)" }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ transform: screenReaderMode ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </label>
          </div>

          {/* Gesture Navigation Help */}
          {gestureNavigationEnabled && (
            <div className="mt-4 p-3 rounded-lg text-xs" style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-secondary)" }}>
              <p className="font-semibold mb-1">Gesture Controls:</p>
              <ul className="space-y-0.5">
                <li>☝️ 1 Finger — Go to Home</li>
                <li>✌️ 2 Fingers — Go to Courses</li>
                <li>🤟 3 Fingers — Go to Jobs</li>
                <li>🖖 4 Fingers — Go to Schemes</li>
                <li>✋ 5 Fingers — Go to AI Chat</li>
                <li>✊ Fist (0) — Scroll Down</li>
              </ul>
            </div>
          )}

          {/* Voice Commands Help */}
          {voiceNavigationEnabled && (
            <div className="mt-4 p-3 rounded-lg text-xs" style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-secondary)" }}>
              <p className="font-semibold mb-1">Voice Commands:</p>
              <ul className="space-y-0.5">
                <li>&quot;Open courses&quot; — Go to courses</li>
                <li>&quot;Find jobs&quot; — Go to jobs</li>
                <li>&quot;Go home&quot; — Go to homepage</li>
                <li>&quot;Scroll down/up&quot; — Scroll page</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}
