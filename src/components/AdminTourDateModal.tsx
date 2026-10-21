"use client";

import React, { useState, useEffect, useCallback, useRef, useId } from "react";
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Ticket,
  Truck,
  Bus,
  Warehouse,
  Navigation,
  FileText,
  Sparkles,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Toggle } from "@/components/Toggle";

export const TOUR_PARKING_OPTIONS = [
  {
    id: "bus-trailer",
    label: "Band Bus & Trailer Lot",
    short: "Bus & Trailer",
    icon: Bus,
    description: "Dedicated outdoor lot, rear stage bus parking (e.g. West Lot Gate 4)",
    defaultNote: "Band bus & crew truck park in West Lot behind stage. Enter through Gate 4 off Bartlett Rd.",
  },
  {
    id: "dock-bay",
    label: "Loading Dock & Freight Bay",
    short: "Loading Dock",
    icon: Truck,
    description: "Dedicated loading dock, roll-up bay doors, freight elevator (e.g. Bays 3-4)",
    defaultNote: "Load-in Gate: West Lot 4. Loading dock bays 3-4 at service concourse.",
  },
  {
    id: "garage",
    label: "Venue Parking Garage",
    short: "Garage / Ramp",
    icon: Warehouse,
    description: "Covered or underground multi-level parking ramp",
    defaultNote: "Stage door load-in via venue parking garage lower level.",
  },
  {
    id: "street",
    label: "Street / Alley Load-in Zone",
    short: "Street / Alley",
    icon: Navigation,
    description: "Curb-side street staging or alley access behind venue",
    defaultNote: "Curb-side staging on street or alley behind venue. Ramp to stage floor.",
  },
  {
    id: "custom",
    label: "Custom Instructions",
    short: "Custom Notes",
    icon: MapPin,
    description: "Specific or complex load-in coordinates, security check-in, or VIP permits",
    defaultNote: "",
  },
];

export interface AdminTourDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (savedShow: any) => void;
  onDeleted?: (deletedId: string) => void;
  editingShow?: any | null;
}

interface AdminTourDateFormProps {
  editingShow?: any | null;
  onClose: () => void;
  onSaved?: (savedShow: any) => void;
  onDeleted?: (deletedId: string) => void;
  titleId: string;
}

function AdminTourDateForm({
  editingShow,
  onClose,
  onSaved,
  onDeleted,
  titleId,
}: AdminTourDateFormProps) {
  // Basic Information
  const [venue, setVenue] = useState(editingShow?.venue || "");
  const [address, setAddress] = useState(editingShow?.address || "");
  const [city, setCity] = useState(editingShow?.city || "");
  const [state, setState] = useState(editingShow?.state || "IL");
  const [date, setDate] = useState(editingShow?.date || "");
  const [day, setDay] = useState(editingShow?.day || "");

  // Timing
  const [time, setTime] = useState(editingShow?.time || "");
  const [doorsTime, setDoorsTime] = useState(editingShow?.doorsTime || "");
  const [playTime, setPlayTime] = useState(editingShow?.playTime || "");

  // Admission & Tickets
  const [cover, setCover] = useState(editingShow?.cover || "");
  const [ageRestriction, setAgeRestriction] = useState(
    editingShow?.ageRestriction ||
    (editingShow?.allAges === false ? "21+" : "All Ages"),
  );
  const [ticketLink, setTicketLink] = useState(editingShow?.ticketLink || "");
  const [websiteUrl, setWebsiteUrl] = useState(editingShow?.websiteUrl || "");
  const [mapUrl, setMapUrl] = useState(
    editingShow?.mapUrl || editingShow?.directionsLink || "",
  );

  // Parking & Production Logistics
  const [parkingType, setParkingType] = useState(
    editingShow?.parkingType || "bus-trailer",
  );
  const [parkingAddress, setParkingAddress] = useState(
    editingShow?.parkingAddress || "",
  );
  const [parkingNotes, setParkingNotes] = useState(
    editingShow?.parkingNotes ||
    editingShow?.parkingInfo ||
    (editingShow
      ? ""
      : "Band bus & crew truck park in West Lot behind stage. Enter through Gate 4 off Bartlett Rd."),
  );
  const [parkingUrl, setParkingUrl] = useState(editingShow?.parkingUrl || "");

  // Show Details & Notes
  const [notes, setNotes] = useState(editingShow?.notes || "");

  // Toggles & tags
  const [allAges, setAllAges] = useState(() => editingShow?.allAges ?? true);
  const [isSoldOut, setIsSoldOut] = useState(() => Boolean(editingShow?.isSoldOut));
  const [isFestival, setIsFestival] = useState(() => {
    const rawTags = (editingShow?.tags || []).map((t: string) => t.toLowerCase());
    return Boolean(editingShow?.isFestival || rawTags.includes("festival"));
  });
  const [isPrivate, setIsPrivate] = useState(() => {
    const rawTags = (editingShow?.tags || []).map((t: string) => t.toLowerCase());
    const lowerNotes = ((editingShow?.notes || "") + " " + (editingShow?.info || "")).toLowerCase();
    return Boolean(editingShow?.isPrivate || rawTags.includes("private") || lowerNotes.includes("private"));
  });
  const [isOutdoor, setIsOutdoor] = useState(() => {
    const rawTags = (editingShow?.tags || []).map((t: string) => t.toLowerCase());
    const lowerNotes = ((editingShow?.notes || "") + " " + (editingShow?.info || "")).toLowerCase();
    return Boolean(rawTags.includes("outdoor") || lowerNotes.includes("outdoor") || lowerNotes.includes("beer garden"));
  });
  const [isUnplugged, setIsUnplugged] = useState(() => {
    const rawTags = (editingShow?.tags || []).map((t: string) => t.toLowerCase());
    const lowerNotes = ((editingShow?.notes || "") + " " + (editingShow?.info || "")).toLowerCase();
    return Boolean(rawTags.includes("unplugged") || lowerNotes.includes("unplugged"));
  });
  const [isCasino, setIsCasino] = useState(() => {
    const rawTags = (editingShow?.tags || []).map((t: string) => t.toLowerCase());
    const lowerNotes = ((editingShow?.notes || "") + " " + (editingShow?.info || "")).toLowerCase();
    return Boolean(rawTags.includes("casino") || lowerNotes.includes("casino"));
  });
  const [isSpecialEvent, setIsSpecialEvent] = useState(() => {
    const rawTags = (editingShow?.tags || []).map((t: string) => t.toLowerCase());
    const lowerNotes = ((editingShow?.notes || "") + " " + (editingShow?.info || "")).toLowerCase();
    return Boolean(
      rawTags.includes("special") ||
      rawTags.includes("gala") ||
      rawTags.includes("fundraiser") ||
      rawTags.includes("cruise") ||
      lowerNotes.includes("special") ||
      lowerNotes.includes("gala"),
    );
  });

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Compute day of week from date
  const updateDayFromDate = useCallback((selectedDate: string) => {
    if (!selectedDate) {
      setDay("");
      return;
    }
    try {
      const dateObj = new Date(selectedDate + "T12:00:00");
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      setDay(dayNames[dateObj.getDay()] || "");
    } catch {
      setDay("");
    }
  }, []);

  // Auto-generate Google Maps link if empty
  const handleGenerateMapUrl = () => {
    const parts = [venue, address, city, state].filter(Boolean);
    if (parts.length > 0) {
      const generated = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(", "))}`;
      setMapUrl(generated);
    }
  };

  const handleSelectParkingType = (typeId: string) => {
    setParkingType(typeId);
    const selectedOption = TOUR_PARKING_OPTIONS.find((opt) => opt.id === typeId);
    if (selectedOption?.defaultNote && (!parkingNotes || parkingNotes === "None" || parkingNotes.trim() === "")) {
      setParkingNotes(selectedOption.defaultNote);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!venue.trim()) {
      setError("Venue name is required.");
      return;
    }
    if (!city.trim()) {
      setError("City is required.");
      return;
    }
    if (!state.trim()) {
      setError("State is required.");
      return;
    }
    if (!date.trim()) {
      setError("Date is required.");
      return;
    }

    setSubmitting(true);

    try {
      const isEditing = Boolean(editingShow?._id);
      const url = "/api/admin/shows";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        ...(isEditing && { id: editingShow._id }),
        venue: venue.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        date: date.trim(),
        day: day.trim() || undefined,
        time: time.trim() || undefined,
        doorsTime: doorsTime.trim() || undefined,
        playTime: playTime.trim() || undefined,
        cover: cover.trim() || undefined,
        ageRestriction: ageRestriction.trim() || undefined,
        ticketLink: ticketLink.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        mapUrl: mapUrl.trim() || undefined,
        parkingType: parkingType || "bus-trailer",
        parkingAddress: parkingAddress.trim() || undefined,
        parkingNotes: parkingNotes.trim() || undefined,
        parkingUrl: parkingUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        allAges,
        isSoldOut,
        isFestival,
        isPrivate,
        isOutdoor,
        isUnplugged,
        isCasino,
        isSpecialEvent,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save tour date.");
      }

      setSuccessMsg(
        isEditing
          ? "Tour date successfully updated!"
          : "New tour date successfully published!",
      );

      if (onSaved) {
        onSaved(data.show || { ...payload, _id: editingShow?._id });
      }

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingShow?._id) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete the show at "${editingShow.venue}" on ${editingShow.date}?`,
    );
    if (!confirmDelete) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/shows?id=${encodeURIComponent(editingShow._id)}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete show.");
      }

      if (onDeleted) {
        onDeleted(editingShow._id);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete show.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[var(--radius-box)] border border-white/15 bg-[#0e0722]/98 shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 id={titleId} className="text-lg font-bold text-white sm:text-xl">
              {editingShow ? "Edit Tour Date" : "Create New Tour Date"}
            </h2>
            <p className="text-xs text-white/50">
              Captures complete venue, schedule, admission, production parking, and status settings
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/60 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Form Body */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
        <div className="space-y-6 p-5 sm:p-6">
          {/* Notifications */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="font-medium">{successMsg}</div>
            </div>
          )}

          {/* SECTION 1: Venue & Physical Location */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-cyan-400">
              <MapPin className="h-4 w-4" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-white">
                1. Venue & Physical Location
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Venue Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evanston Rocks, Durty Nellie's"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1012 Church St"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evanston, Palatine"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  State (2-Letter) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  placeholder="IL, WI, IN"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-xs font-medium text-white/70">
                    Map / Directions URL
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateMapUrl}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Date & Schedule Timings */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-amber-400">
              <Clock className="h-4 w-4" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-white">
                2. Date & Schedule Timings
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Show Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    updateDayFromDate(e.target.value);
                  }}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Day of Week
                </label>
                <input
                  type="text"
                  placeholder="Fri, Sat, Sun"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Doors Open Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7:00 PM"
                  value={doorsTime}
                  onChange={(e) => setDoorsTime(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Band Play / Set Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8:30 PM"
                  value={playTime}
                  onChange={(e) => {
                    setPlayTime(e.target.value);
                    if (!time) setTime(e.target.value);
                  }}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1.5 block text-xs font-medium text-white/50">
                General Event Time (Display String)
              </label>
              <input
                type="text"
                placeholder="e.g. 8:00 PM - 11:30 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* SECTION 3: Tickets, Admission & Links */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-emerald-400">
              <Ticket className="h-4 w-4" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-white">
                3. Admission, Tickets & Web
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Admission / Cover Price
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free, $15, $10 at door"
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Age Restriction
                </label>
                <select
                  value={ageRestriction}
                  onChange={(e) => {
                    setAgeRestriction(e.target.value);
                    setAllAges(e.target.value === "All Ages");
                  }}
                  className="w-full rounded-lg border border-white/15 bg-[#140b2e] px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="All Ages">All Ages</option>
                  <option value="21+">21+ Only</option>
                  <option value="18+">18+ Only</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Ticket Purchase URL
                </label>
                <input
                  type="url"
                  placeholder="https://eventbrite.com/..."
                  value={ticketLink}
                  onChange={(e) => setTicketLink(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Venue / Event Website
                </label>
                <input
                  type="url"
                  placeholder="https://venue.com/event"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Parking & Production Load-In Logistics */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400">
                <Truck className="h-4 w-4" />
                <h3 className="text-sm font-semibold tracking-wide uppercase text-white">
                  4. Parking & Production Logistics
                </h3>
              </div>
              <span className="text-[11px] text-white/40">Band bus, gear truck, crew parking</span>
            </div>

            {/* Parking Type Grid */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {TOUR_PARKING_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = parkingType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectParkingType(opt.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all ${isSelected
                        ? "border-purple-400 bg-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                      }`}
                  >
                    <IconComponent className={`h-5 w-5 ${isSelected ? "text-purple-300" : "text-white/40"}`} />
                    <span className="text-xs font-semibold leading-tight">{opt.short}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Dedicated Parking / Staging Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500 N West St (Behind stage loading gate)"
                  value={parkingAddress}
                  onChange={(e) => setParkingAddress(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Parking Map or Pass URL
                </label>
                <input
                  type="url"
                  placeholder="https://... (parking pass or diagram link)"
                  value={parkingUrl}
                  onChange={(e) => setParkingUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-white/70">
                  Parking & Load-In Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Gate code, bay door numbers, trailer power, security contacts..."
                  value={parkingNotes}
                  onChange={(e) => setParkingNotes(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Public Tour Notes */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-sky-400">
              <FileText className="h-4 w-4" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-white">
                5. Public Tour Notes & Announcements
              </h3>
            </div>
            <textarea
              rows={2}
              placeholder="e.g. Headlining the main stage at 9pm! Arrive early for prime lawn seating."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* SECTION 6: Event Status Badges */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-pink-400">
              <Sparkles className="h-4 w-4" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-white">
                6. Show Characteristics & Status Badges
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <span className="text-xs font-medium text-white/80">All Ages Show</span>
                <Toggle checked={allAges} onChange={setAllAges} size="sm" label="All Ages Show" hideLabel />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <span className="text-xs font-medium text-white/80">Sold Out</span>
                <Toggle checked={isSoldOut} onChange={setIsSoldOut} size="sm" label="Sold Out" hideLabel />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <span className="text-xs font-medium text-white/80">Festival / Fair</span>
                <Toggle checked={isFestival} onChange={setIsFestival} size="sm" label="Festival" hideLabel />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <span className="text-xs font-medium text-white/80">Private Event</span>
                <Toggle checked={isPrivate} onChange={setIsPrivate} size="sm" label="Private Event" hideLabel />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <span className="text-xs font-medium text-white/80">Outdoor Stage</span>
                <Toggle checked={isOutdoor} onChange={setIsOutdoor} size="sm" label="Outdoor Stage" hideLabel />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <span className="text-xs font-medium text-white/80">Acoustic / Unplugged</span>
                <Toggle checked={isUnplugged} onChange={setIsUnplugged} size="sm" label="Unplugged" hideLabel />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <span className="text-xs font-medium text-white/80">Casino Show</span>
                <Toggle checked={isCasino} onChange={setIsCasino} size="sm" label="Casino Show" hideLabel />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <span className="text-xs font-medium text-white/80">Special Event</span>
                <Toggle checked={isSpecialEvent} onChange={setIsSpecialEvent} size="sm" label="Special Event" hideLabel />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-white/[0.03] px-5 py-4 sm:px-6">
          <div>
            {editingShow?._id && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || submitting}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>Delete Show</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || deleting}
              className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || deleting}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{editingShow ? "Update Tour Date" : "Publish Tour Date"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function AdminTourDateModal({
  isOpen,
  onClose,
  onSaved,
  onDeleted,
  editingShow,
}: AdminTourDateModalProps) {
  const titleId = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      open
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100] m-0 flex h-full w-full max-h-none max-w-none items-center justify-center border-0 bg-transparent p-3 sm:p-5 md:p-6 backdrop:bg-transparent"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      <AdminTourDateForm
        key={editingShow?._id || editingShow?.date || "new-tour-date"}
        editingShow={editingShow}
        onClose={onClose}
        onSaved={onSaved}
        onDeleted={onDeleted}
        titleId={titleId}
      />
    </dialog>
  );
}

export default AdminTourDateModal;
