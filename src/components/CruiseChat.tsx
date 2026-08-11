/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/context/MemberContext";
import { AlertTriangle, Ban, Trash2, LogOut } from "lucide-react";

type ChatMessage = {
  id: string;
  sender_name: string;
  sender_role: string;
  sender_avatar: string;
  content: string;
  created_at: string;
};

function formatMessageContent(content: string) {
  if (!content) return null;
  const tagRegex = /(@[a-zA-Z0-9_-]+)/g;
  const parts = content.split(tagRegex);
  return parts.map((part, i) => {
    if (/^@[a-zA-Z0-9_-]+$/.test(part)) {
      const tagLower = part.toLowerCase();
      const isAdminTag = ['@admin', '@crew', '@moderator', '@mary', '@michael', '@tony', '@sammy', '@ryan', '@abbie'].some(t => tagLower.startsWith(t));
      return (
        <span
          key={`tag-${i}-${part}`}
          className={`font-black text-xs px-0.5 mx-0.5 ${isAdminTag ? 'text-cyan-300 font-black' : 'text-purple-300 font-bold'}`}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

function isQuestionForAdmin(content: string) {
  if (!content) return false;
  const lower = content.toLowerCase();
  return ['@admin', '@crew', '@moderator', '@mary', '@michael', '@tony', '@sammy', '@ryan', '@abbie'].some(t => lower.includes(t));
}

const getNameColor = (role?: string, name?: string) => {
  if (role === 'admin') return '!text-purple-300 font-extrabold';
  if (role === 'crew') return '!text-emerald-400 font-extrabold';
  if (role === 'planner') return '!text-pink-400 font-extrabold';
  if (role === 'cruise') return '!text-cyan-400 font-extrabold';
  const colors = [
    '!text-cyan-400 font-bold',
    '!text-purple-400 font-bold',
    '!text-pink-400 font-bold',
    '!text-emerald-400 font-bold',
    '!text-amber-400 font-bold',
    '!text-sky-400 font-bold',
    '!text-rose-400 font-bold',
  ];
  let hash = 0;
  const str = name || 'user';
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getRoleColor = (role: string) => {
  if (role === "admin") return " text-[var(--color-accent)] bg-purple-600/20 border-purple-500/40 font-extrabold";
  if (role === "crew") return "text-emerald-800 bg-emerald-500/20 border-emerald-500/40 font-extrabold";
  if (role === "planner") return " text-[var(--color-accent)] bg-[var(--color-accent)]/20 border-[var(--color-accent)]/40 font-extrabold";
  if (role === "cruise") return "text-cyan-800 bg-cyan-500/20 border-cyan-500/40 font-extrabold";
  return " text-[var(--color-accent)] bg-[var(--color-accent)]/20 border-[var(--color-accent)]/35 font-extrabold";
};

const getAvatarGradient = (name: string) => {
  const gradients = [
    'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white shadow-md',
    'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-md',
    'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-md',
    'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-black font-black shadow-md',
    'bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 text-white shadow-md',
    'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white shadow-md',
  ];
  let hash = 0;
  const str = name || 'user';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

function getUserBubbleBg(senderName: string, opacity: number = 0.8) {
  const palette = [
    `rgba(8, 145, 178, ${opacity})`,    // Deep Cyan
    `rgba(147, 51, 234, ${opacity})`,   // Vibrant Purple
    `rgba(219, 39, 119, ${opacity})`,   // Hot Pink / Rose
    `rgba(5, 150, 105, ${opacity})`,    // Emerald Green
    `rgba(217, 119, 6, ${opacity})`,    // Amber Gold
    `rgba(79, 70, 229, ${opacity})`,    // Indigo
    `rgba(225, 29, 72, ${opacity})`,    // Crimson Red
    `rgba(2, 132, 199, ${opacity})`,    // Sky Blue
  ];
  let hash = 0;
  const str = senderName || "user";
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

const CHAT_EMOJIS = ['😂', '❤️', '🔥', '🤘', '🎸', '👏', '⚡', '😍', '🙌', '💀', '👀', '🎵', '🫶', '😭', '💜', '🤯', '🎤', '🎶', '🥹', '😎', '🥳', '🎉', '🥂', '🚢', '🌊'];

const TAG_SUGGESTIONS = [
  { tag: '@admin', label: 'Tag Admin Team', icon: '👑' },
  { tag: '@Mary', label: 'Mary Grivas (Admin)', icon: '👑' },
  { tag: '@Michael', label: 'Michael Scimeca', icon: '🎤' },
  { tag: '@crew', label: 'Tag 7H Band & Crew', icon: '🎸' },
  { tag: '@Tony', label: 'Tony', icon: '🥁' },
  { tag: '@Sammy', label: 'Sammy', icon: '🎸' },
  { tag: '@Ryan', label: 'Ryan', icon: '🎸' },
];

export default function CruiseChat({ memberOverride, activeChannel = "general" }: { memberOverride?: any; activeChannel?: string }) {
  const { member: contextMember } = useMember();
  const member = memberOverride || contextMember;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<{ name: string; avatar: string; role: string }[]>([]);
  const chatLayout = 3;
  const chatContainerRef = useRef<HTMLDivElement>(null);



  const isCrewOrAdmin = member?.role === 'crew' || member?.role === 'admin';

  const handleUpdatePin = useCallback(async (newPin: string | null) => {
    try {
      const res = await fetch('/api/cruise/chat-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: newPin })
      });
      if (!res.ok) {
        alert('Failed to update announcement');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating announcement');
    }
  }, []);

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

  const CRUISE_END_DATE = new Date("2027-01-17T12:00:00Z").getTime();
  const CHAT_ARCHIVE_DATE = CRUISE_END_DATE + (14 * 24 * 60 * 60 * 1000);
  const isArchived = Date.now() > CHAT_ARCHIVE_DATE;

  const fetchHistory = useCallback(async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room", room)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data && data.length > 0) {
      setMessages(data.reverse());
    } else {
      setMessages([
        { id: '1', sender_name: 'TommyGuitar', sender_role: 'fan', sender_avatar: 'TG', content: 'GET YOUR PHONES UP 📱', created_at: new Date(Date.now() - 600000).toISOString() },
        { id: '2', sender_name: 'ashley__xo', sender_role: 'fan', sender_avatar: 'AX', content: 'the energy in here is UNREAL', created_at: new Date(Date.now() - 540000).toISOString() },
        { id: '3', sender_name: 'Jake7H', sender_role: 'fan', sender_avatar: 'J7', content: 'watching from my car in the parking lot lol 😂', created_at: new Date(Date.now() - 480000).toISOString() },
        { id: '4', sender_name: 'drummer_kid', sender_role: 'fan', sender_avatar: 'DK', content: 'i drove 6 hours for this', created_at: new Date(Date.now() - 420000).toISOString() },
        { id: '5', sender_name: 'MidwestMama', sender_role: 'fan', sender_avatar: 'MW', content: 'PIT IS INSANE RN', created_at: new Date(Date.now() - 360000).toISOString() },
        { id: '6', sender_name: 'StaceyB', sender_role: 'fan', sender_avatar: 'SB', content: 'FRONT ROW BABY', created_at: new Date(Date.now() - 300000).toISOString() },
        { id: '7', sender_name: 'StaceyB', sender_role: 'fan', sender_avatar: 'SB', content: '🤘🤘🤘 sending love from the back row', created_at: new Date(Date.now() - 240000).toISOString() },
        { id: '8', sender_name: 'rockerdan', sender_role: 'fan', sender_avatar: 'RD', content: 'PLAY SING NEXT PLEASE 🎵', created_at: new Date(Date.now() - 180000).toISOString() },
        { id: '9', sender_name: 'MidwestMama', sender_role: 'fan', sender_avatar: 'MW', content: 'my 15th 7H show and they keep getting better', created_at: new Date(Date.now() - 120000).toISOString() },
        { id: '10', sender_name: 'drummer_kid', sender_role: 'fan', sender_avatar: 'DK', content: 'who else is crying rn 😭', created_at: new Date(Date.now() - 60000).toISOString() },
      ]);
    }
  }, [room, supabase]);

  const fetchChatPin = useCallback(async () => {
    try {
      const res = await fetch("/api/cruise/chat-pin");
      if (res.ok) {
        const data = await res.json();
        if (data.chatEnabled !== undefined) setChatEnabled(data.chatEnabled);
      }
    } catch { }
    finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchChatPin();

    const presenceKey = member?.name || 'guest_' + Math.random().toString(36).slice(2, 7);

    const channel = supabase
      .channel(`room_${room}`)
      .on("broadcast", { event: "pin_update" }, () => { })
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
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ name: string; avatar: string; role: string }>();
        const users = Object.values(state).flat().map((u) => ({
          name: u.name || 'Guest',
          avatar: u.avatar || '?',
          role: u.role || 'fan',
        }));
        // dedupe by name
        const seen = new Set<string>();
        setOnlineUsers(users.filter(u => { if (seen.has(u.name)) return false; seen.add(u.name); return true; }));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && member?.name) {
          await channel.track({
            name: member.name,
            avatar: member.avatar || member.name.slice(0, 2).toUpperCase(),
            role: member.role || 'fan',
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHistory, fetchChatPin, supabase, member?.name, member?.avatar, member?.role]);

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
      /\btrump|biden|obama|maga|tds|sleepy joe|sleeply joe\b/i,
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
    setShowTagMenu(false);

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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Message rejected: ${data.error}`);
      } else {
        const data = await res.json();
        setNewMessage("");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const insertTag = (tag: string) => {
    const spaceIndex = newMessage.lastIndexOf('@');
    if (spaceIndex !== -1) {
      setNewMessage(newMessage.slice(0, spaceIndex) + tag + ' ');
    } else {
      setNewMessage(prev => (prev ? prev + ' ' + tag + ' ' : tag + ' '));
    }
    setShowTagMenu(false);
  };





  if (isLoading) {
    return (
      <div className="bg-[var(--color-bg-glass,rgba(18,18,24,0.45))] backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col h-[calc(100vh-12rem)] min-h-[500px] items-center justify-center shadow-2xl text-white">
        <div className="w-6 h-6 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-3">Loading chat...</p>
      </div>
    );
  }

  if (!chatEnabled) {
    return (
      <div className="bg-white border border-black/10 flex flex-col h-[320px] overflow-hidden relative group shadow-md text-black">
        <div className="bg-gray-50 px-5 py-4 border-b border-black/10 flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-lg opacity-50">
              💬
            </div>
            <div>
              <h3 className="font-bold text-black text-sm tracking-wide">Passenger Lounge</h3>
              <span className="text-[var(--font-size-3xs)] text-black/40 font-bold uppercase tracking-wider">Chat Temporarily Disabled</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-3xl mb-2 opacity-40">🔒</span>
          <h4 className="text-xs font-bold uppercase tracking-widest text-black/60 mb-1">Chat is Currently Offline</h4>
          <p className="text-xs text-black/40 max-w-[260px]">The lounge chat has been temporarily paused by crew moderators.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="cruise-chat-root"
      data-lenis-prevent
      style={{
        boxShadow: '0 0 25px var(--chat-glow-color, rgba(168, 85, 247, 0.35))',
        backgroundColor: 'var(--chat-box-bg, transparent)',
      }}
      className="rounded-3xl backdrop-blur-md flex flex-col h-[500px] max-h-[500px] min-h-0 overflow-hidden text-white transition-all duration-300"
    >
      <div className="py-2 px-1 border-b border-white/10 flex items-center justify-between z-10 relative shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-xs shadow-md text-white">
            💬
          </div>
          <div>
            <h3 className="font-black text-white text-xs tracking-wide flex items-center gap-1.5">
              Passenger Lounge
              <span className="text-[var(--font-size-4xs)] font-black uppercase tracking-widest text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded-full">
                LIVE
              </span>
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-xs" />
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                {onlineUsers.length > 0 ? `${onlineUsers.length} Online` : 'Cruisers Online'}
              </span>
            </div>
          </div>
        </div>

        {/* Online users panel */}
        {onlineUsers.length > 0 && (
          <div className="flex items-center gap-1 pr-1 max-w-[55%] overflow-hidden">
            <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[52px] pr-1 scrollbar-hide">
              {onlineUsers.map((u) => (
                <div key={u.name} className="flex items-center gap-1 group">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black shrink-0 ring-1"
                    style={{
                      background: u.role === 'admin' ? 'rgba(168,85,247,0.4)' : u.role === 'crew' ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.1)',
                      ringColor: u.role === 'admin' ? 'rgba(168,85,247,0.6)' : u.role === 'crew' ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.15)',
                      color: u.role === 'admin' ? '#d8b4fe' : u.role === 'crew' ? '#67e8f9' : '#fff',
                    }}
                  >
                    {u.avatar?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[8px] font-semibold truncate max-w-[60px]"
                    style={{ color: u.role === 'admin' ? '#d8b4fe' : u.role === 'crew' ? '#67e8f9' : 'rgba(255,255,255,0.6)' }}
                  >
                    {u.name}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {member?.is_warned && (
        <div className="bg-purple-600/15 border-b border-purple-500/30 px-3 py-2 flex items-start gap-2.5 relative z-10 animate-[slideDown_0.3s_ease-out] shrink-0">
          <span className="text-purple-300 text-xs shrink-0">⚠️</span>
          <div className="flex-1">
            <h4 className="text-[var(--font-size-3xs)] font-bold uppercase tracking-widest text-purple-300/80 mb-0.5">Warning Alert</h4>
            <p className="text-amber-100/90 text-xs font-medium leading-relaxed">
              You have been warned by a moderator for inappropriate behavior. Please follow the PG-13 guidelines.
            </p>
          </div>
        </div>
      )}

      {member?.is_banned && (
        <div className="bg-red-500/15 border-b border-red-500/30 px-3 py-2 flex items-start gap-2.5 relative z-10 animate-[slideDown_0.3s_ease-out] shrink-0">
          <span className="text-red-400 text-xs shrink-0">🚫</span>
          <div className="flex-1">
            <h4 className="text-[var(--font-size-3xs)] font-bold uppercase tracking-widest text-red-400/80 mb-0.5">Banned Alert</h4>
            <p className="text-red-100/90 text-xs font-medium leading-relaxed">
              You have been permanently banned from sending messages in this chat.
            </p>
          </div>
        </div>
      )}

      {/* Scrollable Message List Container with Fixed Pure Glass Blur Clipping Mask */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        {/* Fixed Top Pure Glass Blur with Transparent Clipping Mask (No Dark Tint) */}
        <div
          style={{
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          }}
          className="absolute top-0 left-0 right-0 h-12 backdrop-blur-md z-20 pointer-events-none"
        />

        <div
          ref={chatContainerRef}
          data-lenis-prevent
          style={{ gap: 'var(--chat-message-spacing, 13px)' }}
          className="flex-1 flex flex-col min-h-[300px] max-h-[380px] overflow-y-auto overscroll-contain py-3 px-3 relative bg-transparent scrollbar-thin scrollbar-thumb-purple-500/40 hover:scrollbar-thumb-purple-500/70"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/20">
              <span className="text-3xl mb-2 opacity-50">👋</span>
              <p className="text-xs font-bold uppercase tracking-widest">Welcome to the lounge</p>
              <p className="text-xs mt-1 text-center max-w-[200px]">Say hi to your fellow passengers or tag @admin to ask a question!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isSystem = msg.sender_role === 'system';
              if (isSystem) {
                const isWarning = msg.content.includes('Warning') || msg.content.includes('warned');
                const isBan = msg.content.includes('banned');
                const bgClass = isWarning
                  ? "bg-purple-600/10 border-purple-500/20 text-purple-100"
                  : isBan
                    ? "bg-red-500/10 border-red-500/20 text-red-200"
                    : "bg-sky-500/10 border-sky-500/20 text-sky-200";
                return (
                  <div key={msg.id} className={`flex items-center gap-2 p-2.5 rounded-xl border ${bgClass} text-xs font-medium animate-[slideIn_0.3s_ease-out]`}>
                    <span className="text-sm shrink-0">{msg.sender_avatar || '🛡️'}</span>
                    <div className="flex-1 leading-relaxed">
                      {msg.content}
                    </div>
                    <span className="text-[var(--font-size-2xs)] opacity-40 shrink-0 font-mono ml-2">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              }

              const isSelf = member?.name && msg.sender_name === member.name;
              const hasAdminTag = isQuestionForAdmin(msg.content);

              return (
                <div key={msg.id} className="flex gap-2.5 items-start py-0.5 animate-[slideIn_0.3s_ease-out] group relative">
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-black mt-0.5 ${getAvatarGradient(msg.sender_name)}`}>
                    {(msg.sender_avatar || msg.sender_name || 'FN').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap w-full">
                      <span className={`text-xs font-bold ${getNameColor(msg.sender_role, msg.sender_name)}`}>
                        {msg.sender_name}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border leading-none ${getRoleColor(msg.sender_role)}`}>
                        {msg.sender_role === 'fan' ? 'Cruise Member' : msg.sender_role}
                      </span>
                      {hasAdminTag && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-cyan-300 bg-purple-600/20 border border-purple-500/40 px-1.5 py-0.5 rounded flex items-center gap-1 leading-none animate-pulse">
                          👑 Question for Admin
                        </span>
                      )}
                      <span className="text-[10px] text-white/60 font-mono font-medium leading-none ml-auto tracking-tight">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div
                      style={{
                        borderRadius: "var(--chat-bubble-radius, 16px)",
                        borderWidth: "var(--chat-bubble-border-width, 0px)",
                        borderStyle: "solid",
                        paddingTop: "var(--chat-bubble-padding-y, 5px)",
                        paddingBottom: "var(--chat-bubble-padding-y, 5px)",
                        paddingLeft: "var(--chat-bubble-padding-x, 13px)",
                        paddingRight: "var(--chat-bubble-padding-x, 13px)",
                        borderColor: isSelf
                          ? "var(--chat-bubble-self-border, transparent)"
                          : hasAdminTag
                            ? "var(--chat-bubble-admin-border, transparent)"
                            : "var(--chat-bubble-member-border, transparent)",
                        backgroundColor: isSelf
                          ? "var(--chat-bubble-self-bg, rgba(126, 34, 206, 0.85))"
                          : hasAdminTag
                            ? "var(--chat-bubble-admin-bg, rgba(46, 16, 101, 0.9))"
                            : `var(--chat-bubble-override-bg, ${getUserBubbleBg(msg.sender_name, 0.8)})`,
                        fontSize: "var(--chat-bubble-font-size, 12px)",
                      }}
                      className="w-fit max-w-[85%] leading-relaxed break-words shadow-md transition-all text-white font-medium"
                    >
                      {formatMessageContent(msg.content)}
                    </div>
                  </div>

                  {isCrewOrAdmin && msg.sender_role !== 'crew' && msg.sender_role !== 'admin' && (
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg p-1 z-20 shadow-lg">
                      <button
                        aria-label="Warn User"
                        onClick={() => handleWarn(msg.sender_name)}
                        title="Warn User"
                        className="w-6 h-6 rounded flex items-center justify-center text-amber-400 hover:bg-amber-500/20 hover:scale-105 transition cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        aria-label="Ban User"
                        onClick={() => handleBan(msg.sender_name)}
                        title="Ban User"
                        className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:scale-105 transition cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                      <button
                        aria-label="Delete Message"
                        onClick={() => handleDeleteMsg(msg.id)}
                        title="Delete Message"
                        className="w-6 h-6 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:scale-105 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        aria-label="Remove Fan Completely"
                        onClick={() => handleKick(msg.sender_name)}
                        title="Remove Fan Completely"
                        className="w-6 h-6 rounded flex items-center justify-center text-rose-400 hover:bg-rose-500/20 hover:scale-105 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        {/* Fixed Bottom Pure Glass Blur with Transparent Clipping Mask (No Dark Tint) */}
        <div
          style={{
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
          className="absolute bottom-0 left-0 right-0 h-10 backdrop-blur-md z-20 pointer-events-none"
        />
      </div>

      <div className="relative shrink-0">
        {showTagMenu && (
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-[#0f0e1d] border border-cyan-500/40 p-2 z-30 animate-[slideUp_0.15s_ease-out]">
            <div className="text-[var(--font-size-3xs)] font-black uppercase tracking-widest text-purple-400px-2 py-1 flex items-center justify-between">
              <span>Tag Admin / Crew Member</span>
              <button aria-label="Action button" onClick={() => setShowTagMenu(false)} className="text-white/40 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {TAG_SUGGESTIONS.map(s => (
                <button aria-label="Action button"
                  key={s.tag}
                  type="button"
                  onClick={() => insertTag(s.tag)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/40 text-xs text-white transition-colors text-left cursor-pointer"
                >
                  <span>{s.icon}</span>
                  <div className="truncate">
                    <span className="font-bold text-cyan-300">{s.tag}</span>
                    <span className="text-[var(--font-size-3xs)] text-white/40 block truncate">{s.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 right-0 bg-white border border-black/15 p-2.5 z-30 animate-[slideUp_0.15s_ease-out] w-64">
            <div className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1.5 px-1 flex items-center justify-between">
              <span>Quick Emojis</span>
              <button aria-label="Action button" type="button" onClick={() => setShowEmojiPicker(false)} className="text-black/30 hover:text-black text-xs font-bold">✕</button>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {CHAT_EMOJIS.map(emoji => (
                <button aria-label="Previous"
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setNewMessage(prev => prev + emoji);
                  }}
                  className="w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-black/5 active:scale-95 transition-colors cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {isArchived ? (
          <div className="w-full bg-[var(--color-bg-card)] border border-white/10 px-4 py-3 text-sm text-white/40 text-center flex items-center justify-center gap-2">
            <span>🔒</span> This cruise chat has been archived.
          </div>
        ) : (
          <div className="flex flex-col">
            <form onSubmit={handleSend} className="relative flex items-center w-full">
              <div className="input-glow-border w-full">
                <input aria-label="Input field"
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewMessage(val);
                    if (val.endsWith('@') || (val.includes('@') && !showTagMenu && val.split('@').pop()!.length < 8)) {
                      setShowTagMenu(true);
                    }
                  }}
                  disabled={!member || isSending || member.is_banned}
                  placeholder={member ? (member.is_banned ? "You have been permanently banned" : "Type a message... use @admin to ask a question") : "Log in to chat"}
                  className="w-full bg-white/5 border-y border-white/20 pl-3.5 pr-28 py-3 text-xs text-white font-medium outline-none transition-all shadow-md placeholder:text-white/40"
                  maxLength={500}
                />
              </div>
              <div className="absolute right-1.5 flex items-center gap-1">
                <button aria-label="Action button"
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    if (showTagMenu) setShowTagMenu(false);
                  }}
                  title="Insert Emoji"
                  className="w-7 h-7 rounded-lg bg-black/5 hover:bg-black/10 text-black flex items-center justify-center text-sm transition-colors cursor-pointer"
                >
                  😀
                </button>
                <button aria-label="Action button"
                  type="button"
                  onClick={() => {
                    setShowTagMenu(!showTagMenu);
                    if (showEmojiPicker) setShowEmojiPicker(false);
                  }}
                  title="Tag Admin or Crew"
                  className="px-2 py-1 rounded bg-purple-600/10 hover:bg-purple-600/20  text-[var(--color-accent)] font-bold text-xs border border-purple-500/30 transition-colors cursor-pointer"
                >
                  @
                </button>
                <button aria-label="Action button"
                  type="submit"
                  disabled={!newMessage.trim() || !member || isSending || member.is_banned}
                  className="w-7 h-7 rounded-lg bg-purple-700/50 hover:bg-purple-600/70 text-purple-300 flex items-center justify-center transition-colors shadow-[0_0_10px_rgba(147,51,234,0.2)] disabled:opacity-30 disabled:hover:bg-purple-700/50 cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </form>
            <div className="flex items-center justify-between text-[10px] font-bold text-white uppercase tracking-wider mt-2 px-1">
              <span>KEEP IT RATED PG-13 · NO POLITICS</span>
              <button aria-label="Action button"
                type="button"
                onClick={() => insertTag('@admin')}
                className="text-white hover:text-white/70 transition-colors cursor-pointer font-bold lowercase tracking-normal"
              >
                tag @admin for help
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
