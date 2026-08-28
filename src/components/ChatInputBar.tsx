"use client";

import React from "react";

interface ChatInputBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showEmojiBtn?: boolean;
  onEmojiToggle?: () => void;
  showAtBtn?: boolean;
  onAtToggle?: () => void;
  showRulesFooter?: boolean;
  onAdminTag?: () => void;
  className?: string;
}

/**
 * Global chat input bar — single source of truth for chat input styling.
 * Square corners, border-y only,  bg-[#00000029]   , dim purple send button.
 */
export default function ChatInputBar({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Type a message... use @admin to ask a question",
  maxLength = 500,
  showEmojiBtn = false,
  onEmojiToggle,
  showAtBtn = false,
  onAtToggle,
  showRulesFooter = false,
  onAdminTag,
  className = "",
}: ChatInputBarProps) {
  const rightPadding =
    showEmojiBtn && showAtBtn ? "pr-28" : showEmojiBtn || showAtBtn ? "pr-20" : "pr-12";

  return (
    <div className={`flex flex-col ${className}`}>
      <form onSubmit={onSubmit} className="relative flex items-center w-full">
        <div className="input-glow-border w-full">
          <input
            aria-label="Chat message input"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`w-full bg-[#00000029] !border-0 !border-t pl-3.5 py-3 text-white !rounded-none font-medium outline-none transition-all shadow-md placeholder:text-white/40 ${rightPadding}`}
          />
        </div>

        <div className="absolute right-1.5 flex items-center gap-1">
          {showEmojiBtn && (
            <button
              aria-label="Insert emoji"
              type="button"
              onClick={onEmojiToggle}
              title="Insert Emoji"
              className="w-7 h-7 rounded-lg bg-[#00000029] hover:bg-white/10 text-white/70 flex items-center justify-center transition-colors cursor-pointer"
            >
              😀
            </button>
          )}

          {showAtBtn && (
            <button
              aria-label="Tag admin or crew"
              type="button"
              onClick={onAtToggle}
              title="Tag Admin or Crew"
              className="px-2 py-1 rounded bg-purple-600/10 hover:bg-purple-600/20 text-[var(--color-accent)] font-bold border border-purple-500/30 transition-colors cursor-pointer"
            >
              @
            </button>
          )}

          <button
            aria-label="Send message"
            type="submit"
            disabled={disabled || !value.trim()}
            className="w-7 h-7 rounded-lg bg-purple-700/50 hover:bg-purple-600/70 text-purple-300 flex items-center justify-center transition-colors shadow-[0_0_10px_rgba(147,51,234,0.2)] disabled:opacity-30 disabled:hover:bg-purple-700/50 cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>

      {showRulesFooter && (
        <div className="flex items-center justify-between text-[10px] font-bold text-white uppercase tracking-wider mt-2 px-1">
          <span>KEEP IT RATED PG-13 · NO POLITICS</span>
          {onAdminTag && (
            <button
              aria-label="Tag admin for help"
              type="button"
              onClick={onAdminTag}
              className="text-white hover:text-white/70 transition-colors cursor-pointer font-bold lowercase tracking-normal"
            >
              tag @admin for help
            </button>
          )}
        </div>
      )}
    </div>
  );
}
