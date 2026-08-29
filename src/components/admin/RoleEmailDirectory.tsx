"use client";

import React, { useState, useMemo } from "react";
import SearchInput from "@/components/SearchInput";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import CustomScrollbar from "@/components/CustomScrollbar";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";

export interface RoleUser {
  id: string;
  name: string;
  email: string;
  role: "crew" | "fan" | "cruise" | "planner" | "admin" | "event_planner";
  phone?: string;
  status?: string;
  joinedDate?: string;
  avatar?: string;
}

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    "from-purple-600 to-indigo-600",
    "from-pink-600 to-rose-600",
    "from-cyan-600 to-blue-600",
    "from-emerald-600 to-teal-600",
    "from-amber-600 to-orange-600",
    "from-violet-600 to-purple-600",
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const resolveMemberAvatar = (name: string, avatar?: string | null): string => {
  if (avatar && avatar.trim() && !avatar.includes('ui-avatars.com')) return avatar;
  const lower = (name || '').toLowerCase();

  if (lower.includes('adam')) return '/images/members/adam.png';
  if (lower.includes('nick')) return '/images/members/nick.png';
  if (lower.includes('mark')) return '/images/members/mark.png';
  if (lower.includes('frankie') || lower.includes('harchut')) return '/images/members/frankie.png';
  if (lower.includes('richard') || lower.includes('hofherr') || lower.includes('dicky')) return '/images/members/dicky.png';

  if (lower.includes('abbie')) return '/images/crew/abbie.png';
  if (lower.includes('al') && lower.includes('hollie')) return '/images/crew/al.png';
  if (lower.includes('andrea')) return '/images/crew/andrea.png';
  if (lower.includes('arjun')) return '/images/crew/arjun.png';
  if (lower.includes('chris')) return '/images/crew/chris.png';
  if (lower.includes('colin') || lower.includes('farrell')) return '/images/crew/chris.png';
  if (lower.includes('daniel')) return '/images/crew/daniel.png';
  if (lower.includes('croke')) return '/images/crew/dave_croke.png';
  if (lower.includes('maas')) return '/images/crew/dave_maas.png';
  if (lower.includes('xu')) return '/images/crew/david_xu.png';
  if (lower.includes('emily')) return '/images/crew/emily.png';
  if (lower.includes('emma')) return '/images/crew/emma.png';
  if (lower.includes('erin')) return '/images/crew/erin.png';
  if (lower.includes('francesca')) return '/images/crew/francesca.png';
  if (lower.includes('john') && lower.includes('wick')) return '/images/crew/john_wick.png';
  if (lower.includes('john')) return '/images/crew/john_doe.png';

  return '';
};

const STATIC_DIRECTORY: RoleUser[] = [
  // Admins
  { id: "adm-1", name: "Michael Scimeca", email: "mikeyscimeca@gmail.com", role: "admin", phone: "630-555-0199", status: "Active", joinedDate: "2024-01-15" },
  { id: "adm-2", name: "Anthony Anatone", email: "anthony@7thheavenband.com", role: "admin", phone: "815-555-0144", status: "Active", joinedDate: "2024-01-15" },
  { id: "adm-3", name: "Mary Grivas", email: "mary@7thheavenband.com", role: "admin", phone: "708-555-0188", status: "Active", joinedDate: "2024-02-01" },

  // Crew
  { id: "crw-1", name: "Mike Scimeca (Crew)", email: "mike@test.com", role: "crew", phone: "630-555-0101", status: "Active", joinedDate: "2024-03-10" },
  { id: "crw-2", name: "Sammy Sound", email: "sammy@7thheavenband.com", role: "crew", phone: "312-555-0122", status: "Active", joinedDate: "2024-03-12" },
  { id: "crw-3", name: "Ryan Lights", email: "ryan@7thheavenband.com", role: "crew", phone: "847-555-0133", status: "Active", joinedDate: "2024-03-15" },
  { id: "crw-4", name: "Abbie Stage", email: "abbie@7thheavenband.com", role: "crew", phone: "630-555-0177", status: "Active", joinedDate: "2024-04-01" },

  // Cruise
  { id: "crs-1", name: "Jennifer Miller", email: "jennifer.m@example.com", role: "cruise", phone: "312-555-9011", status: "Cabin 9122", joinedDate: "2026-05-10" },
  { id: "crs-2", name: "David Thompson", email: "dthompson@example.com", role: "cruise", phone: "815-555-4022", status: "Cabin 8214", joinedDate: "2026-05-12" },
  { id: "crs-3", name: "Sarah Connor", email: "s.connor@example.com", role: "cruise", phone: "708-555-1199", status: "Cabin 1004", joinedDate: "2026-05-18" },

  // Planners
  { id: "pln-1", name: "Chicago Event Manager", email: "planner@test.com", role: "planner", phone: "312-555-8822", status: "Verified Planner", joinedDate: "2025-11-01" },
  { id: "pln-2", name: "Rosemont Special Events", email: "chicago_manager@example.com", role: "planner", phone: "847-555-3311", status: "Verified Planner", joinedDate: "2025-12-05" },

  // Fans
  { id: "fan-1", name: "Jessica Alba (Fan)", email: "jessica.fan@example.com", role: "fan", phone: "630-555-8811", status: "VIP Fan", joinedDate: "2025-08-14" },
  { id: "fan-2", name: "Chris Evans", email: "chris.evans@example.com", role: "fan", phone: "312-555-4433", status: "Gold VIP", joinedDate: "2025-09-20" },
  { id: "fan-3", name: "Amanda Seyfried", email: "amanda.s@example.com", role: "fan", phone: "847-555-2244", status: "Silver Fan", joinedDate: "2025-10-02" },
];

const getRoleBadgeStyle = (role: string) => {
  switch (role) {
    case "admin": return "bg-[var(--color-purple-glow)] text-[var(--color-text-main)] border-[var(--color-border-purple)]";
    case "crew": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    case "cruise": return "bg-sky-500/20 text-sky-300 border-sky-500/30";
    case "planner":
    case "event_planner": return "bg-[var(--color-accent)]  text-[var(--color-accent)] border-[var(--color-accent)]";
    default: return "bg-[var(--color-accent)]  text-[var(--color-accent)] border-[var(--color-accent)]";
  }
};

const EMPTY_DYNAMIC_USERS: any[] = [];

export function RoleEmailDirectory({ dynamicUsers = EMPTY_DYNAMIC_USERS }: { dynamicUsers?: any[] }) {
  const [activeTab, setActiveTab] = useState<"all" | "crew" | "fan" | "cruise" | "planner" | "admin">("all");
  const [search, setSearch] = useState("");
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const combinedUsers = useMemo(() => {
    const formattedDynamic: RoleUser[] = (dynamicUsers || []).map(u => ({
      id: u.id || u.email,
      name: u.name || u.full_name || "User",
      email: u.email || "",
      role: u.role === "event_planner" ? "planner" : (u.role as any) || "fan",
      phone: u.phone || "",
      status: u.status || "Active",
      joinedDate: u.created_at ? u.created_at.split("T")[0] : "Recent",
      avatar: u.avatar || u.avatar_url || "",
    }));

    // Merge static and dynamic, deduplicating by email
    const seenEmails = new Set<string>();
    const result: RoleUser[] = [];

    for (const u of [...formattedDynamic, ...STATIC_DIRECTORY]) {
      if (!u.email) continue;
      const lower = u.email.toLowerCase().trim();
      if (!seenEmails.has(lower)) {
        seenEmails.add(lower);
        result.push(u);
      }
    }
    return result;
  }, [dynamicUsers]);

  // Counts by role
  const counts = useMemo(() => {
    return {
      all: combinedUsers.length,
      crew: combinedUsers.filter(u => u.role === "crew").length,
      fan: combinedUsers.filter(u => u.role === "fan").length,
      cruise: combinedUsers.filter(u => u.role === "cruise").length,
      planner: combinedUsers.filter(u => u.role === "planner" || u.role === "event_planner").length,
      admin: combinedUsers.filter(u => u.role === "admin").length,
    };
  }, [combinedUsers]);

  // Filtered users by tab & search query
  const filteredUsers = useMemo(() => {
    return combinedUsers.filter(u => {
      const matchRole =
        activeTab === "all" ? true :
          activeTab === "planner" ? (u.role === "planner" || u.role === "event_planner") :
            u.role === activeTab;

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q));

      return matchRole && matchSearch;
    });
  }, [combinedUsers, activeTab, search]);

  const handleCopyEmails = () => {
    const emailsList = filteredUsers.map(u => u.email).join(", ");
    navigator.clipboard.writeText(emailsList);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const handleExportCSV = () => {
    const csvContent = "Name,Email,Role,Phone,Status\n" +
      filteredUsers.map(u => `"${u.name}","${u.email}","${u.role}","${u.phone || ''}","${u.status || 'Active'}"`).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `7th_heaven_${activeTab}_emails.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };



  return (
    <div className="py-6 pl-0 bg-transparent border-none space-y-6 text-white font-sans">

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "crew", "fan", "cruise", "planner", "admin"] as const).map(tab => (
            <FoolishShrimpButton
              key={tab}
              isActive={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className="px-3.5 py-2 font-bold uppercase cursor-pointer flex items-center gap-2"
            >
              <span>
                {tab === "all" ? "ALL" : tab === "crew" ? "CREW" : tab === "fan" ? "FANS" : tab === "cruise" ? "CRUISE" : tab === "planner" ? "PLANNERS" : "ADMINS"}
              </span>
              <span className={`px-1.5 py-0.5 rounded-lg font-mono font-bold ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-white/10 text-white'}`}>
                {counts[tab]}
              </span>
            </FoolishShrimpButton>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <CosmicRadialButton
            type="button"
            onClick={handleCopyEmails}
            icon={false}
            className="px-3.5 py-2 font-bold uppercase cursor-pointer whitespace-nowrap"
            title="Copy all email addresses for BCC email dispatch"
          >
            {copiedSuccess ? "Copied List!" : `Copy ${filteredUsers.length} Emails`}
          </CosmicRadialButton>

          <button aria-label="Action button"
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-[#00000029] hover:bg-white/10 border-none text-white font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 rounded-lg whitespace-nowrap"
          >
            <span></span> Export CSV
          </button>
        </div>
      </div>

      {/* Global Search Bar (Max 300px) */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search email directory by name or email..."
        containerClassName="max-w-[300px]"
        ariaLabel="Search email directory"
      />

      {/* Email List Container (Divs) */}
      <div className="border-none overflow-hidden bg-transparent relative">
        <div className="w-full text-left">
          {/* Fixed Header Row */}
          <div className="grid grid-cols-[1.5fr_2.5fr_1fr_1.5fr_1fr] items-center gap-2 py-3 pr-4 pl-2 font-bold uppercase  text-white border-b border-white/10 select-none text-[12px]">
            <div>Name</div>
            <div>Email Address</div>
            <div>Role</div>
            <div>Phone Number</div>
            <div className="text-right">Quick Action</div>
          </div>

          {/* Scrollable Body Rows */}
          <CustomScrollbar height={480} direction="vertical">
            <div className="divide-y divide-white/10">
              {filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-white/40 opacity-60 font-semibold">
                  No recipients found matching your search.
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div key={user.id} className="grid grid-cols-[1.5fr_2.5fr_1fr_1.5fr_1fr] items-center gap-2 py-3 pr-4 pl-2 hover: bg-[#00000029] transition-colors border-b border-white/10">
                    <div className="font-bold text-white truncate flex items-center gap-2.5">
                      {(() => {
                        const avatarSrc = resolveMemberAvatar(user.name, user.avatar);
                        return avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={user.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20 shadow-xs"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className={`w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 flex items-center justify-center text-[10px] font-extrabold text-white uppercase shrink-0 font-sans shadow-xs border border-white/20`}
                          >
                            {getInitials(user.name)}
                          </div>
                        );
                      })()}
                      <span className="truncate">{user.name}</span>
                    </div>
                    <div className="text-white font-mono font-bold select-all truncate">
                      {user.email}
                    </div>
                    <div className="py-1 text-white text-[var(--font-size-4xs)] font-bold rouned-lgtracking-wider">
                      {user.role}
                    </div>
                    <div className="font-mono text-white/50 font-semibold truncate">
                      {user.phone || "—"}
                    </div>
                    <div className="text-right">
                      <a
                        href={`mailto:${user.email}`}
                        className="px-2.5 py-1 bg-[#00000029] border border-white/10 !text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        Email
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CustomScrollbar>
        </div>
        {/* Bottom smooth gradient mask blur overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-5 backdrop-blur-md pointer-events-none z-10 [mask-image:linear-gradient(to_top,black_20%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_20%,transparent_100%)]" />
      </div>
    </div>
  );
}
