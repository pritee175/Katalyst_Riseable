"use client";

import { Bot } from "lucide-react";
import { SignLanguageAvatar } from "@/components/sign-language/SignLanguageAvatar";

interface SignLanguageSectionProps {
  showAvatar: boolean;
  avatarText: string;
  onAvatarTextClear: () => void;
  onToggle: () => void;
}

export function SignLanguageSection({ 
  showAvatar, 
  avatarText, 
  onAvatarTextClear,
  onToggle 
}: SignLanguageSectionProps) {
  return (
    <>
      {/* Avatar Toggle Button - Add to accessibility strip */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
        style={{
          backgroundColor: showAvatar ? "rgba(129, 140, 248, 0.2)" : "var(--color-bg)",
          color: showAvatar ? "var(--color-primary)" : "var(--color-text)",
          border: "1px solid var(--color-border)"
        }}
        title="Sign Language Avatar - Translates responses to ISL"
        aria-label="Toggle sign language avatar"
      >
        <Bot size={16} />
        <span className="hidden sm:inline">Avatar</span>
      </button>

      {/* Avatar Display - Add before input section */}
      {showAvatar && (
        <div className="border-t p-4" style={{ borderColor: "var(--color-border)" }}>
          <SignLanguageAvatar 
            text={avatarText} 
            onAnimationComplete={onAvatarTextClear} 
          />
        </div>
      )}
    </>
  );
}
