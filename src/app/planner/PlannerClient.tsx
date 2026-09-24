/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";
import Link from "next/link";
import {
  useState,
  useEffect,
  useSyncExternalStore,
  useCallback,
  useRef,
} from "react";
import { X } from "lucide-react";
import { useMember } from "@/context/MemberContext";

interface Booking {
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
  soundSystem?: string;
  stageAvailable?: string;
  loadInTime?: string;
  notes?: string;
}

const typeLabels: Record<string, string> = {
  full_band: "Full Band Show",
  unplugged: "Unplugged Acoustic Set",
  private: "Private Event",
  custom: "Custom Booking",
};

export default function PlannerClient() {
  const {
    member,
    isLoggedIn,
    hydrated,
    login,
    signup,
    openModal,
    closeModal,
    isModalOpen,
  } = useMember();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const handleCloseModal = useCallback(() => {
    closeModal();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, [closeModal]);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [editField, setEditField] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"fan" | "crew" | "planner" | "cruise">(
    "planner",
  );

  const urlParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const isDevBypass =
    urlParams?.get("bypass") === "true" || urlParams?.get("demo") === "true";
  const forceLogin = urlParams?.get("login") === "true";
  const hasAccess =
    !forceLogin &&
    (isDevBypass || (isLoggedIn && member?.role === "event_planner"));

  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    if (hydrated && !hasAccess && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      openModal("login", "planner");
    }
  }, [hydrated, hasAccess, openModal]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    setLoginLoading(true);
    try {
      if (mode === "signup") {
        const res = await signup(name, email, password, undefined, undefined);
        if (!res.success) {
          setLoginErr(res.error || "Signup failed");
        } else if (res.confirmationRequired) {
          setLoginErr("CONFIRMATION_REQUIRED");
        }
      } else {
        const ok = await login(email, password);
        if (!ok) {
          setLoginErr("Invalid email or password");
        }
      }
    } catch (err: any) {
      setLoginErr(err.message || "Authentication error");
    } finally {
      setLoginLoading(false);
    }
  };

  const isCancellingRef = useRef(false);

  const handleCancelBooking = async () => {
    if (isCancellingRef.current || !booking) return;
    isCancellingRef.current = true;
    setIsCancelling(true);
    if (!confirm("Cancel this booking?")) {
      isCancellingRef.current = false;
      setIsCancelling(false);
      return;
    }
    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, status: "cancelled" }),
      });
      if (res.ok) {
        setBooking((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
      }
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    } finally {
      isCancellingRef.current = false;
      setIsCancelling(false);
    }
  };

  const loadPlannerBookings = useCallback(async () => {
    const memberEmail =
      member?.email ||
      (() => {
        try {
          const s = localStorage.getItem("7h_member");
          return s ? JSON.parse(s).email : null;
        } catch {
          return null;
        }
      })();
    if (!memberEmail) return;
    try {
      const res = await fetch(
        `/api/booking?email=${encodeURIComponent(memberEmail)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Booking[] = data.map((item: any) => ({
            id: item.bookingId || item.booking_id || "",
            eventName: item.eventType
              ? typeLabels[item.eventType] || item.eventType
              : "",
            eventType: item.eventType || "",
            date: item.eventDate || item.event_date || "",
            startTime: item.startTime || item.start_time || "",
            endTime: item.endTime || item.end_time || "",
            venueName: item.venueName || item.venue_name || "",
            venueCity: item.venueCity || item.venue_city || "",
            venueState: item.venueState || item.venue_state || "",
            indoorOutdoor:
              item.indoorOutdoor || item.indoor_outdoor || "indoor",
            expectedAttendance:
              item.expectedAttendance || item.expected_attendance || "250",
            organization: item.organization || "",
            status: item.status || "pending",
            soundSystem: item.soundSystem || item.sound_system || "",
            stageAvailable: item.stageAvailable || item.stage_available || "",
            loadInTime: item.loadInTime || item.load_in_time || "",
            notes: item.notes || "",
          }));
          setAllBookings(mapped);
          setBooking(mapped[0]);
          setNotes(mapped[0].notes || "");
        }
      }
    } catch {}
  }, [member?.email]);

  useEffect(() => {
    loadPlannerBookings();
  }, [loadPlannerBookings]);

  if (!mounted || !hydrated) return null;

  if (!hasAccess) {
    return (
      <main
        id="planner-portal-page"
        className="relative min-h-screen pt-24 pb-16"
      >
        <div className="site-container mx-auto max-w-4xl space-y-12 px-4">
          {/* Hero Header */}
          <header className="relative overflow-hidden rounded-lg p-8 text-center sm:p-12">
            <div className="relative z-10 mx-auto max-w-2xl space-y-4">
              <h1>
                Planner <span className="text-[#c27aff]">Portal</span>
              </h1>
              <p>
                Manage your event bookings, view contracts, coordinate load-in
                setup times, and communicate directly with 7th Heaven
                management.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => openModal("login", "planner")}
                  className="cursor-pointer rounded-lg bg-[var(--color-accent)] px-8 py-3.5 shadow-[0_0_30px_rgba(194,122,255,0.4)] transition-all duration-200 hover:bg-purple-500 hover:shadow-[0_0_40px_rgba(194,122,255,0.6)]"
                >
                  Sign In to Planner Portal
                </button>
                <button
                  type="button"
                  onClick={() => openModal("signup", "planner")}
                  className="cursor-pointer rounded-lg border border-white/10 bg-white/10 px-8 py-3.5 transition-colors hover:bg-white/20"
                >
                  Create Account
                </button>
              </div>
            </div>
          </header>

          {/* Feature Highlights Grid */}
          <section
            aria-label="Planner Portal Process Highlights"
            className="grid grid-cols-1 gap-6 sm:grid-cols-3"
          >
            {[
              {
                step: "1",
                title: "Submit Request",
                desc: "Fill out event details, venue info, and your preferred date.",
              },
              {
                step: "2",
                title: "We Review",
                desc: "Our team checks availability and confirms logistics.",
              },
              {
                step: "3",
                title: "You're Booked",
                desc: "Get confirmed and manage everything from this dashboard.",
              },
            ].map((item) => (
              <div
                key={`step-anon-${item.step}`}
                className="rounded-lg p-6 text-center"
              >
                <div className="bg- purple-white/20 mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-purple-500/30 text-[#c27aff]">
                  {item.step}
                </div>
                <h4 className="mb-1">{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </section>
        </div>
      </main>
    );
  }

  if (!booking) {
    if (typeof window !== "undefined" && mounted && hydrated) {
      window.location.href = "/book";
    }
    return null;
  }

  const st = booking.status;
  const statusSteps = [
    { label: "Pending", active: st === "pending" || st === "confirmed" },
    { label: "Confirmed", active: st === "confirmed" },
    { label: "Completed", active: false },
  ];
  const checklist = [
    { label: "Event date confirmed", done: !!booking.date, val: booking.date },
    {
      label: "Show time set",
      done: !!(booking.startTime && booking.endTime),
      val:
        booking.startTime && booking.endTime
          ? `${booking.startTime} – ${booking.endTime}`
          : "",
    },
    {
      label: "Venue details",
      done: !!booking.venueName,
      val: booking.venueName,
    },
    {
      label: "Indoor/Outdoor",
      done: !!booking.indoorOutdoor,
      val: booking.indoorOutdoor,
    },
    {
      label: "Load-in time",
      done: !!booking.loadInTime,
      val: booking.loadInTime || "",
    },
    {
      label: "Attendance",
      done: !!booking.expectedAttendance,
      val: booking.expectedAttendance ? `~${booking.expectedAttendance}` : "",
    },
  ];
  const done = checklist.filter((i) => i.done).length;
  const pct = Math.round((done / checklist.length) * 100);
  const pastBookings = allBookings.filter((b) => b.id !== booking.id);
  const statusLabel =
    st === "pending"
      ? "⏳ Pending Review"
      : st === "confirmed"
        ? "✅ Confirmed"
        : "❌ Cancelled";
  const statusColor =
    st === "pending"
      ? "text-purple-300 bg-purple-600/10 border-white/20"
      : st === "confirmed"
        ? "text-emerald-400 bg-emerald-500/10  border-[var(--color-accent)]/30"
        : "text-rose-400 bg-rose-500/10 border-rose-500/20";
  const initials = member?.name
    ? member.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "PL";

  return (
    <main id="planner-portal-dashboard" className="min-h-screen pt-24 pb-16">
      <div className="site-container mx-auto max-w-[1400px]">
        <div className="flex gap-8">
          {/* LEFT SIDEBAR */}
          <aside
            aria-label="Booking Status Sidebar"
            className="hidden w-[220px] shrink-0 lg:block"
          >
            <div className="sticky top-24 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
              <h3 className="mb-8 text-white/50">Booking Status</h3>
              <div className="relative pl-5">
                <div className="absolute top-2 bottom-2 left-[9px] w-[2px] bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-accent)]/30 to-white/5" />
                <div className="flex flex-col gap-10">
                  {statusSteps.map((step, i) => (
                    <div
                      key={step.label}
                      className="relative flex items-center gap-4"
                    >
                      <div
                        className={`z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 ${step.active ? "border-purple-400 bg-purple-600 shadow-[0_0_12px_rgba(255,10,61,0.5)]" : "border-white/10 bg-white/10"}`}
                      >
                        {step.active && (
                          <div className="h-2 w-2 rounded-lg bg-white" />
                        )}
                      </div>
                      <span
                        className={` ${step.active ? " " : "text-white/40"}`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="0 border-t border-white/10 pt-6">
                <p className="mb-2">Booking ID</p>
                <p>{booking.id}</p>
              </div>
              <div className="mt-6">
                <p className="mb-2">Planner</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600">
                    {initials}
                  </div>
                  <span className=" ">{member?.name || "Planner"}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="min-w-0 flex-1">
            {/* Hero Card */}
            <header className="relative mb-6 overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-8">
              <div className="absolute top-0 right-0 h-64 w-64 rounded-lg bg-purple-600/5 blur-[80px]" />
              <div className="relative">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-lg border px-3 py-1 ${statusColor}`}
                    >
                      {statusLabel}
                    </span>
                    <span className="text-white/40">{booking.id}</span>
                  </div>
                  <Link
                    href="/book"
                    className="rounded-lg bg-purple-600 px-4 py-2 transition-colors hover:bg-purple-500"
                  >
                    + New Booking
                  </Link>
                </div>
                <div className="mb-1 flex items-center gap-3">
                  <h1>{booking.eventName}</h1>
                </div>
                <p className="mb-1">
                  {typeLabels[booking.eventType] || booking.eventType}
                </p>
                <p className="mb-6">
                  Booked by <span className=" ">{member?.name}</span>
                </p>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  {[
                    { label: "Date", value: booking.date },
                    {
                      label: "Time",
                      value: `${booking.startTime} – ${booking.endTime}`,
                    },
                    { label: "Venue", value: booking.venueName },
                    {
                      label: "City",
                      value: `${booking.venueCity}, ${booking.venueState}`,
                    },
                  ].map((item, i) => (
                    <div key={item.label}>
                      <p className="mb-1">{item.label}</p>
                      <p>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </header>

            {/* 3-Column Tools */}
            <section
              aria-label="Planner Tools and Readiness Checklist"
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
            >
              {/* Notes */}
              <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>📝</span>
                    <h3>Event Notes</h3>
                  </div>
                  {notesSaved && (
                    <span className="rounded-lg border border-[var(--color-accent)]/30 bg-emerald-500/10 px-2 py-0.5 text-[var(--color-accent)]">
                      ✓ Saved
                    </span>
                  )}
                </div>
                <div className="input-glow-border rounded-xl">
                  <textarea
                    aria-label="Text input"
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setNotesSaved(false);
                    }}
                    placeholder="Parking info, green room needs, AV contact..."
                    rows={5}
                    className="form-input resize-none"
                  />
                </div>
                <button
                  onClick={async () => {
                    setNotesSaving(true);
                    try {
                      await fetch("/api/booking", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ bookingId: booking.id, notes }),
                      });
                      setNotesSaved(true);
                      setTimeout(() => setNotesSaved(false), 3000);
                    } catch {}
                    setNotesSaving(false);
                  }}
                  disabled={notesSaving}
                  className="mt-3 w-full cursor-pointer rounded-lg border border-purple-600/20 bg-purple-600/10 py-2 transition-colors hover:border-transparent hover:bg-purple-600 hover:text-white disabled:opacity-50"
                >
                  {notesSaving ? "Saving..." : "Save Notes"}
                </button>
              </div>

              {/* Checklist — editable */}
              <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <h3>Readiness</h3>
                  </div>
                  <span
                    className={`${pct === 100 ? "text-emerald-400" : "text-white/50"}`}
                  >
                    {done}/{checklist.length}
                  </span>
                </div>
                <div className="mb-6 h-2 w-full overflow-hidden rounded-lg bg-[#00000029]">
                  <div
                    className={`h-full rounded-lg transition-colors ${pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-purple-600" : "bg-rose-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {checklist.map((item, i) => {
                    const fieldMap: Record<string, string> = {
                      "Event date confirmed": "date",
                      "Show time set": "startTime",
                      "Venue details": "venueName",
                      "Indoor/Outdoor": "indoorOutdoor",
                      "Sound system": "soundSystem",
                      "Stage availability": "stageAvailable",
                      "Load-in time": "loadInTime",
                      Attendance: "expectedAttendance",
                    };
                    const fieldKey = fieldMap[item.label] || "";
                    const isEditing = editField === i;
                    return (
                      <div
                        key={item.label}
                        className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${item.done ? "border-emerald-500/10 bg-emerald-500/5" : "border-white/10 bg-[#00000029]"}`}
                      >
                        <span className="shrink-0">
                          {item.done ? "✅" : "⬜"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span
                            className={` ${item.done ? " " : "text-white/40"}`}
                          >
                            {item.label}
                          </span>
                          {isEditing ? (
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                defaultValue={item.val || ""}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const v = (e.target as HTMLInputElement)
                                      .value;
                                    if (v && booking) {
                                      setBooking({
                                        ...booking,
                                        [fieldKey]: v,
                                      } as Booking);
                                      setEditField(null);
                                    }
                                  }
                                }}
                                className="flex-1 rounded border border-white/10 bg-white/10 px-2 py-1 outline-none focus:border-purple-500"
                              />
                              <button
                                aria-label="Save field value"
                                type="button"
                                onClick={(e) => {
                                  const input = e.currentTarget
                                    .previousElementSibling as HTMLInputElement;
                                  if (input?.value && booking) {
                                    setBooking({
                                      ...booking,
                                      [fieldKey]: input.value,
                                    } as Booking);
                                    setEditField(null);
                                  }
                                }}
                                className="cursor-pointer px-1.5 text-[var(--font-size-2xs)]"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditField(null)}
                                className="cursor-pointer px-1 text-[var(--font-size-2xs)] text-white/40"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            item.done &&
                            item.val && (
                              <p className="truncate text-[var(--color-accent)]/60">
                                {item.val}
                              </p>
                            )
                          )}
                        </div>
                        {!isEditing &&
                          (item.done ? (
                            <button
                              type="button"
                              onClick={() => setEditField(i)}
                              className="shrink-0 cursor-pointer text-[var(--font-size-2xs)] text-white/40 transition-colors"
                            >
                              Edit
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditField(i)}
                              className="shrink-0 cursor-pointer rounded border border-purple-500/15 bg-purple-600/10 px-1.5 py-0.5 text-[var(--font-size-2xs)] text-purple-300/50 transition-colors hover:bg-purple-600/20"
                            >
                              NEEDED
                            </button>
                          ))}
                      </div>
                    );
                  })}
                  {done < checklist.length && (
                    <Link
                      href={`/book?from=rebook&eventType=${encodeURIComponent(booking.eventType)}&venueName=${encodeURIComponent(booking.venueName)}&venueCity=${encodeURIComponent(booking.venueCity)}&venueState=${encodeURIComponent(booking.venueState)}`}
                      className="mt-2 rounded-lg border border-purple-500/15 bg-purple-600/5 py-2 text-center text-purple-300/70 transition-colors hover:bg-purple-600/10 hover:text-purple-300"
                    >
                      Fill Missing Details →
                    </Link>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
                <div className="mb-6 flex items-center gap-2">
                  <span>⚡</span>
                  <h3>Quick Actions</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    href={`/book?from=rebook&eventType=${encodeURIComponent(booking.eventType)}&venueName=${encodeURIComponent(booking.venueName)}&venueCity=${encodeURIComponent(booking.venueCity)}&venueState=${encodeURIComponent(booking.venueState)}&indoorOutdoor=${encodeURIComponent(booking.indoorOutdoor)}&expectedAttendance=${encodeURIComponent(booking.expectedAttendance)}`}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-purple-600/20 bg-purple-600/10 px-4 py-3 transition-colors hover:bg-purple-600 hover:text-white"
                  >
                    <span>🔄</span> Rebook This Event
                  </Link>
                  <Link
                    href={`/book?from=rebook&eventType=${encodeURIComponent(booking.eventType)}&venueName=${encodeURIComponent(booking.venueName)}&venueCity=${encodeURIComponent(booking.venueCity)}&venueState=${encodeURIComponent(booking.venueState)}&indoorOutdoor=${encodeURIComponent(booking.indoorOutdoor)}&expectedAttendance=${encodeURIComponent(booking.expectedAttendance)}`}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-[#00000029] px-4 py-3 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <span>✏️</span> Edit Logistics
                  </Link>
                  <a
                    href={`mailto:7thheaven@gmail.com?subject=${encodeURIComponent(`[Booking ${booking.id}] Question about ${booking.eventName}`)}&body=${encodeURIComponent(`Hi 7th Heaven,\n\nRe: ${booking.eventName}\nBooking ID: ${booking.id}\nDate: ${booking.date}\nVenue: ${booking.venueName}\n\nMy question:\n\n`)}`}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-[#00000029] px-4 py-3 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <span>✉️</span> Contact 7th Heaven
                  </a>
                  <button
                    aria-label="Cancel request"
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-rose-500/10 bg-rose-500/5 px-4 py-3 text-rose-400/60 transition-colors hover:bg-rose-500 hover:text-white disabled:opacity-50"
                  >
                    <span>✕</span>{" "}
                    {isCancelling ? "Cancelling..." : "Cancel Request"}
                  </button>
                </div>
              </div>
            </section>

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <section aria-label="Past Event Bookings" className="mt-8">
                <div className="mb-6 flex items-center gap-3">
                  <span>📜</span>
                  <h3>Past Events</h3>
                  <span className="rounded bg-[#00000029] px-2 py-0.5 text-white/50">
                    {pastBookings.length} events
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {pastBookings.map((pb, i) => {
                    const sc =
                      pb.status === "cancelled"
                        ? {
                            dot: "bg-rose-500",
                            text: "text-rose-400",
                            bg: "bg-rose-500/5",
                            border: "border-rose-500/15",
                          }
                        : pb.status === "confirmed"
                          ? {
                              dot: "bg-emerald-500",
                              text: "text-emerald-400",
                              bg: "bg-emerald-500/5",
                              border: "border-emerald-500/15",
                            }
                          : {
                              dot: "bg-purple-500",
                              text: " text-[var(--color-accent)]",
                              bg: "bg-purple-500/5",
                              border: "border-purple-500/15",
                            };
                    return (
                      <article
                        key={pb.id || pb.eventName || pb.date}
                        className="group flex items-center gap-4 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4 transition-colors hover:border-purple-500/30"
                      >
                        <div
                          className={`h-2.5 w-2.5 rounded-lg ${sc.dot} shrink-0`}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate">{pb.eventName}</h4>
                          <div className="mt-0.5 flex items-center gap-3 text-white/50">
                            <span>📅 {pb.date}</span>
                            <span>📍 {pb.venueName}</span>
                            <span>{pb.id}</span>
                          </div>
                        </div>
                        <span
                          className={`text-[var(--font-size-2xs)] ${sc.text} ${sc.bg} rounded border px-2 py-0.5 ${sc.border}`}
                        >
                          {pb.status}
                        </span>
                        <Link
                          href={`/book?from=rebook&eventType=${encodeURIComponent(pb.eventType)}&venueName=${encodeURIComponent(pb.venueName)}&venueCity=${encodeURIComponent(pb.venueCity)}&venueState=${encodeURIComponent(pb.venueState)}&indoorOutdoor=${encodeURIComponent(pb.indoorOutdoor)}&expectedAttendance=${encodeURIComponent(pb.expectedAttendance)}&organization=${encodeURIComponent(pb.organization)}`}
                          className="shrink-0 cursor-pointer rounded-lg border border-purple-600/20 bg-purple-600/10 px-4 py-2 transition-colors hover:border-transparent hover:bg-purple-600 hover:text-white"
                        >
                          Rebook →
                        </Link>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
