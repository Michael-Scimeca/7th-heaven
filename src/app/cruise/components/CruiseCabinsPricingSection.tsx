/* eslint-disable react-doctor/no-high-complexity-react-function */
/* eslint-disable react-doctor/duplicate-jsx-subtree */
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Ship,
  Globe,
  Map,
  Video,
  FileText,
  Film,
  Flame,
  AlertTriangle,
  Check,
  HelpCircle,
  CreditCard,
  Calendar as CalendarIcon,
  Compass,
  X,
  Plus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { SectionBadge } from "@/components/SectionBadge";

const FacebookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
import SeventhButton from "@/components/SeventhButton";
import CheckMarkIcon from "@/components/CheckMarkIcon";
import LazyMount from "@/components/LazyMount";
import AddCmsButton from "@/components/AddCmsButton";
import CustomDropdown from "@/components/CustomDropdown";
import { useMember } from "@/context/MemberContext";
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
  CruiseNotesAndSignatureSection: React.ComponentType<{
    formData: any;
    setFormData: any;
    signature: string;
    setSignature: any;
    signatureDate: string;
  }>;
  PaymentPortalDropdownPanel: React.ComponentType<{
    isOpen: boolean;
    onClose: () => void;
  }>;
  sanityContent?: any;
}

function RoomModalFooterButtons({
  isSaving,
  onCancel,
}: {
  isSaving: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="cursor-pointer rounded-xl bg-white/10 px-5 py-2.5 hover:bg-white/15"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-[background-color,box-shadow] hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving to Sanity...</span>
          </>
        ) : (
          <span>+ ADD STATEROOM TO SANITY</span>
        )}
      </button>
    </div>
  );
}

function ModalInputField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-purple-200/80">{label}</label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 placeholder-gray-500"
      />
    </div>
  );
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
  const { member, isLoggedIn } = useMember();
  const isAdmin = Boolean(
    isLoggedIn &&
    (member?.role === "admin" ||
      member?.role === "crew" ||
      (member as any)?.isAdmin === true),
  );
  const [activePriceYear, setActivePriceYear] = useState<2027 | 2028>(2027);
  const [stateroomTab, setStateroomTab] = useState<
    "suites" | "balcony" | "ocean" | "interior"
  >("suites");
  const [suiteTab, setSuiteTab] = useState<"sea" | "sky" | "star">("sea");

  const mounted = React.useSyncExternalStore(
    () => () => { },
    () => true,
    () => false,
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
    <>
      {/* ── SECTION 2: CABINS & PRICING ── */}
      <LazyMount
        as="section"
        id="pricing"
        className="site-container relative z-20 -mt-85 lg:-mt-[460px]"
        minHeight="800px"
        rootMargin="300px 0px"
      >
        <div className="max-w-3xl text-left">
          <h2>
            {sanityContent?.sections?.find((s: any) => s.sectionId === "cabins")
              ?.title || "Staterooms & Cruise Rates"}
          </h2>
          <p className="mt-4">
            {sanityContent?.sections?.find((s: any) => s.sectionId === "cabins")
              ?.subtitle ||
              "Browse group rate options, prevailing market rates, suite class inclusions, and booking cancellation terms."}
          </p>

          {/* Pricing Year Toggle */}
          <div className="mt-8 flex flex-col items-stretch justify-start gap-3 sm:flex-row sm:items-center">
            <SeventhButton
              type="button"
              onClick={() => setActivePriceYear(2027)}
              isActive={activePriceYear === 2027}
            >
              2027 Star of the Seas (7-Night)
            </SeventhButton>
            <SeventhButton
              type="button"
              onClick={() => setActivePriceYear(2028)}
              isActive={activePriceYear === 2028}
            >
              2028 Legend of the Seas (8-Night)
            </SeventhButton>
          </div>
        </div>

        {/* Guidelines Grid */}
        <div className="py-section-fluid grid grid-cols-1 gap-6 border-b border-white/10 text-left md:grid-cols-12">
          {/* Column 1: Ship Resources */}
          <div className="relative flex flex-col justify-between rounded-2xl text-left min-[1600px]:col-span-3 md:col-span-4 lg:col-span-3">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <Ship className="h-6 w-6 shrink-0 text-purple-400" />
                <h3>Ship Resources</h3>
              </div>

              <ul className="space-y-2">
                <li>
                  <SeventhButton
                    type="button"
                    onClick={(e) => {
                      (e.currentTarget as HTMLElement).blur();
                      window.open(
                        "https://en.wikipedia.org/wiki/Star_of_the_Seas",
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    className="!w-full !justify-start !rounded-full px-4 py-2.5"
                  >
                    <Globe className="h-4 w-4 shrink-0 text-purple-400" />
                    <span>WIKI</span>
                  </SeventhButton>
                </li>
                <li>
                  <SeventhButton
                    type="button"
                    onClick={(e) => {
                      (e.currentTarget as HTMLElement).blur();
                      window.open(
                        "https://www.royalcaribbean.com/cruise-ships/star-of-the-seas",
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    className="!w-full !justify-start !rounded-full px-4 py-2.5"
                  >
                    <Ship className="h-4 w-4 shrink-0" />
                    <span>ROYAL CARIBBEAN PAGE</span>
                  </SeventhButton>
                </li>
                <li>
                  <SeventhButton
                    type="button"
                    onClick={(e) => {
                      (e.currentTarget as HTMLElement).blur();
                      window.open(
                        "https://www.chicagomusiccruise.com/assets/staroftheseasdeckplanjan2026.jpg",
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    className="!w-full !justify-start !rounded-full px-4 py-2.5"
                  >
                    <Map className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>DECK PLAN</span>
                  </SeventhButton>
                </li>
                <li>
                  <SeventhButton
                    type="button"
                    onClick={(e) => {
                      (e.currentTarget as HTMLElement).blur();
                      window.open(
                        "https://youtu.be/SOf67Ysk04U?si=bduc0EEkLhYFD7GH",
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    className="!w-full !justify-start !rounded-full px-4 py-2.5"
                  >
                    <Video className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>VIDEO OF THE SHIP</span>
                  </SeventhButton>
                </li>
                <li>
                  <SeventhButton
                    type="button"
                    onClick={(e) => {
                      (e.currentTarget as HTMLElement).blur();
                      window.open(
                        "https://www.chicagomusiccruise.com/assets/star-of-the-seas_cruisecompass-basic.pdf",
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    className="!w-full !justify-start !rounded-full px-4 py-2.5"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>PAST CRUISE COMPASS</span>
                  </SeventhButton>
                </li>
                <li>
                  <SeventhButton
                    type="button"
                    onClick={(e) => {
                      (e.currentTarget as HTMLElement).blur();
                      window.open(
                        "https://youtu.be/0LxUHSdFDtY",
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    className="!w-full !justify-start !rounded-full px-4 py-2.5"
                  >
                    <Film className="h-4 w-4 shrink-0 text-indigo-400" />
                    <span>SHIP TOUR VIDEO</span>
                  </SeventhButton>
                </li>
                <li>
                  <SeventhButton
                    type="button"
                    onClick={(e) => {
                      (e.currentTarget as HTMLElement).blur();
                      window.open(
                        "https://youtu.be/6xCQ4xE7L38",
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    className="!w-full !justify-start !rounded-full px-4 py-2.5"
                  >
                    <Flame className="h-4 w-4 shrink-0 text-orange-400" />
                    <span>PROMO VIDEO</span>
                  </SeventhButton>
                </li>
                <li>
                  <SeventhButton
                    href="https://www.facebook.com/chicagomusiccruise/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-left"
                  >
                    <FacebookIcon className="h-4 w-4 shrink-0 text-blue-400" />
                    <span>Facebook</span>
                  </SeventhButton>
                </li>
                <li>
                  <SeventhButton
                    href="https://www.instagram.com/chicagomusiccruise"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-left"
                  >
                    <InstagramIcon className="h-4 w-4 shrink-0 text-pink-400" />
                    <span>Instagram</span>
                  </SeventhButton>
                </li>
              </ul>
            </div>
            <p className="mt-3">
              Legend of the Seas is an exact sister-ship duplicate.
            </p>
          </div>

          {/* Column 2: Booking Policy */}
          <div className="relative rounded-2xl text-left min-[1600px]:col-span-3 md:col-span-8 lg:col-span-5">
            <div className="mb-6 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 shrink-0 text-yellow-400" />
              <h3>
                {sanityContent?.cruiseInfo?.bookingPolicyTitle ||
                  "Booking Policy"}
              </h3>
            </div>
            <p className="mb-6">
              {sanityContent?.cruiseInfo?.bookingPolicyHeading ||
                "Book through us to participate & lock in best rates"}
            </p>
            <p className="mb-6">
              {sanityContent?.cruiseInfo?.bookingPolicyBody || (
                <>
                  To be part of our events, eat dinner together with the band
                  and fans, and for us to assist you, your reservation{" "}
                  <strong>must</strong> be placed under our official group
                  booking.
                </>
              )}
            </p>
            <ul className="mb-6 space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckMarkIcon className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                <span>
                  Multiple booking options: Group Rate, Prevailing Rate, Sales
                  &amp; Promotions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckMarkIcon className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                <span>
                  We match rates &amp; re-roll your room if prices drop before
                  final payment!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                <span>
                  <strong>ALL-INCLUSIVE:</strong> Prices include Cabin,
                  Gratuities, Taxes, and Port Fees (Double Occupancy).
                </span>
              </li>
            </ul>
            <div className="space-y-1.5 border-t border-white/10 pt-3">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href={`mailto:${sanityContent?.cruiseInfo?.bookingEmail || "info@NTDVacations.com"}`}
                  className="a-btn"
                >
                  {sanityContent?.cruiseInfo?.bookingEmail ||
                    "info@NTDVacations.com"}
                </a>
              </p>
              <p>
                <strong>Call Us:</strong>{" "}
                <a
                  href={`tel:${(sanityContent?.cruiseInfo?.bookingPhone || "877-683-9753").replace(/[^0-9]/g, "")}`}
                  className="hover:underline"
                >
                  {sanityContent?.cruiseInfo?.bookingPhone ||
                    "(877) 683-9753 - opt 5"}
                </a>
              </p>
              <p>
                <CreditCard className="mr-1 inline h-3.5 w-3.5 text-purple-400" />
                <strong>Deposit:</strong>{" "}
                {sanityContent?.cruiseInfo?.depositInfo ||
                  "$250/person ($500/room)."}
              </p>
              <p className="!mt-1">
                <CalendarIcon className="mr-1 inline h-3.5 w-3.5 text-purple-400" />
                <strong>Final Payment:</strong>{" "}
                {activePriceYear === 2027
                  ? sanityContent?.cruiseInfo?.finalPayment2027 || "Oct 1, 2026"
                  : sanityContent?.cruiseInfo?.finalPayment2028 ||
                    "Oct 1, 2027"}
                .
              </p>
            </div>

            {/* Cancellation Policy Card */}
            <div className="mt-6 rounded-2xl bg-purple-950/40 p-5 border border-purple-500/20 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-3">
                <CalendarIcon className="h-6 w-6 shrink-0 text-purple-400" />
                <h3 className="!text-xl font-bold uppercase tracking-wide">
                  {sanityContent?.cruiseInfo?.cancellationTitle ||
                    "Cancellation Policy"}
                </h3>
              </div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-purple-200/80">
                {sanityContent?.cruiseInfo?.cancellationSubheading ||
                  "Refund terms before booking"}
              </p>
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wide text-white">
                  Group Rate Rooms:
                </h4>
                {activePriceYear === 2027 ? (
                  <ul className="list-disc space-y-1.5 pl-4 text-sm text-purple-100/90">
                    <li>
                      Cancel before May 12, 2026:{" "}
                      <strong className="text-white">No penalty</strong>
                    </li>
                    <li>
                      May 12, 2026 – July 12, 2026:{" "}
                      <strong className="text-white">$50 pp fee</strong>
                    </li>
                    <li>
                      July 13, 2026 – Sept 10, 2026:{" "}
                      <strong className="text-white">$100 pp fee</strong>
                    </li>
                    <li>
                      Sept 11, 2026 – Nov 10, 2026:{" "}
                      <strong className="text-white">$200 pp fee</strong>
                    </li>
                  </ul>
                ) : (
                  <ul className="list-disc space-y-1.5 pl-4 text-sm text-purple-100/90">
                    <li>
                      Cancel before May 13, 2027:{" "}
                      <strong className="text-white">No penalty</strong>
                    </li>
                    <li>
                      May 13, 2027 – July 13, 2027:{" "}
                      <strong className="text-white">$50 pp fee</strong>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Passport Guidelines */}
          <div className="relative rounded-2xl text-left min-[1600px]:col-span-4 md:col-span-6 lg:col-span-4">
            <div className="mb-6 flex items-center gap-3">
              <Compass className="h-6 w-6 shrink-0 text-purple-400" />
              <h3>
                {sanityContent?.cruiseInfo?.passportTitle ||
                  "Passport Guidelines"}
              </h3>
            </div>
            <p className="mb-6 text-purple-400">
              {sanityContent?.cruiseInfo?.passportSubheading ||
                "Essential travel document guidelines"}
            </p>
            <div className="space-y-4">
              <p>
                {sanityContent?.cruiseInfo?.passportBody ||
                  "A physical passport book valid for 6 months post-cruise is highly recommended for all travelers."}
              </p>
              <p>
                For closed-loop U.S. sailings, a certified state birth
                certificate accompanied by a government-issued photo ID is
                legally acceptable.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="py-section-fluid space-y-16">
          <div className="relative p-0 text-left">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3>Limited Group Rate Cabins ({activePriceYear})</h3>
              </div>
              {isAdmin && (
                <AddCmsButton
                  label="ADD / EDIT ROOMS IN SANITY CMS"
                  onClick={() => setIsAddRoomModalOpen(true)}
                />
              )}
            </div>

            <div
              key={`group-${activePriceYear}`}
              className="grid animate-[fade-in_0.35s_ease-out_both] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {(
                ([...(sanityContent?.cruiseInfo?.cabins || []), ...addedCabins]
                  .length > 0
                  ? [
                    ...(sanityContent?.cruiseInfo?.cabins || []),
                    ...addedCabins,
                  ].flatMap((c: any) =>
                    String(c.year) === String(activePriceYear)
                      ? [
                        {
                          code: c.code,
                          title: c.title,
                          price: c.price,
                          status: c.status,
                          badge: c.badge,
                          image:
                            c.imagePath ||
                            c.image ||
                            "/images/cruise/q2_interior_plus.jpg",
                          inclusions: c.inclusions,
                          selectValue:
                            c.selectValue ||
                            `group_${(c.code || "room").toLowerCase()}`,
                        },
                      ]
                      : [],
                  )
                  : null) ||
                (activePriceYear === 2027
                  ? [
                    {
                      code: "Q2",
                      title: "Interior Plus",
                      price: "$1,683.27",
                      status: "soldout",
                      badge: "Group Rate Sold Out - Book Prevailing",
                      image: "/images/cruise/q2_interior_plus.jpg",
                      selectValue: "group_n5",
                    },
                    {
                      code: "N5",
                      title: "Ocean View",
                      price: "$1,883.27",
                      status: "warning",
                      badge: "1 Cabin Left!",
                      image: "/images/cruise/n5.jpg",
                      inclusions: "Gratuities Included",
                      selectValue: "group_n5",
                    },
                    {
                      code: "IF",
                      title: "Infinite Central Park",
                      price: "$2,033.27",
                      status: "warning",
                      badge: "2 Cabins Left!",
                      image: "/images/cruise/if.jpg",
                      inclusions: "Gratuities Included",
                      selectValue: "group_if",
                    },
                    {
                      code: "D4",
                      title: "Ocean View Balcony",
                      price: "$2,433.27",
                      status: "info",
                      badge: "10 Available",
                      image: "/images/cruise/d1_ocean_view_balcony.jpg",
                      inclusions: "Gratuities Included",
                      selectValue: "group_d4",
                    },
                    {
                      code: "D2",
                      title: "Ocean View Balcony",
                      price: "$2,483.27",
                      status: "info",
                      badge: "11 Available",
                      image: "/images/cruise/d1_ocean_view_balcony.jpg",
                      inclusions: "Gratuities Included",
                      selectValue: "group_d2",
                    },
                    {
                      code: "I1",
                      title: "Infinite Ocean View Balcony",
                      price: "$2,583.27",
                      status: "warning",
                      badge: "5 Cabins Left!",
                      image:
                        "/images/cruise/i1_infinite_ocean_view_balcony.jpg",
                      inclusions: "Gratuities Included",
                      selectValue: "group_i1",
                    },
                  ]
                  : [
                    {
                      code: "Q2",
                      title: "Interior Plus",
                      price: "$1,832.98",
                      status: "info",
                      badge: "Available",
                      image: "/images/cruise/q2_interior_plus.jpg",
                      inclusions: "Gratuities Included",
                      selectValue: "group_n5",
                    },
                    {
                      code: "IF",
                      title: "Infinite Central Park",
                      price: "$2,032.98",
                      status: "info",
                      badge: "Available",
                      image: "/images/cruise/if.jpg",
                      inclusions: "Gratuities Included",
                      selectValue: "group_if",
                    },
                    {
                      code: "N5",
                      title: "Ocean View",
                      price: "$2,162.98",
                      status: "info",
                      badge: "Available",
                      image: "/images/cruise/n5.jpg",
                      inclusions: "Gratuities Included",
                      selectValue: "group_n5",
                    },
                    {
                      code: "D4",
                      title: "Ocean View Balcony",
                      price: "$2,472.98",
                      status: "info",
                      badge: "Available",
                      image: "/images/cruise/d1_ocean_view_balcony.jpg",
                      inclusions: "Gratuities Included",
                      selectValue: "group_d4",
                    },
                    {
                      code: "D2",
                      title: "Ocean View Balcony",
                      price: "$2,492.98",
                      status: "info",
                      badge: "Available",
                      image: "/images/cruise/d1_ocean_view_balcony.jpg",
                      inclusions: "Gratuities Included",
                      selectValue: "group_d2",
                    },
                    {
                      code: "I1",
                      title: "Infinite Ocean View Balcony",
                      price: "$2,522.98",
                      status: "info",
                      badge: "Available",
                      image:
                        "/images/cruise/i1_infinite_ocean_view_balcony.jpg",
                      inclusions: "Gratuities Included",
                      selectValue: "group_i1",
                    },
                  ])
              ).map((room: any, idx: number) => (
                <div
                  key={(room.code || room.selectValue) + idx}
                  onClick={() => handleSelectCabin(room.selectValue)}
                  className="group flex w-full cursor-pointer flex-col justify-between border-0 text-left"
                >
                  <div>
                    {room.image && (
                      <div className="relative h-44 w-full overflow-hidden text-center">
                        <Image
                          width={200}
                          height={200}
                          unoptimized
                          src={room.image}
                          alt={room.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="px-0 py-5">
                      <div className="mb-3 flex items-start justify-between gap-2 text-left">
                        <SectionBadge label={room.badge} />
                      </div>
                      <span className="block">{room.code} Category</span>
                      <h4 className="text-left">{room.title}</h4>
                    </div>
                  </div>

                  <div className="px-0 pt-0 text-left">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl">{room.price}</span>
                      <span className="text-white/50">USD pp</span>
                    </div>
                    {room.inclusions && (
                      <span className="flex items-center gap-1 text-purple-400">
                        <CheckMarkIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>{room.inclusions}</span>
                      </span>
                    )}
                    <SeventhButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCabin(room.selectValue);
                      }}
                      className="!mt-3 w-full"
                    >
                      SELECT &amp; BOOK CABIN
                    </SeventhButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </LazyMount>

      {/* ── CRUISE RESERVATION & SIGNUP FORM SECTION ── */}
      <section
        id="signup"
        className="site-container py-section-fluid relative z-20 border-b border-white/10"
      >
        <div id="booking" />
        <div id="book-now" />
        <div id="payment-portal" />

        <div>
          <div className="mb-6  text-center">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-3">
              <span className="st inline-block rounded-full border border-purple-500/30 bg-purple-900/50 px-3.5 py-1">
                Official Booking Form
              </span>
              <button
                type="button"
                onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-rose-500/40 bg-rose-600/30 px-4 py-1.5 text-rose-200 hover:bg-rose-600/50"
              >
                💳{" "}
                {isPaymentDropdownOpen
                  ? "Hide Payment Form"
                  : "Make A Payment On Existing Booking"}
              </button>
            </div>
            <h2>RESERVE YOUR CRUISE STATEROOM</h2>
            <p className="mx-auto mt-2 max-w-xl sm:text-base">
              Every booking requires a $500 deposit per room ($250 per person).
              Complete the form below to lock in your cabin rate.
            </p>
          </div>

          {PaymentPortalDropdownPanel && isPaymentDropdownOpen && (
            <div className="mb-8">
              <PaymentPortalDropdownPanel
                isOpen={isPaymentDropdownOpen}
                onClose={() => setIsPaymentDropdownOpen(false)}
              />
            </div>
          )}

          {signupStatus === "success" ? (
            <div className="animate-fade-in space-y-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20 text-2xl text-emerald-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl">Reservation Submitted!</h3>
              <p className="mx-auto max-w-md">
                Thank you,{" "}
                <strong className="text-emerald-400">{formData.name}</strong>!
                Your cruise booking request for cabin{" "}
                <strong>
                  {formData.cabinPreference || "selected stateroom"}
                </strong>{" "}
                has been received by NTD Vacations concierge.
              </p>
              <p className="text-white/50">
                A confirmation email has been dispatched to {formData.email}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3 text-left">
              {formError && (
                <div className="flex items-center gap-3 rounded-xl border border-red-500/50 bg-red-900/40 p-4 text-red-200">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* ROOM CATEGORY SELECTION */}
              <div>
                <label htmlFor="cabinPreference" className="mb-2 block">
                  Room Category / Cabin Preference *
                </label>
                <div className="input-glow-border rounded-xl">
                  <input
                    id="cabinPreference"
                    type="text"
                    required
                    value={formData.cabinPreference || ""}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        cabinPreference: e.target.value,
                      }))
                    }
                    placeholder="e.g. Ocean View Balcony (D4) or Suite"
                    className="focus-ring w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-base"
                  />
                </div>
                <p className="mt-1.5 text-white/50">
                  EVERY BOOKING NEEDS $500 DEPOSIT PER ROOM (OR $250 PER PERSON)
                </p>
              </div>

              {/* GUEST 1 DETAILS & PAYMENT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <h3>GUEST 1 (PRIMARY RESERVATION HOLDER)</h3>
                  <span className="text-purple-400">Primary Guest</span>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label>Full Legal Name *</label>
                    <div className="input-glow-border rounded-xl">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="First &amp; Last Name (as on Passport/ID)"
                        className="focus-ring w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label>Email Address *</label>
                    <div className="input-glow-border rounded-xl">
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="your@email.com"
                        className="focus-ring w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label>Cell Phone *</label>
                    <div className="input-glow-border rounded-xl">
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            phone: formatPhoneDisplay(e.target.value),
                          }))
                        }
                        placeholder="(555) 000-0000"
                        className="focus-ring w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label>Crown &amp; Anchor # (If Any)</label>
                    <div className="input-glow-border rounded-xl">
                      <input
                        type="text"
                        value={formData.crownAnchor1 || ""}
                        onChange={(e) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            crownAnchor1: e.target.value,
                          }))
                        }
                        placeholder="Royal Caribbean Loyalty #"
                        className="focus-ring w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label>T-Shirt Size</label>
                    <CustomDropdown
                      value={formData.tshirtSize1 || "L"}
                      onChange={(val) =>
                        setFormData((prev: any) => ({
                          ...prev,
                          tshirtSize1: val,
                        }))
                      }
                      options={[
                        { value: "S", label: "Small (S)" },
                        { value: "M", label: "Medium (M)" },
                        { value: "L", label: "Large (L)" },
                        { value: "XL", label: "X-Large (XL)" },
                        { value: "2XL", label: "2X-Large (2XL)" },
                        { value: "3XL", label: "3X-Large (3XL)" },
                      ]}
                      chevronColor="#f43f5e"
                      className="!"
                    />
                  </div>
                </div>

                {/* GUEST 1 PAYMENT CARD */}
                <div>
                  <CruiseCard1Section
                    formData={formData}
                    setFormData={setFormData}
                  />
                </div>
              </div>

              {/* GUEST 2 DETAILS (OPTIONAL / TOGGLEABLE) */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h3>GUEST 2 (IF NEEDED)</h3>
                    <p className="mt-0.5">
                      YOU DO NOT NEED TO FILL OUT GUEST 2 CREDIT CARD INFO IF
                      YOU ARE A COUPLE GOING TOGETHER ON ONE CREDIT CARD
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleGuestActive(0, !guests[0]?.active)}
                    className={`cursor-pointer rounded-full border px-4 py-1.5 transition-[background-color,border-color,color] ${guests[0]?.active ? "border-purple-400 bg-purple-600" : "border-white/20 bg-white/10 hover:text-white"}`}
                  >
                    {guests[0]?.active ? "✓ Guest 2 Added" : "+ Add Guest 2"}
                  </button>
                </div>

                {guests[0]?.active && (
                  <div className="animate-fade-in space-y-4">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-1">Guest 2 Full Legal Name</label>
                        <div className="input-glow-border rounded-xl">
                          <input
                            type="text"
                            value={guests[0].name}
                            onChange={(e) =>
                              updateGuest(0, "name", e.target.value)
                            }
                            placeholder="Guest 2 First &amp; Last Name"
                            className="focus-ring w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block">Guest 2 Email</label>
                        <div className="input-glow-border rounded-xl">
                          <input
                            type="email"
                            value={guests[0].email}
                            onChange={(e) =>
                              updateGuest(0, "email", e.target.value)
                            }
                            placeholder="guest2@email.com"
                            className="focus-ring w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div>
                        <label className="mb-1">Guest 2 Phone</label>
                        <div className="input-glow-border rounded-xl">
                          <input
                            type="tel"
                            value={guests[0].phone}
                            onChange={(e) =>
                              updateGuest(
                                0,
                                "phone",
                                formatPhoneDisplay(e.target.value),
                              )
                            }
                            placeholder="(555) 000-0000"
                            className="focus-ring w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1">
                          Guest 2 Crown &amp; Anchor #
                        </label>
                        <div className="input-glow-border rounded-xl">
                          <input
                            type="text"
                            value={guests[0].crownAnchor}
                            onChange={(e) =>
                              updateGuest(0, "crownAnchor", e.target.value)
                            }
                            placeholder="Loyalty #"
                            className="focus-ring w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1">Guest 2 T-Shirt Size</label>
                        <CustomDropdown
                          value={guests[0]?.tshirtSize || "L"}
                          onChange={(val) => updateGuest(0, "tshirtSize", val)}
                          options={[
                            { value: "S", label: "Small (S)" },
                            { value: "M", label: "Medium (M)" },
                            { value: "L", label: "Large (L)" },
                            { value: "XL", label: "X-Large (XL)" },
                            { value: "2XL", label: "2X-Large (2XL)" },
                            { value: "3XL", label: "3X-Large (3XL)" },
                          ]}
                          chevronColor="#f43f5e"
                        />
                      </div>
                    </div>

                    {/* OPTIONAL SPLIT PAYMENT FOR GUEST 2 */}
                    <div className="pt-2">
                      <div className="mb-3 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="splitPayment"
                          checked={formData.splitPayment}
                          onChange={(e) =>
                            setFormData((prev: any) => ({
                              ...prev,
                              splitPayment: e.target.checked,
                            }))
                          }
                          className="cursor-pointer rounded border-white/20 bg-black/50 text-purple-600 focus:ring-purple-500"
                        />
                        <label
                          htmlFor="splitPayment"
                          className="cursor-pointer text-purple-200"
                        >
                          Split deposit onto 2 separate credit cards?
                        </label>
                      </div>

                      {formData.splitPayment && (
                        <CruiseCard2Section
                          formData={formData}
                          setFormData={setFormData}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* EXTRA / OPTIONS & NOTES */}
              <div className="space-y-3">
                <h3 className="border-b border-white/10 pb-3">
                  EXTRA &amp; SPECIAL REQUESTS
                </h3>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label>Travel Insurance? (Yes / No)</label>
                    <CustomDropdown
                      value={formData.insurance || "no"}
                      onChange={(val) =>
                        setFormData((prev: any) => ({
                          ...prev,
                          insurance: val,
                        }))
                      }
                      options={[
                        { value: "no", label: "No - I decline insurance" },
                        {
                          value: "yes",
                          label: "Yes - Send me insurance quote options",
                        },
                      ]}
                      chevronColor="#f43f5e"
                    />
                  </div>

                  <div>
                    <label>Pre-Paid Gratuities? (Y/N?) *</label>
                    <CustomDropdown
                      value={formData.prepaidGratuities || "yes"}
                      onChange={(val) =>
                        setFormData((prev: any) => ({
                          ...prev,
                          prepaidGratuities: val,
                        }))
                      }
                      options={[
                        {
                          value: "yes",
                          label: "Yes - Add pre-paid gratuities",
                        },
                        {
                          value: "no",
                          label: "No - Pay gratuities onboard ship",
                        },
                      ]}
                      chevronColor="#f43f5e"
                    />
                    <p className="mt-1 text-white/50">
                      GROUP RATE ROOMS MUST HAVE THIS
                    </p>
                  </div>
                </div>

                {/* NOTES & SIGNATURE COMPONENT */}
                <CruiseNotesAndSignatureSection
                  formData={formData}
                  setFormData={setFormData}
                  signature={signature}
                  setSignature={setSignature}
                  signatureDate={signatureDate}
                />
                {/* SUBMIT BUTTON */}
                <div className="text-center">
                  <SeventhButton
                    type="submit"
                    disabled={signupStatus === "submitting"}
                    className="w-full justify-center sm:w-auto"
                  >
                    {signupStatus === "submitting" ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>SUBMITTING RESERVATION...</span>
                      </div>
                    ) : (
                      <span>SUBMIT RESERVATION &amp; BOOKING</span>
                    )}
                  </SeventhButton>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Cruise Support Team */}
      <LazyMount
        as="section"
        id="concierge"
        className="site-container py-section-fluid relative z-20 border-b border-white/10 text-center"
        minHeight="400px"
        rootMargin="300px 0px"
      >
        <div className="mx-auto mb-6 max-w-2xl">
          <h2>Official Cruise Concierge &amp; Booking Team</h2>
          <p className="mx-auto mt-3 max-w-2xl sm:text-base">
            Have questions about your booking, cabin options, group travel, or
            excursions? Our dedicated 7th Heaven Cruise concierge team is here
            to assist you every step of the way.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-2 lg:grid-cols-3">
          {(
            (sanityContent?.founders?.length
              ? sanityContent.founders
              : sanityContent?.contacts?.length
                ? sanityContent.contacts
                : null) || [
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
            ]
          ).map((member: any) => {
            const nameStr = member.name || "Team Member";
            const roleStr = member.role || member.category || "Concierge";
            const descStr = member.desc || member.company || "";
            const phoneStr = member.phone || "";
            const emailStr = member.email || "";

            const photoSrc =
              nameStr.toLowerCase().includes("mary") ||
                nameStr.toLowerCase().includes("grivas")
                ? "/images/contact/Mary-contact.png"
                : nameStr.toLowerCase().includes("alan") ||
                  nameStr.toLowerCase().includes("mcrae")
                  ? "/images/contact/Alan-contact.png"
                  : "/images/contact/Dickie-contact.png";

            return (
              <div
                key={nameStr + emailStr}
                className="flex flex-col items-center"
              >
                <div
                  className="relative flex w-full items-end justify-center overflow-hidden"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 0%, black 55%, transparent 95%)",
                    maskImage:
                      "linear-gradient(to bottom, black 0%, black 55%, transparent 95%)",
                  }}
                >
                  <Image
                    width={408}
                    height={408}
                    unoptimized
                    src={photoSrc}
                    alt={nameStr}
                    className="h-full w-full object-contain object-bottom"
                    style={{
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black 0%, black 55%, transparent 95%)",
                      maskImage:
                        "linear-gradient(to bottom, black 0%, black 55%, transparent 95%)",
                    }}
                  />
                </div>
                <h4>{nameStr}</h4>
                <div className="mt-2 flex w-full flex-col items-center gap-1">
                  <SectionBadge label={roleStr} isActive />
                  {descStr && <p className="mt-0.5">{descStr}</p>}
                </div>
                <div className="mt-3 flex w-full flex-col items-center gap-1.5">
                  {phoneStr && (
                    <a
                      href={`tel:${phoneStr.replace(/[^0-9]/g, "")}`}
                      className="! hover:text-white"
                    >
                      <span>{phoneStr}</span>
                    </a>
                  )}
                  {emailStr && (
                    <a href={`mailto:${emailStr}`} className="a-btn">
                      <span>{emailStr}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </LazyMount>

      {/* FEATURED ARTISTS */}
      <LazyMount
        as="section"
        id="artists"
        className="site-container py-section-fluid border-b border-white/10"
        minHeight="500px"
        rootMargin="300px 0px"
      >
        <div className="mb-6 w-full max-w-3xl text-left">
          <h2>
            Featured <span className="accent-gradient-text">Artists</span>
          </h2>
          <p className="mt-2.5 sm:text-base">
            Get ready for non-stop live music! Join 7th Heaven along with an
            extraordinary lineup of world-class performers and special guest
            bands across multiple stages throughout the voyage.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BANDS_DATA.map((band) => (
            <div
              key={band.name}
              className="group relative flex flex-col justify-between overflow-hidden border-0"
            >
              {band.photo && (
                <div
                  className="relative flex w-full items-end justify-center overflow-hidden"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 0%, black 55%, transparent 95%)",
                    maskImage:
                      "linear-gradient(to bottom, black 0%, black 55%, transparent 95%)",
                  }}
                >
                  <Image
                    width={400}
                    height={400}
                    unoptimized
                    src={band.photo}
                    alt={band.name}
                    className="h-full w-full object-contain object-bottom"
                    style={{
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black 0%, black 55%, transparent 95%)",
                      maskImage:
                        "linear-gradient(to bottom, black 0%, black 55%, transparent 95%)",
                    }}
                  />
                </div>
              )}
              <div className="relative z-10 flex flex-col pt-3 pb-2 text-left">
                <h3>{band.name}</h3>
                {band.role && (
                  <div className="mt-2">
                    <SectionBadge label={band.role} />
                  </div>
                )}
                <p className="mt-2 line-clamp-2">{band.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </LazyMount>

      {/* ── ADD ROOM MODAL PORTAL ── */}
      {mounted &&
        isAddRoomModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex animate-[fade-in_0.2s_ease-out] items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-purple-500/30 bg-[#12071f] p-6 text-left sm:p-8">
              <button
                type="button"
                onClick={() => setIsAddRoomModalOpen(false)}
                className="absolute top-4 right-4 cursor-pointer rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/40 bg-purple-600/20 text-purple-400">
                  <Ship className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl">Add Stateroom to Sanity CMS</h3>
                  <p className="/70">
                    Create and publish a stateroom rate card directly to Sanity
                    CMS.
                  </p>
                </div>
              </div>

              {roomError && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-900/40 p-3 text-red-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{roomError}</span>
                </div>
              )}

              {roomSuccess && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-900/40 p-3 text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Stateroom saved successfully to Sanity!</span>
                </div>
              )}

              <form onSubmit={handleSaveRoom} className="space-y-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-purple-200/80">
                      Stateroom Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={roomForm.title}
                      onChange={(e) =>
                        setRoomForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="e.g. Ocean View Balcony"
                      className="focus-ring w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-purple-200/80">
                      Category Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={roomForm.code}
                      onChange={(e) =>
                        setRoomForm((prev) => ({
                          ...prev,
                          code: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="e.g. D4, N5, IF, GS"
                      className="focus-ring w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-purple-200/80">
                      Cruise Year *
                    </label>
                    <select
                      value={roomForm.year}
                      onChange={(e) =>
                        setRoomForm((prev) => ({
                          ...prev,
                          year: e.target.value,
                        }))
                      }
                      className="focus-ring w-full cursor-pointer rounded-xl border border-white/15 bg-black/50 px-3 py-2.5"
                    >
                      <option value="2027">2027 (Star of the Seas)</option>
                      <option value="2028">2028 (Legend of the Seas)</option>
                    </select>
                  </div>

                  <ModalInputField
                    label="Price Per Person (USD) *"
                    value={roomForm.price}
                    onChange={(val) =>
                      setRoomForm((prev) => ({ ...prev, price: val }))
                    }
                    placeholder="e.g. $2,433.27"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ModalInputField
                    label="Availability Badge Text"
                    value={roomForm.badge}
                    onChange={(val) =>
                      setRoomForm((prev) => ({ ...prev, badge: val }))
                    }
                    placeholder="e.g. 5 Cabins Left! or Available"
                  />

                  <div>
                    <label className="mb-1.5 block text-purple-200/80">
                      Badge Status Color
                    </label>
                    <select
                      value={roomForm.status}
                      onChange={(e) =>
                        setRoomForm((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="focus-ring w-full cursor-pointer rounded-xl border border-white/15 bg-black/50 px-3 py-2.5"
                    >
                      <option value="info">Info / Cyan (Available)</option>
                      <option value="warning">
                        Warning / Amber (Few Left)
                      </option>
                      <option value="soldout">Sold Out / Red</option>
                    </select>
                  </div>
                </div>

                <ModalInputField
                  label="Inclusions &amp; Perks"
                  value={roomForm.inclusions}
                  onChange={(val) =>
                    setRoomForm((prev) => ({ ...prev, inclusions: val }))
                  }
                  placeholder="e.g. Gratuities Included"
                />

                <ModalInputField
                  label="Image Path / URL"
                  value={roomForm.imagePath}
                  onChange={(val) =>
                    setRoomForm((prev) => ({ ...prev, imagePath: val }))
                  }
                  placeholder="e.g. /images/cruise/d1_ocean_view_balcony.jpg"
                />

                <RoomModalFooterButtons
                  isSaving={isSavingRoom}
                  onCancel={() => setIsAddRoomModalOpen(false)}
                />
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

const CruiseCabinsPricingSection = React.memo(
  CruiseCabinsPricingSectionComponent,
);
export default CruiseCabinsPricingSection;
