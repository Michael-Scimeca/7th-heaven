import { useMemo } from "react";
import Link from "next/link";
import { Headphones } from "lucide-react";
import { PARKING_OPTIONS } from "./BookClient";
import ItineraryRecapLayouts from "./ItineraryRecapLayouts";

interface BookingSummaryCardProps {
  formData: {
    name?: string;
    email?: string;
    phone?: string;
    venueName?: string;
    venueCity?: string;
    startTime?: string;
    endTime?: string;
    parkingType?: string;
    [key: string]: any;
  };
  bookingSlots: Array<{
    date: string;
    startTime?: string;
    endTime?: string;
    [key: string]: any;
  }>;
  selectedType: string | null;
  addOns?: string[];
  eventTypes: Array<{ id: string; label: string; [key: string]: any }>;
  submitting?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  currentStep?: 1 | 2 | 3;
}

export default function BookingSummaryCard({
  formData,
  bookingSlots,
  selectedType,
  addOns = [],
  eventTypes,
  submitting = false,
  onSubmit,
  currentStep = 2,
}: BookingSummaryCardProps) {
  const isStep1Complete = Boolean(
    formData.name?.trim() && formData.email?.trim() && formData.phone?.trim(),
  );
  const isStep2Complete = bookingSlots.length > 0 && Boolean(selectedType);
  const isStep3Complete = Boolean(
    formData.venueName?.trim() && formData.venueCity?.trim(),
  );

  const completedSteps =
    (isStep1Complete ? 1 : 0) +
    (isStep2Complete ? 1 : 0) +
    (isStep3Complete ? 1 : 0);
  const progressPercent = Math.max(33, Math.round((completedSteps / 3) * 100));

  let currentStepTitle = "STEP 2 OF 3";
  let currentStepPrompt = "Pick your show dates";

  if (currentStep === 1 || !isStep1Complete) {
    currentStepTitle = "STEP 1 OF 3";
    currentStepPrompt = "Enter your contact details";
  } else if (currentStep === 2 || !isStep2Complete) {
    currentStepTitle = "STEP 2 OF 3";
    currentStepPrompt = "Pick your show dates";
  } else if (currentStep === 3 || !isStep3Complete) {
    currentStepTitle = "STEP 3 OF 3";
    currentStepPrompt = "Venue & production details";
  } else {
    currentStepTitle = "ALL STEPS READY";
    currentStepPrompt = "Review & submit request";
  }

  const displayDateBadge = useMemo(() => {
    if (bookingSlots.length > 0 && bookingSlots[0]?.date) {
      try {
        const d = new Date(bookingSlots[0].date + "T12:00:00Z");
        return d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        });
      } catch {
        return "Fri, Oct 30";
      }
    }
    return formData.eventDate ? formData.eventDate : "Fri, Oct 30";
  }, [bookingSlots, formData.eventDate]);

  const displayLoadIn = formData.loadInTime || "3:00 PM";
  const displayDoors =
    formData.doorsOpenTime || formData.eventStartTime || "6:00 PM";
  const displayOnStage =
    bookingSlots[0]?.startTime || formData.startTime || "7:00 PM";
  const displayEnd = bookingSlots[0]?.endTime || formData.endTime || "9:00 PM";
  const displayWrap = formData.eventEndTime || "11:00 PM";

  return (
    <div className="flex flex-col gap-4">
      {/* Top Card: Booking Summary */}
      <div className="rounded-[var(--radius-box)] border border-white/10 bg-purple-950/40 p-6 sm:p-7 shadow-2xl backdrop-blur-md">
        {/* Step Progress Header with Circular Progress Ring */}
        <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-white/10">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            <svg
              className="h-12 w-12 shrink-0 -rotate-90"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke="currentColor"
                strokeWidth="3.5"
                fill="transparent"
                className="text-white/10"
              />
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke="#06b6d4"
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 19}
                strokeDashoffset={
                  2 * Math.PI * 19 * (1 - Math.max(0.06, progressPercent / 100))
                }
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-bold text-white font-mono">
                {progressPercent}%
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-widest text-white/50">
              {currentStepTitle}
            </span>
            <span className="block text-sm sm:text-base font-bold text-white truncate">
              {currentStepPrompt}
            </span>
          </div>
        </div>

        {/* Header: Title in Dashed Box + Live Review Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="rounded-md border border-dashed border-white/30 bg-white/[0.02] px-2.5 py-1">
            <h3 className="font-[family-name:var(--font-anton)] text-2xl sm:text-3xl uppercase tracking-wider text-white">
              Booking Summary
            </h3>
          </div>
          <span className="rounded-full border border-purple-400/30 bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300 whitespace-nowrap">
            Live review
          </span>
        </div>
        <p className="mt-2 text-xs text-white/50">
          Review dates, times and venue details before submitting.
        </p>

        {/* Key-Value Summary List */}
        <div className="mt-5 flex flex-col divide-y divide-white/10 text-sm">
          <div className="flex items-center justify-between py-3">
            <span className="text-white/50">Date</span>
            <span className="text-right font-medium text-white">
              {bookingSlots.length === 1 ? (
                new Date(bookingSlots[0].date + "T12:00:00Z").toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  },
                )
              ) : bookingSlots.length > 1 ? (
                `${bookingSlots.length} Shows Scheduled`
              ) : (
                <span className="text-white/30">—</span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-white/50">Time</span>
            <span className="text-right font-medium text-white">
              {bookingSlots.length === 1 &&
              (bookingSlots[0].startTime || formData.startTime) ? (
                `${bookingSlots[0].startTime || formData.startTime}${
                  bookingSlots[0].endTime || formData.endTime
                    ? ` – ${bookingSlots[0].endTime || formData.endTime}`
                    : ""
                }`
              ) : bookingSlots.length > 1 ? (
                "Varies by show"
              ) : (
                <span className="text-white/30">—</span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-white/50">Format</span>
            <span className="text-right font-bold text-white">
              {selectedType === "unplugged"
                ? "Acoustic Trio"
                : selectedType
                ? eventTypes.find((t) => t.id === selectedType)?.label ||
                  "Full Band"
                : "Full Band"}
            </span>
          </div>

          {/* Venue Name */}
          <div className="flex items-center justify-between py-3">
            <span className="text-white/50">Venue</span>
            <span className="max-w-[200px] text-right font-bold text-white truncate">
              {formData.venueName ? (
                formData.venueName
              ) : (
                <span className="text-white/30">—</span>
              )}
            </span>
          </div>

          {/* Location / City & State */}
          <div className="flex items-center justify-between py-3">
            <span className="text-white/50">City / State</span>
            <span className="max-w-[200px] text-right font-medium text-white truncate">
              {formData.venueCity || formData.venueState ? (
                [formData.venueCity, formData.venueState].filter(Boolean).join(", ")
              ) : (
                <span className="text-white/30">—</span>
              )}
            </span>
          </div>

          {/* Street / Parking Address */}
          <div className="flex items-center justify-between py-3">
            <span className="text-white/50">Street Address</span>
            <span className="max-w-[200px] text-right font-medium text-white/90 truncate">
              {formData.parkingAddress ? (
                formData.parkingAddress
              ) : (
                <span className="text-white/30">—</span>
              )}
            </span>
          </div>

          {/* Band Parking & Load-in Access */}
          <div className="flex items-start justify-between py-3">
            <span className="text-white/50">Parking Access</span>
            <div className="text-right">
              <span className="font-bold text-cyan-300">
                {PARKING_OPTIONS.find(
                  (p) => p.id === (formData.parkingType || "bus-trailer"),
                )?.label || "Band Bus & Trailer Lot"}
              </span>
              <p className="mt-0.5 max-w-[200px] text-[11px] text-white/40 truncate">
                {PARKING_OPTIONS.find(
                  (p) => p.id === (formData.parkingType || "bus-trailer"),
                )?.description}
              </p>
            </div>
          </div>

          {addOns.length > 0 && (
            <div className="flex items-start justify-between pt-3">
              <span className="text-white/50">Add-Ons</span>
              <div className="text-right">
                <span className="font-medium text-white">
                  {addOns.length} selected
                </span>
                <p className="mt-0.5 max-w-[200px] text-xs text-white/40 truncate">
                  {addOns.join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Schedule Itinerary Recap (10 Selectable Layouts) */}
        <ItineraryRecapLayouts
          date={displayDateBadge}
          loadInTime={displayLoadIn}
          doorsTime={displayDoors}
          onStageTime={displayOnStage}
          setEndTime={displayEnd}
          wrapTime={displayWrap}
          venueName={formData.venueName}
          venueCity={formData.venueCity}
          venueState={formData.venueState}
          parkingAddress={formData.parkingAddress}
          parkingTypeLabel={
            PARKING_OPTIONS.find(
              (p) => p.id === (formData.parkingType || "bus-trailer"),
            )?.label
          }
          initialLayoutIndex={10}
        />

        {/* Big Yellow-Gold Submit Button */}
        <div className="mt-6">
          <button
            type={onSubmit ? "button" : "submit"}
            onClick={onSubmit}
            disabled={submitting}
            className="w-full cursor-pointer rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 py-3.5 px-6 text-center font-bold text-[#120826] shadow-[0_4px_24px_rgba(245,195,68,0.35)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? "Submitting Request..." : "Submit Booking Request"}
          </button>
          <p className="mt-4 text-center text-xs text-white/50">
            By submitting, you confirm you are 18 or older and agree to our{" "}
            <Link
              href="/privacy"
              className="text-white/70 hover:text-white underline underline-offset-2"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/terms"
              className="text-white/70 hover:text-white underline underline-offset-2"
            >
              Terms
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Bottom Card: Questions about booking? Call Rich Hofherr */}
      <div className="rounded-[var(--radius-box)] border border-white/10 bg-[#160b29]/80 p-4 sm:p-5 backdrop-blur-xl shadow-xl flex items-center gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/30">
          <Headphones className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">
            Questions about booking?
          </p>
          <p className="text-xs text-white/60 mt-0.5">
            Call Rich Hofherr ·{" "}
            <a
              href="tel:8475515363"
              className="font-bold text-white hover:text-purple-300 transition-colors"
            >
              847-551-5363
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
