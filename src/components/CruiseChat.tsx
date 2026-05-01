"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/context/MemberContext";

type ChatMessage = {
  id: string;
  sender_name: string;
  sender_role: string;
  sender_avatar: string;
  content: string;
  created_at: string;
};

export default function CruiseChat() {
  const { member } = useMember();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();
  const room = "cruise_dashboard";

  // Fetch history and listen to realtime
  useEffect(() => {
    // Initial fetch
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room", room)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setMessages(data.reverse());
      }
    };
    
    fetchHistory();

    // Fetch initial pinned message + chat enabled state
    fetch("/api/cruise/chat-pin")
      .then(res => res.json())
      .then(data => {
        if (data.pin) setPinnedMessage(data.pin);
        if (data.chatEnabled !== undefined) setChatEnabled(data.chatEnabled);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    // Subscribe to new messages, pinned updates & chat toggle
    const channel = supabase
      .channel(`room_${room}`)
      .on("broadcast", { event: "pin_update" }, (payload) => {
        setPinnedMessage(payload.payload.pin);
      })
      .on("broadcast", { event: "chat_toggle" }, (payload) => {
        setChatEnabled(payload.payload.chatEnabled);
      })
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `room=eq.${room}`
      }, (payload) => {
        const newMsg = payload.new as ChatMessage;
        setMessages((prev) => [...prev, newMsg]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !member || isSending || !chatEnabled) return;

    setIsSending(true);
    
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room,
          sender_name: member.name || "Guest",
          sender_role: member.role || "fan",
          sender_avatar: member.avatar || "YO",
          content: newMessage.trim(),
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        alert(`Message rejected: ${data.error}`);
      } else {
        setNewMessage("");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const getRoleColor = (role: string) => {
    if (role === "admin") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (role === "crew") return "text-[var(--color-accent)] bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20";
    return "text-white/60 bg-white/5 border-white/5";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-[#0b0b12] border border-white/5 rounded-2xl flex flex-col h-[calc(100vh-12rem)] min-h-[500px] items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[var(--color-accent)] rounded-full animate-spin" />
        <p className="text-[0.6rem] font-bold text-white/20 uppercase tracking-widest mt-3">Loading chat...</p>
      </div>
    );
  }

  // Chat disabled by admin
  if (!chatEnabled) {
    return (
      <div className="bg-[#0b0b12] border border-white/5 rounded-2xl flex flex-col h-[320px] overflow-hidden relative group">
        {/* Header */}
        <div className="bg-black/40 px-5 py-4 border-b border-white/5 flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lg opacity-50">
              💬
            </div>
            <div>
              <h3 className="font-bold text-white/40 text-sm tracking-wide">Passenger Lounge</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="text-[0.55rem] font-bold text-white/20 uppercase tracking-widest">Offline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Locked overlay */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h4 className="text-sm font-bold text-white/50 tracking-wide mb-1">Chat Paused</h4>
            <p className="text-[0.65rem] text-white/25 leading-relaxed max-w-[220px] mx-auto">
              The crew has temporarily closed the lounge. Check back soon for updates!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0b12] border border-[var(--color-accent)]/20 rounded-2xl flex flex-col h-[calc(100vh-12rem)] min-h-[500px] overflow-hidden shadow-[0_0_30px_rgba(133,29,239,0.05)]">
      {/* Header */}
      <div className="bg-black/40 px-5 py-4 border-b border-white/5 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-lg">
            💬
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-wide">Passenger Lounge</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              <span className="text-[0.55rem] font-bold text-emerald-400 uppercase tracking-widest">Live Chat</span>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <span className="min-w-[28px] h-[28px] flex items-center justify-center rounded-full bg-[var(--color-accent)] text-white text-[0.65rem] font-black px-2 shadow-[0_0_12px_rgba(133,29,239,0.5)] border border-[var(--color-accent)]/50">
            {messages.length > 99 ? '99+' : messages.length}
          </span>
        )}
      </div>

      {/* Pinned Message */}
      {pinnedMessage && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 flex items-start gap-3 relative z-10 animate-[slideDown_0.3s_ease-out]">
          <span className="text-amber-400 text-sm shrink-0">📌</span>
          <div className="flex-1">
            <h4 className="text-[0.6rem] font-bold uppercase tracking-widest text-amber-400/80 mb-0.5">Crew Announcement</h4>
            <p className="text-amber-100/90 text-xs font-medium leading-relaxed">{pinnedMessage}</p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide relative">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/20">
            <span className="text-3xl mb-2 opacity-50">👋</span>
            <p className="text-xs font-bold uppercase tracking-widest">Welcome to the lounge</p>
            <p className="text-[0.65rem] mt-1 text-center max-w-[200px]">Say hi to your fellow passengers or ask the crew a question!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-3 animate-[slideIn_0.3s_ease-out]">
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[0.6rem] font-black border border-white/10 bg-[#15151f]">
                {msg.sender_avatar.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-bold text-white/80">{msg.sender_name}</span>
                  <span className={`text-[0.5rem] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${getRoleColor(msg.sender_role)}`}>
                    {msg.sender_role}
                  </span>
                  <span className="text-[0.55rem] text-white/30 ml-auto font-mono">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-2 text-sm text-white/70 inline-block w-fit max-w-[90%] leading-relaxed border border-white/[0.02]">
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/40 border-t border-white/5">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!member || isSending}
            placeholder={member ? "Type a message..." : "Log in to chat"}
            className="w-full bg-[#15151f] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white outline-none focus:border-[var(--color-accent)]/50 focus:bg-white/5 transition-all disabled:opacity-50"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !member || isSending}
            className="absolute right-2 w-8 h-8 rounded-lg bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center hover:bg-[var(--color-accent)] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-[var(--color-accent)]/20 disabled:hover:text-[var(--color-accent)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
