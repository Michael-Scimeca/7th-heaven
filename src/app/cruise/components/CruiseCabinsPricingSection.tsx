/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Ship, Globe, Map, Video, FileText, Film, Flame, AlertTriangle, Check, HelpCircle, CreditCard, Calendar as CalendarIcon, Compass, X, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { SectionBadge } from "@/components/SectionBadge";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";
import LazyMount from "@/components/LazyMount";
import AddCmsButton from "@/components/AddCmsButton";
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
  sanityContent?: any;
}

function CruiseCabinsPricingSectionComponent({
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
  sanityContent,
}: CruiseCabinsPricingSectionProps) {
  const [activePriceYear, setActivePriceYear] = useState<2027 | 2028>(2027);
  const [stateroomTab, setStateroomTab] = useState<"suites" | "balcony" | "ocean" | "interior">("suites");
  const [suiteTab, setSuiteTab] = useState<"sea" | "sky" | "star">("sea");

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [addedCabins, setAddedCabins] = useState<any[]>([]);
  const [roomForm, setRoomForm] = useState({
    code: "N5",
    title: "",
    year: "2027",
    price: "",
    badge: "Available",
    status: "info",
    inclusions: "Gratuities Included",
    imagePath: "/images/cruise/n5.jpg",
  });
  const [isSavingRoom, setIsSavingRoom] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [roomSuccess, setRoomSuccess] = useState(false);

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.title || !roomForm.price) {
      setRoomError("Please enter Stateroom Title and Price per Person.");
      return;
    }
    setIsSavingRoom(true);
    setRoomError(null);
    try {
      const res = await fetch("/api/admin/cruise-cabins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomForm),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save stateroom");
      }
      const data = await res.json();

      setAddedCabins((prev) => [...prev, data.cabin]);
      setRoomSuccess(true);
      setTimeout(() => {
        setRoomSuccess(false);
        setIsAddRoomModalOpen(false);
        setRoomForm({
          code: "N5",
          title: "",
          year: String(activePriceYear),
          price: "",
          badge: "Available",
          status: "info",
          inclusions: "Gratuities Included",
          imagePath: "/images/cruise/n5.jpg",
        });
      }, 1000);
    } catch (err: any) {
      setRoomError(err.message || "Network error. Failed to save.");
    } finally {
      setIsSavingRoom(false);
    }
  };

  return (
    <div className="site-container">
      {/* ── SECTION 2: CABINS & PRICING ── */}
      <LazyMount minHeight="800px" rootMargin="300px 0px">
        <section id="pricing" className="pt-4 sm:pt-8 pb-16 relative z-20">
          <div className="text-left max-w-3xl mb-6">
            <h2 className="uppercase text-white leading-none">
              {sanityContent?.sections?.find((s: any) => s.sectionId === "cabins")?.title || "Staterooms & Cruise Rates"}
            </h2>
            <p className="mt-4 font-semibold">
              {sanityContent?.sections?.find((s: any) => s.sectionId === "cabins")?.subtitle || "Browse group rate options, prevailing market rates, suite class inclusions, and booking cancellation terms."}
            </p>

            {/* Pricing Year Toggle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-start mt-8">
              <FoolishShrimpButton
                type="button"
                onClick={() => setActivePriceYear(2027)}
                isActive={activePriceYear === 2027}
                className="!w-auto px-6 py-2.5">
                2027 Star of the Seas (7-Night)
              </FoolishShrimpButton>
              <FoolishShrimpButton
                type="button"
                onClick={() => setActivePriceYear(2028)}
                isActive={activePriceYear === 2028}
                className="!w-auto px-6 py-2.5">
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
                  <h3 className="uppercase text-white">Ship Resources</h3>
                </div>

                <ul className="space-y-2 uppercase text-white">
                  <li>
                    <FoolishShrimpButton
                      type="button"
                      onClick={(e) => {
                        (e.currentTarget as HTMLElement).blur();
                        window.open("https://en.wikipedia.org/wiki/Star_of_the_Seas", "_blank", "noopener,noreferrer");
                      }}
                      className="!w-full !justify-start !rounded-full px-4 py-2.5">
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
                      className="!w-full !justify-start !rounded-full px-4 py-2.5">
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
                      className="!w-full !justify-start !rounded-full px-4 py-2.5">
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
                      className="!w-full !justify-start !rounded-full px-4 py-2.5">
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
                      className="!w-full !justify-start !rounded-full px-4 py-2.5">
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
                      className="!w-full !justify-start !rounded-full px-4 py-2.5">
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
                      className="!w-full !justify-start !rounded-full px-4 py-2.5">
                      <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>PROMO VIDEO</span>
                    </FoolishShrimpButton>
                  </li>
                  <li>
                    <a
                      href="https://www.facebook.com/chicagomusiccruise/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full bg-blue-600/40 hover:bg-blue-600 !text-white uppercase transition-all flex items-center gap-1 border border-blue-400/40">
                      <span>Facebook</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/chicagomusiccruise"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full bg-pink-600/40 hover:bg-pink-600 !text-white uppercase transition-all flex items-center gap-1 border border-pink-400/40">
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
                <h3 className="uppercase text-white">{sanityContent?.cruiseInfo?.bookingPolicyTitle || "Booking Policy"}</h3>
              </div>
              <p className="text-purple-400 uppercase mb-4">
                {sanityContent?.cruiseInfo?.bookingPolicyHeading || "Book through us to participate & lock in best rates"}
              </p>
              <p className="mb-4">
                {sanityContent?.cruiseInfo?.bookingPolicyBody || (
                  <>To be part of our events, eat dinner together with the band and fans, and for us to assist you, your reservation <strong className="text-white">must</strong> be placed under our official group booking.</>
                )}
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
                <p><strong>Email:</strong> <a href={`mailto:${sanityContent?.cruiseInfo?.bookingEmail || "info@NTDVacations.com"}`} className="text-purple-400 hover:text-white underline transition-colors">{sanityContent?.cruiseInfo?.bookingEmail || "info@NTDVacations.com"}</a></p>
                <p><strong>Call Us:</strong> {sanityContent?.cruiseInfo?.bookingPhone || "(877) 683-9753 - opt 5"}</p>
                <p><CreditCard className="w-3.5 h-3.5 text-purple-400 inline mr-1" /><strong>Deposit:</strong> {sanityContent?.cruiseInfo?.depositInfo || "$250/person ($500/room)."}</p>
                <p className="mt-1"><CalendarIcon className="w-3.5 h-3.5 text-purple-400 inline mr-1" /><strong>Final Payment:</strong> {activePriceYear === 2027 ? (sanityContent?.cruiseInfo?.finalPayment2027 || "Oct 1, 2026") : (sanityContent?.cruiseInfo?.finalPayment2028 || "Oct 1, 2027")}.</p>
              </div>
            </div>

            {/* Column 3: Passport */}
            <div className="relative text-left rounded-2xl pr-4 sm:pr-6 py-2">
              <div className="flex items-center gap-3 mb-4">
                <Compass className="w-6 h-6 text-purple-400 shrink-0" />
                <h3 className="uppercase text-white">{sanityContent?.cruiseInfo?.passportTitle || "Passport Guidelines"}</h3>
              </div>
              <p className="text-purple-400 uppercase mb-4">{sanityContent?.cruiseInfo?.passportSubheading || "Essential travel document guidelines"}</p>
              <div className="space-y-4 text-white/80">
                <p>{sanityContent?.cruiseInfo?.passportBody || "A physical passport book valid for 6 months post-cruise is highly recommended for all travelers."}</p>
                <p>For closed-loop U.S. sailings, a certified state birth certificate accompanied by a government-issued photo ID is legally acceptable.</p>
              </div>
            </div>

            {/* Column 4: Cancellation */}
            <div className="relative text-left pr-4 sm:pr-6 py-2">
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="w-6 h-6 text-purple-400 shrink-0" />
                <h3 className="uppercase text-white">{sanityContent?.cruiseInfo?.cancellationTitle || "Cancellation Policy"}</h3>
              </div>
              <p className="text-purple-400 uppercase mb-4">{sanityContent?.cruiseInfo?.cancellationSubheading || "Refund terms before booking"}</p>
              <div className="space-y-4 text-white/80">
                <div>
                  <h4 className="text-white uppercase mb-1">Group Rate Rooms:</h4>
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
            <h2 className="uppercase text-purple-300 mb-1">
              Official Cruise Concierge &amp; Booking Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 pt-6 text-center">
              {((sanityContent?.founders?.length ? sanityContent.founders : sanityContent?.contacts?.length ? sanityContent.contacts : null) || [
                {
                  name: "RICHARD HOFHERR",
                  role: "CEO / BOOKING / BANDS",
                  desc: "Marketing / Media",
                  phone: "(847) 551-5363",
                  email: "info@NTDVacations.com",
                },
                {
                  name: "MARY GRIVAS",
                  role: "GROUP EXCURSIONS / GROUP HOTELS",
                  desc: "Group Air / Charters / Shuttles",
                  phone: "(877) 683-9753 - Ext 5",
                  email: "Mary@NTDVacations.com",
                },
                {
                  name: "ALAN MCRAE",
                  role: "SCHEDULE",
                  desc: "Activities / Logistics",
                  phone: "(630) 842-9129",
                  email: "alan@NTDVacations.com",
                },
              ]).map((member: any) => {
                const nameStr = member.name || "Team Member";
                const roleStr = member.role || member.category || "Concierge";
                const descStr = member.desc || member.company || "";
                const phoneStr = member.phone || "";
                const emailStr = member.email || "";
                
                const photoSrc =
                  nameStr.toLowerCase().includes("mary") || nameStr.toLowerCase().includes("grivas")
                    ? "/images/contact/Mary-contact.png"
                    : nameStr.toLowerCase().includes("alan") || nameStr.toLowerCase().includes("mcrae")
                    ? "/images/contact/Alan-contact.png"
                    : "/images/contact/Dickie-contact.png";

                return (
                  <div key={nameStr + emailStr} className="flex flex-col items-center">
                    <div
                      className="w-full h-[300px] sm:h-[350px] lg:h-[408px] overflow-hidden flex items-end justify-center relative shadow-none"
                      style={{
                        WebkitMaskImage: "linear-gradient(black 0%, black 75%, transparent 100%)",
                        maskImage: "linear-gradient(black 0%, black 75%, transparent 100%)",
                      }}>
                      <Image
                        width={408}
                        height={408}
                        unoptimized
                        src={photoSrc}
                        alt={nameStr}
                        className="h-full w-auto object-contain object-bottom"
                        style={{
                          WebkitMaskImage: "linear-gradient(black 0%, black 75%, transparent 100%)",
                          maskImage: "linear-gradient(black 0%, black 75%, transparent 100%)",
                        }}
                      />
                    </div>
                    <h4 className="text-white uppercase">{nameStr}</h4>
                    <div className="mt-2 flex flex-col items-center gap-1 w-full">
                      <SectionBadge label={roleStr} isActive />
                      {descStr && <p className="text-white/70 mt-0.5">{descStr}</p>}
                    </div>
                    <div className="mt-3 flex flex-col items-center gap-1.5 w-full">
                      {phoneStr && (
                        <a href={`tel:${phoneStr.replace(/[^0-9]/g, "")}`} className="!text-white hover:text-white/80 transition-colors">
                          <span>{phoneStr}</span>
                        </a>
                      )}
                      {emailStr && (
                        <a href={`mailto:${emailStr}`} className="text-purple-400 hover:text-purple-300 transition-colors">
                          <span>{emailStr}</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="space-y-16 py-section-fluid">
            <div className="bg-transparent p-0 relative text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-2">
                <div>
                  <h3 className="uppercase text-white mt-1">Limited Group Rate Cabins ({activePriceYear})</h3>
                </div>
                <AddCmsButton
                  label="ADD / EDIT ROOMS IN SANITY CMS"
                  onClick={() => setIsAddRoomModalOpen(true)}
                />
              </div>

              <div key={`group-${activePriceYear}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fade-in_0.35s_ease-out_both]">
                {((([...(sanityContent?.cruiseInfo?.cabins || []), ...addedCabins]).length > 0
                  ? ([...(sanityContent?.cruiseInfo?.cabins || []), ...addedCabins]).flatMap((c: any) =>
                      String(c.year) === String(activePriceYear)
                        ? [{
                            code: c.code,
                            title: c.title,
                            price: c.price,
                            status: c.status,
                            badge: c.badge,
                            image: c.imagePath || c.image || "/images/cruise/q2_interior_plus.jpg",
                            inclusions: c.inclusions,
                            selectValue: c.selectValue || `group_${(c.code || "room").toLowerCase()}`,
                          }]
                        : []
                    )
                  : null) || (activePriceYear === 2027
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
                )).map((room: any, idx: number) => (
                  <div
                    key={(room.code || room.selectValue) + idx}
                    onClick={() => handleSelectCabin(room.selectValue)}
                    className="w-full text-left bg-transparent border-0 rounded-lg overflow-hidden flex flex-col justify-between cursor-pointer group shadow-none">
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
                        <span className="uppercase block mb-0.5">{room.code} Category</span>
                        <h4 className="text-white uppercase text-left">{room.title}</h4>
                      </div>
                    </div>

                    <div className="px-0 pt-0 pb-5 text-left">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl text-white">{room.price}</span>
                        <span className="text-white/50 uppercase font-semibold">USD pp</span>
                      </div>
                      {room.inclusions && (
                        <span className="text-purple-400 uppercase block mt-1">✓ {room.inclusions}</span>
                      )}
                      <FoolishShrimpButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCabin(room.selectValue);
                        }}
                        className="!mt-3 w-full py-2.5 px-4 text-xs uppercase r">
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
            <h2 className="uppercase text-white leading-none mt-2">
              Featured <span className="accent-gradient-text">Artists</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {BANDS_DATA.map((band) => (
              <div key={band.name} className="relative overflow-hidden group bg-transparent border-0 flex flex-col justify-between">
                {band.photo && (
                  <div
                    className="w-full h-[315px] sm:h-[370px] relative flex items-end justify-center"
                    style={{
                      maskImage: "linear-gradient(black 0%, black 75%, transparent 100%)",
                      WebkitMaskImage: "linear-gradient(black 0%, black 75%, transparent 100%)",
                    }}>
                    <Image width={400} height={400} unoptimized src={band.photo} alt={band.name} className="w-full h-full object-contain object-bottom" />
                  </div>
                )}
                <div className="relative z-10 pt-3 pb-2 flex flex-col text-left">
                  <h3 className="text-white leading-none">{band.name}</h3>
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

      {/* ── ADD ROOM MODAL PORTAL ── */}
      {mounted && isAddRoomModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-xl bg-[#12071f] border border-purple-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.25)] text-left max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddRoomModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Ship className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Add Stateroom to Sanity CMS</h3>
                <p className="text-xs text-purple-300/70">Create and publish a stateroom rate card directly to Sanity CMS.</p>
              </div>
            </div>

            {roomError && (
              <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-500/50 text-red-200 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{roomError}</span>
              </div>
            )}

            {roomSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-900/40 border border-emerald-500/50 text-emerald-200 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Stateroom saved successfully to Sanity!</span>
              </div>
            )}

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    Stateroom Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomForm.title}
                    onChange={(e) => setRoomForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Ocean View Balcony"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    Category Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomForm.code}
                    onChange={(e) => setRoomForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. D4, N5, IF, GS"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    Cruise Year *
                  </label>
                  <select
                    value={roomForm.year}
                    onChange={(e) => setRoomForm((prev) => ({ ...prev, year: e.target.value }))}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm cursor-pointer"
                  >
                    <option value="2027">2027 (Star of the Seas)</option>
                    <option value="2028">2028 (Legend of the Seas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    Price Per Person (USD) *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomForm.price}
                    onChange={(e) => setRoomForm((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g. $2,433.27"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    Availability Badge Text
                  </label>
                  <input
                    type="text"
                    value={roomForm.badge}
                    onChange={(e) => setRoomForm((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. 5 Cabins Left! or Available"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    Badge Status Color
                  </label>
                  <select
                    value={roomForm.status}
                    onChange={(e) => setRoomForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm cursor-pointer"
                  >
                    <option value="info">Info / Cyan (Available)</option>
                    <option value="warning">Warning / Amber (Few Left)</option>
                    <option value="soldout">Sold Out / Red</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                  Inclusions &amp; Perks
                </label>
                <input
                  type="text"
                  value={roomForm.inclusions}
                  onChange={(e) => setRoomForm((prev) => ({ ...prev, inclusions: e.target.value }))}
                  placeholder="e.g. Gratuities Included"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                  Image Path / URL
                </label>
                <input
                  type="text"
                  value={roomForm.imagePath}
                  onChange={(e) => setRoomForm((prev) => ({ ...prev, imagePath: e.target.value }))}
                  placeholder="e.g. /images/cruise/d1_ocean_view_balcony.jpg"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddRoomModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRoom}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingRoom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Sanity...</span>
                    </>
                  ) : (
                    <span>+ ADD STATEROOM TO SANITY</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div >
  );
}

const CruiseCabinsPricingSection = React.memo(CruiseCabinsPricingSectionComponent);
export default CruiseCabinsPricingSection;
