"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, MapPin, User, Check } from "lucide-react";

interface StepStatus {
  id: number;
  sectionId: string;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  isComplete: boolean;
  isActive: boolean;
  summaryText: string;
}

export interface BookingProgressTrackerProps {
  bookingSlotsCount: number;
  firstSlotDate?: string;
  startTime?: string;
  endTime?: string;
  selectedType?: string | null;
  selectedTypeLabel?: string;
  venueName?: string;
  venueCity?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  onScrollToSection?: (sectionId: string) => void;
  // Backward compatibility props
  hasTimes?: boolean;
  hasType?: boolean;
  hasVenue?: boolean;
  hasContact?: boolean;
  submitting?: boolean;
  renderMode?: "sidebar" | "portal";
  activeLayout?: number;
  onLayoutChange?: (id: number) => void;
}

function parseTimeToMinutes(t?: string): number {
  if (!t) return 0;
  const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (match[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (match[3].toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function isValidEmail(email?: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone?: string): boolean {
  if (!phone) return false;
  return phone.replace(/\D/g, "").length >= 10;
}

export default function BookingProgressTracker({
  bookingSlotsCount = 0,
  startTime,
  endTime,
  selectedType,
  selectedTypeLabel,
  venueName,
  venueCity,
  contactName,
  contactEmail,
  contactPhone,
  onScrollToSection,
  hasTimes,
  hasType,
  hasVenue,
  hasContact,
  renderMode = "sidebar",
}: BookingProgressTrackerProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>("contact-info");

  // Track active section via scroll / intersection
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sections = [
      { id: "contact-info", el: document.getElementById("contact-info") },
      { id: "step-1", el: document.getElementById("step-1") },
      { id: "venue-logistics", el: document.getElementById("venue-logistics") },
      { id: "tech-specs", el: document.getElementById("tech-specs") },
    ];

    const handleScroll = () => {
      const scrollY = window.scrollY + 260; // offset for header + top of viewport
      let current = "contact-info";

      for (const sec of sections) {
        if (!sec.el) continue;
        const top = sec.el.getBoundingClientRect().top + window.scrollY;
        if (scrollY >= top) {
          current = sec.id;
        }
      }

      if (current === "tech-specs" || current === "venue-logistics") {
        setActiveSectionId("venue-logistics");
      } else if (current === "step-1" || current === "event-format") {
        setActiveSectionId("step-1");
      } else {
        setActiveSectionId("contact-info");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = useCallback(
    (sectionId: string) => {
      if (onScrollToSection) {
        onScrollToSection(sectionId);
      } else {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    [onScrollToSection]
  );

  // ─────────────────────────────────────────────────────────────
  // STEP 1 VALIDATION: Contact & Planner
  // Must have: non-empty Name, valid Email address, valid 10+ digit Phone
  // ─────────────────────────────────────────────────────────────
  const hasValidName = Boolean(contactName?.trim());
  const hasValidEmail = isValidEmail(contactEmail);
  const hasValidPhone = isValidPhone(contactPhone);
  const step1Complete =
    hasContact !== undefined && !contactPhone
      ? hasContact
      : hasValidName && hasValidEmail && hasValidPhone;

  let step1Summary = "Client & contact info";
  if (step1Complete) {
    step1Summary = contactName ? contactName.trim() : "Contact details confirmed";
  } else if (!hasValidName) {
    step1Summary = "Full name required";
  } else if (!contactEmail?.trim()) {
    step1Summary = "Email address required";
  } else if (!hasValidEmail) {
    step1Summary = "Valid email required";
  } else if (!contactPhone?.trim()) {
    step1Summary = "Phone number required";
  } else if (!hasValidPhone) {
    step1Summary = "10-digit phone required";
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 2 VALIDATION: Schedule & Format
  // Must have: at least 1 show slot, event format chosen, valid start/end times with end > start
  // ─────────────────────────────────────────────────────────────
  const hasValidSlotCount = bookingSlotsCount > 0;
  const hasValidType = selectedType !== undefined ? Boolean(selectedType) : Boolean(hasType);
  const hasStartAndEnd =
    startTime && endTime ? true : hasTimes !== undefined ? hasTimes : false;
  const hasValidTimeRange =
    startTime && endTime
      ? parseTimeToMinutes(endTime) > parseTimeToMinutes(startTime)
      : hasTimes !== undefined
        ? hasTimes
        : false;

  const step2Complete =
    hasValidSlotCount && hasValidType && hasStartAndEnd && hasValidTimeRange;

  let step2Summary = "Date, times & format";
  if (step2Complete) {
    step2Summary = `${bookingSlotsCount} Show${bookingSlotsCount > 1 ? "s" : ""} • ${selectedTypeLabel || "Selected"}`;
  } else if (!hasValidSlotCount) {
    step2Summary = "Pick show date on calendar";
  } else if (!hasValidType) {
    step2Summary = "Select show format";
  } else if (!hasStartAndEnd) {
    step2Summary = "Select start & end times";
  } else if (!hasValidTimeRange) {
    step2Summary = "End time must be after start";
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 3 VALIDATION: Venue & Production
  // Must have: non-empty Venue Name and non-empty Venue City
  // ─────────────────────────────────────────────────────────────
  const hasValidVenueName = Boolean(venueName?.trim());
  const hasValidVenueCity = Boolean(venueCity?.trim());
  const step3Complete =
    hasVenue !== undefined && !venueName
      ? hasVenue
      : hasValidVenueName && hasValidVenueCity;

  let step3Summary = "Location & venue specs";
  if (step3Complete) {
    step3Summary = `${venueName?.trim() || "Venue set"}, ${venueCity?.trim() || ""}`;
  } else if (!hasValidVenueName) {
    step3Summary = "Venue name required";
  } else if (!hasValidVenueCity) {
    step3Summary = "Venue city required";
  }

  const steps: StepStatus[] = [
    {
      id: 1,
      sectionId: "contact-info",
      title: "1. Contact & Planner",
      shortTitle: "Contact",
      icon: User,
      isComplete: step1Complete,
      isActive: activeSectionId === "contact-info",
      summaryText: step1Summary,
    },
    {
      id: 2,
      sectionId: "step-1",
      title: "2. Schedule & Format",
      shortTitle: "Schedule",
      icon: Calendar,
      isComplete: step2Complete,
      isActive: activeSectionId === "step-1" || activeSectionId === "event-format",
      summaryText: step2Summary,
    },
    {
      id: 3,
      sectionId: "venue-logistics",
      title: "3. Venue & Production",
      shortTitle: "Venue & Tech",
      icon: MapPin,
      isComplete: step3Complete,
      isActive: activeSectionId === "venue-logistics" || activeSectionId === "tech-specs",
      summaryText: step3Summary,
    },
  ];

  if (renderMode === "portal") {
    return null;
  }

  const completedCount = steps.filter((s) => s.isComplete).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="rounded-[var(--radius-box)] border border-purple-500/30 bg-purple-950/30 p-4 shadow-xl backdrop-blur-md mb-4 flex flex-col gap-3">
      {/* Header with status pulse and counter */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              progressPct === 100
                ? "bg-emerald-400"
                : "bg-cyan-400 animate-pulse"
            }`}
          />
          <span className="font-semibold text-xs text-white">Form Progress</span>
        </div>
        <span className="font-mono text-xs font-bold text-cyan-300">
          {progressPct}% ({completedCount}/3)
        </span>
      </div>

      {/* Dynamic Progress Beam */}
      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.7)] w-[var(--progress-pct)]"
          style={{ "--progress-pct": `${progressPct}%` } as React.CSSProperties}
        />
      </div>

      {/* Vertical Step Timeline */}
      <nav aria-label="Vertical form step progress">
        <ol className="relative flex flex-col gap-3 pl-1">
          {steps.map((s, idx) => {
            const isLast = idx === steps.length - 1;
            return (
              <li key={s.id} className="relative flex items-start gap-3">
                {/* Vertical connecting line */}
                {!isLast && (
                  <div
                    className={`absolute left-3 top-6 w-0.5 h-[calc(100%+4px)] transition-colors ${
                      s.isComplete ? "bg-emerald-500/60" : "bg-white/10"
                    }`}
                  />
                )}

                <button
                  type="button"
                  onClick={() => scrollTo(s.sectionId)}
                  className="group flex items-start gap-3 text-left w-full cursor-pointer"
                >
                  <span
                    className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      s.isComplete
                        ? "bg-emerald-500 text-black font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        : s.isActive
                          ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                          : "border border-white/20 bg-zinc-900 text-white/50 group-hover:border-white/40"
                    }`}
                  >
                    {s.isComplete ? <Check className="h-3.5 w-3.5" /> : s.id}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-semibold ${
                          s.isActive
                            ? "text-white"
                            : s.isComplete
                              ? "text-emerald-200"
                              : "text-white/60"
                        }`}
                      >
                        {s.title}
                      </span>
                      {s.isComplete && (
                        <span className="text-[10px] text-emerald-400 font-mono">✓</span>
                      )}
                    </div>
                    <p
                      className={`text-xs truncate transition-colors ${
                        s.isComplete
                          ? "text-white/60"
                          : s.isActive
                            ? "text-cyan-300/80"
                            : "text-white/40"
                      }`}
                    >
                      {s.summaryText}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
