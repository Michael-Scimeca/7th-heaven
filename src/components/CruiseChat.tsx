/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/context/MemberContext";
import {
  AlertTriangle,
  Ban,
  Trash2,
  LogOut,
  MessageSquare,
} from "lucide-react";
import ChatInputBar from "@/components/ChatInputBar";
import { useAuth } from "@/context/AuthContext";
import SeventhButton from "@/components/SeventhButton";

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
      const isAdminTag = [
        "@admin",
        "@crew",
        "@moderator",
        "@mary",
        "@michael",
        "@tony",
        "@sammy",
        "@ryan",
        "@abbie",
      ].some((t) => tagLower.startsWith(t));
      return (
        <span
          key={`tag-${i}-${part}`}
          className={`mx-0.5 px-0.5 ${isAdminTag ? " " : "text-purple-300"}`}
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
  return [
    "@admin",
    "@crew",
    "@moderator",
    "@mary",
    "@michael",
    "@tony",
    "@sammy",
    "@ryan",
    "@abbie",
  ].some((t) => lower.includes(t));
}

const getNameColor = (role?: string, name?: string) => {
  if (role === "admin") return "!text-purple-300  ";
  if (role === "crew") return "!text-emerald-400  ";
  if (role === "planner") return "!text-pink-400  ";
  if (role === "cruise") return "!    ";
  const colors = [
    "!     ",
    "!text-purple-400   ",
    "!text-pink-400   ",
    "!text-emerald-400   ",
    "!text-amber-400   ",
    "!text-sky-400   ",
    "!text-rose-400   ",
  ];
  let hash = 0;
  const str = name || "user";
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getRoleColor = (role: string) => {
  if (role === "admin") return "  bg-purple-600/20 border-purple-500/40  ";
  if (role === "crew")
    return "text-purple-300 bg-purple-600/30 border-purple-500/40  ";
  if (role === "planner")
    return "  bg-[var(--color-accent)]/20 border-[var(--color-accent)]/40  ";
  if (role === "cruise")
    return "text-cyan-800 bg-cyan-500/20 border-purple-500/40  ";
  return "  bg-[var(--color-accent)]/20 border-[var(--color-accent)]/35  ";
};

const getAvatarGradient = (name: string) => {
  const gradients = [
    "bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700     ",
    "bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600     ",
    "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600     ",
    "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500          ",
    "bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500     ",
    "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700     ",
  ];
  let hash = 0;
  const str = name || "user";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

function getUserBubbleBg(senderName: string, opacity: number = 0.8) {
  const palette = [
    `rgba(8, 145, 178, ${opacity})`, // Deep Cyan
    `rgba(147, 51, 234, ${opacity})`, // Vibrant Purple
    `rgba(219, 39, 119, ${opacity})`, // Hot Pink / Rose
    `rgba(5, 150, 105, ${opacity})`, // Emerald Green
    `rgba(217, 119, 6, ${opacity})`, // Amber Gold
    `rgba(79, 70, 229, ${opacity})`, // Indigo
    `rgba(225, 29, 72, ${opacity})`, // Crimson Red
    `rgba(2, 132, 199, ${opacity})`, // Sky Blue
  ];
  let hash = 0;
  const str = senderName || "user";
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

const CHAT_EMOJIS = [
  "😂",
  "❤️",
  "🔥",
  "🤘",
  "🎸",
  "👏",
  "⚡",
  "😍",
  "🙌",
  "💀",
  "👀",
  "🎵",
  "🫶",
  "😭",
  "💜",
  "🤯",
  "🎤",
  "🎶",
  "🥹",
  "😎",
  "🥳",
  "🎉",
  "🥂",
  "🚢",
  "🌊",
];

const TAG_SUGGESTIONS = [
  { tag: "@admin", label: "Tag Admin Team", icon: "👑" },
  { tag: "@Mary", label: "Mary Grivas (Admin)", icon: "👑" },
  { tag: "@Michael", label: "Michael Scimeca", icon: "🎤" },
  { tag: "@crew", label: "Tag 7H Band & Crew", icon: "🎸" },
  { tag: "@Tony", label: "Tony", icon: "🥁" },
  { tag: "@Sammy", label: "Sammy", icon: "🎸" },
  { tag: "@Ryan", label: "Ryan", icon: "🎸" },
];

export default function CruiseChat({
  memberOverride,
  activeChannel = "general",
  showHeader = true,
  className = "",
}: {
  memberOverride?: any;
  activeChannel?: string;
  showHeader?: boolean;
  className?: string;
}) {
  const { member: contextMember } = useMember();
  const member = memberOverride || contextMember;
  const auth = useAuth();

  const [isSignedIn, setIsSignedIn] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = Boolean(
        member ||
        contextMember ||
        auth?.isAuthenticated ||
        auth?.user ||
        localStorage.getItem("7h_member_v1") ||
        localStorage.getItem("7h_member") ||
        localStorage.getItem("7h_user") ||
        localStorage.getItem("7h_fan_user") ||
        localStorage.getItem("7h_crew_account") ||
        localStorage.getItem("7h_auth_token"),
      );
      setIsSignedIn(isAuth);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [member, contextMember, auth?.isAuthenticated, auth?.user]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<
    { name: string; avatar: string; role: string }[]
  >([]);
  const chatLayout = 3;
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isCrewOrAdmin = member?.role === "crew" || member?.role === "admin";

  const handleUpdatePin = useCallback(async (newPin: string | null) => {
    try {
      const res = await fetch("/api/cruise/chat-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: newPin }),
      });
      if (!res.ok) {
        alert("Failed to update announcement");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating announcement");
    }
  }, []);

  const handleKick = async (senderName: string) => {
    if (!senderName || senderName === member?.name) return;
    if (
      !confirm(
        `WARNING: This will permanently remove ${senderName} from the site, delete their account and profile, and email them a notification. Are you sure you want to do this?`,
      )
    )
      return;

    try {
      const res = await fetch("/api/moderation/kick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: senderName, room }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to kick user: ${err.error}`);
      } else {
        alert(`${senderName} has been successfully removed from the site.`);
      }
    } catch (e) {
      console.error(e);
      alert("Error kicking user");
    }
  };

  const handleWarn = async (senderName: string) => {
    if (!senderName || senderName === member?.name) return;
    if (!confirm(`Are you sure you want to warn ${senderName}?`)) return;

    try {
      const res = await fetch("/api/moderation/warn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: senderName,
          room,
          action: "warn",
          reason: "Moderator warning",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to warn user: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error warning user");
    }
  };

  const handleBan = async (senderName: string) => {
    if (!senderName || senderName === member?.name) return;
    if (!confirm(`Are you sure you want to ban ${senderName}?`)) return;

    try {
      const res = await fetch("/api/moderation/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: senderName, action: "ban", room }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to ban user globally: ${err.error}`);
        return;
      }

      await fetch("/api/chat/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room,
          banned_name: senderName,
          reason: "Moderator action",
        }),
      });
    } catch (e) {
      console.error(e);
      alert("Error banning user");
    }
  };

  const handleDeleteMsg = async (msgId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("id", msgId);
      if (error) alert(`Failed to delete message: ${error.message}`);
    } catch (e) {
      console.error(e);
      alert("Error deleting message");
    }
  };

  const supabase = createClient();
  const room = "cruise_dashboard";

  const CRUISE_END_DATE = new Date("2027-01-17T12:00:00Z").getTime();
  const CHAT_ARCHIVE_DATE = CRUISE_END_DATE + 14 * 24 * 60 * 60 * 1000;
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
        {
          id: "1",
          sender_name: "TommyGuitar",
          sender_role: "fan",
          sender_avatar: "TG",
          content: "GET YOUR PHONES UP 📱",
          created_at: new Date(Date.now() - 600000).toISOString(),
        },
        {
          id: "2",
          sender_name: "ashley__xo",
          sender_role: "fan",
          sender_avatar: "AX",
          content: "the energy in here is UNREAL",
          created_at: new Date(Date.now() - 540000).toISOString(),
        },
        {
          id: "3",
          sender_name: "Jake7H",
          sender_role: "fan",
          sender_avatar: "J7",
          content: "watching from my car in the parking lot lol 😂",
          created_at: new Date(Date.now() - 480000).toISOString(),
        },
        {
          id: "4",
          sender_name: "drummer_kid",
          sender_role: "fan",
          sender_avatar: "DK",
          content: "i drove 6 hours for this",
          created_at: new Date(Date.now() - 420000).toISOString(),
        },
        {
          id: "5",
          sender_name: "MidwestMama",
          sender_role: "fan",
          sender_avatar: "MW",
          content: "PIT IS INSANE RN",
          created_at: new Date(Date.now() - 360000).toISOString(),
        },
        {
          id: "6",
          sender_name: "StaceyB",
          sender_role: "fan",
          sender_avatar: "SB",
          content: "FRONT ROW BABY",
          created_at: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: "7",
          sender_name: "StaceyB",
          sender_role: "fan",
          sender_avatar: "SB",
          content: "🤘🤘🤘 sending love from the back row",
          created_at: new Date(Date.now() - 240000).toISOString(),
        },
        {
          id: "8",
          sender_name: "rockerdan",
          sender_role: "fan",
          sender_avatar: "RD",
          content: "PLAY SING NEXT PLEASE 🎵",
          created_at: new Date(Date.now() - 180000).toISOString(),
        },
        {
          id: "9",
          sender_name: "MidwestMama",
          sender_role: "fan",
          sender_avatar: "MW",
          content: "my 15th 7H show and they keep getting better",
          created_at: new Date(Date.now() - 120000).toISOString(),
        },
        {
          id: "10",
          sender_name: "drummer_kid",
          sender_role: "fan",
          sender_avatar: "DK",
          content: "who else is crying rn 😭",
          created_at: new Date(Date.now() - 60000).toISOString(),
        },
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
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchChatPin();

    const presenceKey =
      member?.name || "guest_" + Math.random().toString(36).slice(2, 7);

    const channel = supabase
      .channel(`room_${room}`)
      .on("broadcast", { event: "pin_update" }, () => {})
      .on("broadcast", { event: "chat_toggle" }, (payload: any) => {
        setChatEnabled(payload.payload.chatEnabled);
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room=eq.${room}`,
        },
        (payload: any) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_messages",
        },
        (payload: any) => {
          const oldMsg = payload.old as { id: string };
          if (oldMsg && oldMsg.id) {
            setMessages((prev) => prev.filter((m) => m.id !== oldMsg.id));
          }
        },
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<
          string,
          Array<{ name?: string; avatar?: string; role?: string }>
        >;
        const users = Object.values(state)
          .flat()
          .map((u) => ({
            name: u.name || "Guest",
            avatar: u.avatar || "?",
            role: u.role || "fan",
          }));
        // dedupe by name
        const seen = new Set<string>();
        setOnlineUsers(
          users.filter((u) => {
            if (seen.has(u.name)) return false;
            seen.add(u.name);
            return true;
          }),
        );
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED" && member?.name) {
          await channel.track({
            name: member.name,
            avatar: member.avatar || member.name.slice(0, 2).toUpperCase(),
            role: member.role || "fan",
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    fetchHistory,
    fetchChatPin,
    supabase,
    member?.name,
    member?.avatar,
    member?.role,
  ]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newMessage.trim() ||
      !member ||
      isSending ||
      !chatEnabled ||
      member.is_banned
    )
      return;

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

    if (PG_BLOCKED.some((re) => re.test(newMessage))) {
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
        }),
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
    const spaceIndex = newMessage.lastIndexOf("@");
    if (spaceIndex !== -1) {
      setNewMessage(newMessage.slice(0, spaceIndex) + tag + " ");
    } else {
      setNewMessage((prev) => (prev ? prev + " " + tag + " " : tag + " "));
    }
    setShowTagMenu(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] min-h-[500px] flex-col items-center justify-center rounded-lg border border-white/10 bg-[var(--color-bg-glass,rgba(18,18,24,0.45))]">
        <div className="h-6 w-6 animate-spin rounded-lg border-2 border-white/10 border-t-cyan-400" />
        <p className="mt-3">Loading chat...</p>
      </div>
    );
  }

  if (!chatEnabled) {
    return (
      <div className="group relative flex h-[320px] flex-col overflow-hidden border border-black/10 bg-white text-black">
        <div className="relative z-10 flex items-center justify-between border-b border-black/10 bg-gray-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 text-lg opacity-50">
              💬
            </div>
            <div>
              <h3 className="text-black">Passenger Lounge</h3>
              <span className="r text-black/40">Chat Temporarily Disabled</span>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <span className="mb-2 text-3xl opacity-40">🔒</span>
          <h4 className="mb-1 text-black/60">Chat is Currently Offline</h4>
          <p className="max-w-[260px] text-black/40">
            The lounge chat has been temporarily paused by crew moderators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="cruise-chat-root"
      data-lenis-prevent
      style={{
        backgroundColor: "var(--chat-box-bg, transparent)",
      }}
      className={`flex h-[750px] min-h-[600px] flex-col overflow-hidden transition-all duration-300 ${className}`}
    >
      {showHeader && (
        <div className="relative z-10 flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="flex items-center gap-1.5">Passenger Lounge</h3>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-lg bg-emerald-500" />
                <span className="r text-[12px] text-emerald-400">
                  {onlineUsers.length > 0
                    ? `${onlineUsers.length} Online`
                    : "Cruisers Online"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isSignedIn ? (
        /* ── GUEST LOCKED CHAT PANEL ── */
        <div className="flex flex-1 flex-col items-center justify-center space-y-6 bg-[#07040d]/90 p-6 text-center">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full border border-purple-500/40 bg-gradient-to-tr from-purple-600/30 to-pink-600/30 text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <MessageSquare className="h-8 w-8" />
          </div>

          <div className="max-w-xs space-y-2">
            <h3>Join the Live Chat</h3>
            <p className=" ">
              Sign in or register as a 7th Heaven fan, crew member, or admin to
              participate in live stream chat and setlist voting!
            </p>
          </div>

          <div className="flex w-full max-w-xs flex-col gap-2.5 pt-2">
            <SeventhButton
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("open-auth-modal", {
                    detail: { mode: "signup" },
                  }),
                );
              }}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/25 py-3"
            >
              Sign Up as a Fan
            </SeventhButton>

            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("open-auth-modal", {
                    detail: { mode: "login" },
                  }),
                );
              }}
              className="w-full cursor-pointer rounded-lg border border-white/10 bg-[#00000029] py-2.5 transition-all hover:bg-white/10 hover:text-white"
            >
              Sign In to Account
            </button>
          </div>
        </div>
      ) : (
        <>
          {member?.is_warned && (
            <div className="relative z-10 flex shrink-0 animate-[slideDown_0.3s_ease-out] items-start gap-2.5 border-b border-purple-500/30 bg-purple-600/15 px-3 py-2">
              <span className="shrink-0 text-purple-300">⚠️</span>
              <div className="flex-1">
                <h4>Warning Alert</h4>
                <p className="text-amber-100/90">
                  You have been warned by a moderator for inappropriate
                  behavior. Please follow the PG-13 guidelines.
                </p>
              </div>
            </div>
          )}

          {member?.is_banned && (
            <div className="relative z-10 flex shrink-0 animate-[slideDown_0.3s_ease-out] items-start gap-2.5 border-b border-red-500/30 bg-red-500/15 px-3 py-2">
              <span className="shrink-0 text-red-400">🚫</span>
              <div className="flex-1">
                <h4 className="text-red-400/80">Banned Alert</h4>
                <p className="text-red-100/90">
                  You have been permanently banned from sending messages in this
                  chat.
                </p>
              </div>
            </div>
          )}

          {/* Scrollable Message List Container with Fixed Pure Glass Blur Clipping Mask */}
          <div className="relative flex min-h-0 flex-1 flex-col border-t border-r border-l border-white/10">
            {/* Fixed Top Pure Glass Blur with Transparent Clipping Mask (No Dark Tint) */}

            <div
              ref={chatContainerRef}
              data-lenis-prevent
              style={{ gap: "var(--chat-message-spacing, 13px)" }}
              className="relative flex min-h-0 flex-1 scrollbar-thin scrollbar-thumb-purple-500/40 flex-col overflow-y-auto overscroll-contain px-3 py-3 hover:scrollbar-thumb-purple-500/70"
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-white/20">
                  <span className="mb-2 text-3xl opacity-50">👋</span>
                  <p>Welcome to the lounge</p>
                  <p className="max-w-[200px] text-center">
                    Say hi to your fellow passengers or tag @admin to ask a
                    question!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSystem = msg.sender_role === "system";
                  if (isSystem) {
                    const isWarning =
                      msg.content.includes("Warning") ||
                      msg.content.includes("warned");
                    const isBan = msg.content.includes("banned");
                    const bgClass = isWarning
                      ? "bg-purple-600/10  border-white/10  text-purple-100"
                      : isBan
                        ? "bg-red-500/10 border-red-500/20 text-red-200"
                        : "bg-sky-500/10 border-sky-500/20 text-sky-200";
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-center gap-2 rounded-lg border p-2.5 ${bgClass} animate-[slideIn_0.3s_ease-out]`}
                      >
                        <span className="shrink-0">
                          {msg.sender_avatar || "🛡️"}
                        </span>
                        <div className="flex-1">{msg.content}</div>
                        <span className="ml-2 shrink-0 text-[var(--font-size-2xs)] opacity-40">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  }

                  const isSelf =
                    member?.name && msg.sender_name === member.name;
                  const hasAdminTag = isQuestionForAdmin(msg.content);

                  return (
                    <div
                      key={msg.id}
                      className="group relative flex animate-[slideIn_0.3s_ease-out] items-start gap-2.5 py-0.5"
                    >
                      <div className="relative shrink-0">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-purple-500/30 to-purple-800/20">
                          {(msg.sender_avatar || msg.sender_name || "FN")
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                        {(msg.sender_role === "crew" ||
                          msg.sender_role === "admin") && (
                          <span className="absolute -right-1 -bottom-1 rounded-full border border-purple-400/50 bg-purple-600/70 px-1.5 py-0.5 text-[7px] text-purple-200 backdrop-blur-sm">
                            {msg.sender_role === "admin" ? "ADMIN" : "CREW"}
                          </span>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col items-start">
                        <div className="mb-1 flex w-full flex-wrap items-center gap-2">
                          <span
                            className={`${getNameColor(msg.sender_role, msg.sender_name)}`}
                          >
                            {msg.sender_name}
                          </span>
                          <span className="rounded-full border border-white/10 px-2 py-1 text-[12px]">
                            {msg.sender_role === "fan"
                              ? "Cruise Member"
                              : msg.sender_role}
                          </span>
                          {hasAdminTag && (
                            <span className="flex animate-pulse items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[12px]">
                              👑 Question for Admin
                            </span>
                          )}
                          <span className="ml-auto">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
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
                          className="w-fit max-w-[85%] break-words transition-all"
                        >
                          {formatMessageContent(msg.content)}
                        </div>
                      </div>

                      {isCrewOrAdmin &&
                        msg.sender_role !== "crew" &&
                        msg.sender_role !== "admin" && (
                          <div className="absolute top-2 right-2 z-20 flex items-center gap-1 rounded-lg border border-white/10 bg-black/90 p-1 opacity-0 backdrop-blur-[45px] transition-opacity group-hover:opacity-100">
                            <button
                              aria-label="Warn User"
                              onClick={() => handleWarn(msg.sender_name)}
                              title="Warn User"
                              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-amber-400 transition hover:bg-amber-500/20"
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                            </button>
                            <button
                              aria-label="Ban User"
                              onClick={() => handleBan(msg.sender_name)}
                              title="Ban User"
                              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-red-400 transition hover:bg-red-500/20"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                            <button
                              aria-label="Delete Message"
                              onClick={() => handleDeleteMsg(msg.id)}
                              title="Delete Message"
                              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-white/50 transition hover:bg-white/10 hover:text-white"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              aria-label="Remove Fan Completely"
                              onClick={() => handleKick(msg.sender_name)}
                              title="Remove Fan Completely"
                              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-rose-400 transition hover:bg-rose-500/20"
                            >
                              <LogOut className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="relative shrink-0">
            {showTagMenu && (
              <div className="absolute right-0 bottom-full left-0 z-30 mb-2 animate-[slideUp_0.15s_ease-out] border border-purple-500/40 bg-[#0f0e1d] p-2">
                <div className="text-purple-400px-2 flex items-center justify-between py-1">
                  <span>Tag Admin / Crew Member</span>
                  <button
                    onClick={() => setShowTagMenu(false)}
                    className="text-white/40 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {TAG_SUGGESTIONS.map((s) => (
                    <button
                      key={s.tag}
                      type="button"
                      onClick={() => insertTag(s.tag)}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#00000029] px-2.5 py-1.5 text-left transition-colors hover:border-purple-500/40 hover:bg-cyan-500/20"
                    >
                      <span>{s.icon}</span>
                      <div className="truncate">
                        <span>{s.tag}</span>
                        <span className="block truncate text-white/40">
                          {s.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showEmojiPicker && (
              <div className="absolute right-0 bottom-full z-30 mb-2 w-64 animate-[slideUp_0.15s_ease-out] border border-black/15 bg-white p-2.5">
                <div className="mb-1.5 flex items-center justify-between px-1 text-[10px] text-black/40">
                  <span>Quick Emojis</span>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-black/30 hover:text-black"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {CHAT_EMOJIS.map((emoji) => (
                    <button
                      aria-label="Previous"
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewMessage((prev) => prev + emoji);
                      }}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-lg transition-colors hover:bg-black/5 active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isArchived ? (
            <div className="flex w-full items-center justify-center gap-2 border border-white/10 bg-[var(--color-bg-card)] px-4 py-3 text-center text-white/40">
              <span>🔒</span> This cruise chat has been archived.
            </div>
          ) : (
            <ChatInputBar
              value={newMessage}
              onChange={(val) => {
                setNewMessage(val);
                if (
                  val.endsWith("@") ||
                  (val.includes("@") &&
                    !showTagMenu &&
                    val.split("@").pop()!.length < 8)
                ) {
                  setShowTagMenu(true);
                }
              }}
              onSubmit={handleSend}
              disabled={!member || isSending || member.is_banned}
              placeholder={
                member
                  ? member.is_banned
                    ? "Banned from chat"
                    : "Type a message..."
                  : "Log in to chat"
              }
              maxLength={500}
              showEmojiBtn
              onEmojiToggle={() => {
                setShowEmojiPicker(!showEmojiPicker);
                if (showTagMenu) setShowTagMenu(false);
              }}
              showAtBtn
              onAtToggle={() => {
                setShowTagMenu(!showTagMenu);
                if (showEmojiPicker) setShowEmojiPicker(false);
              }}
              showRulesFooter
              onAdminTag={() => insertTag("@admin")}
            />
          )}
        </>
      )}
    </div>
  );
}
