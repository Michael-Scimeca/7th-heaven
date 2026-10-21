"use client";

import React from "react";
import type { BookingSlot } from "@/components/CalendarPicker";
import type { TourDateDetailItem } from "@/lib/booking-availability";
import {
  Plus,
  X,
  Megaphone,
  Lock,
  Clock,
  User,
  Building2,
  Volume2,
  Ticket,
  Car,
  FileText,
  Sliders,
  ExternalLink,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { DotChevronDown, DotChevronRight } from "@/components/ui/DotArrow";
import GlowInput from "@/components/GlowInput";
import Dropdown from "@/components/Dropdown";
import { SectionHeader } from "@/components/SectionHeader";
import PageSection from "@/components/PageSection";
import Stack from "@/components/Stack";
import { PARKING_OPTIONS } from "./BookClient";

export interface ScheduledShowsSectionProps {
  sanityContent?: any;
  bookingSlots: BookingSlot[];
  setBookingSlots: React.Dispatch<React.SetStateAction<BookingSlot[]>>;
  dateDetails: Record<string, TourDateDetailItem[]>;
  expandedMetadata: Record<string, boolean>;
  setExpandedMetadata: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  formData: any;
  hasSavedForm?: boolean;
  selectedType?: string | null;
}

export function getFormatLabel(type?: string, custom?: string): string {
  switch (type) {
    case "full_band":
      return "Full Band (Rock Show)";
    case "unplugged":
      return "Unplugged Acoustic";
    case "private":
      return "Private Event";
    case "festival":
      return "Festival / Concert";
    case "custom":
      return custom || "Custom Booking";
    default:
      return type
        ? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "Full Band";
  }
}

export function BookingSlotMetadataSection({
  slot,
  bookingSlots,
  setBookingSlots,
}: {
  slot: any;
  bookingSlots: any[];
  setBookingSlots: (s: any[]) => void;
}) {
  return (
    <div className="mt-4 animate-[fade-in-up_0.15s_ease-out_both] flex flex-col gap-3 rounded-lg border border-purple-500/20 bg-purple-950/20 p-3 sm:p-4">
      {/* Row 1: Age Limit, Cover / Price, Ticket Link */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label
            htmlFor={`slot-age-limit-${slot.id}`}
            className="mb-1 block text-xs tracking-wider uppercase text-white/50"
          >
            Age Limit
          </label>
          <Dropdown
            id={`slot-age-limit-${slot.id}`}
            fullWidth={true}
            selected={slot.ageRestriction || "all_ages"}
            options={[
              { label: "All Ages", value: "all_ages" },
              { label: "21 & Over", value: "21_plus" },
              { label: "18 & Over", value: "18_plus" },
            ]}
            onChange={(val) => {
              const updated = bookingSlots.map((s) =>
                s.id === slot.id ? { ...s, ageRestriction: val } : s,
              );
              setBookingSlots(updated);
            }}
            className="w-full"
          />
        </div>
        <div>
          <GlowInput
            id={`slot-cover-${slot.id}`}
            label="Cover / Price"
            type="text"
            placeholder="e.g. Free, $15..."
            value={slot.cover || ""}
            onChange={(e) => {
              const updated = bookingSlots.map((s) =>
                s.id === slot.id ? { ...s, cover: e.target.value } : s,
              );
              setBookingSlots(updated);
            }}
            wrapperClassName="w-full"
          />
        </div>
        <div>
          <GlowInput
            id={`slot-ticket-link-${slot.id}`}
            label="Ticket Link"
            type="text"
            placeholder="https://..."
            value={slot.ticketLink || ""}
            onChange={(e) => {
              const updated = bookingSlots.map((s) =>
                s.id === slot.id ? { ...s, ticketLink: e.target.value } : s,
              );
              setBookingSlots(updated);
            }}
            wrapperClassName="w-full"
          />
        </div>
      </div>

      {/* Row 2: Parking Access Type, Parking Pass Link, Google Maps Link */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label
            htmlFor={`slot-parking-type-${slot.id}`}
            className="mb-1 block text-xs tracking-wider uppercase text-white/50"
          >
            Parking & Access Type
          </label>
          <Dropdown
            id={`slot-parking-type-${slot.id}`}
            fullWidth={true}
            selected={slot.parkingType || "bus-trailer"}
            options={PARKING_OPTIONS.map((p) => ({
              label: p.label,
              value: p.id,
            }))}
            onChange={(val) => {
              const defaultNote =
                PARKING_OPTIONS.find((p) => p.id === val)?.defaultNote || "";
              const updated = bookingSlots.map((s) =>
                s.id === slot.id
                  ? {
                    ...s,
                    parkingType: val,
                    parkingNotes: s.parkingNotes ? s.parkingNotes : defaultNote,
                  }
                  : s,
              );
              setBookingSlots(updated);
            }}
            className="w-full"
          />
        </div>
        <div>
          <GlowInput
            id={`slot-parking-url-${slot.id}`}
            label="Parking Map / Pass Link"
            type="text"
            placeholder="https://... parking map or permits"
            value={slot.parkingUrl || ""}
            onChange={(e) => {
              const updated = bookingSlots.map((s) =>
                s.id === slot.id ? { ...s, parkingUrl: e.target.value } : s,
              );
              setBookingSlots(updated);
            }}
            wrapperClassName="w-full"
          />
        </div>
        <div>
          <GlowInput
            id={`slot-map-url-${slot.id}`}
            label="Google Maps Link"
            type="text"
            placeholder="https://maps.google.com/..."
            value={slot.mapUrl || slot.directionsLink || ""}
            onChange={(e) => {
              const updated = bookingSlots.map((s) =>
                s.id === slot.id
                  ? {
                    ...s,
                    mapUrl: e.target.value,
                    directionsLink: e.target.value,
                  }
                  : s,
              );
              setBookingSlots(updated);
            }}
            wrapperClassName="w-full"
          />
        </div>
      </div>

      {/* Row 4: Gate / Dock & Load-in Instructions */}
      <div>
        <GlowInput
          id={`slot-parking-notes-${slot.id}`}
          label="Specific Gate / Dock / Bus Access Notes"
          type="text"
          placeholder="e.g. West Lot Gate 4, backstage bus hookups, or dock bay 2..."
          value={slot.parkingNotes || slot.parkingInfo || ""}
          onChange={(e) => {
            const updated = bookingSlots.map((s) =>
              s.id === slot.id
                ? {
                  ...s,
                  parkingNotes: e.target.value,
                  parkingInfo: e.target.value,
                }
                : s,
            );
            setBookingSlots(updated);
          }}
          wrapperClassName="w-full"
        />
      </div>

      {/* Row 5: Public Tour Notes & Announcements */}
      <div>
        <GlowInput
          id={`slot-notes-${slot.id}`}
          label="Tour Notes & Announcements (Optional)"
          type="text"
          placeholder="e.g. Headline festival set, fireworks after 7th Heaven, all-age lawn seating..."
          value={slot.notes || ""}
          onChange={(e) => {
            const updated = bookingSlots.map((s) =>
              s.id === slot.id ? { ...s, notes: e.target.value } : s,
            );
            setBookingSlots(updated);
          }}
          wrapperClassName="w-full"
        />
      </div>

      {/* Row 6: Classification Toggles */}
      <div className="flex flex-wrap items-center gap-6 border-t border-white/10 pt-2.5 text-xs text-white/70">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(slot.isFestival)}
            onChange={(e) => {
              const updated = bookingSlots.map((s) =>
                s.id === slot.id ? { ...s, isFestival: e.target.checked } : s,
              );
              setBookingSlots(updated);
            }}
            className="h-4 w-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-400"
          />
          <span className="font-medium text-white/90">🎪 Festival Stage / Fair</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(slot.isPrivate)}
            onChange={(e) => {
              const updated = bookingSlots.map((s) =>
                s.id === slot.id ? { ...s, isPrivate: e.target.checked } : s,
              );
              setBookingSlots(updated);
            }}
            className="h-4 w-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-400"
          />
          <span className="font-medium text-white/90">🔒 Private / Unlisted Tour Show</span>
        </label>
      </div>
    </div>
  );
}

export function ScheduledShowsSection({
  sanityContent,
  bookingSlots,
  setBookingSlots,
  dateDetails,
  expandedMetadata,
  setExpandedMetadata,
  formData,
  hasSavedForm,
  selectedType,
}: ScheduledShowsSectionProps) {
  return (
    <PageSection
      id="scheduled-shows"
      aria-labelledby="scheduled-shows-heading"
      size="sm"
      containerClassName="bg-[var(--color-section-bg)]"
    >
      <SectionHeader
        as="h2"
        id="scheduled-shows-heading"
        title={
          sanityContent?.sections?.find(
            (s: any) =>
              s.sectionId === "scheduled-shows" ||
              s.sectionId === "schedule",
          )?.title || "Your Scheduled Shows"
        }
        subtitle={
          sanityContent?.sections?.find(
            (s: any) =>
              s.sectionId === "scheduled-shows" ||
              s.sectionId === "schedule",
          )?.subtitle ||
          "Review confirmed show dates, timeline milestones, venue, and stage logistics"
        }
        action={
          bookingSlots.length > 0 ? (
            <span className="rounded-lg border border-purple-400/30 bg-cyan-500/20 px-3 py-1 text-small font-semibold">
              {bookingSlots.length} Show{bookingSlots.length > 1 ? "s" : ""}
            </span>
          ) : null
        }
      />
      <Stack gap="lg">
        {bookingSlots.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
            <span className="mb-6 block text-4xl">📅</span>
            <div className="title-group title-group--sub title-group--center items-center text-center">
              <h4 className="text-center">
                {sanityContent?.sections?.find(
                  (s: any) => s.sectionId === "no_dates",
                )?.title || "No Dates Selected Yet"}
              </h4>
              <p className="mx-auto max-w-md text-center">
                {sanityContent?.sections?.find(
                  (s: any) => s.sectionId === "no_dates",
                )?.subtitle ||
                  "Click one or more dates on the calendar picker above to select dates for your tour date booking request. You can schedule multiple dates at once."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-1 xl:grid-cols-2">
              {bookingSlots.map((slot, index) => {
                const formattedDate = new Date(
                  slot.date + "T12:00:00Z",
                ).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                });
                return (
                  <div
                    key={slot.id}
                    className="transition-colors group relative border border-white/10 bg-[#00000029] p-4 sm:p-6 hover:border-purple-400/40"
                  >
                    <div className="mb-4 flex w-full items-start justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="block text-xs font-semibold text-white/50 uppercase tracking-wider">
                            Show #{index + 1}
                          </span>
                          {(slot.venueName || formData.venueName) && (
                            <>
                              <span className="text-white/30">•</span>
                              <span className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-purple-400" />
                                {slot.venueName || formData.venueName}
                              </span>
                            </>
                          )}
                        </div>
                        <h5 className="text-white">
                          {formattedDate}
                        </h5>
                      </div>

                      {/* Duplicate and Remove buttons */}
                      <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center">
                        <button
                          type="button"
                          onClick={() => {
                            const newSlot = {
                              ...slot,
                              id: Math.random().toString(36).substring(2, 9),
                              venueName: slot.venueName || formData.venueName || "",
                              venueCity: slot.venueCity || formData.venueCity || "",
                              venueState: slot.venueState || formData.venueState || "",
                              parkingAddress: slot.parkingAddress || formData.parkingAddress || "",
                              parkingType: slot.parkingType || formData.parkingType || "bus-trailer",
                              parkingNotes: slot.parkingNotes || formData.parkingNotes || "",
                            };
                            setBookingSlots([...bookingSlots, newSlot]);
                          }}
                          className="transition-colors flex cursor-pointer items-center gap-1 rounded border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-white/80 hover:border-purple-400/30 hover:bg-cyan-500/20 hover:text-white"
                          title="Add another show on this date"
                        >
                          <Plus className="h-3 w-3 shrink-0" /> Add Another
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setBookingSlots(
                              bookingSlots.filter((s) => s.id !== slot.id),
                            )
                          }
                          className="transition-colors flex cursor-pointer items-center gap-1 rounded border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-white/80 hover:border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-400"
                          title="Remove this show"
                        >
                          <X className="h-3 w-3 shrink-0" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Existing Show Double-Booking Notice */}
                    {dateDetails[slot.date] && dateDetails[slot.date].length > 0 && (
                      <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                        <div className="flex items-start gap-2.5">
                          <span className="text-base leading-none mt-0.5" aria-hidden="true">⚠️</span>
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <p className="font-semibold text-rose-300">
                                Existing Show Scheduled on This Date:
                              </p>
                              <span className="text-[10px] text-rose-300 font-medium bg-rose-500/20 px-2 py-0.5 rounded-full">
                                Double-Booking Allowed
                              </span>
                            </div>

                            {dateDetails[slot.date].map((d, i) => {
                              const mapHref = d.mapUrl || d.directionsLink;
                              return (
                                <div
                                  key={`${slot.date}-${d.time}-${d.venue || ""}-${i}`}
                                  className="rounded-lg bg-black/40 border border-rose-500/20 p-2.5 flex flex-col gap-2 text-rose-200/90"
                                >
                                  {/* Venue & Location + Badges */}
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                      <span className="text-white/40 block text-[10px] uppercase tracking-wider font-semibold">
                                        Venue & Location
                                      </span>
                                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                        {d.day && (
                                          <span className="font-semibold text-purple-300">
                                            {d.day} •
                                          </span>
                                        )}
                                        <span className="font-bold text-white text-xs">
                                          {d.venue || "Venue"}
                                        </span>
                                        {(d.city || d.state) && (
                                          <span className="text-white/70 text-xs">
                                            ({d.city}{d.state ? `, ${d.state}` : ""})
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5">
                                      {d.isFestival && (
                                        <span className="rounded bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                                          🎪 Festival
                                        </span>
                                      )}
                                      {d.isPrivate && (
                                        <span className="rounded bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300">
                                          🔒 Private
                                        </span>
                                      )}
                                      {d.allAges !== undefined && (
                                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
                                          {d.allAges ? "All Ages" : "21+"}
                                        </span>
                                      )}
                                      {d.cover && (
                                        <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                                          {d.cover}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Times & Action Links */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-white/10 pt-1.5 text-xs">
                                    <div>
                                      <span className="text-white/40 block text-[10px] uppercase tracking-wider font-semibold">
                                        Stage Schedule
                                      </span>
                                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-white text-xs">
                                        <span>
                                          <strong>Show:</strong> {d.time}
                                        </span>
                                        {d.doorsTime && (
                                          <span className="text-white/70">
                                            <strong>Doors:</strong> {d.doorsTime}
                                          </span>
                                        )}
                                        {d.playTime && d.playTime !== d.time && (
                                          <span className="text-purple-300">
                                            <strong>Set:</strong> {d.playTime}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                                      {mapHref && (
                                        <a
                                          href={mapHref}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 rounded bg-white/10 hover:bg-white/20 border border-white/15 px-2 py-0.5 text-[11px] font-medium text-purple-300 hover:text-white transition-colors"
                                        >
                                          🗺️ Map
                                        </a>
                                      )}
                                      {d.ticketLink && (
                                        <a
                                          href={d.ticketLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 rounded bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 px-2 py-0.5 text-[11px] font-medium text-purple-200 hover:text-white transition-colors"
                                        >
                                          🎟️ Tickets
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  {/* Tour Notes */}
                                  {d.notes && (
                                    <div className="border-t border-white/10 pt-1 text-[11px]">
                                      <span className="text-white/40 block text-[10px] uppercase tracking-wider font-semibold">
                                        Tour Notes
                                      </span>
                                      <p className="mt-0.5 text-white/80">{d.notes}</p>
                                    </div>
                                  )}

                                  {/* Parking */}
                                  {(d.parkingInfo || d.parkingUrl) && (
                                    <div className="rounded bg-amber-500/10 border border-amber-500/20 p-2 text-[11px] text-amber-200/90 flex flex-col gap-0.5">
                                      <div className="flex items-center justify-between gap-1.5">
                                        <span className="text-amber-300 font-semibold text-[10px] uppercase tracking-wider">
                                          🅿️ Parking & Load-In
                                        </span>
                                        {d.parkingUrl && (
                                          <a
                                            href={d.parkingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] text-amber-300 hover:text-white underline font-medium transition-colors"
                                          >
                                            Parking Map ↗
                                          </a>
                                        )}
                                      </div>
                                      {d.parkingInfo && (
                                        <p className="text-amber-100/90">{d.parkingInfo}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            <p className="mt-0.5 text-[11px] text-white/60 italic">
                              Double-booking permitted: please configure your preferred alternate time frame below (e.g. afternoon or daytime set).
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confirmed Show Format & Schedule Times (Locked / Fixed - Not Changeable) */}
                    <div className="mt-4 rounded-lg border border-purple-500/20 bg-purple-950/20 p-3.5 flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-purple-300/70">
                            Show Format
                          </span>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-white">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                              {getFormatLabel(slot.eventType || selectedType || formData.eventType, slot.customEventType || formData.customEventType)}
                            </span>
                            <span className="text-[11px] text-white/40 font-mono inline-flex items-center gap-1">
                              <Lock className="h-3 w-3 text-purple-400/70" /> Fixed
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-purple-300/70">
                            Show Times
                          </span>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-white">
                              <Clock className="h-3 w-3 text-purple-300" />
                              {slot.startTime || formData.startTime
                                ? `${slot.startTime || formData.startTime} – ${slot.endTime || formData.endTime || "End Time TBD"}`
                                : slot.endTime || formData.endTime
                                  ? `Start Time TBD – ${slot.endTime || formData.endTime}`
                                  : "Show Times TBD"}
                            </span>
                            <span className="text-[11px] text-white/40 font-mono inline-flex items-center gap-1">
                              <Lock className="h-3 w-3 text-purple-400/70" /> Fixed
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stage Schedule Milestones */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-purple-500/20 pt-2 text-xs text-white/80">
                        <div>
                          <span className="text-white/40 text-[10px] uppercase font-semibold mr-1">Doors:</span>
                          <span className="text-white font-medium">{slot.doorsTime || formData.eventStartTime || "Doors TBD"}</span>
                        </div>
                        <div>
                          <span className="text-white/40 text-[10px] uppercase font-semibold mr-1">Band Set:</span>
                          <span className="text-purple-300 font-medium">{slot.playTime || slot.startTime || formData.startTime || "Set Time TBD"}</span>
                        </div>
                        <div>
                          <span className="text-white/40 text-[10px] uppercase font-semibold mr-1">Load-In:</span>
                          <span className="text-white/70">{formData.loadInTime || "Load-In TBD"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Separate Contact/Venue details toggle buttons & form fields */}
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <div className="mb-3">
                        <span className="mb-1.5 block text-xs text-white/50">
                          Contact & Venue Details
                        </span>
                        <div className="grid grid-cols-2 gap-1 rounded-md border border-white/10 bg-black/50 p-1">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = bookingSlots.map((s) =>
                                s.id === slot.id
                                  ? {
                                    ...s,
                                    useSeparateInfo: false,
                                    contactName: "",
                                    contactEmail: "",
                                    contactPhone: "",
                                    venueName: "",
                                    venueCity: "",
                                    venueState: "",
                                  }
                                  : s,
                              );
                              setBookingSlots(updated);
                            }}
                            className={`cursor-pointer rounded py-1.5 px-1.5 text-center text-xs transition-colors ${!slot.useSeparateInfo ? "bg-purple-600 font-semibold text-white shadow-sm shadow-purple-600/40" : "text-white/60 hover:text-white"}`}
                          >
                            Share Main Info
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = bookingSlots.map((s) =>
                                s.id === slot.id
                                  ? {
                                    ...s,
                                    useSeparateInfo: true,
                                    contactName:
                                      s.contactName || formData.name || "",
                                    contactEmail:
                                      s.contactEmail || formData.email || "",
                                    contactPhone:
                                      s.contactPhone || formData.phone || "",
                                    venueName:
                                      s.venueName ||
                                      formData.venueName ||
                                      "",
                                    parkingAddress:
                                      s.parkingAddress ||
                                      formData.parkingAddress ||
                                      "",
                                    venueCity:
                                      s.venueCity ||
                                      formData.venueCity ||
                                      "",
                                    venueState:
                                      s.venueState ||
                                      formData.venueState ||
                                      "",
                                    parkingType:
                                      s.parkingType ||
                                      formData.parkingType ||
                                      "bus-trailer",
                                    parkingNotes:
                                      s.parkingNotes ||
                                      formData.parkingNotes ||
                                      "",
                                  }
                                  : s,
                              );
                              setBookingSlots(updated);
                            }}
                            className={`cursor-pointer rounded py-1.5 px-1.5 text-center text-xs transition-colors ${slot.useSeparateInfo ? "bg-purple-600 font-semibold text-white shadow-sm shadow-purple-600/40" : "text-white/60 hover:text-white"}`}
                          >
                            Use Separate Info
                          </button>
                        </div>
                      </div>

                      {!slot.useSeparateInfo ? (
                        <div className="mt-2 animate-[fade-in-up_0.1s_ease-out_both] flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3.5 text-xs text-white/70">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-white/40 flex items-center gap-1.5 shrink-0">
                              <User className="h-3.5 w-3.5 text-purple-400" /> Contact:
                            </span>
                            <div className="text-right">
                              <span className="font-semibold text-white">
                                {formData.name || (
                                  <span className="text-white/50 italic">(empty)</span>
                                )}
                              </span>
                              {formData.email && (
                                <span className="mt-0.5 block text-white/60 text-[11px]">
                                  {formData.email}
                                </span>
                              )}
                              {formData.phone && (
                                <span className="block text-white/60 text-[11px]">
                                  {formData.phone}
                                </span>
                              )}
                              {formData.organization && (
                                <span className="block text-purple-300/80 text-[11px] font-medium">
                                  {formData.organization}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start justify-between gap-2 border-t border-white/10 pt-2">
                            <span className="text-white/40 flex items-center gap-1.5 shrink-0">
                              <Building2 className="h-3.5 w-3.5 text-purple-400" /> Venue:
                            </span>
                            <div className="text-right">
                              <span className="font-semibold text-white">
                                {formData.venueName || (
                                  <span className="text-white/50 italic">(empty)</span>
                                )}
                              </span>
                              {(formData.venueAddress || formData.parkingAddress) && (
                                <span className="mt-0.5 block text-white/60 text-[11px]">
                                  {formData.venueAddress || formData.parkingAddress}
                                </span>
                              )}
                              {(formData.venueCity ||
                                formData.venueState) && (
                                  <span className="block text-white/60 text-[11px]">
                                    {formData.venueCity || "—"},{" "}
                                    {formData.venueState || "—"}
                                  </span>
                                )}
                            </div>
                          </div>
                          <p className="mt-1 flex items-center justify-end gap-1 border-t border-white/10 pt-1.5 text-right text-[11px] text-purple-300/80">
                            <span>
                              🔗 Link Active: Shares primary contact & venue data
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 animate-[fade-in-up_0.15s_ease-out_both] flex flex-col gap-3 border border-white/10 bg-white/[0.03] p-3.5">
                          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-white/40">
                              Separate Show Info
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = bookingSlots.map((s) =>
                                    s.id === slot.id
                                      ? {
                                        ...s,
                                        contactName: formData.name,
                                        contactEmail: formData.email,
                                        contactPhone: formData.phone,
                                        venueName: formData.venueName || "",
                                        parkingAddress: formData.parkingAddress || "",
                                        venueCity: formData.venueCity || "",
                                        venueState: formData.venueState || "",
                                        parkingType: formData.parkingType || "bus-trailer",
                                        parkingNotes: formData.parkingNotes || "",
                                      }
                                      : s,
                                  );
                                  setBookingSlots(updated);
                                }}
                                className="transition-colors cursor-pointer hover:text-white"
                              >
                                ⚡ Copy Main
                              </button>
                              {hasSavedForm && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    try {
                                      const saved =
                                        localStorage.getItem(
                                          "7h_planner_last_form_v1",
                                        ) ||
                                        localStorage.getItem(
                                          "7h_planner_last_form",
                                        );
                                      if (saved) {
                                        const parsed = JSON.parse(saved);
                                        const updated = bookingSlots.map(
                                          (s) =>
                                            s.id === slot.id
                                              ? {
                                                ...s,
                                                contactName:
                                                  parsed.name ||
                                                  s.contactName,
                                                contactEmail:
                                                  parsed.email ||
                                                  s.contactEmail,
                                                contactPhone:
                                                  parsed.phone ||
                                                  s.contactPhone,
                                                venueName:
                                                  parsed.venueName ||
                                                  s.venueName,
                                                venueCity:
                                                  parsed.venueCity ||
                                                  s.venueCity,
                                                venueState:
                                                  parsed.venueState ||
                                                  s.venueState,
                                              }
                                              : s,
                                        );
                                        setBookingSlots(updated);
                                      }
                                    } catch { }
                                  }}
                                  className="transition-colors cursor-pointer text-purple-400 hover:text-white"
                                >
                                  ⚡ Load Last
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <GlowInput
                                id={`slot-contact-name-${slot.id}`}
                                label="Contact Name"
                                type="text"
                                placeholder="e.g. Jane Doe"
                                value={slot.contactName || ""}
                                onChange={(e) => {
                                  const updated = bookingSlots.map((s) =>
                                    s.id === slot.id
                                      ? { ...s, contactName: e.target.value }
                                      : s,
                                  );
                                  setBookingSlots(updated);
                                }}
                                wrapperClassName="w-full"
                              />
                            </div>
                            <div>
                              <GlowInput
                                id={`slot-contact-phone-${slot.id}`}
                                label="Contact Phone"
                                type="tel"
                                placeholder="e.g. (555) 000-0000"
                                value={slot.contactPhone || ""}
                                onChange={(e) => {
                                  const updated = bookingSlots.map((s) =>
                                    s.id === slot.id
                                      ? { ...s, contactPhone: e.target.value }
                                      : s,
                                  );
                                  setBookingSlots(updated);
                                }}
                                wrapperClassName="w-full"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <GlowInput
                                id={`slot-contact-org-${slot.id}`}
                                label="Organization"
                                type="text"
                                placeholder="e.g. Acme Festival"
                                value={slot.organization || ""}
                                onChange={(e) => {
                                  const updated = bookingSlots.map((s) =>
                                    s.id === slot.id
                                      ? { ...s, organization: e.target.value }
                                      : s,
                                  );
                                  setBookingSlots(updated);
                                }}
                                wrapperClassName="w-full"
                              />
                            </div>
                            <div>
                              <GlowInput
                                id={`slot-contact-email-${slot.id}`}
                                label="Contact Email"
                                type="email"
                                placeholder="e.g. jane@email.com"
                                value={slot.contactEmail || ""}
                                onChange={(e) => {
                                  const updated = bookingSlots.map((s) =>
                                    s.id === slot.id
                                      ? { ...s, contactEmail: e.target.value }
                                      : s,
                                  );
                                  setBookingSlots(updated);
                                }}
                                wrapperClassName="w-full"
                              />
                            </div>
                          </div>

                          <div>
                            <GlowInput
                              id={`slot-venue-name-${slot.id}`}
                              label="Venue Name"
                              type="text"
                              placeholder="e.g. House of Blues"
                              value={slot.venueName || ""}
                              onChange={(e) => {
                                const updated = bookingSlots.map((s) =>
                                  s.id === slot.id
                                  ? { ...s, venueName: e.target.value }
                                  : s,
                              );
                              setBookingSlots(updated);
                            }}
                            wrapperClassName="w-full"
                          />
                        </div>

                        <div>
                          <GlowInput
                            id={`slot-parking-address-${slot.id}`}
                            label="Physical Street Address"
                            type="text"
                            placeholder="e.g. 329 N Dearborn St"
                            value={slot.parkingAddress || ""}
                            onChange={(e) => {
                              const updated = bookingSlots.map((s) =>
                                s.id === slot.id
                                  ? { ...s, parkingAddress: e.target.value }
                                  : s,
                              );
                              setBookingSlots(updated);
                            }}
                            wrapperClassName="w-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <GlowInput
                              id={`slot-venue-city-${slot.id}`}
                              label="City"
                              type="text"
                              placeholder="Chicago"
                              value={slot.venueCity || ""}
                              onChange={(e) => {
                                const updated = bookingSlots.map((s) =>
                                  s.id === slot.id
                                    ? { ...s, venueCity: e.target.value }
                                    : s,
                                );
                                setBookingSlots(updated);
                              }}
                              wrapperClassName="w-full"
                            />
                          </div>
                          <div>
                            <GlowInput
                              id={`slot-venue-state-${slot.id}`}
                              label="State"
                              type="text"
                              placeholder="IL"
                              value={slot.venueState || ""}
                              onChange={(e) => {
                                const updated = bookingSlots.map((s) =>
                                  s.id === slot.id
                                    ? { ...s, venueState: e.target.value }
                                    : s,
                                );
                                setBookingSlots(updated);
                              }}
                              wrapperClassName="w-full"
                            />
                          </div>
                        </div>

                        <div>
                          <GlowInput
                            id={`slot-parking-notes-${slot.id}`}
                            label="Specific Gate / Dock & Load-In Instructions"
                            type="text"
                            placeholder="e.g. Band bus & truck park in West Lot behind stage. Enter through Gate 4 off Bartlett Rd."
                            value={slot.parkingNotes || ""}
                            onChange={(e) => {
                              const updated = bookingSlots.map((s) =>
                                s.id === slot.id
                                  ? { ...s, parkingNotes: e.target.value }
                                  : s,
                              );
                              setBookingSlots(updated);
                            }}
                            wrapperClassName="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Complete Show Details & Stage Logistics (Directly Displayed) */}
                  <div className="mt-4 border-t border-white/10 pt-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold text-xs text-white/90">
                        <Megaphone className="h-3.5 w-3.5 text-purple-400" />
                        <span>Tour Date & Stage Details</span>
                      </span>
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> All Info Confirmed
                      </span>
                    </div>

                    {/* 5-Box Info Grid: Location, Production, Admission, Parking & Tour Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {/* Box 1: Physical Venue Location & Map */}
                      <div className="sm:col-span-2 rounded-lg border border-purple-500/20 bg-purple-950/20 p-3.5 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-purple-300 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-purple-400" /> Physical Venue Location &amp; Directions
                          </span>
                          {(slot.venueName || formData.venueName || slot.parkingAddress || formData.parkingAddress) && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                [
                                  slot.venueName || formData.venueName,
                                  slot.parkingAddress || formData.parkingAddress,
                                  slot.venueCity || formData.venueCity,
                                  slot.venueState || formData.venueState,
                                ]
                                  .filter(Boolean)
                                  .join(", ")
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-300 hover:text-white underline inline-flex items-center gap-1 text-[11px] font-medium"
                            >
                              Live Google Map <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-white/80 pt-1">
                          <div className="rounded border border-white/5 bg-white/[0.02] p-2">
                            <span className="text-white/40 text-[10px] uppercase block font-semibold">Venue Name</span>
                            <span className="font-semibold text-white text-xs block truncate mt-0.5">
                              {slot.venueName || formData.venueName || "Venue TBD"}
                            </span>
                          </div>
                          <div className="rounded border border-white/5 bg-white/[0.02] p-2">
                            <span className="text-white/40 text-[10px] uppercase block font-semibold">Street Address</span>
                            <span className="font-medium text-white/90 text-xs block truncate mt-0.5">
                              {slot.parkingAddress || formData.parkingAddress || "Address TBD"}
                            </span>
                          </div>
                          <div className="rounded border border-white/5 bg-white/[0.02] p-2">
                            <span className="text-white/40 text-[10px] uppercase block font-semibold">City, State</span>
                            <span className="font-medium text-white/90 text-xs block mt-0.5">
                              {(slot.venueCity || formData.venueCity)
                                ? `${slot.venueCity || formData.venueCity}, ${slot.venueState || formData.venueState || ""}`
                                : "Location TBD"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Box 2: Sound & Stage Production */}
                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 flex flex-col gap-2">
                        <span className="text-white/40 text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1">
                          <Volume2 className="h-3 w-3 text-purple-400" /> Sound &amp; Production
                        </span>
                        <div className="flex flex-col gap-1 text-white/80">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-white/50">PA System:</span>
                            <span className="font-medium text-white text-right">
                              {formData.soundSystem || "Venue Provides Full PA"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-white/50">Stage:</span>
                            <span className="font-medium text-white text-right">
                              {formData.stageAvailable || "Stage Provided"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-white/50">Backline:</span>
                            <span className="font-medium text-white text-right">
                              {formData.backlineProvided || "Band Brings Own Gear"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-white/50">Environment:</span>
                            <span className="font-medium text-white text-right">
                              {formData.indoorOutdoor || "Indoor"}
                              {formData.expectedAttendance ? ` • ~${formData.expectedAttendance}` : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Box 3: Admission, Age & Tickets */}
                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 flex flex-col gap-2">
                        <span className="text-white/40 text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1">
                          <Ticket className="h-3 w-3 text-purple-400" /> Admission &amp; Age Limit
                        </span>
                        <div className="flex flex-col gap-1 text-white/80">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-white/50">Age Policy:</span>
                            <span className="font-medium text-white text-right">
                              {slot.ageRestriction === "21_plus"
                                ? "21 & Over"
                                : slot.ageRestriction === "18_plus"
                                  ? "18 & Over"
                                  : slot.ageRestriction === "all_ages"
                                    ? "All Ages"
                                    : (formData.ageRestriction === "21_plus"
                                      ? "21 & Over"
                                      : formData.ageRestriction === "18_plus"
                                        ? "18 & Over"
                                        : "All Ages")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-white/50">Cover / Price:</span>
                            <span className="font-medium text-white text-right">
                              {slot.cover || "Free / Included with Event"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-white/50">Tickets:</span>
                            {slot.ticketLink ? (
                              <a
                                href={slot.ticketLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-300 hover:text-white underline inline-flex items-center gap-1 text-[11px]"
                              >
                                Ticket Link <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            ) : (
                              <span className="text-white/40 italic">Direct Entry</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-white/50">Map / Directions:</span>
                            {(slot.mapUrl || slot.directionsLink) ? (
                              <a
                                href={slot.mapUrl || slot.directionsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-300 hover:text-white underline inline-flex items-center gap-1 text-[11px]"
                              >
                                Google Maps <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            ) : (
                              <span className="text-white/40 italic">Venue Address</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Box 4: Parking & Load-In Access (Full width) */}
                      <div className="sm:col-span-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-white/40 text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1">
                            <Car className="h-3 w-3 text-cyan-400" /> Parking &amp; Load-In Access
                          </span>
                          {slot.parkingUrl && (
                            <a
                              href={slot.parkingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-300 hover:text-white underline inline-flex items-center gap-1 text-[11px]"
                            >
                              Parking Map / Permits <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 text-white/80">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-white/50 shrink-0">Access Type:</span>
                            <span className="font-medium text-cyan-300 text-right">
                              {PARKING_OPTIONS.find((p) => p.id === (slot.parkingType || formData.parkingType || "bus-trailer"))?.label || "Band Bus & Trailer Lot"}
                            </span>
                          </div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-white/50 shrink-0">Specific Gate / Dock:</span>
                            <span className="text-white/80 text-right">
                              {slot.parkingNotes || slot.parkingInfo || formData.parkingNotes || "No specific gate notes provided"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Box 5: Tour Notes & Announcements (Full width) */}
                      <div className="sm:col-span-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 flex flex-col gap-1.5">
                        <span className="text-white/40 text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1">
                          <FileText className="h-3 w-3 text-purple-400" /> Tour Notes &amp; Announcements
                        </span>
                        <p className="text-white/80 italic text-xs">
                          {slot.notes || formData.details || "Standard band tour rider & stage schedule apply."}
                        </p>
                      </div>
                    </div>

                    {/* Optional Customization Toggle */}
                    <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMetadata((prev) => ({
                            ...prev,
                            [slot.id]: !prev[slot.id],
                          }))
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                        <span>
                          {expandedMetadata[slot.id]
                            ? "Close Customization Fields"
                            : "Customize Tickets, Links & Notes for this Show"}
                        </span>
                        {expandedMetadata[slot.id] ? (
                          <DotChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <DotChevronRight className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <span className="text-[11px] text-white/40">
                        {expandedMetadata[slot.id]
                          ? "Editing overrides"
                          : `Click to customize Show #${index + 1}`}
                      </span>
                    </div>

                    {/* Expanded Metadata Form for Overrides */}
                    {expandedMetadata[slot.id] && (
                      <BookingSlotMetadataSection
                        slot={slot}
                        bookingSlots={bookingSlots}
                        setBookingSlots={setBookingSlots}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Stack>
  </PageSection>
);
}
