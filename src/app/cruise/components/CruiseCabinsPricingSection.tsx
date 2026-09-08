"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Ship, Globe, Map, Video, FileText, Film, Flame, AlertTriangle, Check, HelpCircle, CreditCard, Calendar as CalendarIcon, Compass } from "lucide-react";
import { SectionBadge } from "@/components/SectionBadge";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";
import SquishyToggle from "@/components/SquishyToggle";
import Dropdown from "@/components/Dropdown";
import LazyMount from "@/components/LazyMount";
import { BANDS_DATA } from "../cruiseData";
import { formatPhoneDisplay } from "@/lib/validation";

interface CruiseCabinsPricingSectionProps {
  handleSelectCabin: (selectVal?: string) => void;
  handleSignup: (e: React.FormEvent) => Promise<void>;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  guests: any[];
  toggleGuestActive: (index: number, active: boolean) => void;
  updateGuest: (index: number, field: string, value: any) => void;
  signature: string;
  setSignature: (sig: string) => void;
  signatureDate: string;
  signupStatus: "idle" | "submitting" | "success" | "error";
  formError: string;
  isPaymentDropdownOpen: boolean;
  setIsPaymentDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  signupCount: number;
  totalGuests: number;
  joinedFans: any[];
  CruiseCard1Section: React.ComponentType<{ formData: any; setFormData: any }>;
  CruiseCard2Section: React.ComponentType<{ formData: any; setFormData: any }>;
  CruiseNotesAndSignatureSection: React.ComponentType<{ formData: any; setFormData: any; signature: string; setSignature: any; signatureDate: string }>;
  PaymentPortalDropdownPanel: React.ComponentType<{ isOpen: boolean; onClose: () => void }>;
}

export default function CruiseCabinsPricingSection({
  handleSelectCabin,
  handleSignup,
  formData,
  setFormData,
  guests,
  toggleGuestActive,
  updateGuest,
  signature,
  setSignature,
  signatureDate,
  signupStatus,
  formError,
  isPaymentDropdownOpen,
  setIsPaymentDropdownOpen,
  signupCount,
  totalGuests,
  joinedFans,
  CruiseCard1Section,
  CruiseCard2Section,
  CruiseNotesAndSignatureSection,
  PaymentPortalDropdownPanel,
}: CruiseCabinsPricingSectionProps) {
  const [activePriceYear, setActivePriceYear] = useState<2027 | 2028>(2027);
  const [stateroomTab, setStateroomTab] = useState<"suites" | "balcony" | "ocean" | "interior">("suites");
  const [suiteTab, setSuiteTab] = useState<"sea" | "sky" | "star">("sea");

  return (
    <div className="site-container">
      {/* ── SECTION 2: CABINS & PRICING ── */}
      <LazyMount minHeight="800px" rootMargin="300px 0px">
        <section id="pricing" className="pt-4 sm:pt-8 pb-16 relative z-20">
          <div className="text-left max-w-3xl mb-6">
            <h2 className="font-bold uppercase text-white leading-none">
              Staterooms <span className="accent-gradient-text"> & Cruise Rates</span>
            </h2>
            <p className="mt-4 font-semibold">
              Browse group rate options, prevailing market rates, suite class inclusions, and booking cancellation terms.
            </p>

            {/* Pricing Year Toggle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-start mt-8">
              <FoolishShrimpButton
                type="button"
                onClick={() => setActivePriceYear(2027)}
                isActive={activePriceYear === 2027}
                className="!w-auto px-6 py-2.5"
              >
                2027 Star of the Seas (7-Night)
              </FoolishShrimpButton>
              <FoolishShrimpButton
                type="button"
                onClick={() => setActivePriceYear(2028)}
                isActive={activePriceYear === 2028}
                className="!w-auto px-6 py-2.5"
              >
                2028 Legend of the Seas (8-Night)
              </FoolishShrimpButton>
            </div>
          </div>

          {/* Guidelines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left border-b border-white/10 py-section-fluid">
            {/* Column 1: Ship Resources */}
            <div className="relative text-left rounded-2xl flex flex-col justify-between pr-4 sm:pr-6 py-2">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Ship className="w-6 h-6 text-purple-400 shrink-0" />
                  <h3 className="font-bold uppercase text-white tracking-wide">Ship Resources</h3>
                </div>

                <ul className="space-y-2 font-bold uppercase text-white">
                  <li>
                    <FoolishShrimpButton
                      type="button"
                      onClick={(e) => {
                        (e.currentTarget as HTMLElement).blur();
                        window.open("https://en.wikipedia.org/wiki/Star_of_the_Seas", "_blank", "noopener,noreferrer");
                      }}
                      className="!w-full !justify-start !rounded-full px-4 py-2.5"
                    >
                      <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>WIKI</span>
                    </FoolishShrimpButton>
                  </li>
                  <li>
                    <FoolishShrimpButton
                      type="button"
                      onClick={(e) => {
                        (e.currentTarget as HTMLElement).blur();
                        window.open("https://www.royalcaribbean.com/cruise-ships/star-of-the-seas", "_blank", "noopener,noreferrer");
                      }}
                      className="!w-full !justify-start !rounded-full px-4 py-2.5"
                    >
                      <Ship className="w-4 h-4 shrink-0" />
                      <span>ROYAL CARIBBEAN PAGE</span>
                    </FoolishShrimpButton>
                  </li>
                  <li>
                    <FoolishShrimpButton
                      type="button"
                      onClick={(e) => {
                        (e.currentTarget as HTMLElement).blur();
                        window.open("https://www.chicagomusiccruise.com/assets/staroftheseasdeckplanjan2026.jpg", "_blank", "noopener,noreferrer");
                      }}
                      className="!w-full !justify-start !rounded-full px-4 py-2.5"
                    >
                      <Map className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>DECK PLAN</span>
                    </FoolishShrimpButton>
                  </li>
                  <li>
                    <FoolishShrimpButton
                      type="button"
                      onClick={(e) => {
                        (e.currentTarget as HTMLElement).blur();
                        window.open("https://youtu.be/SOf67Ysk04U?si=bduc0EEkLhYFD7GH", "_blank", "noopener,noreferrer");
                      }}
                      className="!w-full !justify-start !rounded-full px-4 py-2.5"
                    >
                      <Video className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>VIDEO OF THE SHIP</span>
                    </FoolishShrimpButton>
                  </li>
                  <li>
                    <FoolishShrimpButton
                      type="button"
                      onClick={(e) => {
                        (e.currentTarget as HTMLElement).blur();
                        window.open("https://www.chicagomusiccruise.com/assets/star-of-the-seas_cruisecompass-basic.pdf", "_blank", "noopener,noreferrer");
                      }}
                      className="!w-full !justify-start !rounded-full px-4 py-2.5"
                    >
                      <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>PAST CRUISE COMPASS</span>
                    </FoolishShrimpButton>
                  </li>
                  <li>
                    <FoolishShrimpButton
                      type="button"
                      onClick={(e) => {
                        (e.currentTarget as HTMLElement).blur();
                        window.open("https://youtu.be/0LxUHSdFDtY", "_blank", "noopener,noreferrer");
                      }}
                      className="!w-full !justify-start !rounded-full px-4 py-2.5"
                    >
                      <Film className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>SHIP TOUR VIDEO</span>
                    </FoolishShrimpButton>
                  </li>
                  <li>
                    <FoolishShrimpButton
                      type="button"
                      onClick={(e) => {
                        (e.currentTarget as HTMLElement).blur();
                        window.open("https://youtu.be/6xCQ4xE7L38", "_blank", "noopener,noreferrer");
                      }}
                      className="!w-full !justify-start !rounded-full px-4 py-2.5"
                    >
                      <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>PROMO VIDEO</span>
                    </FoolishShrimpButton>
                  </li>
                  <li>
                    <a
                      href="https://www.facebook.com/chicagomusiccruise/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full bg-blue-600/40 hover:bg-blue-600 !text-white font-bold uppercase transition-all flex items-center gap-1 border border-blue-400/40"
                    >
                      <span>Facebook</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/chicagomusiccruise"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full bg-pink-600/40 hover:bg-pink-600 !text-white font-bold uppercase transition-all flex items-center gap-1 border border-pink-400/40"
                    >
                      <span>Instagram</span>
                    </a>
                  </li>
                </ul>
              </div>
              <p className="mt-3">
                Legend of the Seas is an exact sister-ship duplicate.
              </p>
            </div>

            {/* Column 2: Booking Policy */}
            <div className="relative text-left rounded-2xl pr-4 sm:pr-6 py-2">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0" />
                <h3 className="font-bold uppercase text-white tracking-wide">Booking Policy</h3>
              </div>
              <p className="font-bold text-purple-400 uppercase mb-4">
                Book through us to participate &amp; lock in best rates
              </p>
              <p className="mb-4">
                To be part of our events, eat dinner together with the band and fans, and for us to assist you, your reservation <strong className="text-white">must</strong> be placed under our official group booking.
              </p>
              <ul className="space-y-2.5 text-white/80 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Multiple booking options: Group Rate, Prevailing Rate, Sales &amp; Promotions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>We match rates &amp; re-roll your room if prices drop before final payment!</span>
                </li>
                <li className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>ALL-INCLUSIVE:</strong> Prices include Cabin, Gratuities, Taxes, and Port Fees (Double Occupancy).</span>
                </li>
              </ul>
              <div className="pt-3 border-t border-white/10 space-y-1.5">
                <p><strong>Email:</strong> <a href="mailto:info@NTDVacations.com" className="text-purple-400 hover:text-white underline font-bold transition-colors">info@NTDVacations.com</a></p>
                <p><strong>Call Us:</strong> (877) 683-9753 - opt 5</p>
                <p><CreditCard className="w-3.5 h-3.5 text-purple-400 inline mr-1" /><strong>Deposit:</strong> $250/person ($500/room).</p>
                <p className="mt-1"><CalendarIcon className="w-3.5 h-3.5 text-purple-400 inline mr-1" /><strong>Final Payment:</strong> {activePriceYear === 2027 ? "Oct 1, 2026" : "Oct 1, 2027"}.</p>
              </div>
            </div>

            {/* Column 3: Passport */}
            <div className="relative text-left rounded-2xl pr-4 sm:pr-6 py-2">
              <div className="flex items-center gap-3 mb-4">
                <Compass className="w-6 h-6 text-purple-400 shrink-0" />
                <h3 className="font-bold uppercase text-white tracking-wide">Passport Guidelines</h3>
              </div>
              <p className="font-bold text-purple-400 uppercase mb-4">Essential travel document guidelines</p>
              <div className="space-y-4 text-white/80">
                <p>A physical passport book valid for 6 months post-cruise is <strong className="text-white font-bold underline inline-block">highly recommended</strong> for all travelers.</p>
                <p>For closed-loop U.S. sailings, a certified state birth certificate accompanied by a government-issued photo ID is legally acceptable.</p>
              </div>
            </div>

            {/* Column 4: Cancellation */}
            <div className="relative text-left pr-4 sm:pr-6 py-2">
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="w-6 h-6 text-purple-400 shrink-0" />
                <h3 className="font-bold uppercase text-white tracking-wide">Cancellation Policy</h3>
              </div>
              <p className="font-bold text-purple-400 uppercase mb-4">Refund terms before booking</p>
              <div className="space-y-4 text-white/80">
                <div>
                  <h4 className="font-bold text-white uppercase mb-1">Group Rate Rooms:</h4>
                  {activePriceYear === 2027 ? (
                    <ul className="list-disc pl-4 space-y-1 text-white/80">
                      <li>Cancel before May 12, 2026: <strong>No penalty</strong></li>
                      <li>May 12, 2026 – July 12, 2026: <strong>$50 pp fee</strong></li>
                      <li>July 13, 2026 – Sept 10, 2026: <strong>$100 pp fee</strong></li>
                      <li>Sept 11, 2026 – Nov 10, 2026: <strong>$200 pp fee</strong></li>
                    </ul>
                  ) : (
                    <ul className="list-disc pl-4 space-y-1 text-white/80">
                      <li>Cancel before May 13, 2027: <strong>No penalty</strong></li>
                      <li>May 13, 2027 – July 13, 2027: <strong>$50 pp fee</strong></li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cruise Support Team */}
          <div className="py-section-fluid text-center">
            <h2 className="uppercase text-purple-300 font-bold mb-1">
              Official Cruise Concierge &amp; Booking Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 pt-6 text-center">
              {/* Richard */}
              <div className="flex flex-col items-center">
                <div
                  className="w-full h-[300px] sm:h-[350px] lg:h-[408px] overflow-hidden flex items-end justify-center relative"
                  style={{
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
                  }}
                >
                  <Image width={408} height={408} unoptimized src="/images/contact/Dickie-contact.png" alt="Richard Hofherr" className="h-full w-auto object-contain object-bottom" />
                </div>
                <h4 className="font-bold text-white uppercase">Richard Hofherr</h4>
                <div className="mt-2 flex flex-col items-center gap-1 w-full">
                  <SectionBadge label="CEO / Booking / Bands" isActive />
                  <p className="text-white/70 mt-0.5">Marketing / Media</p>
                </div>
                <div className="mt-3 flex flex-col items-center gap-1.5 w-full">
                  <a href="tel:8475515363" className="font-bold !text-white hover:text-white/80 transition-colors">
                    <span>(847) 551-5363</span>
                  </a>
                  <a href="mailto:info@NTDVacations.com" className="font-bold text-purple-400 hover:text-purple-300 transition-colors">
                    <span>info@NTDVacations.com</span>
                  </a>
                </div>
              </div>

              {/* Mary */}
              <div className="flex flex-col items-center">
                <div
                  className="w-full h-[300px] sm:h-[350px] lg:h-[408px] overflow-hidden flex items-end justify-center relative"
                  style={{
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
                  }}
                >
                  <Image width={408} height={408} unoptimized src="/images/contact/Mary-contact.png" alt="Mary Grivas" className="h-full w-auto object-contain object-bottom" />
                </div>
                <h4 className="font-bold text-white uppercase">Mary Grivas</h4>
                <div className="mt-2 flex flex-col items-center gap-1 w-full">
                  <SectionBadge label="Group Excursions / Group Hotels" isActive />
                  <p className="text-white/70 mt-0.5">Group Air / Charters / Shuttles</p>
                </div>
                <div className="mt-3 flex flex-col items-center gap-1.5 w-full">
                  <a href="tel:8776839753" className="font-bold !text-white hover:text-white/80 transition-colors">
                    <span>(877) 683-9753 - Ext 5</span>
                  </a>
                  <a href="mailto:Mary@NTDVacations.com" className="font-bold text-purple-400 hover:text-purple-300 transition-colors">
                    <span>Mary@NTDVacations.com</span>
                  </a>
                </div>
              </div>

              {/* Alan */}
              <div className="flex flex-col items-center">
                <div
                  className="w-full h-[300px] sm:h-[350px] lg:h-[408px] overflow-hidden flex items-end justify-center relative"
                  style={{
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
                  }}
                >
                  <Image width={408} height={408} unoptimized src="/images/contact/Alan-contact.png" alt="Alan McRae" className="h-full w-auto object-contain object-bottom" />
                </div>
                <h4 className="font-bold text-white uppercase">Alan McRae</h4>
                <div className="mt-2 flex flex-col items-center gap-1 w-full">
                  <SectionBadge label="Schedule" isActive />
                  <p className="text-white/70 mt-0.5">Activities / Logistics</p>
                </div>
                <div className="mt-3 flex flex-col items-center gap-1.5 w-full">
                  <a href="tel:6308429129" className="font-bold !text-white hover:text-white/80 transition-colors">
                    <span>(630) 842-9129</span>
                  </a>
                  <a href="mailto:alan@NTDVacations.com" className="font-bold text-purple-400 hover:text-purple-300 transition-colors">
                    <span>alan@NTDVacations.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="space-y-16 py-section-fluid">
            <div className="bg-transparent p-0 relative text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-2">
                <div>
                  <span className="font-bold uppercase tracking-[0.25em] text-purple-400">Exclusive Group Deal</span>
                  <h3 className="font-bold uppercase text-white mt-1">Limited Group Rate Cabins ({activePriceYear})</h3>
                </div>
              </div>

              <div key={`group-${activePriceYear}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fade-in_0.35s_ease-out_both]">
                {(activePriceYear === 2027
                  ? [
                    { code: "Q2", title: "Interior Plus", price: "$1,683.27", status: "soldout", badge: "Group Rate Sold Out - Book Prevailing", image: "/images/cruise/q2_interior_plus.jpg", selectValue: "group_n5" },
                    { code: "N5", title: "Ocean View", price: "$1,883.27", status: "warning", badge: "1 Cabin Left!", image: "/images/cruise/n5.jpg", inclusions: "Gratuities Included", selectValue: "group_n5" },
                    { code: "IF", title: "Infinite Central Park", price: "$2,033.27", status: "warning", badge: "2 Cabins Left!", image: "/images/cruise/if.jpg", inclusions: "Gratuities Included", selectValue: "group_if" },
                    { code: "D4", title: "Ocean View Balcony", price: "$2,433.27", status: "info", badge: "10 Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", inclusions: "Gratuities Included", selectValue: "group_d4" },
                    { code: "D2", title: "Ocean View Balcony", price: "$2,483.27", status: "info", badge: "11 Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", inclusions: "Gratuities Included", selectValue: "group_d2" },
                    { code: "I1", title: "Infinite Ocean View Balcony", price: "$2,583.27", status: "warning", badge: "5 Cabins Left!", image: "/images/cruise/i1_infinite_ocean_view_balcony.jpg", inclusions: "Gratuities Included", selectValue: "group_i1" },
                  ]
                  : [
                    { code: "Q2", title: "Interior Plus", price: "$1,832.98", status: "info", badge: "Available", image: "/images/cruise/q2_interior_plus.jpg", inclusions: "Gratuities Included", selectValue: "group_n5" },
                    { code: "IF", title: "Infinite Central Park", price: "$2,032.98", status: "info", badge: "Available", image: "/images/cruise/if.jpg", inclusions: "Gratuities Included", selectValue: "group_if" },
                    { code: "N5", title: "Ocean View", price: "$2,162.98", status: "info", badge: "Available", image: "/images/cruise/n5.jpg", inclusions: "Gratuities Included", selectValue: "group_n5" },
                    { code: "D4", title: "Ocean View Balcony", price: "$2,472.98", status: "info", badge: "Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", inclusions: "Gratuities Included", selectValue: "group_d4" },
                    { code: "D2", title: "Ocean View Balcony", price: "$2,492.98", status: "info", badge: "Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", inclusions: "Gratuities Included", selectValue: "group_d2" },
                    { code: "I1", title: "Infinite Ocean View Balcony", price: "$2,522.98", status: "info", badge: "Available", image: "/images/cruise/i1_infinite_ocean_view_balcony.jpg", inclusions: "Gratuities Included", selectValue: "group_i1" },
                  ]
                ).map((room) => (
                  <div
                    key={room.code || room.selectValue}
                    onClick={() => handleSelectCabin(room.selectValue)}
                    className="w-full text-left bg-transparent border-0 rounded-lg overflow-hidden flex flex-col justify-between cursor-pointer group shadow-none"
                  >
                    <div>
                      {room.image && (
                        <div className="relative rounded-lg h-44 w-full overflow-hidden text-center">
                          <Image width={200} height={200} unoptimized src={room.image} alt={room.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="px-0 py-5">
                        <div className="flex justify-between items-start gap-2 mb-3 text-left">
                          <SectionBadge label={room.badge} />
                        </div>
                        <span className="font-bold uppercase block mb-0.5">{room.code} Category</span>
                        <h4 className="font-bold text-white uppercase text-left">{room.title}</h4>
                      </div>
                    </div>

                    <div className="px-0 pt-0 pb-5 text-left">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold text-white">{room.price}</span>
                        <span className="text-white/50 uppercase font-semibold">USD pp</span>
                      </div>
                      {room.inclusions && (
                        <span className="text-purple-400 font-bold uppercase block mt-1">✓ {room.inclusions}</span>
                      )}
                      <FoolishShrimpButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCabin(room.selectValue);
                        }}
                        className="!mt-3 w-full py-2.5 px-4 font-bold text-xs uppercase tracking-wider"
                      >
                        SELECT &amp; BOOK CABIN
                      </FoolishShrimpButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stateroom Suite Class Perks */}
          <div className="py-section-fluid">
            <div className="text-left w-full mb-10">
              <div className="mb-3">
                <SectionBadge label="Accommodations Guide" />
              </div>
              <h3 className="font-bold uppercase text-white leading-none">
                Stateroom Catalog &amp; Suite Perks
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
              {/* Category Tab */}
              <div className="lg:col-span-1 flex flex-col justify-between p-0 border-0 bg-transparent shadow-none">
                <div>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { id: "suites", label: "Royal Suites", desc: "Star Class, Sky Class, and Sea Class accommodations." },
                      { id: "balcony", label: "Balconies & Infinite", desc: "Private sliding glass doors opening to ocean breeze." },
                      { id: "ocean", label: "Ocean View", desc: "Large windows overlooking port approaches." },
                      { id: "interior", label: "Interior Rooms", desc: "Efficient, comfortable, and budget-friendly." },
                    ].map((tab) => (
                      <FoolishShrimpButton
                        key={tab.id}
                        type="button"
                        isActive={stateroomTab === tab.id}
                        onClick={() => setStateroomTab(tab.id as any)}
                        className="w-full !justify-start text-left px-5 py-4 !h-auto flex flex-col items-start gap-1 cursor-pointer"
                      >
                        <span className="block font-bold uppercase tracking-wider">{tab.label}</span>
                        <span className="block text-white/70 normal-case leading-snug">{tab.desc}</span>
                      </FoolishShrimpButton>
                    ))}
                  </div>
                </div>
              </div>

              {/* Perks */}
              <div className="lg:col-span-2 bg-[var(--color-section-bg)] backdrop-blur-xl border border-[var(--color-section-border)] p-6 md:p-8 rounded-lg flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                    <div>
                      <span className="font-bold uppercase tracking-[0.25em] text-purple-400">VIP Experiences</span>
                      <h3 className="font-bold uppercase text-white mt-1">Suite Class Perks</h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 max-w-full overflow-x-auto">
                      {(["sea", "sky", "star"] as const).map(perk => (
                        <FoolishShrimpButton
                          key={perk}
                          type="button"
                          onClick={() => setSuiteTab(perk)}
                          isActive={suiteTab === perk}
                          className="!w-auto px-4 py-2 font-bold uppercase text-xs shrink-0"
                        >
                          {perk} Class
                        </FoolishShrimpButton>
                      ))}
                    </div>
                  </div>

                  <div key={`benefits-${suiteTab}`} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-white/90 animate-[fade-in_0.35s_ease-out_both]">
                    {suiteTab === "sea" && [
                      "Dedicated check-in line",
                      "Priority boarding",
                      "Dinner at Coastal Kitchen (subject to availability)*",
                      "All-day access to Star | Sky | Sea dining",
                      "Royal Caribbean plush bathrobes for use onboard",
                    ].map((perk) => (
                      <div key={`sea-perk-${perk}`} className="flex items-center gap-2.5">
                        <span className="text-purple-400 font-bold text-base shrink-0">✓</span>
                        <span>{perk}</span>
                      </div>
                    ))}
                    {suiteTab === "sky" && [
                      "Concierge service",
                      "All-day access to Coastal Kitchen*",
                      "Complimentary VOOM Surf + Stream (1 device pp)†",
                      "Access to Suite Sun Deck (The Grove on Star)",
                    ].map((perk) => (
                      <div key={`sky-perk-${perk}`} className="flex items-center gap-2.5">
                        <span className="text-purple-400 font-bold text-base shrink-0">✓</span>
                        <span>{perk}</span>
                      </div>
                    ))}
                    {suiteTab === "star" && [
                      "Exclusive access to Royal Genie service§",
                      "Complimentary Deluxe Beverage Package (ages 21+)†",
                      "Complimentary Gratuities for stateroom/dining staffΔ",
                      "Complimentary VOOM Surf + Stream powered by Starlink",
                    ].map((perk) => (
                      <div key={`star-perk-${perk}`} className="flex items-center gap-2.5">
                        <span className="text-[var(--color-accent)] font-bold text-base shrink-0">✓</span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </LazyMount>

      {/* ── OFFICIAL BOOKING FORM ── */}
      <LazyMount minHeight="600px" rootMargin="300px 0px">
        <section id="book-now" className="py-section-fluid relative z-20">
          <div id="signup" className="relative z-10">
            <div>
              <div className="mb-8 text-left">
                <h2 className="font-bold uppercase mb-1 text-white">
                  Official <span className="accent-gradient-text">Booking Form</span> &amp; Reservation Portal
                </h2>
                <p className="font-semibold">
                  Secure your cabin reservation directly under the 7th Heaven group rate. <strong className="text-purple-400">Group ID: 3325680</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 text-left">
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div className="booking-form-card bg-transparent border-0 rounded-lg overflow-hidden shadow-none p-0 text-left">
                      <div className="booking-header-banner border-0 px-0 py-2 text-left bg-transparent">
                        <h3 className="font-bold text-white">7 Night Eastern Caribbean Cruise — Orlando, FL • CocoCay • St. Thomas • St. Maarten</h3>
                        <p className="text-purple-400 mt-1">Star of the Seas — Royal Caribbean (January 10, 2027 – January 17, 2027)</p>
                      </div>

                      {/* GUEST 1 */}
                      <div className="booking-section-container border-0 bg-transparent p-0">
                        <div className="booking-section-header bg-transparent px-0 py-3 border-0 flex items-center justify-between">
                          <span className="font-bold uppercase text-white">Guest 1 (Primary Booker)</span>
                          <SectionBadge label="Primary" />
                        </div>
                        <div className="booking-grid grid grid-cols-1 md:grid-cols-2 gap-y-2">
                          <div className="booking-cell border-0 py-3 px-0 col-span-2">
                            <label htmlFor="guest1-full-name" className="booking-label block font-bold text-purple-400 uppercase mb-1.5">Full Legal Name (as spelled on passport) *</label>
                            <div className="input-glow-border rounded-xl">
                              <input id="guest1-full-name" type="text" required placeholder="Guest 1 Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                            </div>
                          </div>
                          <div className="booking-cell border-0 py-3 px-0 md:pr-3">
                            <label htmlFor="guest1-phone" className="booking-label block font-bold text-purple-400 uppercase mb-1.5">Phone Number *</label>
                            <div className="input-glow-border rounded-xl">
                              <input id="guest1-phone" type="tel" required placeholder="(555) 123-4567" value={formData.phone} onChange={e => setFormData({ ...formData, phone: formatPhoneDisplay(e.target.value) })} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                            </div>
                          </div>
                          <div className="booking-cell border-0 py-3 px-0 md:pl-3">
                            <label htmlFor="guest1-email" className="booking-label block font-bold text-white uppercase mb-1.5">Email Address *</label>
                            <div className="input-glow-border rounded-xl">
                              <input id="guest1-email" type="email" required placeholder="name@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ADDITIONAL GUESTS */}
                      {Array.from(guests, (g, i) => ({ g, i })).map(({ g, i }) => {
                        const guestNum = i + 2;
                        return (
                          <div key={guestNum} className="booking-section-container border-0 bg-transparent py-2">
                            <div className="booking-section-header bg-transparent px-0 py-3 border-0 flex items-center gap-3">
                              <SquishyToggle
                                id={`guest-active-${guestNum}`}
                                label={`Include Guest ${guestNum} in Cabin Reservation`}
                                checked={g.active}
                                onChange={(checked) => toggleGuestActive(i, checked)}
                              />
                              <label htmlFor={`guest-active-${guestNum}`} className="font-bold uppercase text-white cursor-pointer select-none">
                                Include Guest {guestNum} in Cabin Reservation
                              </label>
                            </div>

                            {g.active && (
                              <div className="booking-grid grid grid-cols-1 md:grid-cols-2 gap-y-2">
                                <div className="booking-cell border-0 py-3 px-0 col-span-2">
                                  <label htmlFor={`guest-name-${guestNum}`} className="booking-label block font-bold text-white uppercase mb-1.5">Full Legal Name *</label>
                                  <div className="input-glow-border rounded-xl">
                                    <input id={`guest-name-${guestNum}`} type="text" required placeholder={`Guest ${guestNum} Full Name`} value={g.name} onChange={e => updateGuest(i, "name", e.target.value)} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* CATEGORY SELECT */}
                      <div className="booking-section-container border-0 bg-transparent p-0 mt-4">
                        <div className="booking-section-header bg-transparent px-0 py-2 border-0">
                          <span className="font-bold uppercase text-white">WHAT CATEGORY ROOM DO YOU WANT TO BOOK?</span>
                        </div>
                        <div className="py-2 relative z-20">
                          <Dropdown
                            id="cabin-category-select"
                            selected={formData.cabinPreference || "group_n5"}
                            options={[
                              { label: "N5 - Ocean View ($1,883.27 pp) - 1 Left", value: "group_n5" },
                              { label: "IF - Infinite Central Park ($2,033.27 pp) - 2 Left", value: "group_if" },
                              { label: "D4 - Ocean View Balcony ($2,433.27 pp) - 10 Left", value: "group_d4" },
                              { label: "D2 - Ocean View Balcony ($2,483.27 pp) - 11 Left", value: "group_d2" },
                            ]}
                            onChange={(val) => setFormData((f: any) => ({ ...f, cabinPreference: val }))}
                          />
                        </div>
                      </div>

                      {/* PAYMENT DETAILS */}
                      <div className="booking-section-container border-0 bg-transparent p-0 mt-4">
                        <div className="booking-section-header bg-transparent px-0 py-2 border-0">
                          <span className="font-bold uppercase text-white">PAYMENT INFORMATION</span>
                        </div>
                        <CruiseCard1Section formData={formData} setFormData={setFormData} />
                        {formData.splitPayment && (
                          <CruiseCard2Section formData={formData} setFormData={setFormData} />
                        )}
                      </div>

                      <CruiseNotesAndSignatureSection
                        formData={formData}
                        setFormData={setFormData}
                        signature={signature}
                        setSignature={setSignature}
                        signatureDate={signatureDate}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <FoolishShrimpButton
                        type="submit"
                        isActive={true}
                        disabled={signupStatus === "submitting"}
                        className="w-full !py-4 font-bold uppercase justify-center cursor-pointer disabled:opacity-70"
                      >
                        {signupStatus === "submitting" ? <span className="w-5 h-5 border-2 border-white/10 border-t-white rounded-lg animate-spin inline-block" /> : "Submit Cruise Booking"}
                      </FoolishShrimpButton>

                      <FoolishShrimpButton
                        type="button"
                        isActive={true}
                        onClick={() => window.print()}
                        className="w-full !py-4 font-bold uppercase justify-center cursor-pointer"
                      >
                        Print / Save Booking Form
                      </FoolishShrimpButton>
                    </div>
                    {signupStatus === "error" && <p className="text-rose-400 font-bold text-center">{formError || 'Something went wrong. Try again.'}</p>}
                  </form>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 text-left space-y-5 w-full">
                  <div id="payment-portal-section" className="p-0 border-0 bg-transparent text-left relative w-full scroll-mt-28">
                    <SectionBadge
                      label="ROYAL CARIBBEAN ONLINE PAYMENT PORTAL"
                      isActive
                      onClick={() => setIsPaymentDropdownOpen((prev) => !prev)}
                    />
                    <h3 className="font-bold text-white uppercase tracking-wider mt-2">Already Booked?</h3>
                    <FoolishShrimpButton
                      onClick={() => setIsPaymentDropdownOpen((prev) => !prev)}
                      className="!mt-4 px-6 py-2.5 font-bold uppercase text-xs cursor-pointer flex items-center gap-2"
                    >
                      {isPaymentDropdownOpen ? "CLOSE PAYMENT PORTAL ▲" : "GO TO PAYMENT PORTAL ▼"}
                    </FoolishShrimpButton>

                    <PaymentPortalDropdownPanel
                      isOpen={isPaymentDropdownOpen}
                      onClose={() => setIsPaymentDropdownOpen(false)}
                    />
                  </div>

                  <div className="p-0 border-0 bg-transparent space-y-4 w-full">
                    <h3 className="font-bold uppercase mb-4 text-white border-b border-white/10 pb-3">Voyage Tracker</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-bold">{signupCount}</p>
                        <p className="font-bold uppercase mt-1">Cabins</p>
                      </div>
                      <div>
                        <p className="font-bold">{totalGuests}</p>
                        <p className="font-bold uppercase mt-1">Passengers</p>
                      </div>
                    </div>
                  </div>

                  {joinedFans.length > 0 && (
                    <div className="p-0 border-0 bg-transparent space-y-4 w-full">
                      <h3 className="font-bold uppercase text-white border-b border-white/10 pb-3">Who&apos;s Booked</h3>
                      <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                        {joinedFans.map((fan, i) => (
                          <span key={i} className="text-white/80 font-semibold">
                            {fan.anonymous ? 'Anonymous' : fan.name.split(' ')[0]}
                            {i < joinedFans.length - 1 && <span className="text-white/30 mx-0.5">·</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </LazyMount>

      {/* FEATURED ARTISTS */}
      <LazyMount minHeight="500px" rootMargin="300px 0px">
        <section id="artists" className="py-section-fluid">
          <div className="text-left w-full mb-10">
            <h2 className="font-bold uppercase text-white leading-none mt-2">
              Featured <span className="accent-gradient-text">Artists</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {BANDS_DATA.map((band) => (
              <div key={band.name} className="relative overflow-hidden group bg-transparent border-0 flex flex-col justify-between">
                {band.photo && (
                  <div className="w-full h-[315px] sm:h-[370px] relative flex items-end justify-center">
                    <Image width={400} height={400} unoptimized src={band.photo} alt={band.name} className="w-full h-full object-contain object-bottom" />
                  </div>
                )}
                <div className="relative z-10 pt-3 pb-2 flex flex-col text-left">
                  <h3 className="font-bold text-white leading-none">{band.name}</h3>
                  {band.role && (
                    <div className="mt-2">
                      <SectionBadge label={band.role} />
                    </div>
                  )}
                  <p className="mt-2 line-clamp-2 text-white/70">{band.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </LazyMount>
    </div>
  );
}
