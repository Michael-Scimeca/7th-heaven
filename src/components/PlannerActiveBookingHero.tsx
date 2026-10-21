"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Sliders,
  Navigation,
  Bus,
  History,
  Users,
  Radio,
  Volume2,
  Ticket,
  Layers,
  Sparkles,
  Timer,
  Gauge,
  Zap,
  ExternalLink,
} from "lucide-react";
import { SeventhButton } from "@/components/SeventhButton";
import { SectionBadge } from "@/components/SectionBadge";
import Toggle from "@/components/Toggle";
import type { BookingData } from "@/components/PlannerDashboard";
import {
  rebookUrl,
  defaultBooking as fallbackDefaultBooking,
  pendingBooking as fallbackPendingBooking,
} from "@/components/PlannerDashboard";


export type InfoLayoutVariant =
  | "dual-bay"
  | "timeline-tape"
  | "bento"
  | "channel-strip"
  | "compact-hud"
  | "tabbed"
  | "pass"
  | "cue-teleprompter"
  | "blueprint"
  | "capsules";

const INFO_LAYOUTS: { id: InfoLayoutVariant; label: string; tag: string }[] = [
  { id: "dual-bay", label: "1. Dual Bay", tag: "Console" },
  { id: "timeline-tape", label: "2. Timeline Tape", tag: "Sequential" },
  { id: "bento", label: "3. Bento Grid", tag: "Modular" },
  { id: "channel-strip", label: "4. Channel Strip", tag: "SSL Rack" },
  { id: "compact-hud", label: "5. Compact HUD", tag: "Slim Bar" },
  { id: "tabbed", label: "6. Tabbed Console", tag: "Segmented" },
  { id: "pass", label: "7. VIP Tour Pass", tag: "Laminate" },
  { id: "cue-teleprompter", label: "8. Stage Cue", tag: "Broadcast" },
  { id: "blueprint", label: "9. Spec Blueprint", tag: "Technical" },
  { id: "capsules", label: "10. Glass Capsules", tag: "Floating" },
];

export interface PlannerActiveBookingHeroProps {
  booking: BookingData;
  setBooking: React.Dispatch<React.SetStateAction<BookingData>>;
  allBookings?: BookingData[];
  onSelectBooking?: (b: BookingData) => void;
  isEditing: boolean;
  editDraft: BookingData;
  setEditDraft: React.Dispatch<React.SetStateAction<BookingData>>;
  handleEditStart: () => void;
  handleEditSave: () => void;
  handleEditCancel: () => void;
  setShowCancelConfirm: (show: boolean) => void;
  rebookHref: string;
  reviveTimeLeft: string | null;
  isSignedInPlanner: boolean;
  member: any;
  statusConfig: {
    label: string;
    color: string;
  };
  eventTypeLabels: Record<string, string>;
}

export function PlannerActiveBookingHero({
  booking,
  setBooking,
  allBookings,
  onSelectBooking,
  isEditing,
  editDraft,
  setEditDraft,
  handleEditStart,
  handleEditSave,
  handleEditCancel,
  setShowCancelConfirm,
  rebookHref,
  reviveTimeLeft,
  isSignedInPlanner,
  member,
  statusConfig,
  eventTypeLabels,
}: PlannerActiveBookingHeroProps) {
  const [selectedLayout, setSelectedLayout] = useState<InfoLayoutVariant>("dual-bay");
  const [viewMode, setViewMode] = useState<"both" | "single">("both");
  const [activeConsoleTab, setActiveConsoleTab] = useState<"timing" | "audio" | "parking" | "promoter">("timing");
  const [mapViewModes, setMapViewModes] = useState<Record<string, "map" | "satellite" | "radar">>({});

  const confirmedBooking =
    allBookings?.find((b) => b.status === "confirmed") ||
    (booking.status === "confirmed" ? booking : fallbackDefaultBooking);
  const pendingBooking =
    allBookings?.find((b) => b.status === "pending") ||
    (booking.status === "pending" ? booking : fallbackPendingBooking);

  const isCancelled = booking.status === "cancelled";
  const eventTypeLabel = eventTypeLabels[booking.eventType] || booking.eventType;

  // Shared Action Stack (3 horizontal buttons on desktop)
  const renderActionStack = (
    targetBooking: BookingData = booking,
    buttonClassName = "w-full justify-center text-center cursor-pointer",
    containerClassName = "grid grid-cols-1 sm:grid-cols-3 gap-2 w-full"
  ) => {
    if (!isSignedInPlanner) {
      return (
        <Link
          href="/planner"
          className="flex w-full items-center justify-center gap-2 border border-white/10 bg-white/[0.03] py-3 text-white/50 hover:bg-white/[0.08] hover:text-white transition-colors rounded-[var(--radius-box)] text-sm"
        >
          <History className="h-4 w-4" />
          Sign in to manage
        </Link>
      );
    }

    if (isEditing && editDraft.id === targetBooking.id) {
      return (
        <div className={containerClassName}>
          <SeventhButton
            type="button"
            onClick={handleEditSave}
            icon={false}
            background="linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(4, 120, 87, 0.5))"
            glowStart="rgba(16, 185, 129, 0.6)"
            glowEnd="rgba(5, 150, 105, 0.5)"
            className={`${buttonClassName} text-emerald-200`}
          >
            Save Changes
          </SeventhButton>
          <SeventhButton
            type="button"
            onClick={handleEditCancel}
            icon={false}
            className={buttonClassName}
          >
            Discard
          </SeventhButton>
        </div>
      );
    }

    if (targetBooking.status === "cancelled") {
      return (
        <div className={containerClassName}>
          <SeventhButton
            href={rebookUrl(targetBooking, member)}
            icon={false}
            className={buttonClassName}
          >
            Rebook This Event
          </SeventhButton>
          {reviveTimeLeft && (
            <SeventhButton
              type="button"
              aria-label="Revive booking"
              onClick={() => {
                setBooking((prev) => ({
                  ...prev,
                  status: "pending",
                  cancelledAt: undefined,
                }));
                if (onSelectBooking) {
                  onSelectBooking({
                    ...targetBooking,
                    status: "pending",
                    cancelledAt: undefined,
                  });
                }
              }}
              icon={false}
              className={buttonClassName}
            >
              Revive Booking ({reviveTimeLeft})
            </SeventhButton>
          )}
        </div>
      );
    }

    return (
      <div className={containerClassName}>
        <SeventhButton
          href={rebookUrl(targetBooking, member)}
          icon={false}
          className={buttonClassName}
        >
          Rebook This Event
        </SeventhButton>
        <SeventhButton
          type="button"
          onClick={() => {
            if (onSelectBooking && targetBooking.id !== booking.id) {
              onSelectBooking(targetBooking);
            }
            setBooking(targetBooking);
            setEditDraft(targetBooking);
            handleEditStart();
          }}
          icon={false}
          className={buttonClassName}
        >
          Edit Logistics
        </SeventhButton>
        <SeventhButton
          type="button"
          onClick={() => {
            if (onSelectBooking && targetBooking.id !== booking.id) {
              onSelectBooking(targetBooking);
            }
            setBooking(targetBooking);
            setShowCancelConfirm(true);
          }}
          icon={false}
          background="linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(159, 18, 57, 0.4))"
          glowStart="rgba(244, 63, 94, 0.5)"
          glowEnd="rgba(225, 29, 72, 0.4)"
          className={`${buttonClassName} text-rose-200`}
        >
          Cancel Request
        </SeventhButton>
      </div>
    );
  };

  // Shared Edit Form with ALL Booking Fields from Image 1
  const renderEditForm = () => (
    <div className="flex flex-col gap-6 rounded-[var(--radius-box)] border border-purple-500/30 bg-purple-950/20 p-6 md:p-8 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 text-purple-300">
          <Sliders className="h-5 w-5" />
          <h3 className="font-semibold tracking-wide">Editing Event Logistics</h3>
        </div>
        <span className="text-xs text-white/40">ID: {booking.id}</span>
      </div>

      {/* 1. Schedule & Timing (Step 1) — Direct Mapping from Image 1 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            1. Event Schedule &amp; Band Performance Timing (Step 1)
          </h4>
          <span className="text-xs text-white/40">All times local to venue</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="planner-edit-event-name" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Event Name
            </label>
            <input
              id="planner-edit-event-name"
              value={editDraft.eventName}
              onChange={(e) => setEditDraft((d) => ({ ...d, eventName: e.target.value }))}
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="planner-edit-date" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Event Date
            </label>
            <input
              id="planner-edit-date"
              type="date"
              value={editDraft.date}
              onChange={(e) => setEditDraft((d) => ({ ...d, date: e.target.value }))}
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
        </div>

        {/* Row 1: Event Start & Event End (Image 1 top row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label htmlFor="planner-edit-event-start" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Event Start Time
            </label>
            <input
              id="planner-edit-event-start"
              value={editDraft.eventStartTime || "6:00 PM"}
              onChange={(e) => setEditDraft((d) => ({ ...d, eventStartTime: e.target.value }))}
              placeholder="e.g. 6:00 PM (Doors Open)"
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="planner-edit-event-end" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Event End Time
            </label>
            <input
              id="planner-edit-event-end"
              value={editDraft.eventEndTime || "11:00 PM"}
              onChange={(e) => setEditDraft((d) => ({ ...d, eventEndTime: e.target.value }))}
              placeholder="e.g. 11:00 PM (Curfew)"
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
        </div>

        {/* Row 2: Band Start Time, Band End Time, Load-in Setup Time (Image 1 bottom row) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label htmlFor="planner-edit-band-start" className="mb-1.5 block text-xs tracking-wider uppercase text-cyan-400 font-semibold">
              Band Start Time *
            </label>
            <input
              id="planner-edit-band-start"
              value={editDraft.startTime || "7:00 PM"}
              onChange={(e) => setEditDraft((d) => ({ ...d, startTime: e.target.value }))}
              placeholder="e.g. 7:00 PM"
              className="focus-ring w-full border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm font-semibold"
            />
          </div>
          <div>
            <label htmlFor="planner-edit-band-end" className="mb-1.5 block text-xs tracking-wider uppercase text-cyan-400 font-semibold">
              Band End Time *
            </label>
            <input
              id="planner-edit-band-end"
              value={editDraft.endTime || "10:30 PM"}
              onChange={(e) => setEditDraft((d) => ({ ...d, endTime: e.target.value }))}
              placeholder="e.g. 10:30 PM"
              className="focus-ring w-full border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm font-semibold"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="planner-edit-loadin" className="block text-xs tracking-wider uppercase text-white/40">
                Load-in / Setup Time
              </label>
              <Toggle
                id="toggle-edit-loadin-unsure"
                size="sm"
                checked={editDraft.isLoadInUnsure || false}
                onChange={(checked) =>
                  setEditDraft((d) => ({
                    ...d,
                    isLoadInUnsure: checked,
                    loadInTime: checked
                      ? "Unsure — Band admin coordinates"
                      : d.loadInTime || "3:00 PM",
                  }))
                }
                label={<span className="text-xs text-purple-400 font-medium">Unsure?</span>}
              />
            </div>
            <input
              id="planner-edit-loadin"
              value={editDraft.loadInTime || "3:00 PM"}
              disabled={editDraft.isLoadInUnsure}
              onChange={(e) => setEditDraft((d) => ({ ...d, loadInTime: e.target.value }))}
              placeholder="e.g. 3:00 PM (2 hrs before)"
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-white/40">
              Band load-in is usually ~2 hours before band start time.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Venue & Location */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400">
          2. Venue &amp; Location (Step 3)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="planner-edit-venue" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Venue Name
            </label>
            <input
              id="planner-edit-venue"
              value={editDraft.venueName}
              onChange={(e) => setEditDraft((d) => ({ ...d, venueName: e.target.value }))}
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="planner-edit-city" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              City
            </label>
            <input
              id="planner-edit-city"
              value={editDraft.venueCity}
              onChange={(e) => setEditDraft((d) => ({ ...d, venueCity: e.target.value }))}
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="planner-edit-state" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              State
            </label>
            <input
              id="planner-edit-state"
              value={editDraft.venueState}
              onChange={(e) => setEditDraft((d) => ({ ...d, venueState: e.target.value }))}
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="planner-edit-address" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
            Full Street Address / Entrance
          </label>
          <input
            id="planner-edit-address"
            value={editDraft.parkingAddress || ""}
            onChange={(e) => setEditDraft((d) => ({ ...d, parkingAddress: e.target.value }))}
            placeholder="e.g. 980 S Bartlett Rd, Lot B"
            className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
          />
        </div>
      </div>

      {/* 3. Technical & Stage Rider */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          3. Technical &amp; Stage Rider (Step 4)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="planner-edit-sound" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Sound System
            </label>
            <input
              id="planner-edit-sound"
              value={editDraft.soundSystem || ""}
              onChange={(e) => setEditDraft((d) => ({ ...d, soundSystem: e.target.value }))}
              placeholder="e.g. Yes — full PA system"
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="planner-edit-stage" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Stage Available
            </label>
            <input
              id="planner-edit-stage"
              value={editDraft.stageAvailable || ""}
              onChange={(e) => setEditDraft((d) => ({ ...d, stageAvailable: e.target.value }))}
              placeholder="e.g. Yes — 40ft Proscenium"
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="planner-edit-backline" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Backline Provided
            </label>
            <input
              id="planner-edit-backline"
              value={editDraft.backlineProvided || ""}
              onChange={(e) => setEditDraft((d) => ({ ...d, backlineProvided: e.target.value }))}
              placeholder="e.g. Yes — amps, drums & monitors"
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* 4. Client & Contact Info */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          4. Contact Information (Step 2)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="planner-edit-org" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Organization
            </label>
            <input
              id="planner-edit-org"
              value={editDraft.organization || ""}
              onChange={(e) => setEditDraft((d) => ({ ...d, organization: e.target.value }))}
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="planner-edit-contact-name" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Contact Name
            </label>
            <input
              id="planner-edit-contact-name"
              value={editDraft.name || ""}
              onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="planner-edit-email" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Email
            </label>
            <input
              id="planner-edit-email"
              value={editDraft.email || ""}
              onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))}
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="planner-edit-phone" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Phone
            </label>
            <input
              id="planner-edit-phone"
              value={editDraft.phone || ""}
              onChange={(e) => setEditDraft((d) => ({ ...d, phone: e.target.value }))}
              className="focus-ring w-full border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* 5. Parking Directions & Special Notes */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-400">
          5. Parking Notes &amp; Special Requests (Step 3 &amp; 6)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="planner-edit-parking" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Parking &amp; Bus Access Directions
            </label>
            <textarea
              id="planner-edit-parking"
              rows={3}
              value={editDraft.parkingNotes || ""}
              onChange={(e) => setEditDraft((d) => ({ ...d, parkingNotes: e.target.value }))}
              className="focus-ring w-full resize-none border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="planner-edit-notes" className="mb-1.5 block text-xs tracking-wider uppercase text-white/40">
              Special Notes / Requests
            </label>
            <textarea
              id="planner-edit-notes"
              rows={3}
              value={editDraft.details || editDraft.notes || ""}
              onChange={(e) => setEditDraft((d) => ({ ...d, details: e.target.value, notes: e.target.value }))}
              className="focus-ring w-full resize-none border border-white/15 bg-white/[0.04] px-3.5 py-2.5 outline-none rounded-[var(--radius-box)] text-white text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
        <SeventhButton
          type="button"
          onClick={handleEditCancel}
          icon={false}
          className="px-6 py-2.5 cursor-pointer"
        >
          Discard Changes
        </SeventhButton>
        <SeventhButton
          type="button"
          onClick={handleEditSave}
          icon={false}
          background="linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(4, 120, 87, 0.5))"
          glowStart="rgba(16, 185, 129, 0.6)"
          glowEnd="rgba(5, 150, 105, 0.5)"
          className="px-6 py-2.5 cursor-pointer text-emerald-200"
        >
          Save Changes
        </SeventhButton>
      </div>
    </div>
  );

  // Reusable Card Status Badge (CONFIRMED / PENDING / CANCELLED)
  const renderCardStatusBadge = (b: BookingData = booking) => {
    const isConfirmed = b.status === "confirmed";
    const isPending = b.status === "pending";
    const dotColor = isConfirmed ? "bg-emerald-400" : isPending ? "bg-amber-400" : "bg-rose-400";
    const badgeClass = isConfirmed
      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
      : isPending
      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
      : "bg-rose-500/20 border-rose-500/40 text-rose-300";
    const label = isConfirmed ? "Confirmed" : isPending ? "Pending Review" : "Cancelled";

    return (
      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${badgeClass}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor} ${isConfirmed ? "animate-pulse" : ""}`} />
        {label}
      </span>
    );
  };

  // Common Header Badges & Headline
  const renderIdentityHeader = (b: BookingData = booking) => {
    const isConfirmed = b.status === "confirmed";
    const statusLabel = isConfirmed ? "Confirmed" : b.status === "pending" ? "Pending Review" : "Cancelled";
    const typeLabel = eventTypeLabels[b.eventType] || b.eventType;

    return (
      <div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2.5">
          <SectionBadge label={statusLabel} />
          {renderCardStatusBadge(b)}
          <span className="text-xs font-mono text-white/50">ID: {b.id}</span>
          <span className="rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-0.5 text-xs text-purple-300">
            {typeLabel}
          </span>
          <span className="rounded-full bg-white/[0.05] border border-white/10 px-2.5 py-0.5 text-xs text-white/70">
            {b.indoorOutdoor || "Outdoor"}
          </span>
          {b.ageRestriction && (
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-xs text-cyan-300">
              {b.ageRestriction}
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {b.eventName}
        </h2>
        <p className="text-sm text-white/70 mt-1 flex flex-wrap items-center gap-x-2">
          <span className="font-semibold text-white/90">Headline Performance at {b.venueName}</span>
          {b.organization && (
            <>
              <span className="text-white/30">•</span>
              <span className="text-purple-300/80">{b.organization}</span>
            </>
          )}
        </p>
      </div>
    );
  };

  // Companion Live Venue Google Map Card (Right column)
  const renderMapCompanion = (b: BookingData = booking) => {
    const currentMode = mapViewModes[b.id] || "map";
    const gateText = b.parkingNotes?.includes("Gate")
      ? `Gate ${b.parkingNotes.split("Gate ")[1]?.split(" ")[0] || "4"}`
      : b.parkingNotes?.includes("Loading dock")
      ? "Dock Bays 3-4"
      : "Main Gate";

    const searchQuery = b.parkingAddress
      ? `${b.venueName}, ${b.parkingAddress}`
      : `${b.venueName}, ${b.venueCity}, ${b.venueState}`;
    const encodedQuery = encodeURIComponent(searchQuery);

    const embedUrl = `https://maps.google.com/maps?q=${encodedQuery}&t=${currentMode === "satellite" ? "k" : ""}&z=15&ie=UTF8&iwloc=&output=embed`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

    return (
      <div className="lg:col-span-5 rounded-[var(--radius-box)] border border-white/15 bg-gradient-to-br from-neutral-900 to-black p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl min-h-[380px]">
        {/* Top Header: Title, City & View Mode Switcher */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-300 uppercase tracking-wider">
              <MapPin className="h-4 w-4 text-rose-400" />
              LIVE GOOGLE MAP
            </span>
            <span className="text-xs text-white/50">{b.venueCity}, {b.venueState}</span>
          </div>

          {/* Map View Switcher Pills */}
          <div className="flex items-center rounded-full bg-white/[0.06] p-0.5 border border-white/10 text-[11px]">
            <button
              type="button"
              onClick={() => setMapViewModes((prev) => ({ ...prev, [b.id]: "map" }))}
              className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
                currentMode === "map"
                  ? "bg-rose-500/80 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setMapViewModes((prev) => ({ ...prev, [b.id]: "satellite" }))}
              className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
                currentMode === "satellite"
                  ? "bg-rose-500/80 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapViewModes((prev) => ({ ...prev, [b.id]: "radar" }))}
              className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
                currentMode === "radar"
                  ? "bg-purple-600/80 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Radar
            </button>
          </div>
        </div>

        {/* Center Content: Interactive Google Map iframe OR Radar Telemetry */}
        <div className="relative z-10 my-3 flex-1 min-h-[240px] sm:min-h-[260px] rounded-[var(--radius-box)] overflow-hidden border border-white/10 bg-black/60">
          {currentMode === "radar" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative flex items-center justify-center">
                <span className="absolute h-16 w-16 rounded-full bg-rose-500/20 animate-ping" />
                <span className="absolute h-10 w-10 rounded-full bg-rose-500/40" />
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/50">
                  <MapPin className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-sm font-bold text-white text-center">{b.venueName}</p>
              <p className="text-xs text-white/60 text-center">
                {b.parkingAddress || `${b.venueCity}, ${b.venueState}`}
              </p>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              title={`Google Map - ${b.venueName}`}
              className="absolute inset-0 h-full w-full border-0 block"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            />
          )}
        </div>

        {/* Bottom Venue Footer & Open in Google Maps Link */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
          <div className="min-w-0 max-w-[65%]">
            <p className="text-white font-semibold truncate">{b.venueName}</p>
            <p className="text-white/50 text-[11px] truncate">
              Gate / Dock: <strong className="text-amber-300 font-medium">{gateText}</strong>
            </p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-cyan-300 hover:text-white transition-all font-medium text-xs shrink-0 cursor-pointer"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  };

  // Common dB SPL Limiter Component
  const renderLimiterBar = () => (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-white/50 uppercase tracking-wider flex items-center gap-1.5">
          <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
          dB SPL LIMITER
        </span>
        <span className="text-emerald-400 font-semibold">
          TARGET: 102.4 dB <span className="text-amber-400 font-normal">(PEAK 104 dB)</span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden flex">
        <div className="h-full bg-emerald-500 w-[72%]" />
        <div className="h-full bg-amber-500 w-[18%]" />
        <div className="h-full bg-rose-500 w-[10%]" />
      </div>
    </div>
  );

  // Common Parking & Logistics Component
  const renderParkingCallout = (b: BookingData = booking) => (
    <div className="rounded-[var(--radius-box)] border border-blue-500/20 bg-blue-950/20 p-3 flex items-start gap-3 text-xs">
      <Bus className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-blue-200 leading-relaxed">
          <span className="font-semibold text-white">Parking &amp; Bus Access: </span>
          {b.parkingNotes || "Band bus & crew truck park in designated venue lot. See load-in schedule."}
        </p>
        {(b.details || b.notes) && (
          <p className="text-purple-300 mt-1 pt-1 border-t border-white/5 leading-relaxed">
            <span className="font-semibold text-white">Special Notes &amp; Logistics: </span>
            {b.details || b.notes}
          </p>
        )}
      </div>
    </div>
  );

  // Common Footer Component
  const renderPromoterFooter = (b: BookingData = booking) => (
    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-white/50">
      <div className="flex items-center gap-2">
        <Users className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <span>PROMOTER: <strong className="text-white font-medium">{b.organization || "Scoreboard Entertainment"}</strong></span>
        <span className="text-white/20">•</span>
        <span>ATTENDANCE: <strong className="text-white font-medium">{b.expectedAttendance ? `${b.expectedAttendance} Guests` : "250 Guests"}</strong></span>
      </div>
      <div>
        <span>CONTACT: <strong className="text-white font-medium">{b.name || "Event Planner"}</strong></span>
        {b.phone && <span className="text-cyan-400 ml-1.5">{b.phone}</span>}
      </div>
    </div>
  );

  // =========================================================================
  // 10 DIFFERENT ARCHITECTURAL WAYS TO LAY OUT THIS EXACT INFORMATION
  // =========================================================================

  // 1. DUAL BAY CONSOLE (The refined dual-card baseline)
  const renderDualBay = (b: BookingData = booking) => (
    <div className="rounded-[var(--radius-box)] border border-purple-500/40 bg-gradient-to-br from-neutral-950 via-purple-950/20 to-black p-4 sm:p-5 flex flex-col gap-4 relative overflow-hidden backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {renderCardStatusBadge(b)}
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            PA ARMED
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            200A CAMLOCK OK
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            CURFEW {b.eventEndTime || "11:00 PM"}
          </span>
          <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-xs text-purple-200 font-semibold font-sans">
            {(eventTypeLabels[b.eventType] || b.eventType)}
          </span>
          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-xs text-emerald-300 font-semibold font-sans">
            {b.indoorOutdoor || "Outdoor"}
          </span>
          <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-xs text-cyan-300 font-semibold font-sans">
            {b.ageRestriction || "All Ages"}
          </span>
        </div>
        <span className="text-xs text-white/40 uppercase tracking-widest font-mono">SPL TELEMETRY</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Timing Bay */}
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              DATE &amp; HIT WINDOW
            </span>
            <span className="text-xs text-white/50 font-mono">{b.setDuration || "Full Show"}</span>
          </div>
          <p className="text-base font-bold text-white tracking-tight">{b.date}</p>
          <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-white/5 text-xs">
            <div className="bg-cyan-950/30 border border-cyan-500/20 rounded p-2">
              <span className="text-cyan-300 font-medium block text-xs">BAND PERFORMANCE *</span>
              <p className="text-sm font-bold text-white font-mono mt-0.5">
                {b.startTime || "7:00 PM"} – {b.endTime || "10:30 PM"}
              </p>
              <span className="text-xs text-cyan-300/60 block mt-0.5">Headline Stage Live</span>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded p-2">
              <span className="text-white/50 font-medium block text-xs">EVENT WINDOW (DOORS)</span>
              <p className="text-sm font-bold text-white/90 font-mono mt-0.5">
                {b.eventStartTime || "6:00 PM"} – {b.eventEndTime || "11:00 PM"}
              </p>
              <span className="text-xs text-white/40 block mt-0.5">Doors to Venue Close</span>
            </div>
          </div>
          <div className="rounded bg-black/40 border border-white/5 px-3 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="text-white/60">Load-in / Setup:</span>
              <span className="font-bold text-amber-300 ml-1">{b.loadInTime || "3:00 PM"}</span>
            </div>
            <span className="text-xs text-white/40 hidden sm:inline">~2 hrs before band start</span>
          </div>
        </div>

        {/* Right: FOH Bay */}
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5" />
              VENUE &amp; FOH SYSTEM
            </span>
            <span className="text-xs text-emerald-400 font-mono">102 dB SPL</span>
          </div>
          <div>
            <p className="text-base font-bold text-white tracking-tight truncate">{b.venueName}</p>
            <p className="text-xs text-white/60 truncate mt-0.5">
              {b.parkingAddress || `${b.venueCity}, ${b.venueState}`} • {b.indoorOutdoor || "Outdoor"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-xs">
            <div>
              <span className="text-white/40 block">SOUND RIG</span>
              <p className="font-semibold text-white truncate mt-0.5">{b.soundSystem || "Yes — full PA system"}</p>
            </div>
            <div>
              <span className="text-white/40 block">STAGE SPEC</span>
              <p className="font-semibold text-white truncate mt-0.5">{b.stageAvailable || "Yes"}</p>
            </div>
          </div>
          <div className="rounded bg-black/40 border border-white/5 px-3 py-2 flex items-center justify-between text-xs">
            <span className="text-white/60">Backline:</span>
            <span className="text-emerald-300 font-medium truncate ml-1">{b.backlineProvided || "Yes — amps, drum kit & monitors"}</span>
          </div>
        </div>
      </div>

      {renderLimiterBar()}
      {renderParkingCallout(b)}
      {renderPromoterFooter(b)}
    </div>
  );

  // 2. TIMELINE TAPE (Chronological Run-of-Show Stepper)
  const renderTimelineTape = (b: BookingData = booking) => (
    <div className="rounded-[var(--radius-box)] border border-cyan-500/30 bg-gradient-to-br from-neutral-950 via-cyan-950/20 to-black p-4 sm:p-5 flex flex-col gap-4 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Timer className="h-4 w-4" />
            CHRONOLOGICAL RUN-OF-SHOW TAPE
          </span>
          {renderCardStatusBadge(b)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-xs text-purple-200 font-medium">
            {(eventTypeLabels[b.eventType] || b.eventType)}
          </span>
          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-xs text-emerald-300 font-medium">
            {b.indoorOutdoor || "Outdoor"}
          </span>
          <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-xs text-cyan-300 font-medium">
            {b.ageRestriction || "All Ages"}
          </span>
          <span className="text-white/50">{b.date} • {b.setDuration || "Full Show"}</span>
        </div>
      </div>

      {/* Stepped Timeline Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-3 text-xs">
          <span className="text-white/40 block text-xs">1. LOAD-IN</span>
          <p className="text-sm font-bold text-amber-300 font-mono mt-1">{b.loadInTime || "3:00 PM"}</p>
          <span className="text-white/50 block text-xs mt-0.5">Crew arrival (~2h pre)</span>
        </div>
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-3 text-xs">
          <span className="text-white/40 block text-xs">2. DOORS OPEN</span>
          <p className="text-sm font-bold text-white font-mono mt-1">{b.eventStartTime || "6:00 PM"}</p>
          <span className="text-white/50 block text-xs mt-0.5">Guest entry starts</span>
        </div>
        <div className="rounded-[var(--radius-box)] border border-cyan-500/40 bg-cyan-950/40 p-3 text-xs ring-1 ring-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="text-cyan-300 block text-xs font-semibold">3. BAND HEADLINE *</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
              {(eventTypeLabels[b.eventType] || b.eventType)}
            </span>
          </div>
          <p className="text-base font-black text-white font-mono mt-0.5">
            {b.startTime || "7:00 PM"} – {b.endTime || "10:30 PM"}
          </p>
          <span className="text-cyan-300/80 block text-xs mt-0.5">7th Heaven Live Stage • {b.ageRestriction || "All Ages"}</span>
        </div>
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-3 text-xs">
          <span className="text-white/40 block text-xs">4. CURFEW WRAP</span>
          <p className="text-sm font-bold text-rose-300 font-mono mt-1">{b.eventEndTime || "11:00 PM"}</p>
          <span className="text-white/50 block text-xs mt-0.5">Strict venue sound stop</span>
        </div>
      </div>

      {/* Mid Technical & Venue Pod */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-purple-400 font-semibold uppercase tracking-wider block">VENUE &amp; HARDWARE</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                {b.indoorOutdoor || "Outdoor"}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                {b.ageRestriction || "All Ages"}
              </span>
            </div>
          </div>
          <p className="text-white font-bold">{b.venueName}</p>
          <p className="text-white/60">{b.parkingAddress || `${b.venueCity}, ${b.venueState}`} • {b.indoorOutdoor || "Outdoor"}</p>
          <p className="text-white/50 pt-1 border-t border-white/5">
            Stage: {b.stageAvailable || "Yes — 40ft Proscenium"} • Backline: {b.backlineProvided || "Provided"}
          </p>
        </div>
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-3.5 space-y-1">
          <span className="text-emerald-400 font-semibold uppercase tracking-wider block">AUDIO OUTPUT &amp; LIMITS</span>
          <p className="text-white font-bold">{b.soundSystem || "Yes — full PA system"}</p>
          <p className="text-white/60">Power: 200A Camlock OK • Limit: 102 dB SPL</p>
          <div className="pt-1.5">{renderLimiterBar()}</div>
        </div>
      </div>

      {renderParkingCallout(b)}
      {renderPromoterFooter(b)}
    </div>
  );

  // 3. ASYMMETRIC BENTO GRID (Modular Tech Tiles)
  const renderBentoGrid = (b: BookingData = booking) => (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
      {/* Tile 1: Hero Showtime & Date (7 cols) */}
      <div className="sm:col-span-7 rounded-[var(--radius-box)] border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 to-purple-950/20 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-white/50 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-mono font-semibold uppercase">BAND PERFORMANCE *</span>
            {renderCardStatusBadge(b)}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-purple-500/20 border border-purple-500/40 px-1.5 py-0.5 text-[10px] text-purple-200 uppercase font-bold">
              {(eventTypeLabels[b.eventType] || b.eventType)}
            </span>
            <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.5 text-[10px] text-cyan-300 uppercase font-bold">
              {b.ageRestriction || "All Ages"}
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">PA ARMED</span>
          </div>
        </div>
        <div className="my-2">
          <p className="text-xs text-white/40 uppercase">{b.date}</p>
          <h3 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight mt-0.5">
            {b.startTime || "7:00 PM"} – {b.endTime || "10:30 PM"}
          </h3>
          <p className="text-xs text-cyan-300 mt-1">Headline Set • {b.setDuration || "Full Show"}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
          <div>
            <span className="text-white/40 block">EVENT DOORS</span>
            <span className="font-mono text-white font-semibold">{b.eventStartTime || "6:00 PM"} – {b.eventEndTime || "11:00 PM"}</span>
          </div>
          <div>
            <span className="text-white/40 block">LOAD-IN / SETUP</span>
            <span className="font-mono text-amber-300 font-semibold">{b.loadInTime || "3:00 PM"} (~2h pre)</span>
          </div>
        </div>
      </div>

      {/* Tile 2: Venue & Rig Tile (5 cols) */}
      <div className="sm:col-span-5 rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-4 flex flex-col justify-between text-xs">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-purple-400 font-semibold uppercase block">VENUE &amp; STAGE</span>
            <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 text-[10px] text-emerald-300 uppercase font-bold">
              {b.indoorOutdoor || "Outdoor"}
            </span>
          </div>
          <p className="text-sm font-bold text-white">{b.venueName}</p>
          <p className="text-white/60 mt-0.5">{b.parkingAddress || `${b.venueCity}, ${b.venueState}`} • {b.indoorOutdoor || "Outdoor"}</p>
        </div>
        <div className="pt-2 border-t border-white/10 space-y-1">
          <p className="text-white/80"><strong className="text-white">Rig:</strong> {b.soundSystem || "Full PA system"}</p>
          <p className="text-white/80"><strong className="text-white">Stage:</strong> {b.stageAvailable || "Yes"}</p>
        </div>
      </div>

      {/* Tile 3: Full Width Limiter & Parking Tile (12 cols) */}
      <div className="sm:col-span-12 rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-4 space-y-3">
        {renderLimiterBar()}
        {renderParkingCallout(b)}
        {renderPromoterFooter(b)}
      </div>
    </div>
  );

  // 4. TRIPLE CHANNEL STRIP (FOH Vintage Console 19" Rack)
  const renderChannelStrip = (b: BookingData = booking) => (
    <div className="rounded-[var(--radius-box)] border border-neutral-700 bg-neutral-950 p-4 sm:p-5 flex flex-col gap-4 font-mono text-xs shadow-2xl">
      {/* Rack Mount Screws & Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-neutral-600" />
          <span className="text-neutral-400 uppercase tracking-widest font-bold">FOH LIVE CONSOLE // CH-1 TO CH-3</span>
        </div>
        <div className="flex items-center gap-2">
          {renderCardStatusBadge(b)}
          <span className="text-emerald-400">STATUS: ONLINE</span>
          <span className="h-2 w-2 rounded-full bg-neutral-600" />
        </div>
      </div>

      {/* 3 Vertical Channel Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Strip 1: TIME MATRIX */}
        <div className="rounded border border-neutral-800 bg-neutral-900/60 p-3 space-y-2">
          <div className="border-b border-neutral-800 pb-1 text-cyan-400 font-bold flex justify-between">
            <span>[CH-01: CLOCK]</span>
            <span className="text-neutral-500">SYNC</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-xs">EVENT DATE</span>
            <p className="text-white font-bold">{b.date}</p>
          </div>
          <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/40">
            <span className="text-cyan-300 block text-xs">BAND HIT *</span>
            <p className="text-sm font-black text-white font-mono">{b.startTime || "7:00 PM"} – {b.endTime || "10:30 PM"}</p>
          </div>
          <div>
            <span className="text-neutral-500 block text-xs">EVENT DOORS: {b.eventStartTime || "6:00 PM"} – {b.eventEndTime || "11:00 PM"}</span>
            <span className="text-amber-400 block text-xs mt-1">LOAD-IN CALL: {b.loadInTime || "3:00 PM"}</span>
          </div>
        </div>

        {/* Strip 2: OUTPUT RIG */}
        <div className="rounded border border-neutral-800 bg-neutral-900/60 p-3 space-y-2">
          <div className="border-b border-neutral-800 pb-1 text-purple-400 font-bold flex justify-between">
            <span>[CH-02: OUTPUT]</span>
            <span className="text-neutral-500">RIG</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-xs">VENUE SITE</span>
            <p className="text-white font-bold truncate">{b.venueName}</p>
            <p className="text-neutral-400 text-xs truncate">{b.parkingAddress || "Mainstage Grounds"}</p>
          </div>
          <div>
            <span className="text-neutral-500 block text-xs">PA RIG</span>
            <p className="text-white truncate">{b.soundSystem || "Full PA System"}</p>
          </div>
          <div>
            <span className="text-neutral-500 block text-xs">STAGE / BACKLINE</span>
            <p className="text-neutral-300 truncate">{b.stageAvailable || "40ft Proscenium"}</p>
          </div>
        </div>

        {/* Strip 3: TELEMETRY & SPL */}
        <div className="rounded border border-neutral-800 bg-neutral-900/60 p-3 space-y-2">
          <div className="border-b border-neutral-800 pb-1 text-emerald-400 font-bold flex justify-between">
            <span>[CH-03: TELEMETRY]</span>
            <span className="text-neutral-500">SPL</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-400">POWER CAMLOCK:</span>
            <span className="text-cyan-400 font-bold">200A OK</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-400">CURFEW STOP:</span>
            <span className="text-amber-400 font-bold">{b.eventEndTime || "11:00 PM"}</span>
          </div>
          <div className="pt-2 border-t border-neutral-800">
            <span className="text-neutral-400 block mb-1">dB VU LIMITER:</span>
            <div className="h-3 w-full bg-neutral-800 rounded overflow-hidden flex">
              <div className="h-full bg-emerald-500 w-[70%]" />
              <div className="h-full bg-amber-500 w-[20%]" />
              <div className="h-full bg-rose-500 w-[10%]" />
            </div>
            <span className="text-emerald-400 block text-xs mt-1 text-right">102.4 dB TARGET</span>
          </div>
        </div>
      </div>

      {renderParkingCallout(b)}
      {renderPromoterFooter(b)}
    </div>
  );

  // 5. COMPACT COMMAND BAR (Ultra-Sleek Minimalist Strip)
  const renderCompactHud = (b: BookingData = booking) => (
    <div className="rounded-[var(--radius-box)] border border-white/15 bg-white/[0.03] p-4 flex flex-col gap-3 backdrop-blur-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-xs">
        {/* Pod 1 */}
        <div className="pr-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-semibold uppercase block">TIMING MATRIX</span>
            <div className="flex items-center gap-1.5">
              {renderCardStatusBadge(b)}
              <span className="text-[10px] text-purple-300 font-medium px-1.5 py-0.5 rounded bg-purple-500/20">{(eventTypeLabels[b.eventType] || b.eventType)}</span>
            </div>
          </div>
          <p className="text-sm font-bold text-white font-mono">{b.startTime || "7:00 PM"} – {b.endTime || "10:30 PM"}</p>
          <p className="text-white/60">Doors: {b.eventStartTime || "6:00 PM"} – {b.eventEndTime || "11:00 PM"}</p>
          <span className="text-amber-300 block text-xs">In: {b.loadInTime || "3:00 PM"} (~2h)</span>
        </div>

        {/* Pod 2 */}
        <div className="sm:pl-3 pr-2 pt-2 sm:pt-0 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-purple-400 font-semibold uppercase block">VENUE</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-emerald-300 font-medium px-1.5 py-0.5 rounded bg-emerald-500/20">{b.indoorOutdoor || "Outdoor"}</span>
              <span className="text-[10px] text-cyan-300 font-medium px-1.5 py-0.5 rounded bg-cyan-500/20">{b.ageRestriction || "All Ages"}</span>
            </div>
          </div>
          <p className="text-sm font-bold text-white truncate">{b.venueName}</p>
          <p className="text-white/60 truncate">{b.venueCity}, {b.venueState} • {b.indoorOutdoor || "Outdoor"}</p>
          <span className="text-white/40 block text-xs truncate">{b.parkingAddress || "Outdoor Grounds"}</span>
        </div>

        {/* Pod 3 */}
        <div className="sm:pl-3 pr-2 pt-2 sm:pt-0 space-y-1">
          <span className="text-emerald-400 font-semibold uppercase block">AUDIO &amp; LIMITER</span>
          <p className="text-white font-medium truncate">{b.soundSystem || "Full PA System"}</p>
          <p className="text-white/60 truncate">Stage: {b.stageAvailable || "40ft Proscenium"}</p>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden flex mt-1">
            <div className="h-full bg-emerald-500 w-[72%]" />
            <div className="h-full bg-amber-500 w-[18%]" />
            <div className="h-full bg-rose-500 w-[10%]" />
          </div>
        </div>

        {/* Pod 4 */}
        <div className="sm:pl-3 pt-2 sm:pt-0 space-y-1">
          <span className="text-amber-400 font-semibold uppercase block">LOGISTICS &amp; CLIENT</span>
          <p className="text-white font-medium truncate">{b.organization || "Scoreboard Ent."}</p>
          <p className="text-white/60">{b.expectedAttendance ? `${b.expectedAttendance} Guests` : "250 Guests"}</p>
          <span className="text-cyan-300 block text-xs truncate">{b.name || "Event Planner"} {b.phone ? `(${b.phone})` : ""}</span>
        </div>
      </div>

      {renderParkingCallout(b)}
    </div>
  );

  // 6. TABBED STUDIO CONSOLE (Segmented Focused Views)
  const renderTabbedConsole = (b: BookingData = booking) => (
    <div className="rounded-[var(--radius-box)] border border-purple-500/30 bg-black/40 p-4 sm:p-5 flex flex-col gap-4 backdrop-blur-md">
      {/* Tab Segment Selector */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 pb-3">
        {[
          { id: "timing", label: "⏱️ Run-of-Show & Timing" },
          { id: "audio", label: "🎛️ Audio & Stage Rig" },
          { id: "parking", label: "🚌 Parking & Gate Access" },
          { id: "promoter", label: "📋 Client & Promoter" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveConsoleTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeConsoleTab === tab.id
                ? "bg-[var(--color-purple-primary)] text-white shadow-md shadow-purple-900/40"
                : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      {activeConsoleTab === "timing" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/50">
            <div className="flex flex-wrap items-center gap-2">
              <span>{b.date}</span>
              {renderCardStatusBadge(b)}
              <span className="rounded bg-purple-500/20 border border-purple-500/40 px-1.5 py-0.5 text-[10px] text-purple-200 font-semibold">{(eventTypeLabels[b.eventType] || b.eventType)}</span>
              <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 text-[10px] text-emerald-300 font-semibold">{b.indoorOutdoor || "Outdoor"}</span>
              <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.5 text-[10px] text-cyan-300 font-semibold">{b.ageRestriction || "All Ages"}</span>
            </div>
            <span className="text-cyan-400 font-mono">Curfew: {b.eventEndTime || "11:00 PM"}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-[var(--radius-box)] border border-cyan-500/30 bg-cyan-950/30 p-3">
              <span className="text-cyan-300 block font-semibold">BAND PERFORMANCE *</span>
              <p className="text-base font-bold text-white font-mono mt-1">{b.startTime || "7:00 PM"} – {b.endTime || "10:30 PM"}</p>
              <span className="text-cyan-300/70 block text-xs mt-0.5">Live Stage Window</span>
            </div>
            <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-3">
              <span className="text-white/50 block font-semibold">EVENT DOORS</span>
              <p className="text-base font-bold text-white font-mono mt-1">{b.eventStartTime || "6:00 PM"} – {b.eventEndTime || "11:00 PM"}</p>
              <span className="text-white/40 block text-xs mt-0.5">Doors to Sound Stop</span>
            </div>
            <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-3">
              <span className="text-amber-400 block font-semibold">LOAD-IN / SETUP</span>
              <p className="text-base font-bold text-amber-300 font-mono mt-1">{b.loadInTime || "3:00 PM"}</p>
              <span className="text-white/40 block text-xs mt-0.5">~2 hours before band</span>
            </div>
          </div>
        </div>
      )}

      {activeConsoleTab === "audio" && (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-3 space-y-1">
              <span className="text-purple-400 font-semibold block">SOUND SYSTEM</span>
              <p className="text-sm font-bold text-white">{b.soundSystem || "Yes — full PA system"}</p>
              <p className="text-white/50">Curfew: 11:00 PM • Camlock: 200A</p>
            </div>
            <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-3 space-y-1">
              <span className="text-emerald-400 font-semibold block">STAGE &amp; BACKLINE</span>
              <p className="text-sm font-bold text-white">{b.stageAvailable || "Yes — 40ft Proscenium"}</p>
              <p className="text-white/50">{b.backlineProvided || "Amps, drum kit & monitors"}</p>
            </div>
          </div>
          {renderLimiterBar()}
        </div>
      )}

      {activeConsoleTab === "parking" && (
        <div className="space-y-3">
          {renderParkingCallout(b)}
          <div className="rounded-[var(--radius-box)] border border-white/10 bg-black/40 p-3 text-xs text-white/70">
            <p><strong className="text-white">Venue Gate:</strong> West Lot Gate 4 off Bartlett Rd</p>
            <p className="mt-1"><strong className="text-white">Venue Address:</strong> {b.parkingAddress || `${b.venueCity}, ${b.venueState}`}</p>
          </div>
        </div>
      )}

      {activeConsoleTab === "promoter" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-3">
              <span className="text-white/40 block">ORGANIZATION</span>
              <p className="text-sm font-bold text-white mt-1">{b.organization || "Scoreboard Ent."}</p>
            </div>
            <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-3">
              <span className="text-white/40 block">ATTENDANCE</span>
              <p className="text-sm font-bold text-white mt-1">{b.expectedAttendance ? `${b.expectedAttendance} Guests` : "250 Guests"}</p>
            </div>
            <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-3">
              <span className="text-white/40 block">PRIMARY CONTACT</span>
              <p className="text-sm font-bold text-cyan-300 mt-1">{b.name || "Event Planner"}</p>
              <p className="text-white/60 text-xs">{b.phone || "(847) 555-0199"}</p>
            </div>
          </div>
        </div>
      )}

      {renderPromoterFooter(b)}
    </div>
  );

  // 7. VIP CONCERT PASS LAMINATE
  const renderTourPass = (b: BookingData = booking) => (
    <div className="rounded-[var(--radius-box)] border border-purple-500/40 bg-gradient-to-r from-purple-950/40 via-purple-900/10 to-black/60 p-4 sm:p-5 relative overflow-hidden backdrop-blur-md">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        {/* Pass Spine Barcode */}
        <div className="sm:w-28 shrink-0 flex sm:flex-col items-center justify-between rounded-[var(--radius-box)] bg-purple-950/60 border border-purple-400/30 p-3 text-center">
          <div className="flex items-center gap-1 text-purple-300">
            <Ticket className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">ALL-ACCESS</span>
          </div>
          <div className="my-1 sm:my-3">
            <span className="text-base sm:text-lg font-black font-mono tracking-widest text-white">
              PASS-8921
            </span>
          </div>
          <span className="text-xs text-white/50 font-mono">CLR-STAGE</span>
        </div>

        {/* Pass Main Spec */}
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-purple-300 uppercase tracking-widest">SHOWTIME CREDENTIAL</p>
                {renderCardStatusBadge(b)}
                <span className="rounded bg-purple-500/20 border border-purple-500/40 px-1.5 py-0.5 text-[10px] text-purple-200 font-bold uppercase">{(eventTypeLabels[b.eventType] || b.eventType)}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{b.date}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-cyan-400 font-mono font-bold">{b.startTime || "7:00 PM"} – {b.endTime || "10:30 PM"}</p>
              <p className="text-xs text-white/50">Call: {b.loadInTime || "3:00 PM"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-white/40 block">VENUE &amp; GATE</span>
              <p className="font-semibold text-white truncate">{b.venueName}</p>
              <p className="text-white/60 truncate">{b.parkingAddress || "West Lot Gate 4"} • {b.indoorOutdoor || "Outdoor"}</p>
            </div>
            <div>
              <span className="text-white/40 block">EVENT DOORS &amp; ACCESS</span>
              <p className="font-semibold text-white">{b.eventStartTime || "6:00 PM"} – {b.eventEndTime || "11:00 PM"}</p>
              <p className="text-cyan-300 font-medium">{b.ageRestriction || "All Ages"} • 11 PM Curfew</p>
            </div>
          </div>

          <div className="pt-1">{renderLimiterBar()}</div>
          {renderParkingCallout(b)}
        </div>
      </div>
    </div>
  );

  // 8. STAGE CUE TELEPROMPTER (Broadcast HUD)
  const renderCueTeleprompter = (b: BookingData = booking) => (
    <div className="rounded-[var(--radius-box)] border border-rose-500/30 bg-black p-4 sm:p-5 flex flex-col gap-3 font-mono">
      <div className="flex items-center justify-between border-b border-rose-900/50 pb-2 text-xs">
        <span className="text-rose-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
          <Radio className="h-4 w-4 animate-pulse text-rose-500" />
          ON-AIR STAGE CUE TELEPROMPTER
        </span>
        <div className="flex items-center gap-2">
          {renderCardStatusBadge(b)}
          <span className="text-white/50">STATUS: ARMED</span>
        </div>
      </div>

      {/* Massive Glowing Digital Cue Time */}
      <div className="rounded-[var(--radius-box)] border border-rose-500/20 bg-rose-950/20 p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className="rounded bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-xs text-rose-300 font-bold uppercase tracking-wider">
            {(eventTypeLabels[b.eventType] || b.eventType)}
          </span>
          <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-xs text-emerald-300 font-bold uppercase tracking-wider">
            {b.indoorOutdoor || "Outdoor"}
          </span>
          <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-xs text-cyan-300 font-bold uppercase tracking-wider">
            {b.ageRestriction || "All Ages"}
          </span>
        </div>
        <p className="text-3xl sm:text-4xl font-black text-white tracking-widest mt-1">
          {b.startTime || "7:00 PM"} – {b.endTime || "10:30 PM"}
        </p>
        <div className="flex justify-center items-center gap-4 text-xs text-white/60 mt-2">
          <span>DOORS: {b.eventStartTime || "6:00 PM"}</span>
          <span>•</span>
          <span className="text-amber-300">LOAD-IN: {b.loadInTime || "3:00 PM"}</span>
          <span>•</span>
          <span className="text-rose-400">CURFEW: {b.eventEndTime || "11:00 PM"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
        <div className="p-3 rounded bg-neutral-900 border border-neutral-800">
          <span className="text-neutral-500 block">VENUE RIG:</span>
          <p className="text-white font-bold">{b.venueName}</p>
          <p className="text-neutral-400">{b.soundSystem || "Full PA"} • {b.stageAvailable || "40ft Stage"}</p>
        </div>
        <div className="p-3 rounded bg-neutral-900 border border-neutral-800">
          <span className="text-neutral-500 block">SPL LIMITER:</span>
          {renderLimiterBar()}
        </div>
      </div>

      {renderParkingCallout(b)}
      {renderPromoterFooter(b)}
    </div>
  );

  // 9. TECHNICAL BLUEPRINT (Architectural Spec)
  const renderBlueprint = (b: BookingData = booking) => (
    <div className="rounded-[var(--radius-box)] border border-sky-500/40 bg-slate-950 p-4 sm:p-5 flex flex-col gap-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-sky-500/30 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sky-400 font-bold tracking-wider">PROJECT SPEC // 7H-BK-8921-BLUEPRINT</span>
          {renderCardStatusBadge(b)}
        </div>
        <span className="text-sky-300/60">REV: 2.4</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-sky-500/20 bg-sky-950/20 p-3 space-y-1.5">
          <span className="text-sky-400 font-semibold block">01 / TEMPORAL MATRIX</span>
          <p className="text-white font-bold">{b.date}</p>
          <p className="text-cyan-300 font-bold">BAND: {b.startTime || "7:00 PM"} – {b.endTime || "10:30 PM"}</p>
          <p className="text-purple-300 text-[11px] font-semibold">FORMAT: {(eventTypeLabels[b.eventType] || b.eventType).toUpperCase()}</p>
          <p className="text-white/60">DOORS: {b.eventStartTime || "6:00 PM"} – {b.eventEndTime || "11:00 PM"}</p>
          <p className="text-amber-300">CALL: {b.loadInTime || "3:00 PM"}</p>
        </div>

        <div className="border border-sky-500/20 bg-sky-950/20 p-3 space-y-1.5">
          <span className="text-sky-400 font-semibold block">02 / HARDWARE &amp; SITE</span>
          <p className="text-white font-bold truncate">{b.venueName}</p>
          <p className="text-emerald-300 text-[11px] font-semibold">SITE: {b.indoorOutdoor ? b.indoorOutdoor.toUpperCase() : "OUTDOOR"} GROUNDS</p>
          <p className="text-cyan-300 text-[11px] font-semibold">ACCESS: {b.ageRestriction ? b.ageRestriction.toUpperCase() : "ALL AGES"}</p>
          <p className="text-white/70 truncate">{b.soundSystem || "Full PA"}</p>
          <p className="text-white/70 truncate">Stage: {b.stageAvailable || "40ft Proscenium"}</p>
        </div>

        <div className="border border-sky-500/20 bg-sky-950/20 p-3 space-y-1.5">
          <span className="text-sky-400 font-semibold block">03 / LEVEL TELEMETRY</span>
          <p className="text-emerald-400 font-bold">SPL TARGET: 102.4 dB</p>
          <p className="text-white/60">CURFEW: {b.eventEndTime || "11:00 PM"}</p>
          <div className="pt-2">{renderLimiterBar()}</div>
        </div>
      </div>

      {renderParkingCallout(b)}
      {renderPromoterFooter(b)}
    </div>
  );

  // 10. GLASS CAPSULES (Modern Floating Pills)
  const renderGlassCapsules = (b: BookingData = booking) => (
    <div className="flex flex-col gap-3">
      {/* Top Capsule: Hero Showtime */}
      <div className="rounded-[var(--radius-box)] border border-purple-500/30 bg-purple-950/30 backdrop-blur-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block">SHOWTIME PERFORMANCE *</span>
            {renderCardStatusBadge(b)}
            <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-xs text-purple-200">{(eventTypeLabels[b.eventType] || b.eventType)}</span>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-xs text-emerald-300">{b.indoorOutdoor || "Outdoor"}</span>
            <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-xs text-cyan-300">{b.ageRestriction || "All Ages"}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-mono">{b.startTime || "7:00 PM"} – {b.endTime || "10:30 PM"}</h3>
          <p className="text-xs text-white/60 mt-0.5">{b.date} • {b.setDuration || "Full Show"}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-cyan-950/50 border border-cyan-500/30 px-3 py-1 text-xs text-cyan-300">
            Doors: {b.eventStartTime || "6:00 PM"} – {b.eventEndTime || "11:00 PM"}
          </div>
          <div className="rounded-full bg-amber-950/50 border border-amber-500/30 px-3 py-1 text-xs text-amber-300">
            Load-in: {b.loadInTime || "3:00 PM"}
          </div>
        </div>
      </div>

      {/* Mid Capsule: Venue & Audio Rig */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 text-xs space-y-1">
          <span className="text-white/40 uppercase block">LOCATION &amp; STAGE</span>
          <p className="text-sm font-bold text-white">{b.venueName}</p>
          <p className="text-white/60">{b.parkingAddress || `${b.venueCity}, ${b.venueState}`}</p>
          <p className="text-white/50 pt-1 border-t border-white/5">Stage: {b.stageAvailable || "40ft Proscenium"}</p>
        </div>
        <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 text-xs space-y-2">
          <span className="text-emerald-400 uppercase block font-semibold">AUDIO RIG &amp; LIMITER</span>
          <p className="text-white font-medium">{b.soundSystem || "Yes — full PA system"}</p>
          {renderLimiterBar()}
        </div>
      </div>

      {renderParkingCallout(b)}
      {renderPromoterFooter(b)}
    </div>
  );

  
  const renderLayoutForBooking = (layoutVariant: InfoLayoutVariant, b: BookingData) => {
    switch (layoutVariant) {
      case "dual-bay":
        return renderDualBay(b);
      case "timeline-tape":
        return renderTimelineTape(b);
      case "bento":
        return renderBentoGrid(b);
      case "channel-strip":
        return renderChannelStrip(b);
      case "compact-hud":
        return renderCompactHud(b);
      case "tabbed":
        return renderTabbedConsole(b);
      case "pass":
        return renderTourPass(b);
      case "cue-teleprompter":
        return renderCueTeleprompter(b);
      case "blueprint":
        return renderBlueprint(b);
      case "capsules":
        return renderGlassCapsules(b);
      default:
        return renderDualBay(b);
    }
  };

  const renderSingleBookingHero = (
    b: BookingData,
    badgeConfig?: { label: string; dot: string; border: string; bg: string; text: string }
  ) => {
    return (
      <div
        key={b.id}
        className="flex flex-col gap-4 rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-4 sm:p-6 backdrop-blur-md"
      >
        {badgeConfig && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${badgeConfig.bg} ${badgeConfig.border} ${badgeConfig.text}`}
              >
                <span className={`h-2 w-2 rounded-full ${badgeConfig.dot}`} />
                {badgeConfig.label}
              </span>
              <span className="text-xs text-white/50 font-mono">ID: {b.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onSelectBooking) onSelectBooking(b);
                  setBooking(b);
                  setViewMode("single");
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
              >
                Focus Only This Event
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column (7 cols): Identity, Chosen Layout Specs & Action Buttons */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-5">
            {renderIdentityHeader(b)}

            {/* Active Information Layout */}
            <div>{renderLayoutForBooking(selectedLayout, b)}</div>

            <div>
              {renderActionStack(
                b,
                "w-full justify-center text-center cursor-pointer",
                "grid grid-cols-1 sm:grid-cols-3 gap-2"
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Live Venue Radar Map Companion Card */}
          {renderMapCompanion(b)}
        </div>
      </div>
    );
  };

  if (isEditing) {
    return renderEditForm();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── TOP EVENT QUEUE SELECTOR & VIEW MODE BAR ── */}
      <div className="flex flex-col gap-3 rounded-[var(--radius-box)] border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-neutral-950 to-neutral-900/60 p-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <Radio className="h-4 w-4 text-purple-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              EVENT BOOKINGS QUEUE
            </span>
            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300 border border-purple-500/30">
              2 Events Loaded
            </span>
          </div>

          {/* View Mode Controller */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 hidden sm:inline">View Display:</span>
            <div className="flex items-center rounded-full bg-white/[0.05] p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode("both")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "both"
                    ? "bg-[var(--color-purple-primary)] text-white shadow-md shadow-purple-900/40"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Show Both Events (Confirmed &amp; Pending)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("single")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "single"
                    ? "bg-[var(--color-purple-primary)] text-white shadow-md shadow-purple-900/40"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <span>Single Focused View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Event Switcher Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {/* Confirmed Tab Button */}
          <button
            type="button"
            onClick={() => {
              if (onSelectBooking) onSelectBooking(confirmedBooking);
              setBooking(confirmedBooking);
              setViewMode("single");
            }}
            className={`flex items-center justify-between gap-3 rounded-[var(--radius-box)] p-3 text-left transition-all border cursor-pointer ${
              booking.id === confirmedBooking.id && viewMode === "single"
                ? "border-emerald-500/60 bg-emerald-950/30 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-400/40"
                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-emerald-500/30"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    🟢 Confirmed Booking
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">ID: {confirmedBooking.id}</span>
                </div>
                <p className="text-sm font-bold text-white truncate mt-0.5">
                  {confirmedBooking.eventName}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {confirmedBooking.date} • {confirmedBooking.venueName} ({confirmedBooking.indoorOutdoor})
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right hidden sm:block">
              <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 block">
                {confirmedBooking.startTime} – {confirmedBooking.endTime}
              </span>
              <span className="text-[10px] text-white/40 block mt-1">
                {eventTypeLabels[confirmedBooking.eventType] || confirmedBooking.eventType}
              </span>
            </div>
          </button>

          {/* Pending Tab Button */}
          <button
            type="button"
            onClick={() => {
              if (onSelectBooking) onSelectBooking(pendingBooking);
              setBooking(pendingBooking);
              setViewMode("single");
            }}
            className={`flex items-center justify-between gap-3 rounded-[var(--radius-box)] p-3 text-left transition-all border cursor-pointer ${
              booking.id === pendingBooking.id && viewMode === "single"
                ? "border-amber-500/60 bg-amber-950/30 shadow-lg shadow-amber-950/50 ring-1 ring-amber-400/40"
                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-amber-500/30"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    ⏳ Pending Review
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">ID: {pendingBooking.id}</span>
                </div>
                <p className="text-sm font-bold text-white truncate mt-0.5">
                  {pendingBooking.eventName}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {pendingBooking.date} • {pendingBooking.venueName} ({pendingBooking.indoorOutdoor})
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right hidden sm:block">
              <span className="rounded bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[11px] font-semibold text-amber-300 block">
                {pendingBooking.startTime} – {pendingBooking.endTime}
              </span>
              <span className="text-[10px] text-white/40 block mt-1">
                {eventTypeLabels[pendingBooking.eventType] || pendingBooking.eventType}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ── 10 DIFFERENT ARCHITECTURAL WAYS TO LAY OUT THIS INFORMATION ── */}
      <div className="flex flex-col gap-2.5 rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-2 px-1">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              10 Different Ways to Layout This Information
            </span>
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-300 border border-purple-500/30">
              Live Production Switcher
            </span>
          </div>
          <span className="text-xs text-white/50">
            Click to compare distinct visual hierarchies for this exact dataset
          </span>
        </div>

        {/* 10 Layout Selection Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {INFO_LAYOUTS.map((v) => {
            const isSelected = selectedLayout === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedLayout(v.id)}
                className={`flex items-center justify-between gap-1.5 rounded-[var(--radius-box)] px-3 py-2 text-xs font-medium transition-all cursor-pointer text-left border ${
                  isSelected
                    ? "bg-[var(--color-purple-primary)] text-white shadow-lg shadow-purple-900/40 border-purple-400/50 ring-1 ring-purple-300/40"
                    : "border-white/5 bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/10"
                }`}
              >
                <span className="truncate">{v.label}</span>
                {isSelected ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                ) : (
                  <span className="text-xs text-white/30 hidden xl:inline uppercase">{v.tag}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── EVENTS DISPLAY (BOTH OR SINGLE) ── */}
      {viewMode === "both" ? (
        <div className="flex flex-col gap-8">
          {renderSingleBookingHero(confirmedBooking, {
            label: "🟢 1. CONFIRMED EVENT",
            dot: "bg-emerald-400 animate-pulse",
            border: "border-emerald-500/40",
            bg: "bg-emerald-500/20",
            text: "text-emerald-300",
          })}

          {renderSingleBookingHero(pendingBooking, {
            label: "⏳ 2. PENDING REVIEW EVENT",
            dot: "bg-amber-400",
            border: "border-amber-500/40",
            bg: "bg-amber-500/20",
            text: "text-amber-300",
          })}
        </div>
      ) : (
        renderSingleBookingHero(booking)
      )}
    </div>
  );
}
