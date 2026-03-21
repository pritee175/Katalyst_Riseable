"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { Volume2, VolumeX, SkipForward, Square, Play } from "lucide-react";

export default function ScreenReader() {
  const { screenReaderMode } = useAccessibility();
  const [isReading, setIsReading] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const highlightRef = useRef<HTMLElement | null>(null);
  const isReadingRef = useRef(false);

  // Get the best voice for a language
  const getVoice = useCallback((lang = "en") => {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang.startsWith(lang)) || voices[0];
  }, []);

  // Speak text using Web Speech API
  const speakText = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!text.trim() || !isReadingRef.current) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      const voice = getVoice("en");
      if (voice) utterance.voice = voice;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      setCurrentText(text.slice(0, 80) + (text.length > 80 ? "..." : ""));
      window.speechSynthesis.speak(utterance);
    });
  }, [getVoice]);

  // Highlight an element visually
  const highlightElement = useCallback((el: HTMLElement) => {
    // Remove previous highlight
    if (highlightRef.current) {
      highlightRef.current.style.outline = "";
      highlightRef.current.style.outlineOffset = "";
    }
    // Add highlight
    el.style.outline = "3px solid #7C3AED";
    el.style.outlineOffset = "2px";
    highlightRef.current = el;
    // Scroll into view
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // Remove highlight
  const removeHighlight = useCallback(() => {
    if (highlightRef.current) {
      highlightRef.current.style.outline = "";
      highlightRef.current.style.outlineOffset = "";
      highlightRef.current = null;
    }
  }, []);

  // Get readable text from an element
  const getReadableText = useCallback((el: HTMLElement): string => {
    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel;

    const alt = el.getAttribute("alt");
    if (alt) return `Image: ${alt}`;

    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute("role");
    const text = el.innerText?.trim() || "";

    if (!text) return "";

    // Add context based on element type
    if (tag === "h1") return `Heading level 1: ${text}`;
    if (tag === "h2") return `Heading level 2: ${text}`;
    if (tag === "h3") return `Heading level 3: ${text}`;
    if (tag === "a" || role === "link") return `Link: ${text}`;
    if (tag === "button" || role === "button") return `Button: ${text}`;
    if (tag === "input" || tag === "textarea") {
      const label = el.getAttribute("aria-label") || el.getAttribute("placeholder") || "";
      return `Input field: ${label}`;
    }
    if (tag === "select") return `Dropdown: ${text}`;
    if (tag === "nav") return `Navigation: ${text}`;
    if (tag === "img") return `Image: ${alt || "no description"}`;

    return text;
  }, []);

  // Read the entire page content
  const readPage = useCallback(async () => {
    if (!screenReaderMode) return;
    isReadingRef.current = true;
    setIsReading(true);

    // Get all readable elements in order
    const selectors = "h1, h2, h3, h4, p, a, button, li, span[role], label, img[alt], [aria-label]";
    const main = document.querySelector("main") || document.body;
    const elements = Array.from(main.querySelectorAll(selectors)) as HTMLElement[];

    // Filter to only visible elements with text
    const readable = elements.filter(el => {
      if (el.offsetParent === null && !el.closest('[aria-hidden="true"]')) return false;
      if (el.closest('[aria-hidden="true"]')) return false;
      const text = getReadableText(el);
      return text.length > 0 && text.length < 500;
    });

    // Remove duplicates (child elements already covered by parent)
    const unique: HTMLElement[] = [];
    for (const el of readable) {
      const isDuplicate = unique.some(u => u.contains(el) || el.contains(u));
      if (!isDuplicate) unique.push(el);
    }

    await speakText("Screen reader started. Reading page content.");

    for (const el of unique) {
      if (!isReadingRef.current) break;
      const text = getReadableText(el);
      if (text) {
        highlightElement(el);
        await speakText(text);
        // Small pause between elements
        await new Promise(r => setTimeout(r, 300));
      }
    }

    if (isReadingRef.current) {
      await speakText("End of page content.");
    }

    removeHighlight();
    setIsReading(false);
    isReadingRef.current = false;
    setCurrentText("");
  }, [screenReaderMode, speakText, highlightElement, removeHighlight, getReadableText]);

  // Stop reading
  const stopReading = useCallback(() => {
    isReadingRef.current = false;
    window.speechSynthesis.cancel();
    removeHighlight();
    setIsReading(false);
    setCurrentText("");
  }, [removeHighlight]);

  // Read focused element on focus change
  useEffect(() => {
    if (!screenReaderMode) return;

    const handleFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (!el) return;
      const text = el.getAttribute("aria-label") ||
        el.getAttribute("alt") ||
        el.innerText?.trim() ||
        el.getAttribute("placeholder") || "";
      if (text) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.volume = 1;
        const voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith("en"));
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
      }
    };

    document.addEventListener("focusin", handleFocus);
    return () => {
      document.removeEventListener("focusin", handleFocus);
      window.speechSynthesis.cancel();
    };
  }, [screenReaderMode]);

  // Cleanup on unmount or mode change
  useEffect(() => {
    if (!screenReaderMode) {
      stopReading();
    }
  }, [screenReaderMode, stopReading]);

  if (!screenReaderMode) return null;

  return (
    <div
      className="fixed top-16 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-2 rounded-2xl shadow-2xl border"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-primary)",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <Volume2 size={18} style={{ color: "var(--color-primary)" }} className="shrink-0" />
      <span className="text-xs font-semibold shrink-0" style={{ color: "var(--color-primary)" }}>
        Screen Reader
      </span>

      {/* Current text being read */}
      {currentText && (
        <span className="text-xs truncate max-w-[200px] sm:max-w-[300px]" style={{ color: "var(--color-text-muted)" }}>
          {currentText}
        </span>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1 ml-auto">
        {!isReading ? (
          <button
            onClick={readPage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:scale-105"
            style={{ backgroundColor: "var(--color-primary)" }}
            aria-label="Read page aloud"
          >
            <Play size={12} />
            Read Page
          </button>
        ) : (
          <button
            onClick={stopReading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:scale-105"
            style={{ backgroundColor: "var(--color-error)" }}
            aria-label="Stop reading"
          >
            <Square size={12} />
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
