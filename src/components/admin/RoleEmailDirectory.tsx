"use client";

import React, { useState, useMemo } from "react";
import SearchInput from "@/components/SearchInput";

export interface RoleUser {
  id: string;
  name: string;
  email: string;
  role: "crew" | "fan" | "cruise" | "planner" | "admin" | "event_planner";
  phone?: string;
  status?: string;
  joinedDate?: string;
}

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
    <div className="py-6 pl-0 bg-transparent border-none space-y-6 text-black font-sans">

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "crew", "fan", "cruise", "planner", "admin"] as const).map(tab => (
            <button aria-label="Action button"
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-none flex items-center gap-2 rounded-lg ${activeTab === tab
                ? "bg-[var(--color-accent)] text-white shadow-md"
                : "bg-[#e1e6ff29]   text-white/70 hover:bg-white/10 hover:text-white"
                }`}
            >
              <span>
                {tab === "all" ? "ALL" : tab === "crew" ? "CREW" : tab === "fan" ? "FANS" : tab === "cruise" ? "CRUISE" : tab === "planner" ? "PLANNERS" : "ADMINS"}
              </span>
              <span className={`px-1.5 py-0.5 rounded-full text-[var(--font-size-3xs)] font-mono font-bold ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'}`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button aria-label="Action button"
            type="button"
            onClick={handleCopyEmails}
            className="px-3.5 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 border-none text-white text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 rounded-lg   whitespace-nowrap"
            title="Copy all email addresses for BCC email dispatch"
          >
            <span></span> {copiedSuccess ? "Copied List!" : `Copy ${filteredUsers.length} Emails`}
          </button>

          <button aria-label="Action button"
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-[#e1e6ff29]   hover:bg-white/10 border-none text-white font-bold uppercase text-xs transition-colors cursor-pointer flex items-center gap-1.5 rounded-lg whitespace-nowrap"
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

      {/* Email Table */}
      <div className="border-none overflow-hidden bg-transparent">
        <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-transparent text-[var(--font-size-3xs)] font-black uppercase tracking-wider text-white/50 sticky top-0 backdrop-blur-md z-10 border-b border-white/10">
                <th className="py-3 pr-4 pl-0">Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="pl-3  text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-white/40 opacity-60 italic font-semibold">
                    No recipients found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-[#e1e6ff29]   transition-colors border-b border-white/10">
                    <td className="py-3 pr-4 pl-0 font-bold text-white">
                      <span>{user.name}</span>
                    </td>
                    <td className="py-3 px-4 text-cyan-300 font-mono text-xs font-extrabold select-all">
                      {user.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[var(--font-size-4xs)] font-black uppercase tracking-wider ${getRoleBadgeStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-white/50 font-semibold">
                      {user.phone || "—"}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <a
                        href={`mailto:${user.email}`}
                        className="px-2.5 py-1 bg-[#e1e6ff29]   hover:bg-white/10 text-white font-extrabold rounded-lg text-[var(--font-size-3xs)] uppercase transition-colors inline-flex items-center gap-1"
                      >
                        Email
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
