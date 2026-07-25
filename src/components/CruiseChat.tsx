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

export default function CruiseChat({ memberOverride }: { memberOverride?: any } = {}) {
  const { member: contextMember } = useMember();
  const member = memberOverride || contextMember;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const isCrewOrAdmin = member?.role === 'crew' || member?.role === 'admin';

  const handleKick = async (senderName: string) => {
    if (!senderName || senderName === member?.name) return;
    if (!confirm(`WARNING: This will permanently remove ${senderName} from the site, delete their account and profile, and email them a notification. Are you sure you want to do this?`)) return;

    try {
      const res = await fetch('/api/moderation/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: senderName, room })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to kick user: ${err.error}`);
      } else {
        alert(`${senderName} has been successfully removed from the site.`);
      }
    } catch (e) {
      console.error(e);
      alert('Error kicking user');
    }
  };

  const handleWarn = async (senderName: string) => {
    if (!senderName || senderName === member?.name) return;
    if (!confirm(`Are you sure you want to warn ${senderName}?`)) return;

    try {
      const res = await fetch('/api/moderation/warn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: senderName, room, action: 'warn', reason: 'Moderator warning' })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to warn user: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error warning user');
    }
  };

  const handleBan = async (senderName: string) => {
    if (!senderName || senderName === member?.name) return;
    if (!confirm(`Are you sure you want to ban ${senderName}?`)) return;

    try {
      // 1. Ban globally
      const res = await fetch('/api/moderation/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: senderName, action: 'ban', room })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to ban user globally: ${err.error}`);
        return;
      }

      // 2. Ban in room
      await fetch('/api/chat/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, banned_name: senderName, reason: 'Moderator action' })
      });
    } catch (e) {
      console.error(e);
      alert('Error banning user');
    }
  };

  const handleDeleteMsg = async (msgId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const { error } = await supabase.from('chat_messages').delete().eq('id', msgId);
      if (error) alert(`Failed to delete message: ${error.message}`);
    } catch (e) {
      console.error(e);
      alert('Error deleting message');
    }
  };
  
  const supabase = createClient();
  const room = "cruise_dashboard";

  // Cruise ends January 17, 2027. Archive chat 14 days later.
  const CRUISE_END_DATE = new Date("2027-01-17T12:00:00Z").getTime();
  const CHAT_ARCHIVE_DATE = CRUISE_END_DATE + (14 * 24 * 60 * 60 * 1000);
  const isArchived = Date.now() > CHAT_ARCHIVE_DATE;

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
      .on("broadcast", { event: "pin_update" }, (payload: any) => {
        setPinnedMessage(payload.payload.pin);
      })
      .on("broadcast", { event: "chat_toggle" }, (payload: any) => {
        setChatEnabled(payload.payload.chatEnabled);
      })
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `room=eq.${room}`
      }, (payload: any) => {
        const newMsg = payload.new as ChatMessage;
        setMessages((prev) => [...prev, newMsg]);
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "chat_messages"
      }, (payload: any) => {
        const oldMsg = payload.old as { id: string };
        if (oldMsg && oldMsg.id) {
          setMessages((prev) => prev.filter((m) => m.id !== oldMsg.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !member || isSending || !chatEnabled || member.is_banned) return;

    // Client-side PG content filter (mirrors server blocklist)
    const PG_BLOCKED = [
      /\bfuck|f\*ck|fuk|fvck|fuq\b/i,
      /\bshit|sh1t\b/i,
      /\bass\b/i,
      /\bbitch|b1tch\b/i,
      /\bcrap\b/i,
      /\bbastard\b/i,
      /\bpiss\b/i,
      /\bcock|c0ck\b/i,
      /\bdick|d1ck\b/i,
      /\bpussy\b/i,
      /\bcunt\b/i,
      /\bwhore|wh0re\b/i,
      /\bslut\b/i,
      /\bnigga|nigger\b/i,
      /\bfag|faggot\b/i,
      /\bretard\b/i,
      /\brape\b/i,
      /\bporn|xxx\b/i,
      /\btrump|biden|obama|maga\b/i,
      /\bdemocrat|republican|gop\b/i,
      /\bliberal|conservative\b/i,
      /\bcommunist|socialism|socialist\b/i,
      /\bfascist|fascism\b/i,
      /\bantifa|blm\b/i,
      /\bkkk|klan\b/i,
      /\bnazi|n4zi\b/i,
      /\babortion|pro-life|pro-choice\b/i,
      /\bimpeach\b/i,
      /\belection|ballot|voter fraud\b/i,
      /\bdeep state|qanon\b/i,
      /\bwoke\b/i,
    ];

    if (PG_BLOCKED.some(re => re.test(newMessage))) {
      alert("Keep it PG! No swearing or political topics please 🙏");
      return;
    }

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

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-[0_0_12px_rgba(217,70,239,0.4)]',
      'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]',
      'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]',
      'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-black font-black shadow-[0_0_12px_rgba(245,158,11,0.4)]',
      'bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]',
      'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]',
    ];
    let hash = 0;
    const str = name || 'user';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  const getSenderNameColor = (name: string, role: string) => {
    if (role === 'admin') return 'text-amber-300 font-extrabold';
    if (role === 'crew') return 'text-emerald-400 font-extrabold';
    if (role === 'planner') return 'text-fuchsia-400 font-extrabold';
    if (role === 'cruise') return 'text-cyan-300 font-extrabold';
    const colors = ['text-purple-300', 'text-cyan-300', 'text-pink-300', 'text-emerald-300', 'text-amber-300', 'text-indigo-300'];
    let hash = 0;
    const str = name || 'user';
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getRoleColor = (role: string) => {
    if (role === "admin") return "text-amber-300 bg-amber-500/20 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-extrabold";
    if (role === "crew") return "text-emerald-300 bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-extrabold";
    if (role === "planner") return "text-fuchsia-300 bg-fuchsia-500/20 border-fuchsia-500/40 shadow-[0_0_10px_rgba(217,70,239,0.2)] font-extrabold";
    if (role === "cruise") return "text-cyan-300 bg-cyan-500/20 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-extrabold";
    return "text-purple-300 bg-purple-500/20 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)] font-extrabold";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-[#0b0b12] border border-white/5 rounded-2xl flex flex-col h-[calc(100vh-12rem)] min-h-[500px] items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[var(--color-accent)] rounded-full animate-spin" />
        <p className="text-xs font-bold text-white/20 uppercase tracking-widest mt-3">Loading chat...</p>
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
                <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Offline</span>
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
            <p className="text-xs text-white/25 leading-relaxed max-w-[220px] mx-auto">
              The crew has temporarily closed the lounge. Check back soon for updates!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-white/10 rounded-2xl p-4 flex flex-col h-[calc(100vh-6rem)] max-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div className="py-3 border-b border-white/10 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-sm shadow-[0_0_12px_rgba(168,85,247,0.5)]">
            💬
          </div>
          <div>
            <h3 className="font-black text-white text-sm tracking-wide flex items-center gap-2">
              Passenger Lounge
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                LIVE
              </span>
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Cruisers Online</span>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <span className="min-w-[28px] h-[28px] flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs font-black px-2 shadow-[0_0_12px_rgba(217,70,239,0.5)] border border-purple-400/40">
            {messages.length > 99 ? '99+' : messages.length}
          </span>
        )}
      </div>

      {/* Pinned Message */}
      {pinnedMessage && (
        <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-b border-amber-500/30 px-4 py-3 flex items-start gap-3 relative z-10 animate-[slideDown_0.3s_ease-out]">
          <span className="text-amber-400 text-sm shrink-0">📌</span>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-0.5">Crew Announcement</h4>
            <p className="text-amber-100/90 text-xs font-medium leading-relaxed">{pinnedMessage}</p>
          </div>
        </div>
      )}

      {/* User Warning Alert */}
      {member?.is_warned && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-3 flex items-start gap-3 relative z-10 animate-[slideDown_0.3s_ease-out]">
          <span className="text-amber-400 text-sm shrink-0">⚠️</span>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400/80 mb-0.5">Warning Alert</h4>
            <p className="text-amber-100/90 text-xs font-medium leading-relaxed">
              You have been warned by a moderator for inappropriate behavior. Please follow the PG-13 guidelines.
            </p>
          </div>
        </div>
      )}

      {/* User Banned Alert */}
      {member?.is_banned && (
        <div className="bg-red-500/15 border-b border-red-500/30 px-4 py-3 flex items-start gap-3 relative z-10 animate-[slideDown_0.3s_ease-out]">
          <span className="text-red-400 text-sm shrink-0">🚫</span>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-red-400/80 mb-0.5">Banned Alert</h4>
            <p className="text-red-100/90 text-xs font-medium leading-relaxed">
              You have been permanently banned from sending messages in this chat.
            </p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-hide relative bg-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/20">
            <span className="text-3xl mb-2 opacity-50">👋</span>
            <p className="text-xs font-bold uppercase tracking-widest">Welcome to the lounge</p>
            <p className="text-xs mt-1 text-center max-w-[200px]">Say hi to your fellow passengers or ask the crew a question!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSystem = msg.sender_role === 'system';
            if (isSystem) {
              const isWarning = msg.content.includes('Warning') || msg.content.includes('warned');
              const isBan = msg.content.includes('banned');
              const bgClass = isWarning 
                ? "bg-amber-500/10 border-amber-500/20 text-amber-200" 
                : isBan 
                ? "bg-red-500/10 border-red-500/20 text-red-200" 
                : "bg-purple-500/10 border-purple-500/20 text-purple-200";
              return (
                <div key={msg.id} className={`flex items-center gap-2 p-3 rounded-xl border ${bgClass} text-xs font-medium animate-[slideIn_0.3s_ease-out]`}>
                  <span className="text-sm shrink-0">{msg.sender_avatar || '🛡️'}</span>
                  <div className="flex-1 leading-relaxed">
                    {msg.content}
                  </div>
                  <span className="text-2xs opacity-40 shrink-0 font-mono ml-2">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            }

            const isSelf = member?.name && msg.sender_name === member.name;

            return (
              <div key={msg.id} className="flex gap-3 animate-[slideIn_0.3s_ease-out] group relative">
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-black ${getAvatarGradient(msg.sender_name)}`}>
                  {(msg.sender_avatar || msg.sender_name || 'FN').substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-xs font-bold ${getSenderNameColor(msg.sender_name, msg.sender_role)}`}>
                      {msg.sender_name}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${getRoleColor(msg.sender_role)}`}>
                      {msg.sender_role}
                    </span>
                    <span className="text-[10px] text-white/40 ml-auto font-mono">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`rounded-2xl rounded-tl-none px-4 py-2 text-sm text-white/95 inline-block w-fit max-w-[90%] leading-relaxed border break-words ${
                    isSelf 
                      ? 'bg-gradient-to-r from-purple-600/35 via-fuchsia-600/35 to-pink-600/35 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'bg-gradient-to-r from-white/[0.08] to-white/[0.04] border-white/10 hover:border-white/20'
                  }`}>
                    {msg.content}
                  </div>
                </div>

                {/* Moderation actions for Crew/Admin */}
                {isCrewOrAdmin && msg.sender_role !== 'crew' && msg.sender_role !== 'admin' && (
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-[#0b0b12]/95 border border-white/10 rounded-lg p-1 shadow-lg z-20">
                    <button
                      onClick={() => handleWarn(msg.sender_name)}
                      title="Warn User"
                      className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-amber-500/15 text-amber-500 hover:scale-105 transition-all cursor-pointer"
                    >
                      ⚠️
                    </button>
                    <button
                      onClick={() => handleBan(msg.sender_name)}
                      title="Ban User"
                      className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-red-500/15 text-red-500 hover:scale-105 transition-all cursor-pointer"
                    >
                      🚫
                    </button>
                    <button
                      onClick={() => handleDeleteMsg(msg.id)}
                      title="Delete Message"
                      className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-white/10 text-white/40 hover:scale-105 transition-all cursor-pointer"
                    >
                      🗑
                    </button>
                    <button
                      onClick={() => handleKick(msg.sender_name)}
                      title="Remove Fan Completely"
                      className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-red-500/20 text-red-500 hover:scale-105 transition-all cursor-pointer"
                    >
                      🚪
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="py-3 border-t border-white/10">
        {isArchived ? (
          <div className="w-full bg-[#15151f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/40 text-center flex items-center justify-center gap-2">
            <span>🔒</span> This cruise chat has been archived.
          </div>
        ) : (
          <div className="flex flex-col">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!member || isSending || member.is_banned}
                placeholder={member ? (member.is_banned ? "You have been permanently banned" : "Type a message...") : "Log in to chat"}
                className="w-full bg-[#141224] border border-purple-500/30 rounded-xl pl-4 pr-12 py-3 text-sm text-white outline-none focus:border-purple-400 focus:bg-[#1a1730] transition-all disabled:opacity-50 placeholder:text-white/30"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !member || isSending || member.is_banned}
                className="absolute right-2 w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 text-white flex items-center justify-center hover:brightness-125 transition-all shadow-[0_0_12px_rgba(168,85,247,0.5)] disabled:opacity-30 disabled:hover:brightness-100 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
            <div className="text-center text-[9px] font-black text-cyan-400/60 uppercase tracking-[0.15em] mt-2.5">
              KEEP IT RATED PG-13 • NO POLITICAL STATEMENTS
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
