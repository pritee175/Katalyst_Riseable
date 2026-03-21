"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Globe, Bot, User as UserIcon, Sparkles, MessageCircle, Settings, Sun, Moon, Contrast, Type, Eye, Minus, Languages, Hand } from "lucide-react";
import { useTextToSpeech, useSpeechToText } from "@/hooks/useSpeech";
import { useAuth } from "@/context/AuthContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import dynamic from "next/dynamic";

// Dynamically import SignLanguageAvatar to avoid SSR issues with Three.js
const SignLanguageAvatar = dynamic(
  () => import("@/components/sign-language/SignLanguageAvatar").then(mod => mod.SignLanguageAvatar),
  { ssr: false }
);

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// Translate text using MyMemory API
async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (sourceLang === targetLang || !text.trim()) return text;
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, sourceLang, targetLang }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    return data.translatedText || text;
  } catch {
    return text;
  }
}

// Get bot response from ChatGPT API (with fallback)
async function getChatGPTResponse(
  message: string,
  language: string,
  history: { text: string; sender: string }[]
): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, language, history }),
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return data.response || "I'm sorry, I couldn't process that. Please try again.";
  } catch {
    return "I'm sorry, I'm having trouble connecting. Please try again in a moment.";
  }
}

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth();
  const {
    theme,
    textSize,
    fontType,
    voiceNavigationEnabled,
    reducedMotion,
    setTheme,
    setTextSize,
    setFontType,
    toggleVoiceNavigation,
    toggleReducedMotion,
    announceToScreenReader,
  } = useAccessibility();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm the RiseAble AI Assistant. I can help you find courses, search for jobs, or understand government schemes. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"en" | "hi" | "ta" | "te" | "bn" | "mr" | "gu" | "kn" | "ml">("en");
  const [isTyping, setIsTyping] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [showLanguagePanel, setShowLanguagePanel] = useState(false);
  const [signLanguageEnabled, setSignLanguageEnabled] = useState(false);
  const [currentSignText, setCurrentSignText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { speak, stop, isSpeaking } = useTextToSpeech();
  const { startListening, isListening } = useSpeechToText();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowLanguagePanel(false);
        setShowAccessibilityPanel(false);
      }
    };

    if (showLanguagePanel || showAccessibilityPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLanguagePanel, showAccessibilityPanel]);

  const langToCode = (l: string) => {
    const map: Record<string, string> = { hi: "hi-IN", ta: "ta-IN", te: "te-IN", bn: "bn-IN", mr: "mr-IN", gu: "gu-IN", kn: "kn-IN", ml: "ml-IN" };
    return map[l] || "en-US";
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    announceToScreenReader("Message sent. AI is thinking...");

    try {
      // If user typed in a non-English language, translate to English for ChatGPT
      let messageForAI = text.trim();
      if (language !== "en") {
        messageForAI = await translateText(text.trim(), language, "en");
      }

      // Get response from ChatGPT API
      const history = messages.map(m => ({ text: m.text, sender: m.sender }));
      let response = await getChatGPTResponse(messageForAI, language, history);

      // If user's language is not English, translate response back
      if (language !== "en") {
        response = await translateText(response, "en", language);
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        text: response,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      announceToScreenReader("Bot response received");

      // Speak response if TTS is enabled
      if (ttsEnabled) {
        speak(response, langToCode(language));
      }

      // Show sign language if enabled
      if (signLanguageEnabled) {
        setCurrentSignText(response);
      }
    } catch {
      const errMsg: Message = {
        id: `bot-${Date.now()}`,
        text: "I'm sorry, something went wrong. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
      announceToScreenReader("Error: could not get response");
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    announceToScreenReader("Voice input started. Speak now.");
    startListening(langToCode(language), (text) => {
      setInput(text);
      sendMessage(text);
    });
  };

  const languages = [
    { code: "en" as const, name: "English", nativeName: "English" },
    { code: "hi" as const, name: "Hindi", nativeName: "हिंदी" },
    { code: "mr" as const, name: "Marathi", nativeName: "मराठी" },
    { code: "ta" as const, name: "Tamil", nativeName: "தமிழ்" },
    { code: "te" as const, name: "Telugu", nativeName: "తెలుగు" },
    { code: "bn" as const, name: "Bengali", nativeName: "বাংলা" },
    { code: "gu" as const, name: "Gujarati", nativeName: "ગુજરાતી" },
    { code: "kn" as const, name: "Kannada", nativeName: "ಕನ್ನಡ" },
    { code: "ml" as const, name: "Malayalam", nativeName: "മലയാളം" },
  ];

  const quickActions = [
    { text: "Show me courses", icon: "📚" },
    { text: "Find jobs for me", icon: "💼" },
    { text: "Government schemes", icon: "🏛️" },
    { text: "Accessibility features", icon: "♿" },
  ];

  const getPlaceholder = () => {
    const placeholders: Record<string, string> = {
      hi: "अपना सवाल यहाँ लिखें...",
      mr: "तुमचा प्रश्न इथे लिहा...",
      ta: "உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...",
      te: "మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...",
      bn: "আপনার প্রশ্ন এখানে টাইপ করুন...",
      gu: "તમારો પ્રશ્ન અહીં ટાઈપ કરો...",
      kn: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...",
      ml: "നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...",
    };
    return placeholders[language] || "Type your question here...";
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" aria-hidden="true">
        <img 
          src="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1920&q=80" 
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="fixed inset-0 particles grid-pattern pointer-events-none" aria-hidden="true" />

      <div className="relative flex-1 flex flex-col overflow-hidden">
        
        {/* Comprehensive Accessibility Header */}
        <header className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-4 pb-3 border-b relative z-20" style={{ borderColor: "var(--color-border)" }}>
          <div className="rounded-2xl border p-3 glass-card" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              
              {/* Left: Title & Status */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center animate-glow"
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}>
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
                    AI Assistant
                  </h1>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Multilingual • Voice • Sign Language
                  </p>
                </div>
              </div>

              {/* Right: Accessibility Controls — hidden on mobile, use floating toolbar instead */}
              <div className="hidden md:flex items-center gap-2 flex-wrap relative z-20">
                
                {/* Theme Selector */}
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                  <button
                    onClick={() => setTheme("light")}
                    className="p-2 rounded-lg transition-all hover:scale-105"
                    style={{
                      backgroundColor: theme === "light" ? "var(--color-primary)" : "transparent",
                      color: theme === "light" ? "#fff" : "var(--color-text-muted)",
                    }}
                    aria-label="Light theme"
                    aria-pressed={theme === "light"}
                    title="Light Theme"
                  >
                    <Sun size={18} />
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className="p-2 rounded-lg transition-all hover:scale-105"
                    style={{
                      backgroundColor: theme === "dark" ? "var(--color-primary)" : "transparent",
                      color: theme === "dark" ? "#fff" : "var(--color-text-muted)",
                    }}
                    aria-label="Dark theme"
                    aria-pressed={theme === "dark"}
                    title="Dark Theme"
                  >
                    <Moon size={18} />
                  </button>
                  <button
                    onClick={() => setTheme("high-contrast")}
                    className="p-2 rounded-lg transition-all hover:scale-105"
                    style={{
                      backgroundColor: theme === "high-contrast" ? "var(--color-primary)" : "transparent",
                      color: theme === "high-contrast" ? "#fff" : "var(--color-text-muted)",
                    }}
                    aria-label="High contrast theme"
                    aria-pressed={theme === "high-contrast"}
                    title="High Contrast"
                  >
                    <Contrast size={18} />
                  </button>
                </div>

                {/* Text Size */}
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                  <button
                    onClick={() => setTextSize("normal")}
                    className="px-3 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
                    style={{
                      backgroundColor: textSize === "normal" ? "var(--color-primary)" : "transparent",
                      color: textSize === "normal" ? "#fff" : "var(--color-text-muted)",
                    }}
                    aria-label="Normal text size"
                    aria-pressed={textSize === "normal"}
                    title="Normal Text"
                  >
                    A
                  </button>
                  <button
                    onClick={() => setTextSize("large")}
                    className="px-3 py-2 rounded-lg text-base font-bold transition-all hover:scale-105"
                    style={{
                      backgroundColor: textSize === "large" ? "var(--color-primary)" : "transparent",
                      color: textSize === "large" ? "#fff" : "var(--color-text-muted)",
                    }}
                    aria-label="Large text size"
                    aria-pressed={textSize === "large"}
                    title="Large Text"
                  >
                    A+
                  </button>
                  <button
                    onClick={() => setTextSize("x-large")}
                    className="px-3 py-2 rounded-lg text-lg font-bold transition-all hover:scale-105"
                    style={{
                      backgroundColor: textSize === "x-large" ? "var(--color-primary)" : "transparent",
                      color: textSize === "x-large" ? "#fff" : "var(--color-text-muted)",
                    }}
                    aria-label="Extra large text size"
                    aria-pressed={textSize === "x-large"}
                    title="Extra Large Text"
                  >
                    A++
                  </button>
                </div>

                {/* Voice Navigation Toggle */}
                <button
                  onClick={() => {
                    toggleVoiceNavigation();
                    announceToScreenReader(voiceNavigationEnabled ? "Voice navigation disabled" : "Voice navigation enabled");
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: voiceNavigationEnabled ? "rgba(129, 140, 248, 0.2)" : "var(--color-bg-secondary)",
                    color: voiceNavigationEnabled ? "var(--color-primary)" : "var(--color-text)",
                    border: voiceNavigationEnabled ? "2px solid var(--color-primary)" : "2px solid transparent",
                  }}
                  aria-label={voiceNavigationEnabled ? "Disable voice navigation" : "Enable voice navigation"}
                  aria-pressed={voiceNavigationEnabled}
                  title="Voice Navigation"
                >
                  <Mic size={16} />
                  Voice Nav
                </button>

                {/* TTS Toggle */}
                <button
                  onClick={() => {
                    setTtsEnabled(!ttsEnabled);
                    if (isSpeaking) stop();
                    announceToScreenReader(ttsEnabled ? "Text to speech disabled" : "Text to speech enabled");
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: ttsEnabled ? "rgba(129, 140, 248, 0.2)" : "var(--color-bg-secondary)",
                    color: ttsEnabled ? "var(--color-primary)" : "var(--color-text)",
                    border: ttsEnabled ? "2px solid var(--color-primary)" : "2px solid transparent",
                  }}
                  aria-label={ttsEnabled ? "Disable text to speech" : "Enable text to speech"}
                  aria-pressed={ttsEnabled}
                  title="Text to Speech"
                >
                  {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  TTS
                </button>

                {/* Font Type Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                  <button
                    onClick={() => setFontType("default")}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: fontType === "default" ? "var(--color-primary)" : "transparent",
                      color: fontType === "default" ? "#fff" : "var(--color-text-muted)",
                    }}
                    aria-label="Default font"
                    aria-pressed={fontType === "default"}
                    title="Default Font"
                  >
                    <Type size={16} />
                  </button>
                  <button
                    onClick={() => setFontType("dyslexia")}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: fontType === "dyslexia" ? "var(--color-primary)" : "transparent",
                      color: fontType === "dyslexia" ? "#fff" : "var(--color-text-muted)",
                      fontFamily: "Comic Sans MS, cursive",
                    }}
                    aria-label="Dyslexia-friendly font"
                    aria-pressed={fontType === "dyslexia"}
                    title="Dyslexia Font"
                  >
                    Aa
                  </button>
                </div>

                {/* Reduced Motion Toggle */}
                <button
                  onClick={() => {
                    toggleReducedMotion();
                    announceToScreenReader(reducedMotion ? "Reduced motion disabled" : "Reduced motion enabled");
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: reducedMotion ? "rgba(129, 140, 248, 0.2)" : "var(--color-bg-secondary)",
                    color: reducedMotion ? "var(--color-primary)" : "var(--color-text)",
                    border: reducedMotion ? "2px solid var(--color-primary)" : "2px solid transparent",
                  }}
                  aria-label={reducedMotion ? "Disable reduced motion" : "Enable reduced motion"}
                  aria-pressed={reducedMotion}
                  title="Reduced Motion"
                >
                  <Minus size={16} />
                </button>

                {/* Sign Language Toggle */}
                <button
                  onClick={() => {
                    setSignLanguageEnabled(!signLanguageEnabled);
                    announceToScreenReader(signLanguageEnabled ? "Sign language disabled" : "Sign language enabled");
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: signLanguageEnabled ? "rgba(129, 140, 248, 0.2)" : "var(--color-bg-secondary)",
                    color: signLanguageEnabled ? "var(--color-primary)" : "var(--color-text)",
                    border: signLanguageEnabled ? "2px solid var(--color-primary)" : "2px solid transparent",
                  }}
                  aria-label={signLanguageEnabled ? "Disable sign language" : "Enable sign language"}
                  aria-pressed={signLanguageEnabled}
                  title="Sign Language"
                >
                  <Hand size={16} />
                  ISL
                </button>

                {/* Language Select Box */}
                <div className="flex items-center gap-2">
                  <Languages size={16} style={{ color: "var(--color-text-muted)" }} />
                  <select
                    value={language}
                    onChange={(e) => {
                      const newLang = e.target.value as typeof language;
                      setLanguage(newLang);
                      announceToScreenReader(`Language changed to ${languages.find(l => l.code === newLang)?.name}`);
                    }}
                    className="px-3 py-2 rounded-xl text-sm font-medium cursor-pointer outline-none"
                    style={{
                      backgroundColor: "var(--color-bg-secondary)",
                      color: "var(--color-text)",
                      border: "2px solid var(--color-primary)",
                    }}
                    aria-label="Select language"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName} — {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* More Accessibility Settings */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowAccessibilityPanel(!showAccessibilityPanel);
                      setShowLanguagePanel(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: "var(--color-bg-secondary)",
                      color: "var(--color-text)",
                    }}
                    aria-label="More accessibility settings"
                    aria-expanded={showAccessibilityPanel}
                    title="Accessibility Settings"
                  >
                    <Settings size={16} />
                  </button>

                  {/* Accessibility Dropdown */}
                  {showAccessibilityPanel && (
                    <>
                      {/* Backdrop to close dropdown and prevent collisions */}
                      <div 
                        className="fixed inset-0 z-[100]" 
                        onClick={() => setShowAccessibilityPanel(false)}
                        aria-hidden="true"
                      />
                      <div
                        className="absolute top-full right-0 mt-2 w-64 rounded-xl border shadow-2xl p-4 z-[110] animate-fade-in-up"
                        style={{
                          backgroundColor: "var(--color-bg)",
                          borderColor: "var(--color-border)",
                        }}
                      >
                      <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>
                        More Settings
                      </p>

                      {/* Font Type */}
                      <div className="mb-3">
                        <p className="text-xs font-medium mb-2" style={{ color: "var(--color-text-muted)" }}>
                          Font Style
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setFontType("default")}
                            className="flex-1 px-3 py-2 rounded-lg text-xs border-2 transition-colors"
                            style={{
                              borderColor: fontType === "default" ? "var(--color-primary)" : "var(--color-border)",
                              backgroundColor: fontType === "default" ? "var(--color-bg-secondary)" : "transparent",
                              color: "var(--color-text)",
                            }}
                            aria-pressed={fontType === "default"}
                          >
                            <Type size={14} className="inline mr-1" />
                            Default
                          </button>
                          <button
                            onClick={() => setFontType("dyslexia")}
                            className="flex-1 px-3 py-2 rounded-lg text-xs border-2 transition-colors"
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
                      </div>

                      {/* Toggle Options */}
                      <div className="space-y-2">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text)" }}>
                            <Minus size={14} />
                            Reduced Motion
                          </span>
                          <button
                            role="switch"
                            aria-checked={reducedMotion}
                            onClick={toggleReducedMotion}
                            className="relative w-10 h-5 rounded-full transition-colors"
                            style={{ backgroundColor: reducedMotion ? "var(--color-primary)" : "var(--color-border)" }}
                          >
                            <span
                              className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                              style={{ transform: reducedMotion ? "translateX(20px)" : "translateX(0)" }}
                            />
                          </button>
                        </label>

                        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                          <span className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text)" }}>
                            <Eye size={14} />
                            Screen Reader
                          </span>
                          <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-muted)" }}>
                            System
                          </span>
                        </div>
                      </div>
                    </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Voice Commands Help */}
            {voiceNavigationEnabled && (
              <div className="mt-4 p-3 rounded-lg text-xs" style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-secondary)" }}>
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <Mic size={14} />
                  Voice Commands Active:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <span>• &quot;Open courses&quot;</span>
                  <span>• &quot;Find jobs&quot;</span>
                  <span>• &quot;Go home&quot;</span>
                  <span>• &quot;Scroll down/up&quot;</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Language Select Bar + Read Aloud */}
        <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Language Select Box */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Globe size={16} className="shrink-0" style={{ color: "var(--color-text-muted)" }} />
              <span className="text-xs font-semibold shrink-0 hidden sm:inline" style={{ color: "var(--color-text-muted)" }}>Language:</span>
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value as typeof language;
                  setLanguage(newLang);
                  announceToScreenReader(`Language changed to ${languages.find(l => l.code === newLang)?.name}`);
                }}
                className="px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer outline-none w-full sm:w-auto"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  color: "var(--color-text)",
                  border: "2px solid var(--color-primary)",
                  minWidth: "150px",
                  maxWidth: "220px",
                }}
                aria-label="Select chat language"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} — {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Read Aloud Toggle */}
            <button
              onClick={() => {
                setTtsEnabled(!ttsEnabled);
                if (isSpeaking) stop();
                announceToScreenReader(ttsEnabled ? "Read aloud disabled" : "Read aloud enabled - all responses will be spoken");
              }}
              className="shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: ttsEnabled ? "var(--color-success)" : "var(--color-bg-secondary)",
                color: ttsEnabled ? "#fff" : "var(--color-text-secondary)",
                border: ttsEnabled ? "2px solid var(--color-success)" : "2px solid var(--color-border)",
              }}
              aria-pressed={ttsEnabled}
              aria-label={ttsEnabled ? "Disable read aloud" : "Enable read aloud"}
            >
              {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {ttsEnabled ? "Read Aloud: ON" : "Read Aloud: OFF"}
            </button>
          </div>
        </div>

        {/* Quick Actions - Below Language Bar */}
        <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => sendMessage(action.text)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <span className="mr-2">{action.icon}</span>
                {action.text}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area - Full Screen Layout */}
        <div className="flex-1 flex overflow-hidden px-4 sm:px-6 lg:px-8 py-4">
          <div className={`flex gap-4 w-full ${signLanguageEnabled ? 'flex-col lg:flex-row' : ''}`}>
          
            {/* Chat Messages - Full Height */}
            <div className={`flex flex-col rounded-2xl border glass-card ${signLanguageEnabled ? 'lg:flex-1' : 'flex-1'}`}
              style={{ borderColor: "var(--color-border)", height: '100%' }}>
              
              {/* Messages Container */}
              <div className="flex-1 p-6 overflow-y-auto" role="log" aria-label="Chat messages" aria-live="polite">
                <div className="space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                role="article"
                aria-label={`${msg.sender === "user" ? "You" : "AI Assistant"}: ${msg.text}`}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  {msg.sender === "bot" ? (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}>
                      <Bot size={20} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                      {isAuthenticated && user ? (
                        <img 
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80" 
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon size={20} style={{ color: "var(--color-text-muted)" }} />
                      )}
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className={`flex-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block max-w-[80%] px-5 py-3 rounded-2xl text-base whitespace-pre-line shadow-sm`}
                    style={{
                      backgroundColor: msg.sender === "user" 
                        ? "var(--color-primary)" 
                        : "var(--color-bg-secondary)",
                      color: msg.sender === "user" ? "#ffffff" : "var(--color-text)",
                      borderBottomRightRadius: msg.sender === "user" ? "6px" : undefined,
                      borderBottomLeftRadius: msg.sender === "bot" ? "6px" : undefined,
                    }}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-2">
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {msg.sender === "bot" && (
                      <button
                        onClick={() => speak(msg.text, langToCode(language))}
                        className="p-1 rounded-md transition-all hover:scale-110"
                        style={{ color: "var(--color-primary)" }}
                        aria-label="Read this message aloud"
                        title="Read Aloud"
                      >
                        <Volume2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-3 flex-row" role="status" aria-label="AI is typing">
                      <div className="shrink-0">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}>
                          <Bot size={20} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="inline-block px-5 py-3 rounded-2xl shadow-sm"
                          style={{ backgroundColor: "var(--color-bg-secondary)", borderBottomLeftRadius: "6px" }}>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--color-primary)", animationDelay: "0ms" }} />
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--color-primary)", animationDelay: "150ms" }} />
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--color-primary)", animationDelay: "300ms" }} />
                            <span className="sr-only">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area - Fixed at Bottom */}
              <div className="flex-shrink-0 border-t p-4" style={{ borderColor: "var(--color-border)" }}>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    sendMessage(input);
                  }}
                  className="flex items-end gap-3"
                >
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                    style={{
                      backgroundColor: isListening ? "var(--color-error)" : "var(--color-bg-secondary)",
                      color: isListening ? "#fff" : "var(--color-text-muted)",
                    }}
                    aria-label={isListening ? "Stop voice input" : "Start voice input"}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>

                  <div className="flex-1">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(input);
                        }
                      }}
                      placeholder={getPlaceholder()}
                      rows={1}
                      className="w-full px-4 py-3 rounded-xl text-base border-none outline-none resize-none"
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        color: "var(--color-text)",
                        minHeight: "48px",
                        maxHeight: "120px"
                      }}
                      aria-label="Chat message input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
                    aria-label="Send message"
                  >
                    <Send size={20} />
                  </button>
                </form>

                <div className="flex items-center justify-between mt-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} />
                    Powered by AI
                  </span>
                </div>
              </div>
            </div>

            {/* Sign Language Avatar Panel - Full Height */}
            {signLanguageEnabled && (
              <div className="flex flex-col rounded-2xl border p-4 glass-card lg:w-[420px] w-full"
                style={{ borderColor: "var(--color-border)", height: '100%' }}>
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                    <Hand size={20} />
                    Sign Language
                  </h3>
                  <button
                    onClick={() => setSignLanguageEnabled(false)}
                    className="p-2 rounded-lg transition-colors hover:bg-opacity-80"
                    style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-muted)" }}
                    aria-label="Close sign language"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <SignLanguageAvatar 
                    text={currentSignText}
                    onAnimationComplete={() => setCurrentSignText("")}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
