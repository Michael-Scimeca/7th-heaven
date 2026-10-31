"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  XCircle,
  Truck,
  Sparkles,
  Users,
  LayoutList,
  Columns3,
  ExternalLink,
} from "lucide-react";
import SectionBadge from "@/components/SectionBadge";
import { Button } from "@/components/Button";

export type CrmStage =
  | "all"
  | "pending"
  | "proposal_sent"
  | "contract_sent"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface BookingSlot {
  date: string;
  startTime?: string;
  endTime?: string;
  playTime?: string;
  doorsTime?: string;
  eventType?: string;
  customEventType?: string;
  ageRestriction?: string;
  isFestival?: boolean;
  isPrivate?: boolean;
  cover?: string;
  parkingType?: string;
  parkingNotes?: string;
  notes?: string;
  ticketLink?: string;
  mapUrl?: string;
  directionsLink?: string;
}

export interface BookingLead {
  bookingId: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  status: string;
  createdAt?: string;
  created_at?: string;
  venueName?: string;
  venue_name?: string;
  venueAddress?: string;
  venueCity?: string;
  venueState?: string;
  loadInTime?: string;
  load_in_time?: string;
  parkingAccess?: string;
  parking_access?: string;
  bookingSlots?: BookingSlot[];
  slots?: BookingSlot[];
  proposalFee?: number;
  depositStatus?: "unpaid" | "deposit_paid" | "paid_in_full";
  notes?: string;
  [key: string]: any;
}

export interface ClientNoteItem {
  id: string;
  note_text: string;
  author_name: string;
  author_role?: string;
  created_at: string;
}

interface AdminCrmPipelineProps {
  bookings: BookingLead[];
  onUpdateBookingStatus: (bookingId: string, newStatus: string) => Promise<void>;
  onUpdateLoadInTime?: (bookingId: string, email: string, time: string) => Promise<void>;
  updatingBookingId?: string | null;
}

const STAGES: { id: CrmStage; label: string; icon: string; tone: string; badgeClass: string }[] = [
  { id: "all", label: "All Leads", icon: "📋", tone: "neutral", badgeClass: "bg-white/10 text-white" },
  { id: "pending", label: "New Inquiries", icon: "📥", tone: "warning", badgeClass: "bg-amber-500/20 text-amber-300 border border-amber-500/30" },
  { id: "proposal_sent", label: "Proposal Sent", icon: "📄", tone: "info", badgeClass: "bg-purple-500/20 text-purple-300 border border-purple-500/30" },
  { id: "contract_sent", label: "Contract Sent", icon: "✍️", tone: "info", badgeClass: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
  { id: "confirmed", label: "Confirmed / Booked", icon: "✅", tone: "success", badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" },
  { id: "completed", label: "Show Completed", icon: "🎉", tone: "success", badgeClass: "bg-teal-500/20 text-teal-300 border border-teal-500/30" },
  { id: "cancelled", label: "Declined / Cancelled", icon: "❌", tone: "danger", badgeClass: "bg-rose-500/20 text-rose-300 border border-rose-500/30" },
];

export function AdminCrmPipeline({
  bookings,
  onUpdateBookingStatus,
  onUpdateLoadInTime,
  updatingBookingId,
}: AdminCrmPipelineProps) {
  const [activeStage, setActiveStage] = useState<CrmStage>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"pipeline" | "planners">("pipeline");
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

  // CRM Notes State
  const [leadNotes, setLeadNotes] = useState<Record<string, ClientNoteItem[]>>({});
  const [newNoteInput, setNewNoteInput] = useState<Record<string, string>>({});
  const [notesLoading, setNotesLoading] = useState<Record<string, boolean>>({});
  const [noteSaving, setNoteSaving] = useState<Record<string, boolean>>({});

  // Load In editing
  const [loadInValues, setLoadInValues] = useState<Record<string, string>>({});
  const [loadInSavingId, setLoadInSavingId] = useState<string | null>(null);

  // Financial tracking state (saved in localStorage for demonstration / persistence)
  const [financials, setFinancials] = useState<Record<string, { fee?: string; deposit?: string }>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("7h_crm_financials");
      if (saved) setFinancials(JSON.parse(saved));
    } catch {}
  }, []);

  const saveFinancialField = (bookingId: string, key: "fee" | "deposit", value: string) => {
    const next = {
      ...financials,
      [bookingId]: { ...financials[bookingId], [key]: value },
    };
    setFinancials(next);
    try {
      localStorage.setItem("7h_crm_financials", JSON.stringify(next));
    } catch {}
  };

  // Stage count calculations
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: bookings.length };
    STAGES.forEach((s) => {
      if (s.id !== "all") counts[s.id] = 0;
    });
    bookings.forEach((b) => {
      const s = b.status || "pending";
      if (counts[s] !== undefined) counts[s]++;
      else counts.pending = (counts.pending || 0) + 1;
    });
    return counts;
  }, [bookings]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStage =
        activeStage === "all" ? true : (b.status || "pending") === activeStage;
      if (!matchesStage) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = (b.name || "").toLowerCase();
      const org = (b.organization || "").toLowerCase();
      const venue = (b.venueName || b.venue_name || "").toLowerCase();
      const city = (b.venueCity || "").toLowerCase();
      const email = (b.email || "").toLowerCase();
      const bId = (b.bookingId || "").toLowerCase();

      return (
        name.includes(q) ||
        org.includes(q) ||
        venue.includes(q) ||
        city.includes(q) ||
        email.includes(q) ||
        bId.includes(q)
      );
    });
  }, [bookings, activeStage, searchQuery]);

  // Unique Planners Directory grouping
  const uniquePlanners = useMemo(() => {
    const map = new Map<string, { planner: BookingLead; bookings: BookingLead[] }>();
    bookings.forEach((b) => {
      const key = (b.email || b.name || "unknown").toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, { planner: b, bookings: [b] });
      } else {
        map.get(key)!.bookings.push(b);
      }
    });
    return Array.from(map.values());
  }, [bookings]);

  // Fetch client notes for an expanded booking
  const loadNotesForBooking = useCallback(async (bookingId: string) => {
    if (leadNotes[bookingId]) return;
    setNotesLoading((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const pagePath = `crm-booking-${bookingId}`;
      const res = await fetch(`/api/client-notes?pagePath=${encodeURIComponent(pagePath)}`);
      if (res.ok) {
        const data = await res.json();
        setLeadNotes((prev) => ({ ...prev, [bookingId]: data.notes || [] }));
      }
    } catch (err) {
      console.warn("Failed to load CRM notes:", err);
    } finally {
      setNotesLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  }, [leadNotes]);

  const toggleExpand = (bookingId: string) => {
    if (expandedBookingId === bookingId) {
      setExpandedBookingId(null);
    } else {
      setExpandedBookingId(bookingId);
      loadNotesForBooking(bookingId);
    }
  };

  const handleAddNote = async (bookingId: string) => {
    const text = newNoteInput[bookingId]?.trim();
    if (!text) return;
    setNoteSaving((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const notePayload = {
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        page_path: `crm-booking-${bookingId}`,
        element_selector: `#booking-${bookingId}`,
        note_text: text,
        author_name: "Admin Team",
        author_role: "admin",
        status: "submitted",
        x_offset_pct: 0,
        y_offset_pct: 0,
      };

      const res = await fetch("/api/client-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notePayload),
      });

      if (res.ok) {
        setLeadNotes((prev) => ({
          ...prev,
          [bookingId]: [
            ...(prev[bookingId] || []),
            {
              id: notePayload.id,
              note_text: text,
              author_name: "Admin Team",
              author_role: "admin",
              created_at: new Date().toISOString(),
            },
          ],
        }));
        setNewNoteInput((prev) => ({ ...prev, [bookingId]: "" }));
      }
    } catch (err) {
      console.error("Error adding CRM note:", err);
    } finally {
      setNoteSaving((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleSaveLoadIn = async (b: BookingLead) => {
    const val = loadInValues[b.bookingId]?.trim();
    if (!val || !onUpdateLoadInTime) return;
    setLoadInSavingId(b.bookingId);
    try {
      await onUpdateLoadInTime(b.bookingId, b.email, val);
    } finally {
      setLoadInSavingId(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* ── Top Bar: View Mode Switcher & Search ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("pipeline")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              viewMode === "pipeline"
                ? "bg-action text-black font-bold shadow-[0_0_15px_var(--color-action-ring)]"
                : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Columns3 className="h-4 w-4" />
            Lead Pipeline
          </button>
          <button
            type="button"
            onClick={() => setViewMode("planners")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              viewMode === "planners"
                ? "bg-action text-black font-bold shadow-[0_0_15px_var(--color-action-ring)]"
                : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" />
            Planners Directory ({uniquePlanners.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search leads, venue, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full bg-black/40 border border-white/10 pl-9 pr-4 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── View 1: Lead Pipeline Kanban Bar ── */}
      {viewMode === "pipeline" && (
        <div className="flex flex-col gap-6">
          {/* Stage Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            {STAGES.map((stage) => {
              const count = stageCounts[stage.id] || 0;
              const isActive = activeStage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStage(stage.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                    isActive
                      ? "border-action bg-action/15 text-action shadow-[0_0_12px_var(--color-action-ring)]"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span>{stage.icon}</span>
                  <span>{stage.label}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-action text-black" : "bg-white/10 text-zinc-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Leads List */}
          {filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-[var(--radius-box)] border border-white/10 bg-[#2c1238]/30">
              <AlertCircle className="h-10 w-10 text-zinc-500 mb-3" />
              <p className="text-zinc-300 font-semibold mb-1">No leads found in this stage</p>
              <p className="text-xs text-zinc-500">
                {searchQuery ? `No results matching "${searchQuery}"` : "New booking requests will appear here."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredBookings
                .slice()
                .reverse()
                .map((b) => {
                  const isExpanded = expandedBookingId === b.bookingId;
                  const currentStatus = b.status || "pending";
                  const stageObj = STAGES.find((s) => s.id === currentStatus) || STAGES[1];
                  const slots = b.bookingSlots || b.slots || [];
                  const firstSlot = slots[0];
                  const dateStr = firstSlot?.date
                    ? new Date(firstSlot.date + "T12:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Date TBD";
                  const venueTitle = b.venueName || b.venue_name || "Private Venue";
                  const locationCity = b.venueCity ? `${b.venueCity}, ${b.venueState || ""}` : "Location TBD";
                  const notes = leadNotes[b.bookingId] || [];
                  const isUpdating = updatingBookingId === b.bookingId;

                  return (
                    <div
                      key={b.bookingId}
                      className={`flex flex-col rounded-[var(--radius-box)] border transition-all ${
                        isExpanded
                          ? "border-purple-500/40 bg-black/60 shadow-[0_0_25px_rgba(168,85,247,0.12)]"
                          : "border-white/10 bg-black/40 hover:border-white/20"
                      }`}
                    >
                      {/* Summary Row */}
                      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: Lead Identity */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-purple-500/30 bg-purple-950/60 text-purple-300 font-bold text-sm">
                            {b.name ? b.name.substring(0, 2).toUpperCase() : "BK"}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-white text-base truncate">{b.name || "Anonymous Lead"}</span>
                              {b.organization && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-medium">
                                  {b.organization}
                                </span>
                              )}
                              <span className="text-[11px] text-zinc-400 font-mono">#{b.bookingId}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-zinc-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-action" />
                                {dateStr}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-purple-400" />
                                {venueTitle} ({locationCity})
                              </span>
                              {firstSlot?.eventType && (
                                <span className="text-zinc-400">
                                  Format: <strong className="text-zinc-200">{firstSlot.eventType}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Stage Badge & Actions */}
                        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-between md:justify-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${stageObj.badgeClass}`}>
                            {stageObj.icon} {stageObj.label}
                          </span>

                          {/* Quick Stage Transition Dropdown */}
                          <select
                            value={currentStatus}
                            disabled={isUpdating}
                            onChange={(e) => onUpdateBookingStatus(b.bookingId, e.target.value)}
                            aria-label={`Change stage for booking ${b.bookingId}`}
                            className="bg-black/50 border border-white/15 rounded-full px-3 py-1 text-xs text-white focus:outline-none focus:border-action cursor-pointer"
                          >
                            <option value="pending" className="bg-[#210e2a] text-white">📥 New Inquiry</option>
                            <option value="proposal_sent" className="bg-[#210e2a] text-white">📄 Proposal Sent</option>
                            <option value="contract_sent" className="bg-[#210e2a] text-white">✍️ Contract Sent</option>
                            <option value="confirmed" className="bg-[#210e2a] text-white">✅ Confirmed</option>
                            <option value="completed" className="bg-[#210e2a] text-white">🎉 Show Complete</option>
                            <option value="cancelled" className="bg-[#210e2a] text-white">❌ Declined</option>
                          </select>

                          {/* Expand Drawer Button */}
                          <button
                            type="button"
                            onClick={() => toggleExpand(b.bookingId)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            aria-expanded={isExpanded}
                          >
                            <span>{isExpanded ? "Close" : "Details & Notes"}</span>
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* ── Expanded Drawer: Lead CRM Details, Contacts & Activity Log ── */}
                      {isExpanded && (
                        <div className="border-t border-white/10 p-5 bg-[#210e2a]/60 flex flex-col gap-6">
                          {/* 3-Column Quick Specs Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Column 1: Client Contacts */}
                            <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/10 bg-black/30">
                              <span className="text-xs uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-action" />
                                Contact Information
                              </span>
                              <div className="flex flex-col gap-1.5 mt-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-400">Email:</span>
                                  <a
                                    href={`mailto:${b.email}?subject=7th Heaven Booking Inquiry - ${b.bookingId}`}
                                    className="text-action hover:underline truncate max-w-[180px] font-medium"
                                  >
                                    {b.email}
                                  </a>
                                </div>
                                {b.phone && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-zinc-400">Phone:</span>
                                    <a href={`tel:${b.phone}`} className="text-white hover:underline font-mono">
                                      {b.phone}
                                    </a>
                                  </div>
                                )}
                                {b.organization && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-zinc-400">Organization:</span>
                                    <span className="text-white font-medium">{b.organization}</span>
                                  </div>
                                )}
                              </div>

                              {/* Quick Action Links */}
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                                <a
                                  href={`mailto:${b.email}?subject=7th Heaven Performance Proposal`}
                                  className="flex-1 text-center py-1 rounded bg-action/20 text-action hover:bg-action/30 text-[11px] font-bold"
                                >
                                  ✉️ Email Proposal
                                </a>
                                {b.phone && (
                                  <a
                                    href={`sms:${b.phone}`}
                                    className="px-2.5 py-1 rounded bg-white/10 text-white hover:bg-white/20 text-[11px] font-bold"
                                  >
                                    💬 SMS
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Column 2: Venue & Load-in Logistics */}
                            <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/10 bg-black/30">
                              <span className="text-xs uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1.5">
                                <Truck className="h-3.5 w-3.5 text-purple-400" />
                                Venue & Stage Access
                              </span>
                              <div className="flex flex-col gap-1.5 mt-1 text-xs">
                                <div className="text-white font-medium">
                                  {venueTitle}
                                  {b.venueAddress && <span className="block text-zinc-400">{b.venueAddress}</span>}
                                  <span className="text-zinc-400">{locationCity}</span>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                  <span className="text-zinc-400">Load-in Dock:</span>
                                  <span className="text-zinc-200">{b.parkingAccess || b.parking_access || "Standard / TBD"}</span>
                                </div>

                                {/* Official Load-in Time Setter */}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-zinc-400 shrink-0">Official Load-in:</span>
                                  <input
                                    type="text"
                                    placeholder={b.loadInTime || b.load_in_time || "3:00 PM"}
                                    value={loadInValues[b.bookingId] || ""}
                                    onChange={(e) =>
                                      setLoadInValues((prev) => ({ ...prev, [b.bookingId]: e.target.value }))
                                    }
                                    className="w-24 bg-black/60 border border-white/15 rounded px-2 py-0.5 text-xs text-white"
                                  />
                                  {onUpdateLoadInTime && (
                                    <button
                                      type="button"
                                      disabled={loadInSavingId === b.bookingId}
                                      onClick={() => handleSaveLoadIn(b)}
                                      className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold cursor-pointer"
                                    >
                                      {loadInSavingId === b.bookingId ? "..." : "Set"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Column 3: Financials & Deposit Status */}
                            <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/10 bg-black/30">
                              <span className="text-xs uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                                Contract & Financials
                              </span>
                              <div className="flex flex-col gap-2 mt-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-400">Agreed / Proposed Fee:</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-zinc-400">$</span>
                                    <input
                                      type="text"
                                      placeholder="5,000"
                                      value={financials[b.bookingId]?.fee || ""}
                                      onChange={(e) => saveFinancialField(b.bookingId, "fee", e.target.value)}
                                      className="w-20 bg-black/60 border border-white/15 rounded px-2 py-0.5 text-xs text-white text-right font-mono"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-400">Deposit Status:</span>
                                  <select
                                    value={financials[b.bookingId]?.deposit || "unpaid"}
                                    onChange={(e) => saveFinancialField(b.bookingId, "deposit", e.target.value)}
                                    className="bg-black/60 border border-white/15 rounded px-2 py-0.5 text-xs text-white cursor-pointer"
                                  >
                                    <option value="unpaid">⚠️ Unpaid</option>
                                    <option value="deposit_paid">💳 Deposit Received</option>
                                    <option value="paid_in_full">✅ Paid in Full</option>
                                  </select>
                                </div>

                                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
                                  <span>Created:</span>
                                  <span>
                                    {(b.createdAt || b.created_at)
                                      ? new Date((b.createdAt || b.created_at) as string).toLocaleDateString()
                                      : "Recent"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ── CRM Activity Notes Section ── */}
                          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-black/20">
                            <span className="text-xs uppercase tracking-wider font-bold text-zinc-300 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-purple-400" />
                                CRM Internal Notes & History ({notes.length})
                              </span>
                              {notesLoading[b.bookingId] && (
                                <span className="text-[10px] text-zinc-400 font-normal">Loading history...</span>
                              )}
                            </span>

                            {/* Existing notes list */}
                            {notes.length > 0 ? (
                              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                {notes.map((n) => (
                                  <div
                                    key={n.id}
                                    className="p-2.5 rounded-lg border border-white/5 bg-black/40 flex flex-col gap-1 text-xs"
                                  >
                                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                                      <span className="font-semibold text-purple-300">{n.author_name}</span>
                                      <span>{new Date(n.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-zinc-200">{n.note_text}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-zinc-500 italic">
                                No internal activity notes logged yet for this booking.
                              </p>
                            )}

                            {/* Add note input */}
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="text"
                                placeholder="Log contact update, rider check, contract notes..."
                                value={newNoteInput[b.bookingId] || ""}
                                onChange={(e) =>
                                  setNewNoteInput((prev) => ({ ...prev, [b.bookingId]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleAddNote(b.bookingId);
                                }}
                                className="flex-1 bg-black/50 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                              />
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={noteSaving[b.bookingId] || !newNoteInput[b.bookingId]?.trim()}
                                onClick={() => handleAddNote(b.bookingId)}
                              >
                                {noteSaving[b.bookingId] ? "Saving..." : "Add Note"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ── View 2: Planners Directory ── */}
      {viewMode === "planners" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              Aggregated roster of all event coordinators and talent buyers from past and upcoming bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniquePlanners.map(({ planner, bookings: pBookings }) => {
              const activeCount = pBookings.filter((b) => b.status === "confirmed" || b.status === "pending").length;

              return (
                <div
                  key={planner.email || planner.name}
                  className="p-5 rounded-[var(--radius-box)] border border-white/10 bg-black/40 hover:border-purple-500/30 flex flex-col justify-between gap-4 transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-purple-500/30 bg-purple-900/30 text-purple-200 font-bold text-sm">
                      {planner.name ? planner.name.substring(0, 2).toUpperCase() : "PL"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-bold text-white text-base truncate">{planner.name || "Planner"}</h4>
                      {planner.organization && (
                        <span className="text-xs text-zinc-400 font-medium truncate">{planner.organization}</span>
                      )}
                      <span className="text-xs text-action mt-0.5">{pBookings.length} Total Bookings</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-zinc-400 border-t border-white/5 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{planner.email}</span>
                      <a href={`mailto:${planner.email}`} className="text-action hover:underline shrink-0">
                        Email
                      </a>
                    </div>
                    {planner.phone && (
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{planner.phone}</span>
                        <a href={`tel:${planner.phone}`} className="text-zinc-300 hover:underline shrink-0">
                          Call
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="text-zinc-500">{activeCount} Active / In-Flight</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery(planner.email || planner.name);
                        setViewMode("pipeline");
                      }}
                      className="text-action hover:underline font-semibold cursor-pointer"
                    >
                      View in Pipeline →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCrmPipeline;
