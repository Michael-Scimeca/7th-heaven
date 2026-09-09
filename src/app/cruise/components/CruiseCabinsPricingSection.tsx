"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Ship, Globe, Map, Video, FileText, Film, Flame, AlertTriangle, Check, HelpCircle, CreditCard, Calendar as CalendarIcon, Compass } from "lucide-react";
import { SectionBadge } from "@/components/SectionBadge";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";
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
                  className="w-full h-[300px] sm:h-[350px] lg:h-[408px] overflow-hidden flex items-end justify-center relative shadow-none"
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
                  className="w-full h-[300px] sm:h-[350px] lg:h-[408px] overflow-hidden flex items-end justify-center relative shadow-none"
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
                  className="w-full h-[300px] sm:h-[350px] lg:h-[408px] overflow-hidden flex items-end justify-center relative shadow-none"
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
