"use client";

import React, { useState, useMemo } from "react";

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

export function RoleEmailDirectory({ dynamicUsers = [] }: { dynamicUsers?: any[] }) {
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
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "admin": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "crew": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "cruise": return "bg-sky-500/20 text-sky-300 border-sky-500/30";
      case "planner":
      case "event_planner": return "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30";
      default: return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
  };

  return (
    <div className="p-6 bg-[var(--color-bg-surface)] border-t border-white/5 space-y-6 text-white font-sans">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "crew", "fan", "cruise", "planner", "admin"] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-2 ${
                activeTab === tab
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  : "bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>
                {tab === "all" ? "🌐 ALL" : tab === "crew" ? "👥 CREW" : tab === "fan" ? "⭐ FANS" : tab === "cruise" ? "🚢 CRUISE" : tab === "planner" ? "📋 PLANNERS" : "👑 ADMINS"}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[var(--font-size-3xs)] font-mono text-white">
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyEmails}
            className="px-3.5 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Copy all email addresses for BCC email dispatch"
          >
            <span>📋</span> {copiedSuccess ? "Copied List!" : `Copy ${filteredUsers.length} Emails`}
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>📥</span> Export CSV
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search email directory by name, email, or phone number..."
          className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-500/50"
        />
      </div>

      {/* Email Table */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/30">
        <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.04] border-b border-white/10 text-[var(--font-size-3xs)] font-black uppercase tracking-wider text-white/40 sticky top-0 backdrop-blur-md z-10">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-white/30 italic">
                    No recipients found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-[var(--font-size-3xs)]">
                        {user.name.charAt(0)}
                      </div>
                      <span>{user.name}</span>
                    </td>
                    <td className="py-3 px-4 text-amber-300 font-mono text-xs select-all">
                      {user.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[var(--font-size-4xs)] font-black uppercase tracking-wider border ${getRoleBadgeStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-white/60">
                      {user.phone || "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`mailto:${user.email}`}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-[var(--font-size-3xs)] font-bold uppercase transition-colors inline-flex items-center gap-1"
                      >
                        ✉️ Email
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
