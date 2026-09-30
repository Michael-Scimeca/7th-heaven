"use client";

import React from "react";
import InputField from "./InputField";

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
    showEmojiBtn && showAtBtn
      ? "pr-28"
      : showEmojiBtn || showAtBtn
        ? "pr-20"
        : "pr-12";

  return (
    <div className={`flex flex-col ${className}`}>
      <form onSubmit={onSubmit} className="relative flex w-full items-center">
        <InputField
          aria-label="Chat message input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          glow={false}
          autoComplete="off"
          autoCorrect="on"
          autoCapitalize="sentences"
          enterKeyHint="send"
          containerClassName="w-full"
          inputClassName={`!rounded-none border border-white/10 input-focus outline-none placeholder:text-white/40 ${rightPadding}`}
        />

        <div className="absolute right-1 flex items-center gap-1">
          {showEmojiBtn && (
            <button
              aria-label="Insert emoji"
              type="button"
              onClick={onEmojiToggle}
              title="Insert Emoji"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#00000029] text-base transition-transform hover:scale-105"
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
              className="btn-interactive flex h-11 min-w-[44px] cursor-pointer items-center justify-center rounded border border-purple-500/30 bg-purple-600/10 px-2.5 py-1 text-sm font-semibold"
            >
              @
            </button>
          )}

          <button
            aria-label="Send message"
            type="submit"
            disabled={disabled || !value.trim()}
            className="btn-interactive flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-purple-700/50 shadow-[0_0_10px_rgba(147,51,234,0.2)] disabled:opacity-30"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>

      {showRulesFooter && (
        <div className=" flex items-center justify-between mt-6">
          <span>Keep it Rated PG-13 · No Politics</span>
          {onAdminTag && (
            <button
              aria-label="Tag admin for help"
              type="button"
              onClick={onAdminTag}
              className="text-link cursor-pointer tracking-normal lowercase"
            >
              tag @admin for help
            </button>
          )}
        </div>
      )}
    </div>
  );
}
