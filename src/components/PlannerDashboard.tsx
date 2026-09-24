/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  FileText,
  Check,
  CheckSquare,
  Square,
  PartyPopper,
  Lightbulb,
  History,
  Calendar,
  MapPin,
  Clock,
  Navigation,
  Phone,
  Mail,
  User,
  Sliders,
  PhoneCall,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useMember } from "@/context/MemberContext";
import { SquishyToggle } from "@/components/SquishyToggle";
import SeventhButton from "@/components/SeventhButton";
import { SectionBadge } from "@/components/SectionBadge";

interface BookingData {
  id: string;
  eventName: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  venueCity: string;
  venueState: string;
  indoorOutdoor: string;
  expectedAttendance: string;
  organization: string;
  status: "pending" | "confirmed" | "cancelled";
  cancelledAt?: string;
  soundSystem?: string;
  stageAvailable?: string;
  loadInTime?: string;
  parkingAddress?: string;
  parkingNotes?: string;
  notes?: string;
  name?: string;
  email?: string;
  phone?: string;
  budget?: string;
  backlineProvided?: string;
  ageRestriction?: string;
  details?: string;
}

const defaultBooking: BookingData = {
  id: "7H-BK-8921",
  eventName: "Mainstage Festival Event",
  eventType: "unplugged",
  date: "Thu, Aug 6, 2026",
  startTime: "7:00 PM",
  endTime: "10:30 PM",
  venueName: "Bridges Scoreboard",
  venueCity: "Chicago",
  venueState: "IL",
  indoorOutdoor: "Outdoor",
  expectedAttendance: "250",
  organization: "Scoreboard Entertainment",
  status: "confirmed",
  name: "Event Planner",
  email: "planner@7thheavenband.com",
  phone: "(847) 555-0199",
  soundSystem: "Yes — full PA system",
  stageAvailable: "Yes",
  loadInTime: "3:00 PM",
  parkingAddress: "980 S Bartlett Rd, Lot B",
  parkingNotes:
    "Band bus & crew truck park in West Lot behind stage. Enter through Gate 4 off Bartlett Rd.",
};

const pendingBooking: BookingData = {
  id: "7H-BK-9204",
  eventName: "Lakefront Summer Bash",
  eventType: "full_band",
  date: "Sat, Sep 12, 2026",
  startTime: "6:00 PM",
  endTime: "11:00 PM",
  venueName: "Navy Pier Grand Ballroom",
  venueCity: "Chicago",
  venueState: "IL",
  indoorOutdoor: "Indoor",
  expectedAttendance: "500",
  organization: "Lakefront Events Co.",
  status: "pending",
  name: "Event Planner",
  email: "planner@7thheavenband.com",
  phone: "(847) 555-0199",
  soundSystem: "",
  stageAvailable: "",
  loadInTime: "",
};

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    text: string;
    bar: string;
  }
> = {
  pending: {
    label: "Pending Review",
    color: "purple",
    bg: "bg-purple-600/10",
    border: "border- purple-white/20",
    text: "text-purple-300",
    bar: "bg-purple-600",
  },
  confirmed: {
    label: "Confirmed",
    color: "purple",
    bg: "bg-[var(--color-accent)]/10",
    border: "border-[var(--color-accent)]/30",
    text: "text-[var(--color-accent)]",
    bar: "bg-[var(--color-accent)]",
  },
  cancelled: {
    label: "Cancelled",
    color: "rose",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    text: "text-rose-500",
    bar: "bg-rose-500",
  },
};

const rebookUrl = (b: BookingData, member?: any) => {
  const p = new URLSearchParams();
  p.set("from", "rebook");
  p.set("organization", b.organization || "Scoreboard Entertainment");
  p.set("venueName", b.venueName || "Bridges Scoreboard");
  p.set("venueCity", b.venueCity || "Chicago");
  p.set("venueState", b.venueState || "IL");
  p.set("eventType", b.eventType || "unplugged");
  p.set("indoorOutdoor", b.indoorOutdoor || "Outdoor");
  p.set("expectedAttendance", b.expectedAttendance || "250");

  const contactName = b.name || member?.name || "Event Planner";
  const contactEmail = b.email || member?.email || "planner@7thheavenband.com";
  const contactPhone = b.phone || member?.phone || "(847) 555-0199";

  if (contactName) p.set("name", contactName);
  if (contactEmail) p.set("email", contactEmail);
  if (contactPhone) p.set("phone", contactPhone);

  if (b.soundSystem) p.set("soundSystem", b.soundSystem);
  if (b.stageAvailable) p.set("stageAvailable", b.stageAvailable);
  if (b.loadInTime) p.set("loadInTime", b.loadInTime);
  if (b.budget) p.set("budget", b.budget);
  if (b.backlineProvided) p.set("backlineProvided", b.backlineProvided);
  if (b.ageRestriction) p.set("ageRestriction", b.ageRestriction);
  if (b.details) p.set("details", b.details);
  if (b.parkingAddress) p.set("parkingAddress", b.parkingAddress);
  if (b.parkingNotes) p.set("parkingNotes", b.parkingNotes);
  return `/book?${p.toString()}`;
};

const eventTypeLabels: Record<string, string> = {
  full_band: "Full Band Show",
  unplugged: "Unplugged Acoustic Set",
  private: "Private Event",
  custom: "Custom Booking",
};

export default function PlannerDashboard() {
  const { member, isLoggedIn, hydrated, openModal, login } = useMember();
  const [mounted, setMounted] = useState(false);
  const [booking, setBooking] = useState<BookingData>(defaultBooking);
  const [allBookings, setAllBookings] = useState<BookingData[]>([
    defaultBooking,
    pendingBooking,
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<BookingData>(defaultBooking);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reviveTimeLeft, setReviveTimeLeft] = useState<string | null>(null);
  const [plannerNotes, setPlannerNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [activeContactFilter, setActiveContactFilter] = useState<string>("all");
  const REVIVE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

  // Planner login state
  const [plannerEmail, setPlannerEmail] = useState("");
  const [plannerPassword, setPlannerPassword] = useState("");
  const [plannerName, setPlannerName] = useState("");
  const [plannerLoginError, setPlannerLoginError] = useState("");
  const [plannerLoginLoading, setPlannerLoginLoading] = useState(false);
  const [plannerAgeConfirmed, setPlannerAgeConfirmed] = useState(false);
  const [plannerMode, setPlannerMode] = useState<"login" | "signup">("login");

  const handlePlannerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlannerLoginError("");
    setPlannerLoginLoading(true);
    try {
      const storedAccountsStr =
        localStorage.getItem("7h_accounts_v1") ||
        localStorage.getItem("7h_accounts");
      const accounts = JSON.parse(storedAccountsStr || "{}");
      if (plannerMode === "signup") {
        // Create planner account in localStorage
        if (!plannerName.trim()) {
          setPlannerLoginError("Name is required.");
          return;
        }
        if (!plannerAgeConfirmed) {
          setPlannerLoginError(
            "You must confirm you are over 18 years old to sign up.",
          );
          return;
        }
        if (accounts[plannerEmail.toLowerCase()]) {
          setPlannerLoginError(
            "An account with this email already exists. Try signing in.",
          );
          return;
        }
        accounts[plannerEmail.toLowerCase()] = {
          id: crypto.randomUUID(),
          name: plannerName.trim(),
          email: plannerEmail.toLowerCase(),
          joinDate: new Date().toISOString(),
          avatar: plannerName
            .trim()
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase(),
          points: 0,
          tier: "Bronze",
          showsAttended: 0,
          favoriteVenues: [],
          notificationsEnabled: false,
          notificationRadius: 25,
          role: "event_planner",
        };
        localStorage.setItem("7h_accounts_v1", JSON.stringify(accounts));
      }

      const ok = await login(plannerEmail, plannerPassword);
      if (!ok) {
        setPlannerLoginError(
          plannerMode === "signup"
            ? "Account created but login failed. Try signing in."
            : "No account found. Create one below.",
        );
      } else {
        // Verify they have the right role
        const acct = accounts[plannerEmail.toLowerCase()];
        if (acct && acct.role !== "event_planner") {
          setPlannerLoginError("This account is not an Event Planner account.");
        }
      }
    } finally {
      setPlannerLoginLoading(false);
    }
  };

  const fetchBookings = useCallback(async () => {
    try {
      const stored =
        localStorage.getItem("7h_member_v1") ||
        localStorage.getItem("7h_member");
      const email = stored ? JSON.parse(stored).email : null;
      if (!email) return;
      const res = await fetch(
        `/api/booking?email=${encodeURIComponent(email)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: BookingData[] = data.map((item: any) => ({
            id: item.bookingId || item.booking_id || defaultBooking.id,
            eventName: item.eventType
              ? eventTypeLabels[item.eventType] || item.eventType
              : defaultBooking.eventName,
            eventType: item.eventType || defaultBooking.eventType,
            date: item.eventDate || item.event_date || defaultBooking.date,
            startTime:
              item.startTime || item.start_time || defaultBooking.startTime,
            endTime: item.endTime || item.end_time || defaultBooking.endTime,
            venueName:
              item.venueName || item.venue_name || defaultBooking.venueName,
            venueCity:
              item.venueCity || item.venue_city || defaultBooking.venueCity,
            venueState:
              item.venueState || item.venue_state || defaultBooking.venueState,
            indoorOutdoor:
              item.indoorOutdoor ||
              item.indoor_outdoor ||
              defaultBooking.indoorOutdoor,
            expectedAttendance:
              item.expectedAttendance ||
              item.expected_attendance ||
              defaultBooking.expectedAttendance,
            organization: item.organization || defaultBooking.organization,
            status: item.status || defaultBooking.status,
            cancelledAt: item.cancelledAt || item.cancelled_at,
            soundSystem: item.soundSystem || item.sound_system || "",
            stageAvailable: item.stageAvailable || item.stage_available || "",
            loadInTime: item.loadInTime || item.load_in_time || "",
            notes: item.details || item.notes || "",
          }));
          const statusOrder: Record<string, number> = {
            confirmed: 1,
            pending: 2,
            cancelled: 3,
          };
          const sorted = mapped.sort(
            (a, b) =>
              (statusOrder[a.status] || 9) - (statusOrder[b.status] || 9),
          );
          setAllBookings(sorted);
          // Active booking = confirmed booking first, or most recent non-cancelled, or first
          const active =
            sorted.find((b) => b.status === "confirmed") ||
            sorted.find((b) => b.status !== "cancelled") ||
            sorted[0];
          setBooking(active);
          setEditDraft(active);
          setPlannerNotes(active.notes || "");
        }
      }
    } catch (e) {
      console.error("Failed to fetch bookings:", e);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchBookings();
  }, [fetchBookings]);

  // Revive countdown timer
  useEffect(() => {
    if (booking.status !== "cancelled") {
      setReviveTimeLeft(null);
      return;
    }

    // Backfill cancelledAt for legacy cancelled bookings
    if (!booking.cancelledAt) {
      setBooking((prev) => ({
        ...prev,
        cancelledAt: new Date().toISOString(),
      }));
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - new Date(booking.cancelledAt!).getTime();
      const remaining = REVIVE_WINDOW_MS - elapsed;
      if (remaining <= 0) {
        setReviveTimeLeft(null);
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setReviveTimeLeft(`${mins}m ${secs.toString().padStart(2, "0")}s`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [booking.status, booking.cancelledAt, REVIVE_WINDOW_MS]);

  // Developer Bypass Check — allows viewing the dashboard UI for dev work
  const isDevBypass =
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development" &&
    localStorage.getItem("7h_dev_bypass") === "true";
  // Footer link uses ?login=true to force showing the login form
  const forceLogin =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("login") === "true";
  const hasAccess =
    (!forceLogin && isDevBypass) ||
    (isLoggedIn && member?.role === "event_planner");
  const isSignedInPlanner = hasAccess;

  if (!mounted || !hydrated) return null;

  if (!hasAccess) {
    return (
      <main
        id="planner-portal-auth"
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
      >
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[var(--color-accent)] opacity-[0.03] blur-[120px]" />

        <div className="relative z-10 w-full max-w-md">
          <div className="overflow-hidden border border-white/10 bg-[var(--color-bg-surface)]">
            <div className="h-px bg-[var(--color-accent)]/40" />

            <div className="p-10">
              <div className="mb-10 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10">
                  <ClipboardList className="h-6 w-6 text-[var(--color-accent)]" />
                </div>
                <h1>
                  Planner{" "}
                  <span className="text-[var(--color-accent)]">Portal</span>
                </h1>
                <p className="mt-2">Event planner accounts only</p>
              </div>

              <form
                onSubmit={handlePlannerLogin}
                className="flex flex-col gap-4"
              >
                {plannerMode === "signup" && (
                  <div>
                    <label
                      htmlFor="planner-full-name"
                      className="mb-2 block text-white/40"
                    >
                      Full Name
                    </label>
                    <input
                      id="planner-full-name"
                      type="text"
                      value={plannerName}
                      onChange={(e) => setPlannerName(e.target.value)}
                      placeholder="e.g. Sarah Mitchell"
                      className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]/50"
                      required
                    />
                  </div>
                )}
                <div>
                  <label
                    htmlFor="planner-login-email"
                    className="mb-2 block text-white/40"
                  >
                    Email
                  </label>
                  <input
                    id="planner-login-email"
                    type="email"
                    value={plannerEmail}
                    onChange={(e) => setPlannerEmail(e.target.value)}
                    placeholder="planner@company.com"
                    className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]/50"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="planner-login-password"
                    className="mb-2 block text-white/40"
                  >
                    Password
                  </label>
                  <input
                    id="planner-login-password"
                    type="password"
                    value={plannerPassword}
                    onChange={(e) => setPlannerPassword(e.target.value)}
                    placeholder="••••••••"
                    className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]/50"
                    required
                  />
                </div>

                {plannerMode === "signup" && (
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPlannerAgeConfirmed(!plannerAgeConfirmed);
                      }
                    }}
                    className="my-1.5 flex cursor-pointer items-center gap-2.5 select-none"
                    onClick={() => setPlannerAgeConfirmed(!plannerAgeConfirmed)}
                  >
                    <SquishyToggle
                      id="planner-age-confirm-toggle"
                      label="I confirm that I am 18 years of age or older"
                      checked={plannerAgeConfirmed}
                      onChange={setPlannerAgeConfirmed}
                    />
                    <span className="text-[var(--font-size-2xs)] text-white/70">
                      I confirm that I am <span>18 years of age or older</span>
                    </span>
                  </div>
                )}

                {plannerLoginError && (
                  <p className="border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-rose-400">
                    {plannerLoginError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={plannerLoginLoading}
                  className="w-full cursor-pointer bg-[var(--color-accent)] py-3.5 shadow-[0_0_20px_rgba(217,70,239,0.2)] transition-colors hover:bg-[var(--color-accent)] disabled:opacity-50"
                >
                  {plannerLoginLoading
                    ? "Authenticating..."
                    : plannerMode === "signup"
                      ? "Create Planner Account"
                      : "Sign In as Planner"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPlannerMode((m) => (m === "login" ? "signup" : "login"));
                    setPlannerLoginError("");
                  }}
                  className="cursor-pointer text-[var(--color-accent)]/60 transition-colors"
                >
                  {plannerMode === "login"
                    ? "Need an account? Create one"
                    : "Already have an account? Sign in"}
                </button>
              </form>

              <p className="mt-8 text-center">
                7th Heaven · Event Planning Portal
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const handleEditStart = () => {
    setEditDraft({ ...booking });
    setIsEditing(true);
  };

  const handleEditSave = () => {
    setBooking({ ...editDraft });
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleCancelRequest = async () => {
    setBooking((prev) => ({
      ...prev,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    }));
    setShowCancelConfirm(false);
    // Persist to Supabase
    try {
      await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, status: "cancelled" }),
      });
    } catch {}
  };

  const s = STATUS_CONFIG[booking.status];

  return (
    <>
      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <dialog
          open
          aria-labelledby="cancel-modal-heading"
          className="fixed inset-0 z-50 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-4"
        >
          <button
            type="button"
            aria-label="Close dialog backdrop"
            onClick={() => setShowCancelConfirm(false)}
            className="fixed inset-0 h-full w-full cursor-default border-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-md cursor-auto rounded-lg border border-rose-500/30 bg-[var(--color-bg-surface)] p-8 text-left shadow-[0_0_60px_rgba(244,63,94,0.15)]">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/10">
              <History className="h-5 w-5 text-rose-500" />
            </div>
            <h3 id="cancel-modal-heading" className="mb-2 text-center">
              Cancel This Booking?
            </h3>
            <p className="mb-2 text-center">{booking.eventName}</p>
            <p className="mb-8 text-center">
              This will send a cancellation request to 7th Heaven. You can
              always rebook later.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-[#00000029] py-3 transition-colors hover:bg-white/10"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelRequest}
                className="flex-1 bg-rose-500 py-3 transition-colors hover:bg-rose-600"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* BOOKING CARDS */}
      <section
        aria-label="Active Event Booking Details"
        className="grid grid-cols-1 gap-6"
      >
        <div
          className={`border bg-[var(--color-bg-surface)] ${booking.status === "cancelled" ? "border-rose-500/10 opacity-60" : "border-white/5"} group relative flex flex-col gap-8 overflow-hidden rounded-lg p-6 transition-colors md:p-8 lg:flex-row`}
        >
          <div className={`absolute top-0 left-0 h-full w-1 ${s.bar}`} />

          <div className="flex-1">
            <div className="mb-6 flex items-center gap-3">
              <SectionBadge label={s.label} />
              <span className="text-white/40">ID: {booking.id}</span>
            </div>

            {/* View Mode */}
            {!isEditing ? (
              <>
                <h2
                  className={`mb-2 ${booking.status === "cancelled" ? "line-through opacity-50" : ""}`}
                >
                  {booking.eventName}
                </h2>
                <p className="mb-6">
                  {eventTypeLabels[booking.eventType] || booking.eventType}
                </p>

                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  <div>
                    <p className="mb-1">Date</p>
                    <p>{booking.date}</p>
                  </div>
                  <div>
                    <p className="mb-1">Time Window</p>
                    <p>
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1">Venue</p>
                    <p className="truncate">{booking.venueName}</p>
                  </div>
                  <div>
                    <p className="mb-1">City</p>
                    <p className="truncate">
                      {booking.venueCity}, {booking.venueState}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              /* Edit Mode */
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="planner-edit-event-name"
                    className="mb-1 block text-white/30"
                  >
                    Event Name
                  </label>
                  <input
                    id="planner-edit-event-name"
                    value={editDraft.eventName}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, eventName: e.target.value }))
                    }
                    className="w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-base transition-colors outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <label
                      htmlFor="planner-edit-start-time"
                      className="mb-1 block text-white/30"
                    >
                      Start Time
                    </label>
                    <input
                      id="planner-edit-start-time"
                      value={editDraft.startTime}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          startTime: e.target.value,
                        }))
                      }
                      className="w-full border border-white/10 bg-white/[0.03] px-3 py-2.5 text-base transition-colors outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="planner-edit-end-time"
                      className="mb-1 block text-white/30"
                    >
                      End Time
                    </label>
                    <input
                      id="planner-edit-end-time"
                      value={editDraft.endTime}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, endTime: e.target.value }))
                      }
                      className="w-full border border-white/10 bg-white/[0.03] px-3 py-2.5 text-base transition-colors outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="planner-edit-venue"
                      className="mb-1 block text-white/30"
                    >
                      Venue
                    </label>
                    <input
                      id="planner-edit-venue"
                      value={editDraft.venueName}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          venueName: e.target.value,
                        }))
                      }
                      className="w-full border border-white/10 bg-white/[0.03] px-3 py-2.5 text-base transition-colors outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="planner-edit-attendance"
                      className="mb-1 block text-white/30"
                    >
                      Attendance
                    </label>
                    <input
                      id="planner-edit-attendance"
                      value={editDraft.expectedAttendance}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          expectedAttendance: e.target.value,
                        }))
                      }
                      className="w-full border border-white/10 bg-white/[0.03] px-3 py-2.5 text-base transition-colors outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="planner-edit-city"
                      className="mb-1 block text-white/30"
                    >
                      City
                    </label>
                    <input
                      id="planner-edit-city"
                      value={editDraft.venueCity}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          venueCity: e.target.value,
                        }))
                      }
                      className="w-full border border-white/10 bg-white/[0.03] px-3 py-2.5 text-base transition-colors outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="planner-edit-state"
                      className="mb-1 block text-white/30"
                    >
                      State
                    </label>
                    <input
                      id="planner-edit-state"
                      value={editDraft.venueState}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          venueState: e.target.value,
                        }))
                      }
                      className="w-full border border-white/10 bg-white/[0.03] px-3 py-2.5 text-base transition-colors outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions — require real sign-in */}
          <div className="flex flex-col justify-center gap-3 border-white/10 lg:w-64 lg:border-l lg:pl-8">
            {isSignedInPlanner ? (
              <>
                {isEditing ? (
                  /* Edit mode actions */
                  <>
                    <button
                      onClick={handleEditSave}
                      className="w-full border border-emerald-500/30 bg-emerald-500/10 py-3 transition-colors hover:border-transparent hover:bg-emerald-500 hover:text-white"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="w-full border border-white/5 bg-white/[0.03] py-3 transition-colors hover:bg-white/[0.08]"
                    >
                      Discard
                    </button>
                  </>
                ) : booking.status === "cancelled" ? (
                  /* Cancelled state — rebook or revive */
                  <>
                    <a
                      href={rebookUrl(booking, member)}
                      className="w-full rounded-lg border border-white/10 bg-[var(--color-accent)]/10 py-3 text-center transition-colors hover:border-transparent hover:bg-[var(--color-accent)] hover:text-white"
                    >
                      Rebook This Event
                    </a>
                    {reviveTimeLeft && (
                      <>
                        <button
                          aria-label="Revive booking"
                          onClick={() =>
                            setBooking((prev) => ({
                              ...prev,
                              status: "pending",
                              cancelledAt: undefined,
                            }))
                          }
                          className="w-full border border-purple-500/30 bg-purple-500/10 py-3 transition-colors hover:border-transparent hover:bg-purple-500 hover:text-white"
                        >
                          Revive Booking
                        </button>
                        <p className="text-center">
                          ⏱ Revive expires in{" "}
                          <span className="text-purple-300">
                            {reviveTimeLeft}
                          </span>
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  /* Normal actions */
                  <>
                    <a
                      href={rebookUrl(booking, member)}
                      className="w-full rounded-lg border border-white/10 bg-[var(--color-accent)]/10 py-3 text-center transition-colors hover:border-transparent hover:bg-[var(--color-accent)] hover:text-white"
                    >
                      Rebook This Event
                    </a>
                    <button
                      onClick={handleEditStart}
                      className="w-full border border-white/5 bg-white/[0.03] py-3 transition-colors hover:bg-white/[0.08]"
                    >
                      Edit Logistics
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full py-3 text-rose-400 transition-colors hover:bg-rose-500/10"
                    >
                      Cancel Request
                    </button>
                  </>
                )}
              </>
            ) : (
              <Link
                href="/planner"
                className="flex w-full items-center justify-center gap-2 border border-white/10 bg-white/[0.03] py-3 text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <History className="h-4 w-4" />
                Sign in to manage
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Band & Event Contacts Panel ── */}
      <section aria-label="7th Heaven Band and Event Contacts">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center">
          <div>
            <h3>7th Heaven Band & Event Contacts</h3>
            <p className="mt-0.5">
              Direct contacts for booking, production, hospitality & press
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {(activeContactFilter === "all" ||
            activeContactFilter === "booking") && (
            <div className="flex w-full flex-col items-center text-center">
              <div
                className="relative flex w-full items-end justify-center overflow-hidden"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 75%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 75%, transparent 100%)",
                }}
              >
                <Image
                  width={400}
                  height={400}
                  unoptimized
                  src="/images/contact/Dickie-contact.png"
                  alt="Richard Hofherr"
                  className="h-full w-full origin-bottom object-contain object-bottom"
                />
              </div>
              <div className="mt-2 flex w-full flex-col items-center text-center">
                <div className="mb-2">
                  <SectionBadge
                    label="BOOKING & MANAGEMENT"
                    isActive={activeContactFilter === "booking"}
                    className="r px-5 py-2 text-[11px] sm:text-xs"
                  />
                </div>
                <h3 className="mb-1 text-xl sm:text-2xl">Richard Hofherr</h3>
                <p className="mb-2 text-sm text-white/70">NTD Management</p>
                <a
                  href="tel:8475515363"
                  className="mb-1 text-base text-[var(--color-accent)] hover:text-white"
                >
                  (847) 551-5363
                </a>
                <a
                  href="mailto:info@NTDManagement.com"
                  className="max-w-full truncate px-2 text-sm hover:text-white"
                >
                  info@NTDManagement.com
                </a>
              </div>
            </div>
          )}

          {(activeContactFilter === "all" ||
            activeContactFilter === "tech") && (
            <div className="flex w-full flex-col items-center text-center">
              <div
                className="relative flex w-full items-end justify-center overflow-hidden"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 75%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 75%, transparent 100%)",
                }}
              >
                <Image
                  width={400}
                  height={400}
                  unoptimized
                  src="/images/contact/Jeff-contact.png"
                  alt="Jeff Dobbs"
                  className="h-full w-full origin-bottom object-contain object-bottom"
                />
              </div>
              <div className="mt-2 flex w-full flex-col items-center text-center">
                <div className="mb-2">
                  <SectionBadge
                    label="TECHNICAL ADVANCE"
                    isActive={activeContactFilter === "tech"}
                    className="r px-5 py-2 text-[11px] sm:text-xs"
                  />
                </div>
                <h3 className="mb-1 text-xl sm:text-2xl">Jeff Dobbs</h3>
                <p className="mb-2 text-sm text-white/70">Production & Sound</p>
                <a
                  href="tel:8477725333"
                  className="mb-1 text-base text-[var(--color-accent)] hover:text-white"
                >
                  (847) 772-5333
                </a>
                <a
                  href="mailto:jeffdobbs64@yahoo.com"
                  className="max-w-full truncate px-2 text-sm hover:text-white"
                >
                  jeffdobbs64@yahoo.com
                </a>
              </div>
            </div>
          )}

          {(activeContactFilter === "all" ||
            activeContactFilter === "non-tech") && (
            <div className="flex w-full flex-col items-center text-center">
              <div
                className="relative flex w-full items-end justify-center overflow-hidden"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 75%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 75%, transparent 100%)",
                }}
              >
                <Image
                  width={400}
                  height={400}
                  unoptimized
                  src="/images/contact/Alan-contact.png"
                  alt="Alan McRae"
                  className="h-full w-full origin-bottom object-contain object-bottom"
                />
              </div>
              <div className="mt-2 flex w-full flex-col items-center text-center">
                <div className="mb-2">
                  <SectionBadge
                    label="NON-TECH ADVANCE"
                    isActive={activeContactFilter === "non-tech"}
                    className="r px-5 py-2 text-[11px] sm:text-xs"
                  />
                </div>
                <h3 className="mb-1 text-xl sm:text-2xl">Alan McRae</h3>
                <p className="mb-2 text-sm text-white/70">NTD Management</p>
                <a
                  href="tel:6308429129"
                  className="mb-1 text-base text-[var(--color-accent)] hover:text-white"
                >
                  (630) 842-9129
                </a>
                <a
                  href="mailto:Alan@NTDManagement.com"
                  className="max-w-full truncate px-2 text-sm hover:text-white"
                >
                  Alan@NTDManagement.com
                </a>
              </div>
            </div>
          )}

          {(activeContactFilter === "all" ||
            activeContactFilter === "press") && (
            <div className="flex w-full flex-col items-center text-center">
              <div
                className="relative flex w-full items-end justify-center overflow-hidden"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 75%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 75%, transparent 100%)",
                }}
              >
                <Image
                  width={400}
                  height={400}
                  unoptimized
                  src="/images/contact/Lenny-contact.png"
                  alt="Lenny Rago"
                  className="h-full w-full origin-bottom object-contain object-bottom"
                />
              </div>
              <div className="mt-2 flex w-full flex-col items-center text-center">
                <div className="mb-2">
                  <SectionBadge
                    label="PRESS & MEDIA"
                    isActive={activeContactFilter === "press"}
                    className="r px-5 py-2 text-[11px] sm:text-xs"
                  />
                </div>
                <h3 className="mb-1 text-xl sm:text-2xl">Lenny Rago</h3>
                <p className="mb-2 text-sm text-white/70">NTD Records</p>
                <a
                  href="tel:8472696200"
                  className="mb-1 text-base text-[var(--color-accent)] hover:text-white"
                >
                  (847) 269-6200
                </a>
                <a
                  href="mailto:LRago@NTDRecords.com"
                  className="max-w-full truncate px-2 text-sm hover:text-white"
                >
                  LRago@NTDRecords.com
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Booking History Timeline ── */}
      {allBookings.length > 1 && (
        <section aria-label="Booking History Timeline">
          <div className="mb-6 flex items-center">
            <div>
              <h3>Booking History</h3>
              <p className="mt-0.5">
                {allBookings.length} total booking
                {allBookings.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-0 bottom-0 left-[5px] w-[1px] bg-white/10" />

            <div className="flex flex-col">
              {allBookings.map((b, i) => {
                const isActive = b.id === booking.id;
                const sc =
                  b.status === "confirmed"
                    ? {
                        dot: "bg-[var(--color-accent)]",
                        border: "border-[var(--color-accent)]/30",
                        bg: "bg-[var(--color-accent)]/10",
                        text: "text-[var(--color-accent)]",
                        label: "Confirmed",
                      }
                    : b.status === "cancelled"
                      ? {
                          dot: "bg-rose-500",
                          border: "border-rose-500/20",
                          bg: "bg-rose-500/5",
                          text: "text-rose-400",
                          label: "Cancelled",
                        }
                      : {
                          dot: "bg-purple-400",
                          border: "border-white/20",
                          bg: "bg-purple-600/10",
                          text: "text-purple-300",
                          label: "Pending",
                        };

                return (
                  <div key={b.id} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div className="z-10 shrink-0">
                      <div
                        className={`h-3 w-3 rounded-full ${sc.dot} ring-4 ring-[#e1e6ff29]`}
                      />
                    </div>

                    {/* Card */}
                    <button
                      onClick={() => {
                        setBooking(b);
                        setEditDraft(b);
                      }}
                      className={`flex-1 cursor-pointer !rounded-none border-b border-white/10 px-5 py-4 text-left transition-colors ${
                        isActive ? `` : ""
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SectionBadge label={sc.label} />
                          <span className="text-white/30">{b.id}</span>
                          {isActive && <SectionBadge label="Active" />}
                        </div>
                      </div>
                      <h4
                        className={`${b.status === "cancelled" ? "text-white/30 line-through" : " "}`}
                      >
                        {b.eventName}
                      </h4>
                      <div className="flex items-center gap-4 text-white/40">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {b.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {b.venueName},{" "}
                          {b.venueCity}
                        </span>
                        {b.startTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {b.startTime}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
