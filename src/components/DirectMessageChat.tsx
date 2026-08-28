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
    const dms: DMMessage[] = JSON.parse(localStorage.getItem("7h_dms_v1") || localStorage.getItem("7h_dms") || "[]");
    // Filter messages between this user and admin
    const relevant = dms.filter(
      (m) =>
        (m.sender === "admin" && m.recipientId === userId) ||
        (m.sender === "user" && m.recipientId === userId)
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
      const dms: DMMessage[] = JSON.parse(localStorage.getItem("7h_dms_v1") || localStorage.getItem("7h_dms") || "[]");
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
  const unreadCount = messages.filter((m) => m.sender === "admin" && !m.read).length;

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
      const dms: DMMessage[] = JSON.parse(localStorage.getItem("7h_dms_v1") || localStorage.getItem("7h_dms") || "[]");
      const updated = [...dms, newMsg];
      localStorage.setItem("7h_dms_v1", JSON.stringify(updated));
      window.dispatchEvent(new Event("7h_dm_update"));
    }

    setMessageText("");
  };

  return (
    <div className="fixed bottom-20 right-6 z-[9999] font-sans select-none">
      {/* Floating Chat Bubble Button */}
      <button aria-label="Action button"
        onClick={() => setOpen(!open)}
        className="relative w-12 h-12  rounded-lg  bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] hover:scale-105 transition-colors text-white flex items-center justify-center cursor-pointer shadow-[0_4px_20px_rgba(255,10,61,0.5)] border   border-white/10 group"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        )}

        {/* Pulse unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[var(--font-size-4xs)]  font-bold  w-5 h-5  rounded-lg  flex items-center justify-center border-2 border-[#050505]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Chat Box Panel */}
      {open && (
        <div className="absolute bottom-16 right-0 w-[300px] h-[380px] bg-[var(--color-bg-surface)]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-[fadeIn_0.25s_ease-out]">
          {/* Header */}
          <div className="p-3.5 bg-white/[0.02] border-b border-white/5 flex items-center gap-2">
            <span className="w-1.5 h-1.5  rounded-lg  bg-emerald-500 animate-pulse" />
            <div className="flex flex-col text-left">
              <span className="text-[var(--font-size-3xs)]  font-bold  uppercase tracking-widest text-[var(--color-accent)]">Direct Message</span>
              <span className="text-xs font-bold text-white uppercase tracking-tight">Admin Support Chat</span>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar min-h-0">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <span className="text-2xl mb-1.5 opacity-25">💬</span>
                <p className="font-bold uppercase tracking-wider">No messages yet</p>
                <p className="mt-1 max-w-[180px]">Ask admin any questions or wait for their direct support ping.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isAdminMsg = msg.sender === "admin";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${isAdminMsg ? "mr-auto text-left" : "ml-auto text-right"
                      }`}
                  >
                    {/* Sender tag */}
                    <div className={`flex items-center gap-1 mb-1 ${isAdminMsg ? '' : 'justify-end'}`}>
                      <span className={`text-[8px]  font-bold  uppercase tracking-widest px-1 py-0.5 rounded border leading-none ${isAdminMsg ? 'text-[var(--color-purple-light)] bg-[var(--color-purple-glow)] border-[var(--color-border-purple)]' : 'text-sky-400 bg-sky-500/20 border-sky-500/35'
                        }`}>
                        {isAdminMsg ? 'ADMIN' : 'YOU'}
                      </span>
                    </div>
                    {/* Text bubble */}
                    <div
                      className={`p-2.5  text-xs leading-relaxed font-bold !text-white   ${isAdminMsg
                        ? "bg-[var(--color-purple-primary)] rounded-tl-xs"
                        : "bg-cyan-500 border border-cyan-400/50 rounded-tr-xs"
                        }`}
                    >
                      {msg.text}
                    </div>
                    {/* Timestamp */}
                    <span className="text-[10px] !text-gray-700 font-sans font-bold leading-none mt-1 tracking-tight">
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
