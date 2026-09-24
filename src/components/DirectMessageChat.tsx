"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMember } from "@/context/MemberContext";
import ChatInputBar from "@/components/ChatInputBar";

interface DMMessage {
  id: string;
  sender: "admin" | "user";
  recipientId: string;
  senderName: string;
  text: string;
  timestamp: string;
  read?: boolean;
}

export default function DirectMessageChat() {
  const { isLoggedIn, member } = useMember();
  const [open, setOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // If user is Admin, they use the registry directly, so don't show user widget
  const isAdmin = member?.role === "admin";
  const userId = member?.id;

  // Fetch messages from localStorage
  const loadMessages = useCallback(() => {
    if (typeof window === "undefined" || !userId) return;
    const dms: DMMessage[] = JSON.parse(
      localStorage.getItem("7h_dms_v1") ||
        localStorage.getItem("7h_dms") ||
        "[]",
    );
    // Filter messages between this user and admin
    const relevant = dms.filter(
      (m) =>
        (m.sender === "admin" && m.recipientId === userId) ||
        (m.sender === "user" && m.recipientId === userId),
    );
    setMessages(relevant);
  }, [userId]);

  useEffect(() => {
    if (!isLoggedIn || !userId || isAdmin) return;

    loadMessages();

    // Event listener for tab sync & localStorage updates
    const handleStorageChange = () => {
      loadMessages();
    };

    window.addEventListener("storage", handleStorageChange);
    // Custom trigger event within the same page
    window.addEventListener("7h_dm_update", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("7h_dm_update", handleStorageChange);
    };
  }, [isLoggedIn, userId, isAdmin, loadMessages]);

  // Scroll to bottom when opening or getting a message
  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Mark all admin messages as read when opening the drawer
  useEffect(() => {
    if (open && messages.length > 0 && typeof window !== "undefined") {
      const dms: DMMessage[] = JSON.parse(
        localStorage.getItem("7h_dms_v1") ||
          localStorage.getItem("7h_dms") ||
          "[]",
      );
      let changed = false;
      const updated = dms.map((m) => {
        if (m.recipientId === userId && m.sender === "admin" && !m.read) {
          changed = true;
          return { ...m, read: true };
        }
        return m;
      });

      if (changed) {
        localStorage.setItem("7h_dms_v1", JSON.stringify(updated));
        window.dispatchEvent(new Event("7h_dm_update"));
      }
    }
  }, [open, messages, userId]);

  if (!isLoggedIn || isAdmin || !userId) return null;

  // Count unread DMs from Admin
  const unreadCount = messages.filter(
    (m) => m.sender === "admin" && !m.read,
  ).length;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg: DMMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      recipientId: userId || "",
      senderName: member?.name || "User",
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };

    if (typeof window !== "undefined") {
      const dms: DMMessage[] = JSON.parse(
        localStorage.getItem("7h_dms_v1") ||
          localStorage.getItem("7h_dms") ||
          "[]",
      );
      const updated = [...dms, newMsg];
      localStorage.setItem("7h_dms_v1", JSON.stringify(updated));
      window.dispatchEvent(new Event("7h_dm_update"));
    }

    setMessageText("");
  };

  return (
    <div className="fixed right-6 bottom-20 z-[9999] select-none">
      {/* Floating Chat Bubble Button */}
      <button
        onClick={() => setOpen(!open)}
        className="group relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-[var(--color-accent)] shadow-[0_4px_20px_rgba(255,10,61,0.5)] transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        {open ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}

        {/* Pulse unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg border-2 border-[#050505] bg-red-600">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Chat Box Panel */}
      {open && (
        <div className="absolute right-0 bottom-16 flex h-[380px] w-[300px] animate-[fadeIn_0.25s_ease-out] flex-col overflow-hidden border border-white/10 bg-[var(--color-bg-surface)]/95 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] p-3.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-lg bg-emerald-500" />
            <div className="flex flex-col text-left">
              <span className="text-[var(--color-accent)]">Direct Message</span>
              <span>Admin Support Chat</span>
            </div>
          </div>

          {/* Messages area */}
          <div className="custom-scrollbar min-h-0 flex-1 space-y-3.5 overflow-y-auto p-3.5">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <span className="mb-1.5 text-2xl opacity-25">💬</span>
                <p className="r">No messages yet</p>
                <p className="max-w-[180px]">
                  Ask admin any questions or wait for their direct support ping.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isAdminMsg = msg.sender === "admin";
                return (
                  <div
                    key={msg.id}
                    className={`flex max-w-[85%] flex-col ${isAdminMsg ? "mr-auto text-left" : "ml-auto text-right"}`}
                  >
                    {/* Sender tag */}
                    <div
                      className={`mb-1 flex items-center gap-1 ${isAdminMsg ? "" : "justify-end"}`}
                    >
                      <span
                        className={`rounded border px-1 py-0.5 text-[8px] ${isAdminMsg ? "border-[var(--color-border-purple)] bg-[var(--color-purple-glow)] text-[var(--color-purple-light)]" : "border-sky-500/35 bg-sky-500/20 text-sky-400"}`}
                      >
                        {isAdminMsg ? "ADMIN" : "YOU"}
                      </span>
                    </div>
                    {/* Text bubble */}
                    <div
                      className={`! p-2.5 ${isAdminMsg ? "rounded-tl-xs bg-[var(--color-purple-primary)]" : "rounded-tr-xs border border-purple-400/50 bg-cyan-500"}`}
                    >
                      {msg.text}
                    </div>
                    {/* Timestamp */}
                    <span className="text-[10px] !text-gray-700">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <ChatInputBar
            value={messageText}
            onChange={setMessageText}
            onSubmit={handleSendMessage}
            placeholder="Type your message..."
            className="border-t border-white/10 p-2"
          />
        </div>
      )}
    </div>
  );
}
