"use client";

import React, { useState } from "react";
import Image from "next/image";
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
    </div>
  );
}
