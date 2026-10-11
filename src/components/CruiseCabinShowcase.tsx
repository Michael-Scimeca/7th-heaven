/* eslint-disable react-doctor/prefer-html-dialog */
"use client";

import Image from "next/image";
import { useState } from "react";
import {
  BedDouble,
  Maximize2,
  Users,
  Compass,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Mail,
  Wine,
  Ticket,
  Utensils,
  ShieldCheck,
  Tv,
  Refrigerator,
  Zap,
  Wifi,
  Wind,
} from "lucide-react";
import {
  CRUISE_CABIN_CATALOG,
  resolveCabinDetails,
  extractCabinNumber,
  type CabinDetails,
} from "@/app/cruise/cabinData";
import SeventhButton from "@/components/SeventhButton";
import { GlowSelect } from "@/components/GlowInput";

interface CruiseCabinShowcaseProps {
  booking: {
    name?: string;
    email?: string;
    cabin_preference?: string;
    cabin_deck?: string;
    cabin_image?: string;
    notes?: string;
    [key: string]: any;
  };
}

export default function CruiseCabinShowcase({
  booking,
}: CruiseCabinShowcaseProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "amenities" | "inclusions"
  >("overview");
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeTargetCategory, setUpgradeTargetCategory] =
    useState("group_jy");
  const [upgradeNotes, setUpgradeNotes] = useState("");

  const cabinDetails: CabinDetails = resolveCabinDetails(
    booking.cabin_preference,
    booking.notes,
  );

  const cabinNumber = extractCabinNumber(booking.cabin_preference);
  const deckLocation =
    booking.cabin_deck || cabinDetails.deckRange.split(",")[0] || "Deck 9 · Midship";
  const cabinImage = booking.cabin_image || cabinDetails.image;

  const displayCabinTitle = booking.cabin_preference
    ? booking.cabin_preference.toLowerCase().includes(cabinNumber.toLowerCase())
      ? booking.cabin_preference
      : `${booking.cabin_preference} (${cabinNumber})`
    : `${cabinDetails.name} (${cabinNumber})`;

  const handleOpenUpgradeModal = (categoryId?: string) => {
    if (categoryId) {
      setUpgradeTargetCategory(categoryId);
    }
    setIsUpgradeModalOpen(true);
  };

  const handleSendUpgradeRequest = () => {
    const targetCabin = CRUISE_CABIN_CATALOG.find(
      (c) => c.id === upgradeTargetCategory,
    );
    const targetName = targetCabin ? targetCabin.name : upgradeTargetCategory;

    const subject = encodeURIComponent(
      `7th Heaven Cruise Stateroom Upgrade/Change Request - ${booking.name || "Passenger"} (${cabinNumber})`,
    );
    const body = encodeURIComponent(
      `Hi Mary & 7th Heaven Cruise Team,\n\nI would like to inquire about modifying or upgrading my cabin reservation for the 7th Heaven Rock Cruise.\n\nPassenger: ${booking.name || "Cruise Passenger"}\nEmail: ${booking.email || "guest"}\nCurrent Stateroom: ${displayCabinTitle}\nCurrent Deck: ${deckLocation}\n\nRequested Category: ${targetName}\nNotes / Special Requests:\n${upgradeNotes || "Please let me know the availability and fare differential for this category."}\n\nThank you,\n${booking.name || "Cruise Passenger"}`,
    );

    window.location.href = `mailto:mary@ntdvacations.com,cruise@7thheavenband.com?subject=${subject}&body=${body}`;
    setIsUpgradeModalOpen(false);
  };

  return (
    <article
      aria-labelledby="cabin-showcase-heading"
      className="relative overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-[var(--color-bg-glass,rgba(18,18,24,0.55))] p-5 shadow-2xl backdrop-blur-md md:p-8"
    >
      {/* Subtle Ambient Background Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-0.5 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirmed VIP Stateroom
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/15 px-3 py-0.5 text-xs font-semibold text-cyan-300">
              <Compass className="h-3.5 w-3.5" />
              {cabinNumber}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/15 px-3 py-0.5 text-xs font-semibold text-purple-300">
              {deckLocation}
            </span>
          </div>

          <h2
            id="cabin-showcase-heading"
            className="text-2xl font-bold tracking-tight text-white md:text-3xl"
          >
            {booking.cabin_preference || cabinDetails.name}
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {cabinDetails.categoryTitle} · Royal Caribbean Star of the Seas
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          <button
            type="button"
            onClick={() => setIsCatalogOpen((prev) => !prev)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10 hover:text-cyan-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isCatalogOpen ? "Hide Stateroom Guide" : "Compare Ship Cabins"}</span>
            {isCatalogOpen ? (
              <ChevronUp className="h-3.5 w-3.5 text-white/60" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-white/60" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleOpenUpgradeModal()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/15 px-3.5 py-2 text-xs font-medium text-purple-200 transition-colors hover:bg-purple-500/25 hover:text-white"
          >
            <Mail className="h-3.5 w-3.5 text-purple-400" />
            <span>Request Upgrade</span>
          </button>
        </div>
      </div>

      {/* Main Selected Stateroom Layout */}
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: High-Res Cabin Image & Quick Metric Cards (5 Cols) */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-black/40">
            <Image
              src={cabinImage}
              alt={cabinDetails.name}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                {cabinDetails.code}
              </span>
              <span className="rounded-full bg-cyan-950/80 px-2.5 py-1 text-xs font-medium text-cyan-200 backdrop-blur">
                {cabinDetails.viewType}
              </span>
            </div>

            {/* Bottom Bar with Expand Trigger */}
            <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between">
              <div>
                <p className="text-xs font-medium text-white/70">Assigned Stateroom</p>
                <p className="text-sm font-bold text-white">
                  {cabinNumber} · {deckLocation}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white/30"
              >
                <Maximize2 className="h-3 w-3" />
                <span>Zoom Photo</span>
              </button>
            </div>
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-1.5 text-white/50">
                <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-medium">Total Area</span>
              </div>
              <span className="mt-1 text-sm font-bold text-white">
                {cabinDetails.totalSizeSqFt} sq. ft.
              </span>
              <span className="text-[11px] text-white/50">
                {cabinDetails.roomSizeSqFt} sq ft room + {cabinDetails.balconySizeSqFt} sq ft veranda
              </span>
            </div>

            <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-1.5 text-white/50">
                <BedDouble className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-xs font-medium">Bedding</span>
              </div>
              <span className="mt-1 text-sm font-bold text-white truncate">
                Royal King / Twins
              </span>
              <span className="text-[11px] text-white/50 truncate">
                + Double Sofa Bed
              </span>
            </div>

            <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-1.5 text-white/50">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium">Occupancy</span>
              </div>
              <span className="mt-1 text-sm font-bold text-white">
                {cabinDetails.occupancy.split("(")[0].trim()}
              </span>
              <span className="text-[11px] text-white/50">
                {booking.guest_count || 2} Registered in Cabin
              </span>
            </div>

            <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-1.5 text-white/50">
                <Compass className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-medium">Position</span>
              </div>
              <span className="mt-1 text-sm font-bold text-white truncate">
                {deckLocation}
              </span>
              <span className="text-[11px] text-white/50 truncate">
                Near Central Park & Stages
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Narrative, Tabbed Specs, Amenities & VIP Inclusions (7 Cols) */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          {/* Narrative Summary */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-white/80">
            <p>{cabinDetails.summary}</p>
          </div>

          {/* Segmented Navigation Tabs */}
          <div className="flex border-b border-white/10 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`cursor-pointer pb-2.5 pr-4 pl-1 transition-colors ${
                activeTab === "overview"
                  ? "border-b-2 border-cyan-400 font-bold text-cyan-300"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Stateroom Specs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("amenities")}
              className={`cursor-pointer px-4 pb-2.5 transition-colors ${
                activeTab === "amenities"
                  ? "border-b-2 border-cyan-400 font-bold text-cyan-300"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Cabin Amenities
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("inclusions")}
              className={`cursor-pointer px-4 pb-2.5 transition-colors ${
                activeTab === "inclusions"
                  ? "border-b-2 border-cyan-400 font-bold text-cyan-300"
                  : "text-white/60 hover:text-white"
              }`}
            >
              7th Heaven Inclusions
            </button>
          </div>

          {/* Tab 1: Detailed Specifications & Highlights */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {cabinDetails.specs.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs"
                  >
                    <span className="text-white/50">{item.label}</span>
                    <span className="font-semibold text-white text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold tracking-wider text-cyan-300 uppercase">
                  Key Stateroom Highlights
                </h3>
                <ul className="flex flex-col gap-2">
                  {cabinDetails.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2 text-xs text-white/75"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Amenities & In-Room Comforts */}
          {activeTab === "amenities" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs">
                  <Tv className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                  <div>
                    <span className="font-semibold text-white">43&quot; HDTV Entertainment</span>
                    <p className="mt-0.5 text-white/60">
                      Band daily schedules, theater broadcasts &amp; ship cameras.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs">
                  <Refrigerator className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <div>
                    <span className="font-semibold text-white">Mini-Fridge &amp; Safe</span>
                    <p className="mt-0.5 text-white/60">
                      Cold beverage chiller and electronic keypad safe.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs">
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <span className="font-semibold text-white">USB-A / USB-C &amp; Power</span>
                    <p className="mt-0.5 text-white/60">
                      Bedside high-speed charging ports &amp; 110V/220V plugs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs">
                  <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-white">Starlink VOOM Wi-Fi</span>
                    <p className="mt-0.5 text-white/60">
                      High-speed satellite connectivity ready in stateroom.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs">
                  <Wind className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <div>
                    <span className="font-semibold text-white">Climate Control</span>
                    <p className="mt-0.5 text-white/60">
                      Individual in-room thermostat for custom coolness.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-pink-400" />
                  <div>
                    <span className="font-semibold text-white">Daily Attendant Service</span>
                    <p className="mt-0.5 text-white/60">
                      Twice-daily housekeeping, ice service &amp; evening turndown.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-white/70">
                <span className="font-semibold text-white">Also Included in Room: </span>
                Hair dryer, vanity desk with lighted makeup mirror, premium shampoo/conditioner/body wash, plush cotton towels, and ample wardrobe closet storage with wooden hangers.
              </div>
            </div>
          )}

          {/* Tab 3: Exclusive 7th Heaven Band Cruise Inclusions */}
          {activeTab === "inclusions" && (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Included with Your Stateroom Group Fare
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-white/80">
                    <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    <span>
                      <strong className="text-white">All 7th Heaven Private Concerts:</strong> Guaranteed admission to all Main Theater rock shows, poolside acoustic jams, and late-night karaoke events.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-white/80">
                    <Wine className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                    <span>
                      <strong className="text-white">All-Inclusive Beverage Package:</strong> Beers, wines, tropical cocktails, sodas, juices, and premium specialty coffees throughout the cruise.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-white/80">
                    <Utensils className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <span>
                      <strong className="text-white">Full Dining Privileges:</strong> Multi-course dinners in the Main Dining Room, Windjammer Marketplace buffet, and casual venues (Sorrento&apos;s Pizza, Cafe Promenade).
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-white/80">
                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-pink-400" />
                    <span>
                      <strong className="text-white">VIP Band Meet &amp; Greet:</strong> Private passenger cocktail party with 7th Heaven, photo opportunities, and exclusive commemorative VIP pass.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-white/80">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>
                      <strong className="text-white">Taxes, Port Fees &amp; Gratuities:</strong> All government port fees and shipboard crew gratuities are already included in your group rate.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Section: Compare All Ship Staterooms & Floorplans */}
      {isCatalogOpen && (
        <section
          aria-labelledby="all-cabins-guide-heading"
          className="relative z-10 mt-8 border-t border-white/10 pt-6"
        >
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3
                id="all-cabins-guide-heading"
                className="text-lg font-bold text-white"
              >
                Explore All Ship Cabin Categories &amp; Floorplans
              </h3>
              <p className="text-xs text-white/60">
                Compare stateroom dimensions, locations, and views across Royal Caribbean Star of the Seas.
              </p>
            </div>
            <span className="text-xs text-cyan-400">
              {CRUISE_CABIN_CATALOG.length} Available Group Categories
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CRUISE_CABIN_CATALOG.map((room) => {
              const isSelected = room.id === cabinDetails.id;
              return (
                <div
                  key={room.id}
                  className={`flex flex-col overflow-hidden rounded-xl border transition-all ${
                    isSelected
                      ? "border-cyan-500/50 bg-cyan-950/20 ring-1 ring-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="rounded bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur">
                        {room.code}
                      </span>
                      {room.badge && (
                        <span className="rounded bg-purple-600/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                          {room.badge}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-black">
                        <CheckCircle2 className="h-3 w-3" /> Your Cabin
                      </span>
                    )}

                    <div className="absolute right-2.5 bottom-2.5 left-2.5">
                      <h4 className="text-sm font-bold text-white">{room.name}</h4>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-3 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-white/40 block">Total Area</span>
                        <span className="font-semibold text-white">
                          {room.totalSizeSqFt} sq. ft.
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 block">Occupancy</span>
                        <span className="font-semibold text-white">
                          {room.occupancy.split("(")[0]}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 block">Decks</span>
                        <span className="font-semibold text-white truncate block">
                          {room.deckRange}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 block">View</span>
                        <span className="font-semibold text-cyan-300 truncate block">
                          {room.viewType}
                        </span>
                      </div>
                    </div>

                    <p className="line-clamp-2 text-xs text-white/70 mb-4">
                      {room.summary}
                    </p>

                    <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
                      {isSelected ? (
                        <span className="text-xs font-semibold text-emerald-400">
                          Currently Assigned
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenUpgradeModal(room.id)}
                          className="cursor-pointer text-xs font-medium text-cyan-300 hover:text-cyan-200 hover:underline"
                        >
                          Request Category Upgrade →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Lightbox Photo Preview Modal */}
      {isPhotoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cabin Photo Preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-[var(--radius-box)] border border-white/20 bg-gray-950 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white/80 transition-colors hover:bg-black hover:text-white"
              aria-label="Close photo preview"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-[16/10] w-full min-h-[350px] sm:min-h-[480px]">
              <Image
                src={cabinImage}
                alt={cabinDetails.name}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>

            <div className="p-4 text-center">
              <h3 className="text-lg font-bold text-white">
                {displayCabinTitle}
              </h3>
              <p className="text-xs text-white/60">
                {cabinDetails.categoryTitle} · {deckLocation} · {cabinDetails.totalSizeSqFt} sq. ft. Total Space
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stateroom Upgrade / Change Inquiry Modal */}
      {isUpgradeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Stateroom Upgrade Request"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setIsUpgradeModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-[var(--radius-box)] border border-white/20 bg-[var(--color-bg-surface,#18181b)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Request Stateroom Upgrade or Change
                </h3>
                <p className="text-xs text-white/60">
                  Notify Mary (NTD Vacations) &amp; Cruise Admin to check category availability
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="cursor-pointer rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4 text-xs">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <span className="text-white/40 block mb-1">Your Current Booking</span>
                <span className="font-bold text-white text-sm">
                  {displayCabinTitle}
                </span>
                <span className="text-white/60 block mt-0.5">
                  Assigned Deck: {deckLocation} · Passenger: {booking.name || "Cruise Guest"}
                </span>
              </div>

              <div>
                <label
                  htmlFor="upgrade-category-select"
                  className="mb-1 block font-medium text-white/70"
                >
                  Desired Upgrade Category *
                </label>
                <GlowSelect
                  id="upgrade-category-select"
                  value={upgradeTargetCategory}
                  onChange={(e) =>
                    setUpgradeTargetCategory(
                      typeof e === "string" ? e : e.target.value,
                    )
                  }
                >
                  {CRUISE_CABIN_CATALOG.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) — {c.totalSizeSqFt} sq ft
                    </option>
                  ))}
                </GlowSelect>
              </div>

              <div>
                <label
                  htmlFor="upgrade-notes-field"
                  className="mb-1 block font-medium text-white/70"
                >
                  Additional Preferences / Questions
                </label>
                <textarea
                  id="upgrade-notes-field"
                  rows={3}
                  value={upgradeNotes}
                  onChange={(e) => setUpgradeNotes(e.target.value)}
                  placeholder="e.g. Inquiring about fare difference for Junior Suite, or preference for high deck aft..."
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-3 text-xs text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(false)}
                  className="cursor-pointer rounded-lg bg-white/10 px-4 py-2 font-medium text-white hover:bg-white/15"
                >
                  Cancel
                </button>
                <SeventhButton
                  type="button"
                  icon={false}
                  onClick={handleSendUpgradeRequest}
                  className="py-2 px-5"
                >
                  Send Inquiry to Cruise Agents
                </SeventhButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
