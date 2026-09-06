/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */
import Image from 'next/image';

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ship, Waves, Palmtree, Anchor, Wine, Music, PartyPopper, Compass, HelpCircle, CreditCard, Calendar as CalendarIcon, AlertTriangle, Check, Sun, Crown, DoorClosed, TreePine, Sparkles, Phone, Mail, Globe, Map, Video, FileText, Film, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/context/MemberContext";
import { formatPhoneDisplay, isValidEmail } from "@/lib/validation";
import Dropdown from "@/components/Dropdown";
import SquishyToggle from "@/components/SquishyToggle";
import { useHeroParallax, parallaxScaleFor } from "@/lib/useHeroParallax";
import HeroParallaxCustomizer from "@/components/HeroParallaxCustomizer";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";
import { SectionBadge } from "@/components/SectionBadge";
import InputField from "@/components/InputField";
import {
  BANDS_DATA,
  PORTS_DATA,
  FAQS_EXTENDED,
  CRUISE_HISTORY,
  ITINERARY_2027,
  ITINERARY_2028,
} from "./cruiseData";
import dynamic from "next/dynamic";
const CruiseSnakeItinerary = dynamic(() => import("@/components/CruiseSnakeItinerary"), { ssr: false });
const CruiseVideoGallery = dynamic(() => import("@/components/CruiseVideoGallery"), { ssr: false });
const CruiseHistoryTimeline = dynamic(() => import("@/components/CruiseHistoryTimeline"), { ssr: false });

const CruiseHeroMaskEditor = dynamic(() => import("@/components/CruiseHeroMaskEditor"), { ssr: false });

function ViewportSection({
  children,
  minHeight = "500px",
  className = "",
  id,
}: {
  children: React.ReactNode;
  minHeight?: string;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={className}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: minHeight,
      }}
    >
      {children}
    </div>
  );
}

function mapToSnakeItinerary(itinData: typeof ITINERARY_2027) {
  const COLOR_THEMES = ["#06b6d4", "#3b82f6", "#a855f7", "#10b981", "#9333ea", "#ec4899", "#8b5cf6", "#64748b"];
  return itinData.map((day, i) => ({
    id: `day-${day.day}`,
    dayLabel: `Day ${day.day} · ${day.label}`,
    location: day.port,
    theme: day.label,
    photo: day.photo,
    colorTheme: COLOR_THEMES[i % COLOR_THEMES.length],
    events: day.schedule.map((item, idx) => ({
      id: `event-${day.day}-${idx}`,
      time: item.time,
      title: item.event,
      subtitle: item.cat === "band" ? "Exclusive Fan Performance" : item.cat === "food" ? "Dining & Social Event" : "Ship & Port Activity",
    })),
  }));
}

const ITINERARY = [
  {
    day: 1, port: "Port Canaveral, FL (Orlando)", label: "Embarkation", Icon: Ship, type: "depart",
    photo: "/images/cruise/miami.png",
    schedule: [
      { time: "12:00 PM", event: "Boarding begins at Port Canaveral", cat: "ship" },
      { time: "2:00 PM", event: "Cabins open — explore the brand new Star of the Seas", cat: "explore" },
      { time: "4:30 PM", event: "Sail-Away Concert — AquaDome / Pool Deck", cat: "band" },
      { time: "8:00 PM", event: "Group Dinner - Eat together in Main Dining Room", cat: "food" },
    ],
  },
  {
    day: 2, port: "Perfect Day at CocoCay, Bahamas", label: "Private Island", Icon: Palmtree, type: "island",
    photo: "/images/cruise/cozumel.png",
    schedule: [
      { time: "8:00 AM", event: "Arrive at Royal Caribbean's Private Island", cat: "ship" },
      { time: "11:00 AM", event: "Chill Island beach day & waterslides", cat: "explore" },
      { time: "2:00 PM", event: "Poolside Acoustic Set at Coco Beach Club", cat: "band" },
      { time: "5:00 PM", event: "All aboard CocoCay pier", cat: "ship" },
    ],
  },
  {
    day: 3, port: "At Sea", label: "Sea Day", Icon: Waves, type: "sea",
    photo: "/images/cruise/at-sea.png",
    schedule: [
      { time: "10:00 AM", event: "Free play at Thrill Waterpark on ship", cat: "explore" },
      { time: "1:00 PM", event: "Q&A session with 7th Heaven in Music Hall", cat: "band" },
      { time: "4:00 PM", event: "Cocktail hours with other fans", cat: "food" },
      { time: "8:30 PM", event: "Full Electric Concert - Royal Theater", cat: "band" },
    ],
  },
  {
    day: 4, port: "Charlotte Amalie, St. Thomas", label: "Port Day", Icon: Palmtree, type: "island",
    photo: "/images/cruise/grand-cayman.png",
    schedule: [
      { time: "8:00 AM", event: "Dock in beautiful St. Thomas", cat: "ship" },
      { time: "10:00 AM", event: "Magen's Bay beach excursion", cat: "explore" },
      { time: "3:00 PM", event: "Shopping & local sight-seeing in Charlotte Amalie", cat: "explore" },
      { time: "9:00 PM", event: "Under-the-stars deck concert", cat: "band" },
    ],
  },
  {
    day: 5, port: "Philipsburg, St. Maarten", label: "Port Day", Icon: Palmtree, type: "island",
    photo: "/images/cruise/roatan.png",
    schedule: [
      { time: "8:00 AM", event: "Dock in St. Maarten", cat: "ship" },
      { time: "10:30 AM", event: "Maho Beach plane spotting excursion", cat: "explore" },
      { time: "1:00 PM", event: "French side culinary tour (Marigot)", cat: "food" },
      { time: "8:00 PM", event: "Themed night & group deck party", cat: "band" },
    ],
  },
  {
    day: 6, port: "At Sea", label: "Grand Finale", Icon: Music, type: "sea",
    photo: "/images/cruise/concert.png",
    schedule: [
      { time: "11:00 AM", event: "Farewell pool deck celebration", cat: "explore" },
      { time: "3:00 PM", event: "Acoustic requests & farewell lounge jam", cat: "band" },
      { time: "8:00 PM", event: "7th Heaven Grand Finale Show", cat: "band" },
      { time: "10:30 PM", event: "Late night passenger lounge after-party", cat: "band" },
    ],
  },
  {
    day: 7, port: "Port Canaveral, FL", label: "Disembarkation", Icon: Anchor, type: "depart",
    photo: "/images/cruise/miami.png",
    schedule: [
      { time: "7:00 AM", event: "Arrive back in Port Canaveral", cat: "ship" },
      { time: "9:00 AM", event: "Group photo with the band - pool deck", cat: "band" },
      { time: "10:00 AM", event: "Disembarkation begins", cat: "ship" },
    ],
  },
];

const ITIN_TYPE_ACCENT: Record<string, string> = {
  island: "text-purple-400", sea: " text-[var(--color-accent)]", depart: "text-purple-300",
};
const ITIN_TYPE_BAR: Record<string, string> = {
  island: "from-purple-500 to-indigo-400", sea: "from-purple-500 to-[var(--color-accent)]", depart: "from-amber-500 to-orange-400",
};
const ITIN_CAT_DOT: Record<string, string> = {
  band: "bg-[var(--color-accent)] shadow-[0_0_6px_rgba(255,10,61,0.8)]",
  explore: "bg-purple-400", food: "bg-emerald-400", ship: "bg-white/25",
};
const ITIN_CAT_TEXT: Record<string, string> = {
  band: "text-white font-semibold", explore: "text-white/70", food: " text-white ", ship: "text-white/35",
};

const FAQS = [
  { q: "How does the group deal work?", a: "We take the total number of interested fans to cruise line management and negotiate the best possible group rate. The more people who sign up, the better the deal for everyone." },
  { q: "Am I committing to buy by signing up?", a: "No — signing up is free and non-binding. It just tells us you're interested so we can negotiate the best rate. You'll get first access to book once pricing is locked in." },
  { q: "When will I know the final price?", a: "Once we hit our target number of interested fans, we'll take the headcount to cruise management. You'll be emailed the negotiated pricing before anyone else." },
  { q: "Is 7th Heaven playing the whole cruise?", a: "Yes! We have multiple performances planned — from intimate acoustic sets by the pool to a full-production grand finale concert." },
  { q: "Can I bring friends and family?", a: "Absolutely! When you sign up, tell us how many people you'd bring. Every person counts toward the group rate, so the more the merrier." },
  { q: "What's included?", a: "Cabin, meals at main dining venues, all 7th Heaven performances, and standard cruise amenities. Drink packages and excursions are typically additional." },
  { q: "Can I book through a travel agent?", a: "Yes! Travel agents booking cabins for clients can easily link reservations to the 7th Heaven group. Agents can log into Royal Caribbean Group's official Cruising Power portal (https://www.cruisingpower.com) to register and link bookings to our group code." },
];

const GUEST_COLORS = ["#3b82f6", "#06b6d4", "#9333ea", "#10b981", "#ef4444", "#ec4899", "#8b5cf6", "#f97316"];
const AVATAR_COLORS = ["#851DEF", "#3b82f6", "#06b6d4", "#9333ea", "#10b981", "#ef4444", "#ec4899", "#8b5cf6"];

export default function CruisePage() {
  const supabase = createClient();
  const router = useRouter();
  const { isLoggedIn, member, openModal } = useMember();
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [heroVideoReady, setHeroVideoReady] = useState(true);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);

  const [heroMaskSettings, setHeroMaskSettings] = useState(() => {
    const defaults = {
      topFadeStart: 0,
      topFadeEnd: 15,
      topGradientHeight: 240,
      topGradientOpacity: 85,
      bottomFadeStart: 80,
      bottomFadeEnd: 98,
      videoBlur: 0,
      videoBrightness: 90,
      videoContrast: 100,
      videoOpacity: 100,
      beforeHeight: 0,
      beforeBlur: 0,
      beforeBgOpacity: 85,
      beforeZIndex: 10,
      itinTopFadeStart: 0,
      itinTopFadeEnd: 3,
      itinBottomFadeStart: 95,
      itinBottomFadeEnd: 100,
      itinBgOpacity: 90,
      itinBlur: 16,
      historyTopFadeStart: 0,
      historyTopFadeEnd: 2,
      historyBottomFadeStart: 95,
      historyBottomFadeEnd: 100,
      historyBgOpacity: 90,
      historyBlur: 16,
    };
    if (typeof window === "undefined") return defaults;
    try {
      const saved = localStorage.getItem('7h_cruise_hero_mask_v6');
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch { }
    return defaults;
  });

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setHeroMaskSettings((prev: Record<string, any>) => ({ ...prev, ...customEvent.detail }));
      }
    };
    window.addEventListener('hero-mask-update', handleUpdate);
    return () => window.removeEventListener('hero-mask-update', handleUpdate);
  }, []);

  // Pause hero video only when scrolled far out of view
  useEffect(() => {
    const videoEl = heroVideoRef.current;
    if (!videoEl) return;

    // Ensure video is playing on mount
    videoEl.play().catch(() => { });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (videoEl.paused) {
              videoEl.play().catch(() => { });
            }
          } else {
            // Only pause if scrolled down past the hero header to prevent initial page-load flicker
            if (typeof window !== 'undefined' && window.scrollY > 150 && !videoEl.paused) {
              videoEl.pause();
            }
          }
        });
      },
      { threshold: 0.01 }
    );

    observer.observe(videoEl);
    return () => observer.disconnect();
  }, []);

  // Same shared parallax as the home page and /media heroes
  // (src/lib/useHeroParallax.ts) — tuning it via any of these pages' panels
  // updates the default on all of them. #cruise-hero renders unconditionally
  // at the top of this component (unlike /media's featured hero, which waits
  // on an async fetch), so `heroVideoRef`/`heroForegroundRef` are already
  // populated by the time this hook's effect runs — no extra readiness
  // check needed in `enabled`.
  const heroForegroundRef = useRef<HTMLDivElement>(null);
  const heroParallax = useHeroParallax({
    mediaRef: heroVideoRef,
    foregroundRef: heroForegroundRef,
    triggerSelector: "#cruise-hero",
    enabled: false,
  });

  const transitionDone = true;
  const renderTimeline = true;

  const itin2027Mapped = useMemo(() => mapToSnakeItinerary(ITINERARY_2027), []);
  const itin2028Mapped = useMemo(() => mapToSnakeItinerary(ITINERARY_2028), []);

  const [signupStatus, setSignupStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", notes: "", anonymous: false,
    joinCommunity: true, cruiseNotifications: true, website: "", guestCount: 1, cabinPreference: "",
    dob1: "", crownAnchor1: "", tshirtSize1: "L",
    cardName1: "", cardNumber1: "", cardExpiry1: "", cardCvv1: "", cardZip1: "", cardAmount1: "250.00",
    cardName2: "", cardNumber2: "", cardExpiry2: "", cardCvv2: "", cardZip2: "", cardAmount2: "250.00",
    splitPayment: false,
    insurance: "no", prepaidGratuities: "yes", howHeard: "7th Heaven"
  });

  // Restore draft cabin selection from localStorage on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem("7h_cruise_cabin_draft_v1") || localStorage.getItem("7h_cruise_cabin_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      }
    } catch { }
  }, []);

  // Signal PageTransition that CruisePage has mounted and web fonts are ready
  useEffect(() => {
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        window.dispatchEvent(new CustomEvent("7h:page:ready"));
      });
    } else {
      window.dispatchEvent(new CustomEvent("7h:page:ready"));
    }
  }, []);



  useEffect(() => {
    try {
      localStorage.setItem("7h_cruise_cabin_draft_v1", JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes,
        guestCount: formData.guestCount,
        cabinPreference: formData.cabinPreference,
        dob1: formData.dob1,
        tshirtSize1: formData.tshirtSize1,
        insurance: formData.insurance,
        prepaidGratuities: formData.prepaidGratuities,
        howHeard: formData.howHeard
      }));
    } catch { }
  }, [formData]);

  const [portLayoutMode, setPortLayoutMode] = useState<"grid" | "spotlight" | "carousel" | "list">("grid");
  const [activeSpotlightPort, setActiveSpotlightPort] = useState<number>(0);
  const portCarouselRef = useRef<HTMLDivElement>(null);

  const handleSelectCabin = (selectVal?: string) => {
    if (selectVal) {
      setFormData(f => ({ ...f, cabinPreference: selectVal }));
    }
    const target = document.getElementById("signup") || document.getElementById("book-now");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };



  const [activeItinYear, setActiveItinYear] = useState<2027 | 2028>(2027);
  const [activePriceYear, setActivePriceYear] = useState<2027 | 2028>(2027);
  const [foodTypeTab, setFoodTypeTab] = useState<"included" | "paid">("included");
  const [barTab, setBarTab] = useState<"bars" | "entertainment">("bars");

  const [guests, setGuests] = useState<{
    active: boolean;
    name: string;
    email: string;
    phone: string;
    age: string;
    type: "adult" | "child";
    dob: string;
    crownAnchor: string;
    tshirtSize: string;
  }[]>([
    { active: false, name: "", email: "", phone: "", age: "", type: "adult", dob: "", crownAnchor: "", tshirtSize: "L" }, // Guest 2
    { active: false, name: "", email: "", phone: "", age: "", type: "adult", dob: "", crownAnchor: "", tshirtSize: "L" }, // Guest 3
    { active: false, name: "", email: "", phone: "", age: "", type: "adult", dob: "", crownAnchor: "", tshirtSize: "L" }  // Guest 4
  ]);

  const [signature, setSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState("");

  const [openPanel, setOpenPanel] = useState<number>(-1); // -1 = primary booker open by default
  const [primaryOpen, setPrimaryOpen] = useState(true);



  const toggleGuestActive = (index: number, active: boolean) => {
    setGuests(prev => prev.map((g, i) => i === index ? { ...g, active } : g));
  };

  const updateGuest = (index: number, field: string, value: any) => {
    setGuests(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g));
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [suiteTab, setSuiteTab] = useState<"sea" | "sky" | "star">("sea");
  const [stateroomTab, setStateroomTab] = useState<"suites" | "balcony" | "ocean" | "interior">("suites");
  const [signupCount, setSignupCount] = useState<number>(0);
  const [joinedFans, setJoinedFans] = useState<{ name: string; guest_count: number; anonymous: boolean; created_at: string }[]>([]);
  const [totalGuests, setTotalGuests] = useState<number>(0);



  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/cruise/count');
      if (res.ok) {
        const data = await res.json();
        setSignupCount(data.signupCount);
        setTotalGuests(data.totalGuests);
        setJoinedFans(data.joinedFans);
      }
    } catch { }
  }, []);

  useEffect(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    setSignatureDate(`${mm}/${dd}/${yyyy}`);

    fetchCount();
  }, [fetchCount]);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (isLoggedIn && member) {
      setFormData(prev => ({
        ...prev,
        name: member.name || prev.name,
        email: member.email || prev.email,
        phone: prev.phone || "", // If member has phone, use it, else empty
      }));
    }
  }, [isLoggedIn, member]);

  // Dynamically update payment deposit amounts
  useEffect(() => {
    setFormData(prev => {
      const activeCount = 1 + guests.filter(g => g.active).length;
      const totalDeposit = activeCount * 250;
      if (prev.splitPayment && activeCount > 1) {
        return {
          ...prev,
          cardAmount1: (totalDeposit / 2).toFixed(2),
          cardAmount2: (totalDeposit / 2).toFixed(2),
        };
      }
      return {
        ...prev,
        cardAmount1: totalDeposit.toFixed(2),
        cardAmount2: "250.00",
      };
    });
  }, [guests]);

  const [formError, setFormError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website) return; // Honeypot trap
    setFormError('');

    // Client-side email validation
    if (!isValidEmail(formData.email)) {
      setFormError('Please enter a valid email address.');
      setSignupStatus("error");
      return;
    }

    // Client-side phone validation (10+ digits)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setFormError('Please enter a valid phone number (10+ digits).');
      setSignupStatus("error");
      return;
    }

    // Validate guest emails for active additional guests
    const activeGuests = guests.filter(g => g.active);
    for (let i = 0; i < guests.length; i++) {
      const g = guests[i];
      if (g.active) {
        if (!g.name) {
          setFormError(`Please enter a name for Guest ${i + 2}.`);
          setSignupStatus("error");
          return;
        }
        if (g.type === 'adult' && g.email && !isValidEmail(g.email)) {
          setFormError(`Guest ${i + 2} has an invalid email address.`);
          setSignupStatus("error");
          return;
        }
      }
    }

    // CC payment validations (basic mock checks)
    if (!formData.cardName1 || !formData.cardNumber1 || !formData.cardExpiry1 || !formData.cardCvv1 || !formData.cardZip1) {
      setFormError('Please complete Guest 1 credit card payment details.');
      setSignupStatus("error");
      return;
    }

    if (formData.splitPayment && activeGuests.length > 0 && (!formData.cardName2 || !formData.cardNumber2 || !formData.cardExpiry2 || !formData.cardCvv2 || !formData.cardZip2)) {
      setFormError('Please complete Card 2 payment details for split charge.');
      setSignupStatus("error");
      return;
    }

    // Validate Signature
    if (!signature.trim()) {
      setFormError('Please type your name to sign the booking form.');
      setSignupStatus("error");
      return;
    }

    setSignupStatus("submitting");

    // Mask Credit Card for storage safety (PCI compliance simulation)
    const maskCC = (num: string) => {
      const trimmed = num.replace(/\D/g, '');
      if (trimmed.length < 4) return 'XXXX';
      return `XXXX-XXXX-XXXX-${trimmed.slice(-4)}`;
    };

    // Serialize full form info into notes so we don't break existing DB schema
    const bookingMeta = {
      primaryGuest: {
        dob: formData.dob1,
        crownAnchor: formData.crownAnchor1 || "None",
        tshirtSize: formData.tshirtSize1,
      },
      additionalGuests: activeGuests.map((g) => ({
        index: guests.indexOf(g) + 2,
        name: g.name,
        type: g.type,
        dob: g.dob,
        tshirtSize: g.tshirtSize,
        crownAnchor: g.crownAnchor || "None",
      })),
      roomCategory: formData.cabinPreference.toUpperCase(),
      tripCustomization: {
        travelInsurance: formData.insurance.toUpperCase(),
        prepaidGratuities: formData.prepaidGratuities.toUpperCase(),
        howHeard: formData.howHeard,
      },
      payment: {
        card1: {
          name: formData.cardName1,
          number: maskCC(formData.cardNumber1),
          expiry: formData.cardExpiry1,
          billingZip: formData.cardZip1,
          amountCharged: `$${formData.cardAmount1}`,
        },
        splitCard: (formData.splitPayment && activeGuests.length > 0) ? {
          name: formData.cardName2,
          number: maskCC(formData.cardNumber2),
          expiry: formData.cardExpiry2,
          billingZip: formData.cardZip2,
          amountCharged: `$${formData.cardAmount2}`,
        } : null
      },
      signature: {
        name: signature,
        date: signatureDate
      }
    };

    let guestsNotesText = "";
    activeGuests.forEach((g) => {
      const idx = guests.indexOf(g) + 2;
      guestsNotesText += `
--- Guest ${idx} ---
Name: ${g.name}
DOB: ${g.dob}
Crown & Anchor: ${g.crownAnchor || "None"}
`;
    });

    const serializedNotes = `
=== OFFICIAL BOOKING REQUEST DETAILS ===
Cabin Selection: ${bookingMeta.roomCategory}
Travel Insurance: ${bookingMeta.tripCustomization.travelInsurance}
Pre-paid Gratuities: ${bookingMeta.tripCustomization.prepaidGratuities}
Hear About Us: ${bookingMeta.tripCustomization.howHeard}

--- Guest 1 (Primary) ---
Name: ${formData.name}
DOB: ${bookingMeta.primaryGuest.dob}
Crown & Anchor: ${bookingMeta.primaryGuest.crownAnchor}
${guestsNotesText}
--- Payment Method 1 ---
Cardholder: ${bookingMeta.payment.card1.name}
Card (masked): ${bookingMeta.payment.card1.number}
Charge: ${bookingMeta.payment.card1.amountCharged}
${bookingMeta.payment.splitCard ? `
--- Payment Method 2 (Split Charge) ---
Cardholder: ${bookingMeta.payment.splitCard.name}
Card (masked): ${bookingMeta.payment.splitCard.number}
Charge: ${bookingMeta.payment.splitCard.amountCharged}
` : ''}

--- E-Signature ---
Signature: ${signature}
Date Signed: ${signatureDate}
${formData.notes ? `\n--- Additional Notes ---\n${formData.notes}` : ''}
`.trim();

    try {
      const res = await fetch('/api/cruise/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone || null,
          guest_count: 1 + activeGuests.length,
          notes: serializedNotes,
          anonymous: formData.anonymous,
          joinCommunity: formData.joinCommunity,
          cruiseNotifications: formData.cruiseNotifications,
          guests: activeGuests.map(g => ({
            name: g.name,
            email: g.email || null,
            phone: g.phone || null,
            age: g.type === "child" ? (g.age || null) : null,
            type: g.type,
          })),
          paymentDetails: {
            card1: {
              name: formData.cardName1,
              number: formData.cardNumber1,
              expiry: formData.cardExpiry1,
              cvv: formData.cardCvv1,
              billingZip: formData.cardZip1,
              amountCharged: formData.cardAmount1,
            },
            card2: (formData.splitPayment && activeGuests.length > 0) ? {
              name: formData.cardName2,
              number: formData.cardNumber2,
              expiry: formData.cardExpiry2,
              cvv: formData.cardCvv2,
              billingZip: formData.cardZip2,
              amountCharged: formData.cardAmount2,
            } : null
          }
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setFormError('This email has already signed up!');
          setSignupStatus("error");
          return;
        }
        setFormError(data.error || 'Something went wrong. Try again.');
        throw new Error(data.error || 'Signup failed');
      }
      const data = await res.json();
      setSignupStatus("success");
      setSignupCount(prev => prev + 1);
      setTotalGuests(prev => prev + 1 + activeGuests.length);

      // If the API returned pendingVerification, redirect to the PIN entry page
      if (data.pendingVerification && data.email) {
        router.push(`/cruise/verify?email=${encodeURIComponent(data.email)}`);
        return;
      }

      // Reset form
      setFormData({
        name: "", email: "", phone: "", notes: "", anonymous: false,
        joinCommunity: true, cruiseNotifications: true, website: "", guestCount: 1, cabinPreference: "",
        dob1: "", crownAnchor1: "", tshirtSize1: "L",
        cardName1: "", cardNumber1: "", cardExpiry1: "", cardCvv1: "", cardZip1: "", cardAmount1: "250.00",
        cardName2: "", cardNumber2: "", cardExpiry2: "", cardCvv2: "", cardZip2: "", cardAmount2: "250.00",
        splitPayment: false,
        insurance: "no", prepaidGratuities: "yes", howHeard: "7th Heaven"
      });
      setGuests([
        { active: false, name: "", email: "", phone: "", age: "", type: "adult" as const, dob: "", crownAnchor: "", tshirtSize: "L" },
        { active: false, name: "", email: "", phone: "", age: "", type: "adult" as const, dob: "", crownAnchor: "", tshirtSize: "L" },
        { active: false, name: "", email: "", phone: "", age: "", type: "adult" as const, dob: "", crownAnchor: "", tshirtSize: "L" }
      ]);
      setSignature("");
    } catch {
      setSignupStatus("error");
    }
  };


  const GOAL = 200;
  const progress = Math.min((totalGuests / GOAL) * 100, 100);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/40 via-[#05030a] to-black text-white pt-[100px]">

      {/* ── SECTION 1: HERO (BACKGROUND VIDEO — FULL BLEED UNDER NAV HEADER WITH BOTTOM MASK & BLUR STRIP) ── */}
      <section
        id="cruise-hero"
        className="-mt-[100px] pt-[100px] relative flex flex-col justify-start overflow-hidden pb-8 md:pb-16 text-white min-h-[35vh] md:min-h-[36vh] lg:min-h-[620px] transition-all duration-300 ease-out"
        style={{
          marginLeft: "calc(-1 * var(--page-padding-x))",
          marginRight: "calc(-1 * var(--page-padding-x))",
          width: "calc(100% + 2 * var(--page-padding-x))",
        }}
      >
        {/* Cruise Hero Video Background Overlay with Pure Mask Gradient */}
        <div
          className="absolute inset-0 z-0 overflow-hidden bg-transparent"
          style={{
            maskImage: "linear-gradient(black 0%, black 65%, transparent 87%)",
            WebkitMaskImage: "linear-gradient(black 0%, black 65%, transparent 87%)",
          }}
        >
          <video
            ref={heroVideoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/cruise/hero-video-poster.jpg"
            onPlaying={() => setHeroVideoReady(true)}
            {...({ fetchPriority: "high" } as any)}
            className="w-full h-full object-cover transition-[opacity,object-position,filter] duration-500 ease-out"
            style={{
              objectPosition: "center 25%",
              filter: `blur(${heroMaskSettings.videoBlur}px) brightness(${heroMaskSettings.videoBrightness}%) contrast(${heroMaskSettings.videoContrast}%)`,
              WebkitFilter: `blur(${heroMaskSettings.videoBlur}px) brightness(${heroMaskSettings.videoBrightness}%) contrast(${heroMaskSettings.videoContrast}%)`,
              opacity: heroVideoReady ? heroMaskSettings.videoOpacity / 100 : 0,
              transform: "translateY(-80px)",
            }}
          >
            <source src="/movie/cruise-mobile.mp4" type="video/mp4" media="(max-width: 768px)" />
            <source src="/movie/cruise-desktop.mp4" type="video/mp4" media="(min-width: 769px)" />
            <source src="/movie/cruise.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Top Dark Gradient Overlay for Nav Header Legibility */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-[1] transition-all duration-150 hero-top-dark-gradient"
          style={{
            height: `${heroMaskSettings.topGradientHeight ?? 240}px`,
            background: `linear-gradient(to bottom, rgba(6, 6, 12, ${(heroMaskSettings.topGradientOpacity ?? 85) / 100}) 0%, rgba(6, 6, 12, ${((heroMaskSettings.topGradientOpacity ?? 85) * 0.45) / 100}) 55%, transparent 100%)`,
          }}
        />



        {/* Shared across every hero on the site — see src/lib/useHeroParallax.ts */}
        <HeroParallaxCustomizer {...heroParallax} />

        {/* Hero Text */}
        <div
          ref={heroForegroundRef}
          className="relative z-10 text-left site-container mb-4"
        >

          {/* Chicago Music Cruise Official Branding Badges & Social Links */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <SectionBadge label="CHICAGO MUSIC CRUISE · OVER 25 YEARS (1998 – 2028)" />
            <SectionBadge label="ROYAL CARIBBEAN GROUP ID: 3325680" />
            <SectionBadge
              label="ROYAL CARIBBEAN ONLINE PAYMENT PORTAL"
              isActive
              onClick={() => {
                setIsPaymentDropdownOpen(true);
                const el = document.getElementById("payment-portal-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>

          {/* Main Title: Cruise Name */}
          <h1 className="font-bold uppercase tracking-tighter text-white  leading-none" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
            7TH HEAVEN <span className="inline-block pr-[0.15em]">FAN CRUISE</span>
          </h1>

          {/* Cruise Ship Names Subtitle */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-start gap-3 sm:gap-4 md:text-base font-bold uppercase text-white">
            <span className="bg-[#e1e6ff29]  border-white/10  border px-2 py-2 !rounded-full text-white font-bold border  border-white/10  backdrop-blur-[45px] flex items-center gap-2.5">
              Star of the seas <span className="text-purple-200 bg-purple-600/40 px-2.5 py-1 !rounded-full font-bold border border-purple-400/40">2027</span>
            </span>
            <span className="bg-[#e1e6ff29]  border-white/10  border px-2 py-2 !rounded-full text-white font-bold border  border-white/10  backdrop-blur-[45px] flex items-center gap-2.5">
              Legend of the seas <span className="text-purple-200 bg-purple-600/40 px-2.5 py-1 !rounded-full font-bold border border-purple-400/40">2028</span>
            </span>

          </div>
        </div>
      </section>

      {/* ── SECTIONS 2–N: only rendered after wave exits to prevent main-thread block ── */}
      {transitionDone && (
        <>
          <div className="site-container">

            {/* ── SECTION 2: CABINS & PRICING ── */}
            <section id="pricing" className="pt-4 sm:pt-8 pb-16 relative z-20">
              <div className="text-left max-w-3xl mb-6">
                <h2 className="font-bold uppercase tracking-tight text-white leading-none" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                  Staterooms <span className="accent-gradient-text"> & Cruise Rates</span>
                </h2>
                <p className="mt-4 leading-relaxed font-semibold">
                  Browse group rate options, prevailing market rates, suite class inclusions, and booking cancellation terms.
                </p>

                {/* Pricing Year Toggle — Left Aligned */}
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

              {/* Cancellation & Policy Guidelines — 4-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left border-b  border-white/10  py-section-fluid">
                {/* Column 1: Ship & Cruise Resource Links (from ship.html) */}
                <div className="relative text-left rounded-2xl flex flex-col justify-between px-4 sm:px-6 py-2">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Ship className="w-6 h-6 text-purple-400 shrink-0" />
                      <h3 className="font-bold uppercase text-white tracking-wide">Ship Resources</h3>
                    </div>
                    <p className="font-bold text-purple-400 uppercase    mb-4">
                      Official Links &amp; Media
                    </p>
                    <ul className="space-y-2 font-bold uppercase  text-white">
                      <li>
                        <a
                          href="https://en.wikipedia.org/wiki/Star_of_the_Seas"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border  border-white/10   bg-[#00000029] transition-all"
                        >
                          <Globe className="w-4 h-4 text-purple-400 shrink-0" /> <span>WIKI</span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.royalcaribbean.com/cruise-ships/star-of-the-seas"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg  border  border-white/10   bg-[#00000029] transition-all"
                        >
                          <Ship className="w-4 h-4 text-cyan-400 shrink-0" /> <span>ROYAL CARIBBEAN PAGE</span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.chicagomusiccruise.com/assets/staroftheseasdeckplanjan2026.jpg"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border  border-white/10   bg-[#00000029] transition-all"
                        >
                          <Map className="w-4 h-4 text-emerald-400 shrink-0" /> <span>DECK PLAN</span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://youtu.be/SOf67Ysk04U?si=bduc0EEkLhYFD7GH"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg  border  border-white/10   bg-[#00000029] transition-all"
                        >
                          <Video className="w-4 h-4 text-rose-400 shrink-0" /> <span>VIDEO OF THE SHIP</span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.chicagomusiccruise.com/assets/star-of-the-seas_cruisecompass-basic.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg  border  border-white/10   bg-[#00000029] transition-all"
                        >
                          <FileText className="w-4 h-4 text-amber-400 shrink-0" /> <span>PAST CRUISE COMPASS</span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://youtu.be/0LxUHSdFDtY"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border  border-white/10   bg-[#00000029] transition-all"
                        >
                          <Film className="w-4 h-4 text-indigo-400 shrink-0" /> <span>SHIP TOUR VIDEO</span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://youtu.be/6xCQ4xE7L38"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border  border-white/10   bg-[#00000029] transition-all"
                        >
                          <Flame className="w-4 h-4 text-orange-400 shrink-0" /> <span>PROMO VIDEO</span>
                        </a>
                      </li>

                      <li>
                        <a
                          href="https://www.facebook.com/chicagomusiccruise/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600/40 hover:bg-blue-600 !text-white font-bold uppercase  transition-all flex items-center gap-1 border border-blue-400/40"
                          title="Chicago Music Cruise Facebook"
                        >
                          <span className="!text-white">Facebook</span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.instagram.com/chicagomusiccruise"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-pink-600/40 hover:bg-pink-600 !text-white font-bold uppercase  transition-all flex items-center gap-1 border border-pink-400/40"
                          title="Chicago Music Cruise Instagram"
                        >
                          <span className="!text-white">Instagram</span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://x.com/CMCNTDV"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-black !text-white font-bold uppercase  transition-all flex items-center gap-1 border border-white/10"
                          title="Chicago Music Cruise X (Twitter)"
                        >
                          <span className="!text-white">X (Twitter)</span>
                        </a>
                      </li>
                      <li>

                      </li>





                    </ul>
                  </div>
                  <p className="mt-3 ">
                    Legend of the Seas is an exact sister-ship duplicate.
                  </p>
                </div>

                {/* Column 2: Booking Policy & Best Rate Guarantee */}
                <div className="relative text-left rounded-2xl px-4 sm:px-6 py-2">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0" />
                    <h3 className="font-bold uppercase text-white tracking-wide">Booking Policy</h3>
                  </div>
                  <p className="font-bold text-purple-400 uppercase    mb-4">
                    Book through us to participate &amp; lock in best rates
                  </p>
                  <p className="leading-relaxed mb-4">
                    To be part of our events, eat dinner together with the band and fans, and for us to assist you, your reservation <strong className="text-white">must</strong> be placed under our official group booking.
                  </p>
                  <ul className="space-y-2.5 text-white/80 leading-relaxed mb-6">
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
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span><strong>Group Rate:</strong> Gratuities fully included.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <span><strong>Prevailing Rates:</strong> Gratuities NOT included ($129.50 PP; $147 PP Suites).</span>
                    </li>
                  </ul>
                  <div className="pt-3 border-t  border-white/10  space-y-1.5">
                    <p className="">
                      <strong>Email:</strong> <a href="mailto:info@NTDVacations.com" className="text-purple-400 hover:text-white underline font-bold transition-colors">info@NTDVacations.com</a>
                    </p>
                    <p className="">
                      <strong>Call Us:</strong> (877) 683-9753 - opt 5 • (877) NTD-WRLD - opt 5
                    </p>
                    <p className="">
                      <CreditCard className="w-3.5 h-3.5 text-purple-400 inline mr-1" /><strong>Deposit:</strong> $250/person ($500/room).
                    </p>
                    <p className="mt-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-purple-400 inline mr-1" /><strong>Final Payment:</strong> {activePriceYear === 2027 ? "Oct 1, 2026" : "Oct 1, 2027"}.
                    </p>
                  </div>
                </div>

                {/* Column 3: Passport Requirements */}
                <div className="relative text-left rounded-2xl px-4 sm:px-6 py-2">
                  <div className="flex items-center gap-3 mb-4">
                    <Compass className="w-6 h-6 text-purple-400 shrink-0" />
                    <h3 className="font-bold uppercase text-white tracking-wide">Passport Guidelines</h3>
                  </div>
                  <p className="font-bold text-purple-400 uppercase    mb-4">
                    Essential travel document guidelines
                  </p>
                  <div className="space-y-4 text-white/80 leading-relaxed">
                    <p>
                      A physical passport book valid for 6 months post-cruise is <strong className="text-white font-bold underline inline-block">highly recommended</strong> for all travelers.
                    </p>
                    <p>
                      For closed-loop U.S. sailings, a certified state birth certificate accompanied by a government-issued photo ID is legally acceptable, but a passport is always the safest method.
                    </p>
                    <p>
                      Visas may be required depending on nationality. Check <a href="http://travel.state.gov" target="_blank" rel="noopener noreferrer" className="text-purple-400 font-bold underline hover:text-white inline-block">travel.state.gov</a> to ensure compliance.
                    </p>
                  </div>
                </div>

                {/* Column 4: Cancellation Policy */}
                <div className="relative text-left px-4 sm:px-6 py-2">
                  <div className="flex items-center gap-3 mb-4">
                    <CalendarIcon className="w-6 h-6 text-purple-400 shrink-0" />
                    <h3 className="font-bold uppercase text-white tracking-wide">Cancellation Policy</h3>
                  </div>
                  <p className="font-bold text-purple-400 uppercase    mb-4">
                    Refund terms before booking
                  </p>
                  <div className="space-y-4 text-white/80 leading-relaxed">
                    <div>
                      <h4 className="font-bold text-white uppercase  mb-1">Group Rate Rooms:</h4>
                      {activePriceYear === 2027 ? (
                        <ul className="list-disc pl-4 space-y-1 text-white/80">
                          <li>Cancel before May 12, 2026: <strong>No penalty</strong></li>
                          <li>May 12, 2026 – July 12, 2026: <strong>$50 pp fee</strong></li>
                          <li>July 13, 2026 – Sept 10, 2026: <strong>$100 pp fee</strong></li>
                          <li>Sept 11, 2026 – Nov 10, 2026: <strong>$200 pp fee</strong></li>
                          <li>After Nov 10, 2026: <strong>50% cost</strong></li>
                          <li>After Dec 10, 2026: <strong>No refund</strong></li>
                        </ul>
                      ) : (
                        <ul className="list-disc pl-4 space-y-1 text-white/80">
                          <li>Cancel before May 13, 2027: <strong>No penalty</strong></li>
                          <li>May 13, 2027 – July 13, 2027: <strong>$50 pp fee</strong></li>
                          <li>July 14, 2027 – Sept 10, 2027: <strong>$100 pp fee</strong></li>
                          <li>Sept 11, 2027 – Nov 8, 2027: <strong>$200 pp fee</strong></li>
                          <li>After Nov 8, 2027: <strong>50% cost</strong></li>
                          <li>After Dec 9, 2027: <strong>No refund</strong></li>
                        </ul>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase  mb-1">Prevailing Rate:</h4>
                      <p className="">Cancel by {activePriceYear === 2027 ? "Oct 10, 2026" : "Oct 1, 2027"} for no penalty.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* NTD Vacations Official Cruise Support Team Banner */}
              <div className="py-section-fluid text-center">
                <h2 className="   uppercase  text-purple-300 font-bold mb-1">
                  Official Cruise Concierge &amp; Booking Team
                </h2>



                {/* 3 Team Members Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-center">
                  {/* Richard Hofherr */}
                  <div className="flex flex-col items-center">
                    <div
                      className="h-[200px] overflow-hidden mb-3 flex items-end justify-center relative"
                      style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                      }}
                    >
                      <Image width={200} height={200} unoptimized src="/images/contact/Dickie-contact.png" alt="Richard Hofherr" className="h-[200px] w-auto object-contain object-bottom" />
                    </div>
                    <h4 className="font-bold text-white uppercase tracking-tight">
                      Richard Hofherr
                    </h4>
                    <div className="mt-2 flex flex-col items-center gap-1 w-full">
                      <SectionBadge label="CEO / Booking / Bands" isActive />
                      <p className="font-medium text-xs text-white/70 mt-0.5">Marketing / Media</p>
                    </div>
                    <div className="mt-3 flex flex-col items-center gap-1.5 w-full">
                      <a href="tel:8475515363" className="font-bold !text-white hover:text-white/80 transition-colors flex items-center gap-1.5">
                        <span>(847) 551-5363</span>
                      </a>
                      <a href="mailto:info@NTDVacations.com" className="font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5">
                        <span>info@NTDVacations.com</span>
                      </a>
                    </div>
                  </div>

                  {/* Mary Grivas */}
                  <div className="flex flex-col items-center">
                    <div
                      className="h-[200px] overflow-hidden mb-3 flex items-end justify-center relative"
                      style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                      }}
                    >
                      <Image width={200} height={200} unoptimized src="/images/contact/Mary-contact.png" alt="Mary Grivas" className="h-[200px] w-auto object-contain object-bottom" />
                    </div>
                    <h4 className="font-bold text-white uppercase tracking-tight">
                      Mary Grivas
                    </h4>
                    <div className="mt-2 flex flex-col items-center gap-1 w-full">
                      <SectionBadge label="Group Excursions / Group Hotels" isActive />
                      <p className="font-medium text-xs text-white/70 mt-0.5">Group Air / Charters / Shuttles</p>
                    </div>
                    <div className="mt-3 flex flex-col items-center gap-1.5 w-full">
                      <a href="tel:8776839753" className="font-bold !text-white hover:text-white/80 transition-colors flex items-center gap-1.5">
                        <span>(877) 683-9753 - Ext 5</span>
                      </a>
                      <a href="mailto:Mary@NTDVacations.com" className="font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5">
                        <span>Mary@NTDVacations.com</span>
                      </a>
                    </div>
                  </div>

                  {/* Alan McRae */}
                  <div className="flex flex-col items-center">
                    <div
                      className="h-[200px] overflow-hidden mb-3 flex items-end justify-center relative"
                      style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                      }}
                    >
                      <Image width={200} height={200} unoptimized src="/images/contact/Alan-contact.png" alt="Alan McRae" className="h-[200px] w-auto object-contain object-bottom" />
                    </div>
                    <h4 className="font-bold text-white uppercase tracking-tight">
                      Alan McRae
                    </h4>
                    <div className="mt-2 flex flex-col items-center gap-1 w-full">
                      <SectionBadge label="Schedule" isActive />
                      <p className="font-medium text-xs text-white/70 mt-0.5">Activities / Logistics</p>
                    </div>
                    <div className="mt-3 flex flex-col items-center gap-1.5 w-full">
                      <a href="tel:6308429129" className="font-bold !text-white hover:text-white/80 transition-colors flex items-center gap-1.5">
                        <span>(630) 842-9129</span>
                      </a>
                      <a href="mailto:alan@NTDVacations.com" className="font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5">
                        <span>alan@NTDVacations.com</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>



              {/* Pricing Grid */}
              <div className="space-y-16 py-section-fluid">
                {/* GROUP RATES */}
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
                        { code: "Q2", title: "Interior Plus", price: "$1,683.27", status: "soldout", badge: "Group Rate Sold Out - Book Prevailing", image: "/images/cruise/q2_interior_plus.jpg", icon: "", selectValue: "group_n5" },
                        { code: "N5", title: "Ocean View", price: "$1,883.27", status: "warning", badge: "1 Cabin Left!", image: "/images/cruise/n5.jpg", icon: "", inclusions: "Gratuities Included", selectValue: "group_n5" },
                        { code: "IF", title: "Infinite Central Park", price: "$2,033.27", status: "warning", badge: "2 Cabins Left!", image: "/images/cruise/if.jpg", icon: "", inclusions: "Gratuities Included", selectValue: "group_if" },
                        { code: "D4", title: "Ocean View Balcony", price: "$2,433.27", status: "info", badge: "10 Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", icon: "", inclusions: "Gratuities Included", selectValue: "group_d4" },
                        { code: "D2", title: "Ocean View Balcony", price: "$2,483.27", status: "info", badge: "11 Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", icon: "", inclusions: "Gratuities Included", selectValue: "group_d2" },
                        { code: "I1", title: "Infinite Ocean View Balcony", price: "$2,583.27", status: "warning", badge: "5 Cabins Left!", image: "/images/cruise/i1_infinite_ocean_view_balcony.jpg", icon: "", inclusions: "Gratuities Included", selectValue: "group_i1" },
                        { code: "IG", title: "Infinite Grand Suite", price: "Prevailing", status: "soldout", badge: "Sold Out - Prevailing Only", image: "/images/cruise/icon_ig_infinite_grand_suite_320x171.jpg", icon: "", selectValue: "prev_jy" },
                      ]
                      : [
                        { code: "Q2", title: "Interior Plus", price: "$1,832.98", status: "info", badge: "Available", image: "/images/cruise/q2_interior_plus.jpg", icon: "", inclusions: "Gratuities Included", selectValue: "group_n5" },
                        { code: "IF", title: "Infinite Central Park", price: "$2,032.98", status: "info", badge: "Available", image: "/images/cruise/if.jpg", icon: "", inclusions: "Gratuities Included", selectValue: "group_if" },
                        { code: "N5", title: "Ocean View", price: "$2,162.98", status: "info", badge: "Available", image: "/images/cruise/n5.jpg", icon: "", inclusions: "Gratuities Included", selectValue: "group_n5" },
                        { code: "D4", title: "Ocean View Balcony", price: "$2,472.98", status: "info", badge: "Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", icon: "", inclusions: "Gratuities Included", selectValue: "group_d4" },
                        { code: "D2", title: "Ocean View Balcony", price: "$2,492.98", status: "info", badge: "Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", icon: "", inclusions: "Gratuities Included", selectValue: "group_d2" },
                        { code: "I1", title: "Infinite Ocean View Balcony", price: "$2,522.98", status: "info", badge: "Available", image: "/images/cruise/i1_infinite_ocean_view_balcony.jpg", icon: "", inclusions: "Gratuities Included", selectValue: "group_i1" },
                        { code: "JY", title: "Sky Junior Suite", price: "$8,122.98", status: "warning", badge: "1 Available!", image: "/images/cruise/jy.png", icon: "", inclusions: "Gratuities Included", selectValue: "prev_jy" },
                        { code: "IG", title: "Infinite Grand Suite", price: "$7,195.98", status: "warning", badge: "1 Available!", image: "/images/cruise/icon_ig_infinite_grand_suite_320x171.jpg", icon: "", inclusions: "Gratuities Included", selectValue: "prev_jy" },
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
                              {room.icon && <span className="text-xl">{room.icon}</span>}
                              <SectionBadge label={room.badge} />
                            </div>
                            <span className="font-bold uppercase    block mb-0.5">{room.code} Category</span>
                            <h4 className="font-bold text-white uppercase tracking-tight text-left">{room.title}</h4>
                          </div>
                        </div>

                        <div className="px-0 pt-0 pb-5 text-left">
                          {room.price === "Prevailing" ? (
                            <p className="italic font-medium">Prevailing Rates Only</p>
                          ) : (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xl font-bold text-white">{room.price}</span>
                              <span className="text-white/50 uppercase font-semibold">USD pp</span>
                            </div>
                          )}
                          {room.inclusions && (
                            <span className="text-purple-400 font-bold uppercase  block mt-1">✓ {room.inclusions}</span>
                          )}
                          <FoolishShrimpButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCabin(room.selectValue);
                            }}
                            className="mt-3 w-full py-2.5 px-4 font-bold text-xs uppercase tracking-wider"
                          >
                            SELECT & BOOK CABIN
                          </FoolishShrimpButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PREVAILING RATES */}
                {activePriceYear === 2027 && (
                  <div className="bg-transparent p-0 relative text-left">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-2">
                      <div>
                        <span className="font-bold uppercase tracking-[0.25em] text-purple-400">Variable Market Pricing</span>
                        <h3 className="font-bold uppercase text-white mt-1">Prevailing Rate Cabins (2027)</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { code: "ZI", title: "Inside GTY", price: "$1,430.77", label: "Guaranteed Cabin", image: "/images/cruise/q2_interior_plus.jpg", icon: "", selectValue: "prev_zi" },
                        { code: "YO", title: "Ocean View GTY", price: "$1,691.27", label: "Guaranteed Cabin", image: "/images/cruise/n5.jpg", icon: "", selectValue: "prev_yo", isHighlighted: true },
                        { code: "IF", title: "Infinite Central Park", price: "$1,907.27", label: "Central Park View", image: "/images/cruise/if.jpg", icon: "", selectValue: "prev_if" },
                        { code: "XB", title: "Oceanview Balcony GTY", price: "$1,903.77", label: "Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", icon: "", selectValue: "prev_xb" },
                        { code: "I1", title: "Infinite Ocean View Balcony", price: "$2,237.77", label: "Balcony Access", image: "/images/cruise/i1_infinite_ocean_view_balcony.jpg", icon: "", selectValue: "prev_i1" },
                        { code: "JY", title: "Sky Junior Suite", price: "$5,157.77", label: "Suite Class Luxury", image: "/images/cruise/jy.png", icon: "", selectValue: "prev_jy" },
                      ].map((room) => {
                        const isYo = room.code === "YO";
                        return (
                          <div
                            key={room.code || room.selectValue}
                            onClick={() => handleSelectCabin(room.selectValue)}
                            className="w-full text-left overflow-hidden rounded-lg flex flex-col justify-between cursor-pointer group relative shadow-none border-0 bg-transparent"
                          >
                            {isYo && (
                              <div className="absolute top-3 right-3 z-10">
                                <SectionBadge label="Popular" />
                              </div>
                            )}
                            <div>
                              {room.image && (
                                <div className="relative h-44 w-full rounded-lg overflow-hidden text-center">
                                  <Image width={200} height={200} unoptimized src={room.image} alt={room.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="px-0 py-5 text-left">
                                <div className="flex justify-between items-start gap-2 mb-3 text-left">
                                  {room.icon && <span className="text-2xl">{room.icon}</span>}
                                  <SectionBadge label={room.label} />
                                </div>
                                <span className="font-bold  uppercase block text-left">{room.code} Category</span>
                                <h4 className="font-bold text-white uppercase tracking-tight mt-0.5 text-left">{room.title}</h4>
                              </div>
                            </div>

                            <div className="px-0 pt-0 pb-5 text-left">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-bold text-white">{room.price}</span>
                                <span className="text-[var(--font-size-2xs)] text-white font-bold">USD pp</span>
                              </div>
                              <span className="  text-white/50 uppercase    font-bold block mt-1">Rates as of June 27, 2026</span>
                              <FoolishShrimpButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCabin(room.selectValue);
                                }}
                                className="mt-4 w-full py-2.5 px-4 font-bold text-xs uppercase tracking-wider"
                              >
                                Select Prevailing Rate
                              </FoolishShrimpButton>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>



              {/* Stateroom Suite Class Perks */}
              <div className="py-section-fluid">
                <div className="text-left w-full mb-10">
                  <div className="mb-3">
                    <SectionBadge label="Accommodations Guide" />
                  </div>
                  <h3 className="font-bold uppercase tracking-tight text-white leading-none" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                    Stateroom Catalog & Suite Perks
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
                  {/* Stateroom Categories Tab Column — borderless & unpadded */}
                  <div className="lg:col-span-1 flex flex-col justify-between p-0 border-0 bg-transparent shadow-none">
                    <div>
                      <h3 className="font-bold uppercase text-white    mb-4">Stateroom Categories</h3>
                      <div className="flex flex-col gap-2.5">
                        {[
                          { id: "suites", label: "Royal Suites", desc: "Star Class, Sky Class, and Sea Class accommodations." },
                          { id: "balcony", label: "Balconies & Infinite", desc: "Private sliding glass doors opening to ocean breeze." },
                          { id: "ocean", label: "Ocean View", desc: "Large windows overlooking port approaches." },
                          { id: "interior", label: "Interior Rooms", desc: "Efficient, comfortable, and budget-friendly." },
                        ].map(tab => (
                          <button aria-label="Action button"
                            key={tab.id}
                            type="button"
                            onClick={() => setStateroomTab(tab.id as any)}
                            className={`w-full p-4 rounded-lg text-left border  border-white/10  transition-colors cursor-pointer ${stateroomTab === tab.id ? "bg-purple-600/30 text-white"
                              : " bg-[#00000029]"
                              }`}
                          >
                            <h4 className="font-bold text-white uppercase tracking-wider">{tab.label}</h4>
                            <p className="mt-1 leading-relaxed">{tab.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 bg-transparent border-0 p-0">
                      <h4 className="font-bold uppercase text-white    mb-3">Available layouts:</h4>
                      {stateroomTab === "suites" && (
                        <div key="suites" className="space-y-2 text-white/80 font-medium animate-[fade-in_0.35s_ease-out_both]">
                          <p>• Ultimate Family Townhouse</p>
                          <p>• Royal Loft Suite</p>
                          <p>• Owner&apos;s Suite</p>
                          <p>• Grand Suite (1 Bedroom & 2 Bedroom)</p>
                          <p>• Sky Junior Suite</p>
                          <p>• Surfside Family Suite</p>
                        </div>
                      )}
                      {stateroomTab === "balcony" && (
                        <div key="balcony" className="space-y-2 text-white/80 font-medium animate-[fade-in_0.35s_ease-out_both]">
                          <p>• Infinite Ocean View Balcony</p>
                          <p>• Infinite Central Park Balcony</p>
                          <p>• Ocean View Balcony</p>
                          <p>• Central Park View Balcony</p>
                          <p>• Surfside Family View Balcony</p>
                        </div>
                      )}
                      {stateroomTab === "ocean" && (
                        <div key="ocean" className="space-y-2 text-white/80 font-medium animate-[fade-in_0.35s_ease-out_both]">
                          <p>• Panoramic Ocean View</p>
                          <p>• Ocean View</p>
                        </div>
                      )}
                      {stateroomTab === "interior" && (
                        <div key="interior" className="space-y-2 text-white/80 font-medium animate-[fade-in_0.35s_ease-out_both]">
                          <p>• Interior</p>
                          <p>• Spacious Interior</p>
                          <p>• Central Park View Interior</p>
                          <p>• Surfside Family View Interior</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suite Class Benefits Column (Span 2) */}
                  <div className="lg:col-span-2 bg-[var(--color-section-bg)] backdrop-blur-xl border border-[var(--color-section-border)] p-6 md:p-8 rounded-lg flex flex-col justify-between shadow-lg">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                        <div>
                          <span className="font-bold uppercase tracking-[0.25em] text-purple-400">VIP Experiences</span>
                          <h3 className="font-bold uppercase text-white mt-1">Suite Class Perks</h3>
                        </div>
                        <div className="flex gap-2.5 p-1 shrink-0 self-center">
                          {(["sea", "sky", "star"] as const).map(perk => (
                            <FoolishShrimpButton
                              key={perk}
                              type="button"
                              onClick={() => setSuiteTab(perk)}
                              isActive={suiteTab === perk}
                              className="!w-auto px-5 py-2.5 font-bold uppercase text-xs"
                            >
                              {perk} Class
                            </FoolishShrimpButton>
                          ))}
                        </div>
                      </div>

                      {/* Benefits List */}
                      <div key={`benefits-${suiteTab}`} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 md:text-base text-white/90 font-medium leading-relaxed animate-[fade-in_0.35s_ease-out_both]">
                        {suiteTab === "sea" && [
                          "Dedicated check-in line",
                          "Priority boarding",
                          "Dinner at Coastal Kitchen (subject to availability)*",
                          "All-day access to Star | Sky | Sea dining",
                          "Royal Caribbean plush bathrobes for use onboard",
                          "Luxury pillow top mattress and linen",
                          "Luxury bathroom amenities",
                          "Lavazza Espresso coffee machine"
                        ].map((perk) => (
                          <div key={`sea-perk-${perk}`} className="flex items-center gap-2.5">
                            <span className="text-purple-400 font-bold text-base shrink-0">✓</span>
                            <span>{perk}</span>
                          </div>
                        ))}

                        {suiteTab === "sky" && [
                          "Concierge service",
                          "All-day access to Coastal Kitchen*",
                          "All-day access to Star & Sky dining",
                          "Complimentary VOOM Surf + Stream (1 device pp)†",
                          "Specialty bottled water upon arrival",
                          "Flexible arrival boarding & priority departure",
                          "Priority dining reservations",
                          "Reserved seating in select entertainment venues",
                          "Suite Lounge access (complimentary hors d’oeuvres/cocktails)",
                          "Access to Suite Sun Deck (The Grove on Star)",
                          "Royal Caribbean plush bathrobes for use onboard",
                          "Luxury pillow top mattress and linen",
                          "Luxury bathroom amenities",
                          "Lavazza Espresso coffee machine"
                        ].map((perk) => (
                          <div key={`sky-perk-${perk}`} className="flex items-center gap-2.5">
                            <span className="text-purple-400 font-bold text-base shrink-0">✓</span>
                            <span>{perk}</span>
                          </div>
                        ))}

                        {suiteTab === "star" && [
                          "Exclusive access to Royal Genie service§",
                          "All-day access to Coastal Kitchen*",
                          "All-day access to Star & Sky dining",
                          "Complimentary Deluxe Beverage Package (ages 21+)†",
                          "Complimentary Refreshment Package (under legal age)†",
                          "Still and sparkling water replenished daily",
                          "Complimentary Gratuities for stateroom/dining staffΔ",
                          "Complimentary VOOM Surf + Stream powered by Starlink",
                          "Expedited boarding & departure",
                          "Best seats in the house in select entertainment venues",
                          "Priority entrance to many onboard activities††",
                          "Suite Lounge access (complimentary hors d'oeuvres/cocktails)",
                          "Access to Suite Sun Deck, and The Grove",
                          "Complimentary minibar stocked with Coca-Cola & water",
                          "Complimentary laundry and pressing services",
                          "Luxury mattress, pillows, and linens",
                          "Luxury bathroom amenities",
                          "Luxury bathrobes for use onboard",
                          "In-suite coffee machine"
                        ].map((perk) => (
                          <div key={`star-perk-${perk}`} className="flex items-center gap-2.5">
                            <span className="text-[var(--color-accent)] font-bold text-base shrink-0">✓</span>
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Disclaimers & Notes */}
                    <div key={`disclaimers-${suiteTab}`} className="mt-8 border-t  border-white/10  pt-4 text-white space-y-1.5 leading-relaxed font-semibold animate-[fade-in_0.35s_ease-out_both]">
                      {suiteTab === "sea" && (
                        <>
                          <p>* Reservations required for dinner at Coastal Kitchen. Beverages are not included.</p>
                          <p>** Sea Class guests do not have access to stateroom lounges.</p>
                          <p>— Complimentary gratuities are not included for Sea Class guests.</p>
                        </>
                      )}
                      {suiteTab === "sky" && (
                        <>
                          <p>* Reservations required for dinner at Coastal Kitchen. Beverages are not included.</p>
                          <p>† VOOM Surf + Stream package: One device per person is included for guests booked in a Sky Suite (not included in Sky Junior Suite).</p>
                        </>
                      )}
                      {suiteTab === "star" && (
                        <>
                          <p>§ Royal Genie services are for Star Class guests only and cannot be extended to friends/family in other staterooms.</p>
                          <p>* Reservations required for dinner at Coastal Kitchen. Beverages not in Deluxe Package are charged.</p>
                          <p>Δ Gratuities apply to standard housekeeping/dining. genie/concierge tipping is at guest discretion.</p>
                          <p>†† Reduced wait times for select activities during published hours, excluding sea day peaks (1:00 PM – 4:00 PM).</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── OFFICIAL BOOKING FORM ── */}
            <section id="book-now" className="py-section-fluid relative z-20">
              <div id="signup" className="relative z-10">
                <div>
                  {/* Section Header */}
                  <div className="mb-8 text-left">
                    <h2 className="font-bold uppercase tracking-tight mb-1 text-white" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                      Official <span className="accent-gradient-text">Booking Form</span> & Reservation Portal
                    </h2>
                    <p className="font-semibold">
                      Secure your cabin reservation directly under the 7th Heaven group rate. <strong className="text-purple-400">Group ID: 3325680</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 text-left">
                      <form onSubmit={handleSignup} className="space-y-6">
                        <div className="booking-form-card bg-transparent border-0 rounded-lg overflow-hidden shadow-none p-0 text-left">
                          {/* Header Banner representing the PDF top section */}
                          <div className="booking-header-banner border-0 px-0 py-2 text-left bg-transparent">
                            <h3 className="font-bold text-white">7 Night Eastern Caribbean Cruise — Orlando, FL • CocoCay • St. Thomas • St. Maarten</h3>
                            <p className="text-purple-400 mt-1">Star of the Seas — Royal Caribbean (January 10, 2027 – January 17, 2027)</p>
                            <p className="mt-0.5">Group I.D. 3325680 • Official Travel Agency: NTD Vacations (877-683-9753)</p>
                          </div>

                          {/* GUEST 1 (Primary Booker) */}
                          <div className="booking-section-container border-0 bg-transparent p-0">
                            <div className="booking-section-header bg-transparent px-0 py-3 border-0 flex items-center justify-between">
                              <span className="font-bold uppercase text-white">Guest 1 (Primary Booker)</span>
                              <SectionBadge label="Primary" />
                            </div>
                            <div className="booking-grid grid grid-cols-1 md:grid-cols-2 gap-y-2">
                              {/* Name */}
                              <div className="booking-cell border-0 py-3 px-0 col-span-2">
                                <label htmlFor="guest1-full-name" className="booking-label block font-bold text-purple-400 uppercase  mb-1.5">Full Legal Name (as spelled on passport) *</label>
                                <div className="input-glow-border rounded-xl">
                                  <input aria-label="Input field" id="guest1-full-name" type="text" required placeholder="Guest 1 Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                                </div>
                              </div>
                              {/* Phone */}
                              <div className="booking-cell border-0 py-3 px-0 md:pr-3">
                                <label htmlFor="guest1-phone" className="booking-label block font-bold text-purple-400 uppercase  mb-1.5">Phone Number *</label>
                                <div className="input-glow-border rounded-xl">
                                  <input aria-label="Input field" id="guest1-phone" type="tel" required placeholder="(555) 123-4567" value={formData.phone} onChange={e => setFormData({ ...formData, phone: formatPhoneDisplay(e.target.value) })} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                                </div>
                              </div>
                              {/* Email */}
                              <div className="booking-cell border-0 py-3 px-0 md:pl-3 ">
                                <label htmlFor="guest1-email" className="booking-label block font-bold text-white uppercase  mb-1.5">Email Address *</label>
                                <div className="input-glow-border rounded-xl">
                                  <input aria-label="Input field" id="guest1-email" type="email" required placeholder="name@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                                </div>
                              </div>
                              {/* Crown & Anchor */}
                              <div className="booking-cell border-0 py-3 px-0">
                                <label htmlFor="guest1-crown-anchor" className="booking-label block font-bold text-white uppercase  mb-1.5">Crown & Anchor Number (if applicable)</label>
                                <div className="input-glow-border rounded-xl">
                                  <input aria-label="Input field" id="guest1-crown-anchor" type="text" placeholder="Loyalty Number" value={formData.crownAnchor1} onChange={e => setFormData({ ...formData, crownAnchor1: e.target.value })} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                                </div>
                              </div>
                            </div>

                            {/* Customization toggles mirroring the Guest 1 page elements */}
                            <div className="grid grid-cols-1 md:grid-cols-2 border-0 gap-y-4 gap-x-6 mt-4">
                              <div className="flex items-center gap-3 w-full select-none">
                                <SquishyToggle
                                  id="insurance-toggle"
                                  label="Travel protection insurance"
                                  checked={formData.insurance === "yes"}
                                  onChange={(checked) => setFormData((f) => ({ ...f, insurance: checked ? "yes" : "no" }))}
                                />
                                <label htmlFor="insurance-toggle" className="font-bold uppercase  text-white cursor-pointer">
                                  Travel protection insurance ({formData.insurance === "yes" ? "Protected" : "Declined"})
                                </label>
                              </div>

                              <div className="flex items-center gap-3 w-full select-none">
                                <SquishyToggle
                                  id="gratuities-toggle"
                                  label="Pre-paid gratuities"
                                  checked={formData.prepaidGratuities === "yes"}
                                  onChange={(checked) => setFormData((f) => ({ ...f, prepaidGratuities: checked ? "yes" : "no" }))}
                                />
                                <label htmlFor="gratuities-toggle" className="font-bold uppercase  text-white cursor-pointer">
                                  Pre-paid gratuities ({formData.prepaidGratuities === "yes" ? "Included" : "Excluded"})
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* ADDITIONAL GUESTS (Guest 2, Guest 3, Guest 4) */}
                          {Array.from(guests, (g, i) => ({ g, i })).map(({ g, i }) => {
                            const guestNum = i + 2;
                            return (
                              <div key={guestNum} className={`booking-section-container border-0 bg-transparent py-2 transition-colors duration-300 ${g.active ? "opacity-100" : "opacity-80 print:booking-inactive"}`}>
                                {/* Section Header with checkbox activator */}
                                <div className="booking-section-header bg-transparent px-0 py-3 border-0 flex items-center gap-3">
                                  <SquishyToggle
                                    id={`guest-active-${guestNum}`}
                                    label={`Include Guest ${guestNum} in Cabin Reservation`}
                                    checked={g.active}
                                    onChange={(checked) => toggleGuestActive(i, checked)}
                                  />
                                  <label htmlFor={`guest-active-${guestNum}`} className="font-bold uppercase  text-white cursor-pointer select-none">
                                    Include Guest {guestNum} in Cabin Reservation
                                  </label>
                                </div>

                                {g.active ? (
                                  <div className="booking-grid grid grid-cols-1 md:grid-cols-2 gap-y-2">
                                    {/* Name */}
                                    <div className="booking-cell border-0 py-3 px-0 col-span-2">
                                      <label htmlFor={`guest-name-${guestNum}`} className="booking-label block font-bold text-white uppercase  mb-1.5">Full Legal Name (as spelled on passport) *</label>
                                      <div className="input-glow-border rounded-xl">
                                        <input aria-label="Input field" id={`guest-name-${guestNum}`} type="text" required placeholder={`Guest ${guestNum} Full Name`} value={g.name} onChange={e => updateGuest(i, "name", e.target.value)} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                                      </div>
                                    </div>
                                    {/* Phone */}
                                    <div className="booking-cell border-0 py-3 px-0 md:pr-3">
                                      <label htmlFor={`guest-phone-${guestNum}`} className="booking-label block font-bold text-white uppercase  mb-1.5">Phone Number (Optional)</label>
                                      <div className="input-glow-border rounded-xl">
                                        <input aria-label="Input field" id={`guest-phone-${guestNum}`} type="tel" placeholder="(555) 123-4567" value={g.phone} onChange={e => updateGuest(i, "phone", formatPhoneDisplay(e.target.value))} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                                      </div>
                                    </div>
                                    {/* Email */}
                                    <div className="booking-cell border-0 py-3 px-0 md:pl-3">
                                      <label htmlFor={`guest-email-${guestNum}`} className="booking-label block font-bold text-purple-400 uppercase  mb-1.5">Email Address (Optional)</label>
                                      <div className="input-glow-border rounded-xl">
                                        <input aria-label="Input field" id={`guest-email-${guestNum}`} type="email" placeholder="name@example.com" value={g.email} onChange={e => updateGuest(i, "email", e.target.value)} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                                      </div>
                                    </div>
                                    {/* Crown & Anchor */}
                                    <div className="booking-cell border-0 py-3 px-0">
                                      <label htmlFor={`guest-crown-${guestNum}`} className="booking-label block font-bold text-purple-400 uppercase  mb-1.5">Crown & Anchor Number (if applicable)</label>
                                      <div className="input-glow-border rounded-xl">
                                        <input aria-label="Input field" id={`guest-crown-${guestNum}`} type="text" placeholder="Loyalty Number" value={g.crownAnchor} onChange={e => updateGuest(i, "crownAnchor", e.target.value)} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="py-4 text-center text-white/50 font-bold uppercase    no-print select-none">
                                    No Passenger Registered in Slot {guestNum}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* CABIN CATEGORY SELECTION */}
                          <div className="booking-section-container border-0 bg-transparent p-0 mt-4">
                            <div className="booking-section-header bg-transparent px-0 py-2 border-0">
                              <span className="font-bold uppercase  text-white">WHAT CATEGORY ROOM DO YOU WANT TO BOOK?</span>
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
                                  { label: "I1 - Infinite Ocean View Balcony ($2,583.27 pp) - 5 Left", value: "group_i1" },
                                  { label: "ZI - Inside GTY ($1,430.77 pp)", value: "prev_zi" },
                                  { label: "YO - Ocean View GTY ($1,691.27 pp) ★ FEATURED", value: "prev_yo" },
                                  { label: "IF - Infinite Central Park ($1,907.27 pp)", value: "prev_if" },
                                  { label: "XB - Oceanview Balcony GTY ($1,903.77 pp) - 8 Left", value: "prev_xb" },
                                  { label: "I1 - Infinite Ocean View Balcony ($2,237.77 pp)", value: "prev_i1" },
                                  { label: "JY - Sky Junior Suite ($5,157.77 pp)", value: "prev_jy" },
                                ]}
                                onChange={(val) => setFormData((f: any) => ({ ...f, cabinPreference: val }))}
                              />
                            </div>
                          </div>

                          {/* PAYMENT DETAILS */}
                          <div className="booking-section-container border-0 bg-transparent p-0 mt-4">
                            <div className="booking-section-header bg-transparent px-0 py-2 border-0 flex items-center justify-between">
                              <span className="font-bold uppercase  text-white">PAYMENT INFORMATION (DEPOSIT DEALS)</span>
                            </div>
                            <div className="py-2 font-semibold leading-relaxed border-0">
                              A $250.00 per-person deposit (Min $500.00 per cabin) is required to secure your cabin under our group code. Payments are mock-processed for staging.
                            </div>

                            {/* Card 1 */}
                            <CruiseCard1Section formData={formData} setFormData={setFormData} />

                            {/* Card 2 Split Option */}
                            {guests.filter(g => g.active).length > 0 && (
                              <div className="py-4 border-b  border-white/10  no-print flex items-center gap-3">
                                <SquishyToggle
                                  id="split-payment-toggle"
                                  label="Split deposit payment between Card 1 and Card 2"
                                  checked={formData.splitPayment}
                                  onChange={(checked) => setFormData({ ...formData, splitPayment: checked })}
                                />
                                <label htmlFor="split-payment-toggle" className="font-bold uppercase    text-purple-400 cursor-pointer select-none">
                                  Split deposit payment between Card 1 and Card 2
                                </label>
                              </div>
                            )}

                            {/* Card 2 Details */}
                            {formData.splitPayment && guests.filter(g => g.active).length > 0 && (
                              <CruiseCard2Section formData={formData} setFormData={setFormData} />
                            )}
                          </div>

                          {/* NOTES & CONSENT */}
                          <CruiseNotesAndSignatureSection
                            formData={formData}
                            setFormData={setFormData}
                            signature={signature}
                            setSignature={setSignature}
                            signatureDate={signatureDate}
                          />
                        </div>

                        {/* Submit & Print buttons */}
                        <div className="space-y-4 no-print mt-4">
                          <div className="flex items-center gap-3 select-none">
                            <SquishyToggle
                              id="anonymous-toggle"
                              label="Keep my name anonymous on the public roster list"
                              checked={formData.anonymous}
                              onChange={(checked) => setFormData((f: any) => ({ ...f, anonymous: checked }))}
                            />
                            <label htmlFor="anonymous-toggle" className="text-white/80 font-semibold cursor-pointer">
                              Keep my name anonymous on the public roster list
                            </label>
                          </div>

                          <div className="flex items-center gap-3 select-none">
                            <SquishyToggle
                              id="join-community-toggle"
                              label="Join the 7th Heaven Cruise Community"
                              checked={formData.joinCommunity}
                              onChange={(checked) => setFormData((f: any) => ({ ...f, joinCommunity: checked }))}
                            />
                            <label htmlFor="join-community-toggle" className="flex-1 cursor-pointer">
                              <p className="font-bold transition-colors">Join the 7th Heaven Cruise Community</p>
                              <p className="font-semibold !m-0">Get early access to chatroom, update news, deck plans, and pre-cruise passenger chat rooms.</p>
                            </label>
                          </div>

                          <div className="flex items-center gap-3 select-none">
                            <SquishyToggle
                              id="cruise-notifications-toggle"
                              label="Cruise Notifications"
                              checked={formData.cruiseNotifications}
                              onChange={(checked) => setFormData((f: any) => ({ ...f, cruiseNotifications: checked }))}
                            />
                            <label htmlFor="cruise-notifications-toggle" className="flex-1 cursor-pointer">
                              <p className="font-bold transition-colors">Cruise Notifications</p>
                              <p className="font-semibold !m-0">Get push alerts for cruise announcements, itinerary changes, and exclusive passenger updates.</p>
                            </label>
                          </div>

                          {/* Honeypot */}
                          <div className="hidden" aria-hidden="true">
                            <input aria-label="Input field" type="text" name="website" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} tabIndex={-1} autoComplete="off" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <CosmicRadialButton
                              syncId="cruise-booking-form"
                              icon={false}
                              type="submit"
                              disabled={signupStatus === "submitting"}
                              className="w-full !py-4 font-bold uppercase    justify-center    cursor-pointer disabled:opacity-70"
                            >
                              {signupStatus === "submitting" ? <span className="w-5 h-5 border-2  border-white/10  border-t-white rounded-lg animate-spin inline-block" /> : "Submit Cruise Booking"}
                            </CosmicRadialButton>

                            <CosmicRadialButton
                              syncId="cruise-booking-form"
                              icon={false}
                              type="button"
                              onClick={() => window.print()}
                              className="w-full !py-4 font-bold uppercase    justify-center    cursor-pointer"
                            >
                              Print / Save Booking Form
                            </CosmicRadialButton>
                          </div>

                          <p className="font-semibold text-center leading-relaxed">
                            By submitting, you confirm you are 18 years of age or older and agree to our <Link href="/privacy" className="text-white font-bold underline hover:text-white/80 transition-colors">Privacy Policy</Link> and <Link href="/terms" className="text-white font-bold underline hover:text-white/80 transition-colors">Terms of Service</Link>. You'll receive a confirmation email.
                          </p>
                          {signupStatus === "error" && <p className="text-rose-400 font-bold text-center">{formError || 'Something went wrong. Try again.'}</p>}
                        </div>
                      </form>
                    </div>

                    {/* Sidebar Column: NTD Vacations Contacts & Payment Portal */}
                    <div className="lg:col-span-1 text-left space-y-5 w-full">
                      {/* Online Payment Portal Section with Expandable Dropdown */}
                      <div id="payment-portal-section" className="p-0 border-0 bg-transparent text-left relative w-full scroll-mt-28">
                        <div className="mb-2">
                          <SectionBadge
                            label="ROYAL CARIBBEAN ONLINE PAYMENT PORTAL"
                            isActive
                            onClick={() => setIsPaymentDropdownOpen((prev) => !prev)}
                          />
                        </div>
                        <h3 className="font-bold text-white uppercase tracking-wider">Already Booked?</h3>
                        <p className=" mt-1 leading-normal">
                          Submit additional payments, modify balances, or authorize custom charges directly with the Royal Caribbean processor.
                        </p>
                        <FoolishShrimpButton
                          onClick={() => setIsPaymentDropdownOpen((prev) => !prev)}
                          className="mt-4 px-6 py-2.5 font-bold uppercase text-xs cursor-pointer flex items-center gap-2"
                        >
                          {isPaymentDropdownOpen ? "CLOSE PAYMENT PORTAL ▲" : "GO TO PAYMENT PORTAL ▼"}
                        </FoolishShrimpButton>

                        {/* Inline Expandable Dropdown Form */}
                        <PaymentPortalDropdownPanel
                          isOpen={isPaymentDropdownOpen}
                          onClose={() => setIsPaymentDropdownOpen(false)}
                        />
                      </div>

                      {/* Travel coordinators list */}
                      <div className="p-0 border-0 bg-transparent space-y-2 w-full">
                        <h3 className="font-bold uppercase  mb-4  text-white border-b  border-white/10  pb-3">Travel Coordinators</h3>
                        <div className="space-y-2">
                          {[
                            { name: "Richard Hofherr", role: "CEO / Booking & Media", phone: "(877) 683-9753 ext 5", email: "info@NTDVacations.com" },
                            { name: "Mary Grivas", role: "Excursions / Hotels & Air", phone: "(877) 683-9753 ext 5", email: "Mary@NTDVacations.com" },
                            { name: "Alan McRae", role: "Schedules & Logistics", phone: "(877) 683-9753 ext 5", email: "alan@NTDVacations.com" },
                          ].map((coord, idx) => (
                            <div key={coord.name} className="leading-normal pb-2 border-b  border-white/10  last:border-0 last:pb-0">
                              <h4 className="font-bold text-white">{coord.name}</h4>
                              <p className="font-bold uppercase  mt-0.5">{coord.role}</p>
                              <p className="   mt-1 font-bold">{coord.phone}</p>
                              <a href={`mailto:${coord.email}`} className="text-base md:text-lg text-purple-400 font-bold hover:underline block mt-1 tracking-wide">{coord.email}</a>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Voyage Interest Tracker */}
                      <div className="p-0 border-0 bg-transparent space-y-4 w-full">
                        <h3 className="font-bold uppercase   mb-4  text-white border-b  border-white/10  pb-3">Voyage Tracker</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className=" text-left">
                            <p className="font-bold">{signupCount}</p>
                            <p className="font-bold uppercase    mt-1">Cabins</p>
                          </div>
                          <div className="text-left">
                            <p className="font-bold">{totalGuests}</p>
                            <p className="font-bold uppercase    mt-1">Passengers</p>
                          </div>
                        </div>
                      </div>

                      {/* Who's Booked */}
                      {joinedFans.length > 0 && (
                        <div className="p-0 border-0 bg-transparent space-y-4 w-full">
                          <h3 className="font-bold uppercase    text-white border-b  border-white/10  pb-3">Who&apos;s Booked</h3>
                          <div className="flex items-center mb-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {joinedFans.slice(0, 8).map((fan, i) => (
                                <div
                                  key={i}
                                  className="w-8 h-8 border  border-white/10  rounded-full bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 flex items-center justify-center font-bold text-white shrink-0     transition-transform hover:scale-110"

                                  title={fan.anonymous ? 'Anonymous Fan' : fan.name}
                                >
                                  {fan.anonymous ? '?' : fan.name.charAt(0).toUpperCase()}
                                </div>
                              ))}
                              {joinedFans.length > 8 && (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white/80 bg-white/10 shrink-0 border border-white/10">
                                  +{joinedFans.length - 8}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                            {joinedFans.map((fan, i) => (
                              <span key={i} className="text-[var(--font-size-2xs)] text-white/80 font-semibold">
                                {fan.anonymous ? 'Anonymous' : fan.name.split(' ')[0]}
                                {fan.guest_count > 1 && <span className="text-purple-400 font-bold"> +{fan.guest_count - 1}</span>}
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



            {/* ── FEATURED HEADLINE ARTISTS ── */}
            <section id="artists" className="py-section-fluid">
              <div className="text-left w-full mb-10">
                <span className="font-bold uppercase tracking-[0.25em] text-purple-400">Headline Musical Acts</span>
                <h2 className="font-bold uppercase tracking-tight text-white leading-none mt-2" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                  Featured <span className="accent-gradient-text">Artists</span>
                </h2>
                <p className="mt-3 leading-relaxed font-semibold max-w-2xl">
                  Meet the headlining bands performing live concert sets, acoustic pool jams, and theater shows throughout the voyage.
                </p>
              </div>

              {/* Bands/Artists Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {BANDS_DATA.map((band, idx) => (
                  <div key={band.name} className="relative overflow-hidden group aspect-[4/5] flex items-center justify-center rounded-2xl">
                    {band.photo ? (
                      <div className="w-full h-full relative flex items-end justify-center [mask-image:linear-gradient(to_bottom,black_60%,transparent_80%)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_80%)]">
                        <picture className="w-full h-full block">
                          {band.mobilePhoto && (
                            <source media="(max-width: 768px)" srcSet={band.mobilePhoto} />
                          )}
                          <source media="(min-width: 769px)" srcSet={band.desktopPhoto || band.photo} />
                          {/* eslint-disable-next-line react-doctor/nextjs-no-img-element, @next/next/no-img-element */}
                          <img
                            src={band.photo}
                            alt={band.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
                          />
                        </picture>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-black flex items-center justify-center text-5xl">
                        {band.logo}
                      </div>
                    )}

                    {/* Bottom Gradient Mask Overlay */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end text-left pointer-events-none z-10">
                      <h3 className="font-bold text-white tracking-tight leading-none">
                        {band.name}
                      </h3>
                      {band.role && (
                        <p className="font-bold tracking-wide mt-1.5 text-white/80">
                          {band.role}
                        </p>
                      )}
                      <p className="mt-2 line-clamp-2 leading-relaxed font-medium text-white/70">
                        {band.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── SECTION: ITINERARY TIMELINE (FULL BLEED OCEAN BLUE BACKGROUND WITH SMOOTH TOP MASK) ── */}
          <ViewportSection id="itinerary" minHeight="900px" className="w-full max-w-none px-0 overflow-x-clip relative">
            <div
              className="py-section-fluid"
              style={{
                position: "relative",
                left: "50%",
                right: "50%",
                marginLeft: "-50vw",
                marginRight: "-50vw",
                width: "100vw",
                maxWidth: "100vw",
                backgroundColor: "transparent",
                backgroundImage: "linear-gradient(180deg, transparent 0%, #060b18 90px, #0a142c 50%, #060b18 calc(100% - 160px), transparent 100%)",
                maskImage: "linear-gradient(to bottom, transparent 0px, black 70px, black calc(100% - 140px), transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 70px, black calc(100% - 140px), transparent 100%)",
              }}
            >
              {/* Top mask blend overlay for smooth edge feathering */}
              <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[#05030a] via-[#05030a]/70 to-transparent pointer-events-none z-10" />

              {/* Inner div with site container padding */}
              <div className="w-full mx-auto px-[var(--page-padding-x)] relative z-20">
                <div className="text-center max-w-3xl mx-auto mb-12 px-4">
                  <h2 className="font-bold uppercase tracking-tight text-white leading-none" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                    Day-by-Day <span className="accent-gradient-text">Schedules</span>
                  </h2>
                  <p className="mt-4 leading-relaxed font-semibold">
                    Explore daily port calls, cruising coordinates, sail-away party times, and exclusive fan concerts.
                  </p>

                  {/* Itinerary Year Toggle */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-8">
                    <FoolishShrimpButton
                      type="button"
                      onClick={() => setActiveItinYear(2027)}
                      isActive={activeItinYear === 2027}
                      className="!w-auto px-6 py-2.5"
                    >
                      2027 Star of the Seas (7-Night)
                    </FoolishShrimpButton>
                    <FoolishShrimpButton
                      type="button"
                      onClick={() => setActiveItinYear(2028)}
                      isActive={activeItinYear === 2028}
                      className="!w-auto px-6 py-2.5"
                    >
                      2028 Legend of the Seas (8-Night)
                    </FoolishShrimpButton>
                  </div>
                </div>

                {/* 3D Snake Itinerary Timeline Component */}
                <div className="w-full">
                  <React.Suspense fallback={null}>
                    <CruiseSnakeItinerary key={`itin-${activeItinYear}`} itinerary={activeItinYear === 2027 ? itin2027Mapped : itin2028Mapped} />
                  </React.Suspense>
                </div>
              </div>
            </div>
          </ViewportSection>

          <div className="site-container py-section-fluid">
            {/* ── SECTION 2: PORTS OF CALL ── */}
            <ViewportSection id="ports" minHeight="700px">
              {/* Ports of Call Section */}
              <div>
                <div className="text-center md:text-left mb-10">
                  <span className="font-bold uppercase tracking-[0.25em] text-purple-400">Destination Explorer</span>
                  <h3 className="font-bold uppercase italic text-white tracking-tight mt-0.5" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                    Ports of Call Catalog
                  </h3>
                </div>

                {/* LAYOUT 1: GRID VIEW */}
                {portLayoutMode === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left animate-fadeIn">
                    {PORTS_DATA.map((port, idx) => (
                      <div key={`grid-${port.name}`} className="flex flex-col justify-between group rounded-2xl overflow-hidden">
                        <div className="h-48 w-full relative overflow-hidden rounded-lg bg-black">
                          {port.image && <Image width={400} height={300} unoptimized src={port.image} alt={port.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                          <div className="absolute top-3 left-3 z-20">
                            <SectionBadge label={`Port Call #${idx + 1}`} />
                          </div>
                        </div>
                        <div className="pt-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold uppercase tracking-tight text-white mb-2 group-hover:text-purple-300 transition-colors">{port.name}</h4>
                            <p className="leading-relaxed font-semibold">{port.desc}</p>

                            {/* Port Highlights */}
                            {port.highlights && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {port.highlights.map(h => (
                                  <span key={h} className="font-bold   px-2 py-0.5 rounded-lg text-white border  border-white/10  bg-[#00000029]">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Gallery Thumbnail Strip */}
                          {port.gallery && port.gallery.length > 1 && (
                            <div className="flex gap-1.5 mt-4 overflow-x-auto scrollbar-none">
                              {
                                port.gallery.map((gImg, gIdx) => (
                                  <div key={gIdx} className="w-12 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                    <Image width={48} height={40} unoptimized src={gImg} alt={`${port.name} thumb ${gIdx}`} className="w-full h-full object-cover" />
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* LAYOUT 2: SPOTLIGHT HERO VIEW */}
                {portLayoutMode === "spotlight" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-fadeIn">
                    {/* Main Featured Hero Card */}
                    <div className="lg:col-span-2 bg-[#00000029]  border-white/10  backdrop-blur-[16px] rounded-lg overflow-hidden relative shadow-2xl">
                      <div className="h-72 md:h-96 w-full relative overflow-hidden bg-black">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-black/30 to-transparent z-10" />
                        {PORTS_DATA[activeSpotlightPort].image && (
                          <Image width={800} height={500} unoptimized src={PORTS_DATA[activeSpotlightPort].image} alt={PORTS_DATA[activeSpotlightPort].name} className="w-full h-full object-cover scale-105" />
                        )}
                        <div className="absolute top-6 left-6 z-20">
                          <SectionBadge label="⭐ Featured Destination Spotlight" isActive />
                        </div>
                      </div>
                      <div className="p-8 relative z-20 -mt-16">
                        <h3 className="font-bold uppercase text-white tracking-tight mb-3" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                          {PORTS_DATA[activeSpotlightPort].name}
                        </h3>
                        <p className="leading-relaxed mb-4">
                          {PORTS_DATA[activeSpotlightPort].desc}
                        </p>

                        {/* Highlights */}
                        {PORTS_DATA[activeSpotlightPort].highlights && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {PORTS_DATA[activeSpotlightPort].highlights.map(h => (
                              <span key={h} className="font-bold uppercase  text-purple-300 bg-purple-900/60 px-3 py-1 rounded-lg border border-purple-500/40">
                                ✓ {h}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Gallery Thumbnails */}
                        {PORTS_DATA[activeSpotlightPort].gallery && (
                          <div className="mb-6 pt-4 border-t border-white/10">
                            <span className="text-[10px]    uppercase    text-purple-300 font-bold block mb-2">Destination Photo Gallery</span>
                            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
                              {PORTS_DATA[activeSpotlightPort].gallery.map((gImg, gIdx) => (
                                <div key={gIdx} className="w-24 h-16 rounded-lg overflow-hidden shrink-0 border  border-white/10    ">
                                  <Image width={96} height={64} unoptimized src={gImg} alt="Gallery Still" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 items-center">
                          <button aria-label="Action button"
                            type="button"
                            onClick={() => document.getElementById("book-now")?.scrollIntoView({ behavior: "smooth" })}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase    transition-colors cursor-pointer border-none rounded-lg shadow-lg"
                          >
                            Book Cruise &amp; Visit {PORTS_DATA[activeSpotlightPort].name.split(',')[0]}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar Selectors */}
                    <div className="space-y-3">
                      <span className="text-[var(--font-size-2xs)] font-bold text-white/40 uppercase    block mb-2">Select Destination to Preview:</span>
                      {PORTS_DATA.map((port, idx) => (
                        <button aria-label="Action button"
                          key={`spotlight-${port.name}`}
                          type="button"
                          onClick={() => setActiveSpotlightPort(idx)}
                          className={`w-full p-4 text-left transition-colors cursor-pointer flex items-center gap-4 rounded-2xl border ${activeSpotlightPort === idx ? "  bg-[#00000029]     border-white/10   backdrop-blur-[16px]"
                            : "  bg-[#00000029]     border-white/10   backdrop-blur-[16px]"
                            }`}
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-black border border-white/10">
                            {port.image && <Image width={200} height={200} unoptimized src={port.image} alt={port.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold uppercase truncate ${activeSpotlightPort === idx ? "text-purple-300" : "text-white"}`}>
                              {port.name}
                            </h4>
                            <span className="text-white/35   ">Port #{idx + 1}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* LAYOUT 3: CAROUSEL SLIDER VIEW */}
                {portLayoutMode === "carousel" && (
                  <div className="relative animate-fadeIn text-left">
                    {/* Scroll buttons */}
                    <div className="flex justify-end gap-2 mb-4">
                      <button aria-label="Action button"
                        type="button"
                        onClick={() => {
                          if (portCarouselRef.current) portCarouselRef.current.scrollBy({ left: -360, behavior: "smooth" });
                        }}
                        className="w-10 h-10 rounded-lg bg-[#00000029]  border-white/10  backdrop-blur-[16px] text-white flex items-center justify-center cursor-pointer transition-colors"
                      >
                        ◀
                      </button>
                      <button aria-label="Action button"
                        type="button"
                        onClick={() => {
                          if (portCarouselRef.current) portCarouselRef.current.scrollBy({ left: 360, behavior: "smooth" });
                        }}
                        className="w-10 h-10 rounded-lg bg-[#00000029] border  border-white/10  backdrop-blur-[16px] text-white flex items-center justify-center cursor-pointer transition-colors"
                      >
                        ▶
                      </button>
                    </div>

                    <div
                      ref={portCarouselRef}
                      className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4"
                      style={{ scrollbarWidth: "none" }}
                    >
                      {PORTS_DATA.map((port, idx) => (
                        <div
                          key={`carousel-${port.name}`}
                          className="w-[320px] md:w-[380px] shrink-0 snap-start bg-[#00000029]  border-white/10  backdrop-blur-[16px] rounded-lg overflow-hidden flex flex-col justify-between transition-colors duration-300 group hover:-translate-y-1"
                        >
                          <div className="h-52 w-full relative overflow-hidden bg-black/60">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b12] via-transparent to-black/30 z-10" />
                            {port.image && <Image width={400} height={300} unoptimized src={port.image} alt={port.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                            <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/70 backdrop-blur-[45px] border  border-white/10  rounded-lg   font-bold uppercase    text-purple-300">
                              {idx + 1} / {PORTS_DATA.length}
                            </span>
                          </div>
                          <div className="p-6 relative z-20 -mt-8">
                            <h4 className="font-bold text-white uppercase tracking-tight mb-2 group-hover:text-purple-300 transition-colors">{port.name}</h4>
                            <p className="leading-relaxed">{port.desc}</p>

                            {/* Highlights */}
                            {port.highlights && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {port.highlights.map(h => (
                                  <span key={h} className="text-[10px] font-bold uppercase  text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-lg border border-purple-500/30">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LAYOUT 4: COMPACT LIST VIEW */}
                {portLayoutMode === "list" && (
                  <div className="space-y-4 animate-fadeIn text-left max-w-5xl mx-auto">
                    {PORTS_DATA.map((port, idx) => (
                      <div key={`list-${port.name}`} className="bg-[#00000029]  border-white/10  backdrop-blur-[16px] rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-6 transition-colors duration-300 hover:bg-white/[0.08]">
                        <div className="w-full md:w-48 h-32 md:h-28 overflow-hidden rounded-lg relative shrink-0">
                          {port.image && <Image width={200} height={200} unoptimized src={port.image} alt={port.name} className="w-full h-full object-cover   transition-transform" />}
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 rounded   font-bold text-purple-300 uppercase border border-white/10">
                            Port #{idx + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold uppercase text-white tracking-tight">{port.name}</h4>
                          </div>
                          <p className="leading-relaxed">{port.desc}</p>

                          {/* Highlights */}
                          {port.highlights && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {port.highlights.map(h => (
                                <span key={h} className="text-[10px] font-bold uppercase  text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-lg border border-purple-500/30">
                                  {h}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button aria-label="Action button"
                          type="button"
                          onClick={() => document.getElementById("book-now")?.scrollIntoView({ behavior: "smooth" })}
                          className="shrink-0 px-4 py-2 bg-[#00000029]  border-white/10  backdrop-blur-[16px] text-white font-bold uppercase    transition-colors cursor-pointer rounded-xl"
                        >
                          Book →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ViewportSection>



            {/* ── SECTION 4: SHIP EXPLORER ── */}
            <ViewportSection id="ship-explorer" minHeight="800px" className="py-[32px] md:py-20">
              <div className="text-left w-full mb-10">
                <h2 className="font-bold uppercase tracking-tight text-white leading-none" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                  Ship Specifications <span className="accent-gradient-text">& Inclusions</span>
                </h2>
                <p className="mt-3 leading-relaxed font-semibold max-w-2xl">
                  Explore structural specs, dining options (included vs fee-based), entertainment venues, and bars on our state-of-the-art vessel.
                </p>
              </div>

              {/* Specs & Dimensions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 text-left">
                {[
                  { label: "Gross Tonnage", value: "248,663 GT" },
                  { label: "Total Length", value: "1,196.9 Feet" },
                  { label: "Total Width", value: "159.1 Feet" },
                  { label: "Decks Tall", value: "20 Decks" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-transparent border-0 p-0 text-left">
                    <span className="text-white font-bold uppercase  block">{stat.label}</span>
                    <span className="text-lg md:text-xl font-bold text-white mt-1 block">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* ── STAR OF THE SEAS OFFICIAL SHIP PHOTO GALLERY ── */}
              <div className="mb-16">
                <div className="mb-6 text-left">
                  <h3 className="font-bold uppercase text-white tracking-tight" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                    Star of the Seas <span className="accent-gradient-text">Official Photo Gallery</span>
                  </h3>
                  <p className="font-semibold mt-1">
                    Authentic ship photography directly from Royal Caribbean's newest Icon-Class flagship launching August 2025.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { title: "Star of the Seas Sunset Aerial", img: "/images/cruise/ship/star-aerial-sunset.jpg", category: "Icon Class Ship" },
                    { title: "Twilight Evening Aerial View", img: "/images/cruise/ship/star-aerial-evening.jpg", category: "Exterior Architecture" },
                    { title: "The AquaDome Theater", img: "/images/cruise/ship/aquadome.jpg", category: "Mainstage Venue" },
                    { title: "Central Park Neighborhood", img: "/images/cruise/ship/central-park.jpg", category: "Open-Air Garden" },
                    { title: "The Hideaway Adults Pool", img: "/images/cruise/ship/hideaway-pool.jpg", category: "Infinity Edge Pool" },
                    { title: "Category 6 Waterpark", img: "/images/cruise/ship/cat6-waterpark.jpg", category: "Thrill Waterpark" },
                    { title: "Chops Grille Steakhouse", img: "/images/cruise/ship/chopsgrille.jpg", category: "Specialty Dining" },
                    { title: "Izumi Teppanyaki & Hibachi", img: "/images/cruise/ship/izumi-hibachi.jpg", category: "Asian Specialty" },
                    { title: "Lime & Coconut Pool Bar", img: "/images/cruise/ship/lime-and-coconut.jpg", category: "Tropical Lounge" },
                    { title: "Schooner Piano Lounge", img: "/images/cruise/ship/schooner-bar.jpg", category: "Cocktail Bar" },
                    { title: "Dueling Pianos Music Hall", img: "/images/cruise/ship/duelingpianos.jpg", category: "Live Nightlife" },
                    { title: "Ultimate Family Townhouse", img: "/images/cruise/ship/family-townhouse.jpg", category: "Suite Luxury" },
                  ].map((item) => (
                    <div key={item.title} className="relative rounded-2xl overflow-hidden group h-52 sm:h-60 rounded-lg">
                      <Image
                        width={400}
                        height={300}
                        unoptimized
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                        <SectionBadge label={item.category} className="self-start mb-1.5" />
                        <p className="font-bold leading-snug">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dining Tab Section */}
              <div className="bg-transparent p-0 text-left mb-16">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="font-bold uppercase text-white">Dining Explorer Guide</h3>
                    <p className="font-semibold mt-1">Discover included food spots and premium specialty restaurants.</p>
                  </div>
                  {/* Dining Filter Tabs */}
                  <div className="flex items-center gap-2">
                    <FoolishShrimpButton
                      onClick={() => setFoodTypeTab("included")}
                      isActive={foodTypeTab === "included"}
                      className="px-4 py-2 font-bold uppercase text-xs cursor-pointer"
                    >
                      Included (Free)
                    </FoolishShrimpButton>
                    <FoolishShrimpButton
                      onClick={() => setFoodTypeTab("paid")}
                      isActive={foodTypeTab === "paid"}
                      className="px-4 py-2 font-bold uppercase text-xs cursor-pointer"
                    >
                      Specialty (With Fee)
                    </FoolishShrimpButton>
                  </div>
                </div>

                {/* Bento Box Food Grid */}
                <div key={foodTypeTab} className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/80 animate-[fade-in_0.35s_ease-out_both]">
                  {(foodTypeTab === "included"
                    ? [
                      { name: "Windjammer Buffet", img: "/images/cruise/ship/windjammer.jpg", tag: "Buffet" },
                      { name: "Main Dining Room", img: "/images/cruise/ship/star-aerial-sunset.jpg", tag: "Main Dining" },
                      { name: "Park Cafe", img: "/images/cruise/ship/central-park.jpg", tag: "Deli & Bites" },
                      { name: "Pearl Cafe", img: "/images/cruise/ship/central-park.jpg", tag: "24/7 Snacks" },
                      { name: "Sorrento's Pizza", img: "/images/cruise/ship/lime-and-coconut.jpg", tag: "Fresh Pizza" },
                      { name: "Basecamp", img: "/images/cruise/ship/hideaway-pool.jpg", tag: "Casual Eats" },
                      { name: "Surfside Bites", img: "/images/cruise/ship/cat6-waterpark.jpg", tag: "Quick Service" },
                      { name: "Surfside Eatery", img: "/images/cruise/ship/windjammer.jpg", tag: "Family Buffet" },
                      { name: "El Loco Fresh", img: "/images/cruise/ship/lime-and-coconut.jpg", tag: "Mexican" },
                      { name: "Creme De La Crepe", img: "/images/cruise/ship/central-park.jpg", tag: "Creperie" },
                      { name: "Pig Out BBQ", img: "/images/cruise/ship/lime-and-coconut.jpg", tag: "BBQ Grill" },
                      { name: "Toast & Garden", img: "/images/cruise/ship/central-park.jpg", tag: "Breakfast" },
                      { name: "Mai Thai", img: "/images/cruise/ship/hideaway-pool.jpg", tag: "Asian Fusion" },
                      { name: "Feta Mediterranean", img: "/images/cruise/ship/central-park.jpg", tag: "Greek & Med" },
                      { name: "La Cocinita", img: "/images/cruise/ship/lime-and-coconut.jpg", tag: "Street Food" },
                      { name: "Sprinkles Ice Cream", img: "/images/cruise/ship/cat6-waterpark.jpg", tag: "Soft Serve" },
                      { name: "Coastal Kitchen (Suites)", img: "/images/cruise/ship/family-townhouse.jpg", tag: "Suite Dining" },
                      { name: "The Grove (Suites)", img: "/images/cruise/ship/hideaway-pool.jpg", tag: "Suite Buffet" },
                      { name: "Vitality Cafe", img: "/images/cruise/ship/central-park.jpg", tag: "Healthy Eats" },
                      { name: "Room Service (Breakfast)", img: "/images/cruise/ship/windjammer.jpg", tag: "In-Stateroom" },
                    ]
                    : [
                      { name: "Chops Grille", img: "/images/cruise/ship/chopsgrille.jpg", tag: "Steakhouse" },
                      { name: "Izumi Hibachi", img: "/images/cruise/ship/izumi-hibachi.jpg", tag: "Teppanyaki" },
                      { name: "Izumi Sushi", img: "/images/cruise/ship/izumi-hibachi.jpg", tag: "Sushi Bar" },
                      { name: "Izumi in the Park", img: "/images/cruise/ship/izumi-hibachi.jpg", tag: "Walk-Up Asian" },
                      { name: "Hooked Seafood", img: "/images/cruise/ship/windjammer.jpg", tag: "Seafood" },
                      { name: "Giovanni's Italian Kitchen", img: "/images/cruise/ship/central-park.jpg", tag: "Trattoria" },
                      { name: "Playmakers Sports Bar", img: "/images/cruise/ship/duelingpianos.jpg", tag: "Pub & Arcade" },
                      { name: "Lincoln Park Supper Club", img: "/images/cruise/ship/chopsgrille.jpg", tag: "Fine Dining" },
                      { name: "Desserted Milkshake Bar", img: "/images/cruise/ship/cat6-waterpark.jpg", tag: "Over-the-Top Shakes" },
                      { name: "Pier 7", img: "/images/cruise/ship/lime-and-coconut.jpg", tag: "Beach Club" },
                      { name: "Celebration Table", img: "/images/cruise/ship/chopsgrille.jpg", tag: "VIP Dining" },
                      { name: "Starbucks Coffee", img: "/images/cruise/ship/central-park.jpg", tag: "Espresso Bar" },
                      { name: "Sugar Beach", img: "/images/cruise/ship/cat6-waterpark.jpg", tag: "Candy & Treats" },
                      { name: "Room Service (Lunch/Dinner)", img: "/images/cruise/ship/chopsgrille.jpg", tag: "24/7 In-Room" },
                      { name: "Trellis Bar Dining", img: "/images/cruise/ship/central-park.jpg", tag: "Outdoor Dining" },
                    ]
                  ).map((food, idx) => {
                    return (
                      <div key={food.name} className="relative rounded-lg overflow-hidden group border border-black/10 h-48 md:h-56">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <Image width={200} height={200} unoptimized src={food.img} alt={food.name} className="w-full h-full object-cover" />
                        <div className="absolute rounded-lg inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                          <SectionBadge label={food.tag} className="self-start mb-1.5" />
                          <p className="font-bold leading-snug">{food.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>




              {/* ── BARS & ENTERTAINMENT SEGMENTED TABS SECTION (Option 2) ── */}
              <div className="py-20">
                {/* Segmented Tab Header — Stacks vertically on mobile & tablet for full text width */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 pb-4 border-b  border-white/10  text-left">
                  <div className="w-full lg:w-auto">
                    <h3 className="font-bold uppercase text-white">Bars & Entertainment Explorer</h3>
                    <p className="font-semibold mt-1">Explore 20 onboard lounges, nightlife venues, and world-class attractions.</p>
                  </div>
                  <div className="flex  p-1 shrink-0 self-start lg:self-center max-w-full overflow-x-auto  gap-2">
                    <FoolishShrimpButton
                      onClick={() => setBarTab("bars")}
                      isActive={barTab === "bars"}
                      className="px-4 py-2 font-bold uppercase text-xs cursor-pointer flex items-center gap-2"
                    >
                      <span>Bars & Clubs</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${barTab === "bars" ? "bg-white/20 text-white" : "bg-white/10 text-purple-300"}`}>20</span>
                    </FoolishShrimpButton>
                    <FoolishShrimpButton
                      onClick={() => setBarTab("entertainment")}
                      isActive={barTab === "entertainment"}
                      className="px-4 py-2 font-bold uppercase text-xs cursor-pointer flex items-center gap-2"
                    >
                      <span>Entertainment</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${barTab === "entertainment" ? "bg-white/20 text-white" : "bg-white/10 text-purple-300"}`}>20</span>
                    </FoolishShrimpButton>
                  </div>
                </div>

                {/* Full-Width 4-Column Uniform Grid */}
                <div key={barTab} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-white/80 animate-[fade-in_0.35s_ease-out_both]">
                  {(barTab === "bars"
                    ? [
                      { name: "Lime & Coconut Bar", img: "/images/cruise/ship/limecoconut.jpg", tag: "Poolside" },
                      { name: "Rye & Beam", img: "/images/cruise/ship/ryebeam.jpg", tag: "Bourbon" },
                      { name: "Lemon Post Bar", img: "/images/cruise/ship/lemonpost.jpg", tag: "Outdoor" },
                      { name: "Swim & Tonic Pool Bar", img: "/images/cruise/ship/swimtonic.jpg", tag: "Swim-Up" },
                      { name: "The Hideaway Lounge", img: "/images/cruise/ship/thehideaway.jpg", tag: "Adults Only" },
                      { name: "Vue Bar", img: "/images/cruise/ship/vuebar.jpg", tag: "Ocean View" },
                      { name: "Overlook Bar & Pods", img: "/images/cruise/ship/overlookbar.jpg", tag: "AquaDome" },
                      { name: "Basecamp Bar", img: "/images/cruise/ship/basecampbar.jpg", tag: "Thrill Zone" },
                      { name: "Trellis Bar", img: "/images/cruise/ship/trellisbar.jpg", tag: "Central Park" },
                      { name: "Boleros Latin Bar", img: "/images/cruise/ship/bolerosbar.jpg", tag: "Latin Dance" },
                      { name: "Cantina Fresca", img: "/images/cruise/ship/cantinafrescabar.jpg", tag: "Mexican" },
                      { name: "Bubbles Champagne Bar", img: "/images/cruise/ship/bubblesbar.jpg", tag: "Champagne" },
                      { name: "Point & Feather Pub", img: "/images/cruise/ship/pointfeather.jpg", tag: "English Pub" },
                      { name: "Schooner Bar", img: "/images/cruise/ship/schoonerbar.jpg", tag: "Piano Lounge" },
                      { name: "1400 Lobby Bar", img: "/images/cruise/ship/1400bar.jpg", tag: "Atrium" },
                      { name: "Dueling Pianos Lounge", img: "/images/cruise/ship/duelingpianosbar.jpg", tag: "Live Music" },
                      { name: "Lou's Jazz & Blues", img: "/images/cruise/ship/lousbar.jpg", tag: "Jazz Club" },
                      { name: "Music Hall Lounge", img: "/images/cruise/ship/musichallbar.jpg", tag: "Rock Venue" },
                      { name: "Playmakers Lounge", img: "/images/cruise/ship/playmakersbar.jpg", tag: "Sports & Arcade" },
                      { name: "Casino Royale Bar", img: "/images/cruise/ship/casinoroyalbar.jpg", tag: "Casino Lounge" },
                    ]
                    : [
                      { name: "Back to the Future Musical", img: "/images/cruise/ship/backtothefurure.jpg", tag: "Broadway Show" },
                      { name: "Flowrider Surf Simulator", img: "/images/cruise/ship/rci_ic_202401_cc_nmorley_flowrider_2361_rt-crop-u35615.jpg", tag: "Surf Simulator" },
                      { name: "Absolute Zero Ice Rink", img: "/images/cruise/ship/superclub.jpg", tag: "Ice Arena" },
                      { name: "Torque Racing Arena", img: "/images/cruise/ship/torgue.jpg", tag: "E-Karting" },
                      { name: "SOL Pool Zone", img: "/images/cruise/ship/sol.jpg", tag: "Top Deck Pool" },
                      { name: "Create! Art Studio", img: "/images/cruise/ship/create.jpg", tag: "Craft Studio" },
                      { name: "The Price is Right Game", img: "/images/cruise/ship/thepriceisright.jpg", tag: "Game Show" },
                      { name: "The Quest Adult Game", img: "/images/cruise/ship/quest.jpg", tag: "Adult Show" },
                      { name: "Comedy Live Theater", img: "/images/cruise/ship/comedy.jpg", tag: "Standup Comedy" },
                      { name: "Headliner Concert Stage", img: "/images/cruise/ship/headliner.jpg", tag: "Live Concerts" },
                      { name: "Spotlight Karaoke Box", img: "/images/cruise/ship/karoke.jpg", tag: "Karaoke" },
                      { name: "Music Hall Nightclub", img: "/images/cruise/ship/lous.jpg", tag: "Nightclub" },
                      { name: "Ultimate Family Townhouse", img: "/images/cruise/ship/rci_ic_202401_cc_ahendel_ultimatefamilytownhouse_e43a2011_rt-crop-u36238.jpg", tag: "3-Story Suite" },
                      { name: "Splashaway Bay & Cat 6", img: "/images/cruise/ship/rci_ic_202401_cc_nmorley_cat6waterpark_hurricanehunter_gopr0154_rt-crop-u35622.jpg", tag: "Water Park" },
                      { name: "Adrenaline Peak Climb", img: "/images/cruise/ship/rci_ic_202401_cc_nmorley_adrenalinepeak_6050_rt-crop-u35524.jpg", tag: "Rock Climbing" },
                      { name: "Adventure Ocean Kids Club", img: "/images/cruise/ship/rci_ic_202401_cc_nmorley_adventureocean_1407_rt-crop-u36294.jpg", tag: "Youth Program" },
                      { name: "Central Park Gardens", img: "/images/cruise/ship/central%20park2-crop-u36273.jpg", tag: "Nature Park" },
                      { name: "Lost Dunes Mini Golf", img: "/images/cruise/ship/rci_ic_202401_cc_nmorley_lostdunes_6868_rt-crop-u35608.jpg", tag: "Mini Golf" },
                      { name: "Surfside Carousel", img: "/images/cruise/ship/rci_ic_202401_cc_nmorley_surfsidecarousel_1851_rt-crop-u37671.jpg", tag: "Carousel" },
                      { name: "Royal AquaDome Theater", img: "/images/cruise/ship/aquadome.jpg", tag: "Main Theater" },
                    ]
                  ).map((item) => {
                    const isCyan = barTab === "bars";
                    return (
                      <div key={item.name} className="relative overflow-hidden rounded-lg group border border-black/10 h-48 md:h-56  ">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <Image width={200} height={200} unoptimized src={item.img} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                          <SectionBadge label={item.tag} className="self-start mb-1.5" />
                          <p className="font-bold leading-snug">{item.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ViewportSection>

            {/* ── SECTION 4.5: SHIP & CRUISE YOUTUBE VIDEO GALLERY ── */}
            <ViewportSection minHeight="600px">
              <React.Suspense fallback={<div className="h-48 flex items-center justify-center text-white/50 font-bold uppercase tracking-wider">Loading Video Gallery...</div>}>
                <CruiseVideoGallery />
              </React.Suspense>

            </ViewportSection>

            {/* ── SECTION 5: FAQS & HISTORY ── */}
            <ViewportSection id="faqs" minHeight="600px" className="pt-20 pb-10">
              <div className="text-left w-full mb-10">
                <h2 className="font-bold uppercase tracking-tight text-white leading-none" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>
                  Frequently Asked <span className="accent-gradient-text">Questions</span>
                </h2>
                <p className="mt-3 leading-relaxed font-semibold max-w-2xl">
                  Find answers to important passport requirements, dining configurations, payment plans, and booking rules.
                </p>
              </div>

              {/* FAQs List */}
              <div className="space-y-3 mb-0 text-left max-w-4xl">
                {FAQS_EXTENDED.map((faq, i) => (
                  <div key={faq.q} className="bg-[#59595929] border  border-white/10  backdrop-blur-[16px] rounded-lg overflow-hidden    ">
                    <button aria-label="Action button"
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-white/10 transition-colors cursor-pointer rounded-none border-none bg-transparent"
                    >
                      <span className="font-bold text-white pr-4">{faq.q}</span>
                      <span className={`text-white/70 transition-transform font-bold shrink-0 ${openFaq === i ? 'rotate-45 text-rose-400' : ''}`}>+</span>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 py-4 bg-[#59595929] border  border-white/10  backdrop-blur-[16px]">
                        <p className="font-medium leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ViewportSection>
          </div>

          {/* Cruise History Timeline Section (Lazy-Loaded at Bottom) */}
          {renderTimeline && (
            <ViewportSection id="history" minHeight="500px" className="w-full relative overflow-x-clip site-container">
              <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-black/50 font-bold uppercase tracking-wider">Loading Cruise History Timeline...</div>}>
                <CruiseHistoryTimeline history={CRUISE_HISTORY} />
              </React.Suspense>
            </ViewportSection>
          )}
        </>
      )}
    </div>
  );
}


function CruiseCard1Section({ formData, setFormData }: { formData: any; setFormData: (fd: any) => void }) {
  return (
    <div className="py-4 border-b border-white/10">
      <span className="font-bold text-white uppercase block mb-3">Card 1 - Deposit Details</span>
      <div className="booking-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="booking-cell pb-4 pt-4">
          <label htmlFor="cruise-card-name-1" className="booking-label block font-bold text-white uppercase mb-1.5">Your Full Name on the Card *</label>
          <div className="input-glow-border rounded-xl">
            <input aria-label="Input field" id="cruise-card-name-1" type="text" required placeholder="Name on Card" value={formData.cardName1} onChange={e => setFormData({ ...formData, cardName1: e.target.value })} className="booking-input w-full bg-black/50 border  border-white/10  px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
          </div>
        </div>
        <div className="booking-cell pb-4 pt-4">
          <label htmlFor="cruise-card-number-1" className="booking-label block font-bold text-white uppercase mb-1.5">Credit Card Number *</label>
          <div className="input-glow-border rounded-xl">
            <input aria-label="Input field" id="cruise-card-number-1" type="text" required placeholder="Credit Card Number" value={formData.cardNumber1} onChange={e => setFormData({ ...formData, cardNumber1: e.target.value })} className="booking-input w-full bg-black/50 border  border-white/10  px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
          </div>
        </div>
        <div className="booking-cell pb-4 pt-4 ">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="cruise-card-exp-1" className="booking-label block font-bold text-white uppercase mb-1.5">Exp. Date *</label>
              <div className="input-glow-border rounded-xl">
                <input aria-label="Input field" id="cruise-card-exp-1" type="text" required placeholder="MM/YY" value={formData.cardExpiry1} onChange={e => setFormData({ ...formData, cardExpiry1: e.target.value })} className="booking-input w-full bg-black/50 border  border-white/10  px-3 py-2.5 text-base font-semibold text-white text-center placeholder:text-white/40 focus:outline-none rounded-lg" />
              </div>
            </div>
            <div>
              <label htmlFor="cruise-card-cvv-1" className="booking-label block font-bold text-white uppercase mb-1.5">3 Digit CVC *</label>
              <div className="input-glow-border rounded-xl">
                <input aria-label="Input field" id="cruise-card-cvv-1" type="text" required placeholder="CVC" value={formData.cardCvv1} onChange={e => setFormData({ ...formData, cardCvv1: e.target.value })} className="booking-input w-full bg-black/50 border  border-white/10  px-3 py-2.5 text-base font-semibold text-white text-center placeholder:text-white/40 focus:outline-none rounded-lg" />
              </div>
            </div>
            <div>
              <label htmlFor="cruise-card-zip-1" className="booking-label block font-bold text-white uppercase mb-1.5">Billing Zip *</label>
              <div className="input-glow-border rounded-xl">
                <input aria-label="Input field" id="cruise-card-zip-1" type="text" required placeholder="Zip" value={formData.cardZip1} onChange={e => setFormData({ ...formData, cardZip1: e.target.value })} className="booking-input w-full bg-black/50 border  border-white/10  px-3 py-2.5 text-base font-semibold text-white text-center placeholder:text-white/40 focus:outline-none rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <div className="booking-cell pb-4 pt-4">
          <label htmlFor="cruise-card-amount-1" className="booking-label block font-bold text-white uppercase mb-1.5">Amount to Charge ($ USD)</label>
          <div className="input-glow-border rounded-xl">
            <input aria-label="Input field" id="cruise-card-amount-1" type="text" required value={formData.cardAmount1} onChange={e => setFormData({ ...formData, cardAmount1: e.target.value })} className="booking-input w-full bg-black/50 border  border-white/10  px-3.5 py-2.5 text-base font-bold text-purple-300 focus:outline-none rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}


function CruiseCard2Section({ formData, setFormData }: { formData: any; setFormData: (fd: any) => void }) {
  return (
    <div className="p-4 border-b border-white/10">
      <span className="font-bold text-white uppercase block mb-3">Card 2 - Split Details</span>
      <div className="booking-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="booking-cell p-4">
          <label htmlFor="cruise-card-name-2" className="booking-label block font-bold text-white uppercase mb-1.5">Your Full Name on the Card *</label>
          <div className="input-glow-border rounded-xl">
            <input aria-label="Input field" id="cruise-card-name-2" type="text" required placeholder="Name on Card" value={formData.cardName2} onChange={e => setFormData({ ...formData, cardName2: e.target.value })} className="booking-input w-full bg-black/50 border  border-white/10  px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
          </div>
        </div>
        <div className="booking-cell p-4">
          <label htmlFor="cruise-card-number-2" className="booking-label block font-bold text-white uppercase mb-1.5">Credit Card Number *</label>
          <div className="input-glow-border rounded-xl">
            <input aria-label="Input field" id="cruise-card-number-2" type="text" required placeholder="Credit Card Number" value={formData.cardNumber2} onChange={e => setFormData({ ...formData, cardNumber2: e.target.value })} className="booking-input w-full bg-black/50 border  border-white/10  px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
          </div>
        </div>
        <div className="booking-cell p-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="cruise-card-exp-2" className="booking-label block font-bold text-white uppercase mb-1.5">Exp. Date *</label>
              <div className="input-glow-border rounded-xl">
                <input aria-label="Input field" id="cruise-card-exp-2" type="text" required placeholder="MM/YY" value={formData.cardExpiry2} onChange={e => setFormData({ ...formData, cardExpiry2: e.target.value })} className="booking-input w-full bg-black/50 border  border-white/10  px-3 py-2.5 text-base font-semibold text-white text-center placeholder:text-white/40 focus:outline-none rounded-lg" />
              </div>
            </div>
            <div>
              <label htmlFor="cruise-card-cvv-2" className="booking-label block font-bold text-white uppercase mb-1.5">3 Digit CVC *</label>
              <div className="input-glow-border rounded-xl">
                <input aria-label="Input field" id="cruise-card-cvv-2" type="text" required placeholder="CVC" value={formData.cardCvv2} onChange={e => setFormData({ ...formData, cardCvv2: e.target.value })} className="booking-input w-full bg-black/50 border  border-white/10  px-3 py-2.5 text-base font-semibold text-white text-center placeholder:text-white/40 focus:outline-none rounded-lg" />
              </div>
            </div>
            <div>
              <label htmlFor="cruise-card-zip-2" className="booking-label block font-bold text-white uppercase mb-1.5">Billing Zip *</label>
              <div className="input-glow-border rounded-xl">
                <input aria-label="Input field" id="cruise-card-zip-2" type="text" required placeholder="Zip" value={formData.cardZip2} onChange={e => setFormData({ ...formData, cardZip2: e.target.value })} className="booking-input w-full bg-black/50 border  border-white/10  px-3 py-2.5 text-base font-semibold text-white text-center placeholder:text-white/40 focus:outline-none rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <div className="booking-cell p-4">
          <label htmlFor="cruise-card-amount-2" className="booking-label block font-bold text-white uppercase mb-1.5">Amount to Charge ($ USD)</label>
          <div className="input-glow-border rounded-xl">
            <input aria-label="Input field" id="cruise-card-amount-2" type="text" required value={formData.cardAmount2} onChange={e => setFormData({ ...formData, cardAmount2: e.target.value })} className="booking-input w-full bg-black/50 border  border-white/10  px-3.5 py-2.5 text-base font-bold text-purple-300 focus:outline-none rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CruiseNotesAndSignatureSection({
  formData,
  setFormData,
  signature,
  setSignature,
  signatureDate,
}: {
  formData: any;
  setFormData: (fn: (prev: any) => any) => void;
  signature: string;
  setSignature: (s: string) => void;
  signatureDate: string;
}) {
  return (
    <div className="booking-section-container border-0 bg-transparent p-0 mt-4">
      <div className="booking-section-header bg-transparent px-0 py-2 border-0">
        <span className="font-bold uppercase  text-white">ADDITIONAL NOTES & DIGITAL SIGNATURE</span>
      </div>

      <div className="py-3 border-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col justify-start">
            <label htmlFor="cruise-how-heard" className="booking-label block font-bold text-white uppercase mb-1.5">How Did You Hear About Us? (Which Band?)</label>
            <div className="input-glow-border rounded-xl">
              <input aria-label="Input field" id="cruise-how-heard" type="text" required placeholder="e.g. 7th Heaven" value={formData.howHeard} onChange={e => setFormData(f => ({ ...f, howHeard: e.target.value }))} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col justify-start">
            <label htmlFor="cruise-dining-requests" className="booking-label block font-bold text-white uppercase mb-1.5">Dining Requests, Special Occasion, or Custom Details</label>
            <div className="input-glow-border rounded-xl">
              <textarea aria-label="Text input" id="cruise-dining-requests" placeholder="e.g. Early seating dinner, celebrating 10th anniversary" value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} rows={2} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none resize-none rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* SIGNATURE FIELDS */}
      <div className="booking-grid grid grid-cols-1 md:grid-cols-2 border-0 items-start gap-4 mt-2">
        {/* E-Signature */}
        <div className="booking-cell border-0 py-3 px-0 flex flex-col justify-start">
          <label htmlFor="cruise-e-signature" className="booking-label block font-bold text-white uppercase mb-1.5">Date & E-Signature (Type full name to sign) *</label>
          <div className="input-glow-border rounded-xl">
            <input aria-label="Input field"
              id="cruise-e-signature"
              type="text"
              required
              placeholder="Type legal name to sign"
              value={signature}
              onChange={e => setSignature(e.target.value)}
              className="booking-signature-input signature-font w-full bg-black/50 border-0 px-3.5 py-2.5 text-lg font-bold text-purple-300 placeholder:text-white/30 focus:outline-none rounded-lg"
            />
          </div>
        </div>
        {/* Signature Date */}
        <div className="booking-cell border-0 py-3 px-0 flex flex-col justify-start">
          <span className="booking-label block font-bold text-white uppercase mb-1.5">Date Signed</span>
          <div className="input-glow-border rounded-xl">
            <input aria-label="Input field" type="text" readOnly value={signatureDate} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white/80 focus:outline-none cursor-not-allowed rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentPortalDropdownPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [payForm, setPayForm] = useState({
    bookingNumber: "",
    email: "",
    phone: "",
    cardName: "",
    cardNumber: "",
    cardExp: "",
    cardCvc: "",
    cardZip: "",
    cardAmount: "250.00",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedRef(`PAY-7H-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1200);
  };

  return (
    <div className="mt-4 w-full  text-left text-white animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 border-b  border-white/10  pb-3">
        <div>

          <h3 className=" font-bold uppercase tracking-tight text-white">
            MAKE A PAYMENT
          </h3>
          <p className="text-white/60  mt-0.5">
            Group ID: 3325680 · Official Travel Agency: NTD Vacations
          </p>
        </div>

      </div>

      {submittedRef ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h3 className="text-xl font-bold text-white">Payment Authorized!</h3>
          <p className="text-white/80 text-xs leading-relaxed max-w-xs mx-auto">
            Your payment of <strong className="text-emerald-400">${payForm.cardAmount}</strong> has been successfully processed under Royal Caribbean Group ID <strong className="text-purple-300">3325680</strong>.
          </p>
          <div className="bg-purple-950/40 border border-purple-500/30 p-2.5 rounded-xl font-mono text-xs text-purple-200 inline-block">
            Ref: {submittedRef}
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSubmittedRef(null);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white uppercase text-xs tracking-wider transition-colors cursor-pointer"
            >
              Close Panel
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3.5">
            {/* Booking Number */}
            <InputField
              id="pay-booking-number"
              label="Booking Number"
              required
              type="text"
              placeholder="Enter Booking Number"
              value={payForm.bookingNumber}
              onChange={(e) => setPayForm({ ...payForm, bookingNumber: e.target.value })}
            />

            {/* Email */}
            <InputField
              id="pay-email"
              label="Email Address"
              required
              type="email"
              placeholder="your@email.com"
              value={payForm.email}
              onChange={(e) => setPayForm({ ...payForm, email: e.target.value })}
            />

            {/* Cell Phone */}
            <InputField
              id="pay-phone"
              label="Cell Phone"
              required
              type="tel"
              placeholder="(555) 000-0000"
              value={payForm.phone}
              onChange={(e) => setPayForm({ ...payForm, phone: formatPhoneDisplay(e.target.value) })}
            />

            {/* Your Name on Credit Card */}
            <InputField
              id="pay-card-name"
              label="Your Name on Credit Card"
              required
              type="text"
              placeholder="Name on Credit Card"
              value={payForm.cardName}
              onChange={(e) => setPayForm({ ...payForm, cardName: e.target.value })}
            />

            {/* Credit Card Number */}
            <InputField
              id="pay-card-number"
              label="Credit Card Number"
              required
              type="text"
              placeholder="Card Number"
              value={payForm.cardNumber}
              onChange={(e) => setPayForm({ ...payForm, cardNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Credit Card Expiration Date */}
            <InputField
              id="pay-card-exp"
              label="Exp. Date"
              required
              type="text"
              placeholder="MM/YY"
              value={payForm.cardExp}
              onChange={(e) => setPayForm({ ...payForm, cardExp: e.target.value })}
              inputClassName="text-center"
            />

            {/* Credit Card 3 Digit or 4 Digit (Amex) */}
            <InputField
              id="pay-card-cvc"
              label="3/4 CVC"
              required
              type="text"
              placeholder="CVC"
              value={payForm.cardCvc}
              onChange={(e) => setPayForm({ ...payForm, cardCvc: e.target.value })}
              inputClassName="text-center"
            />

            {/* Billing Zip Code */}
            <InputField
              id="pay-card-zip"
              label="Billing Zip"
              required
              type="text"
              placeholder="Zip"
              value={payForm.cardZip}
              onChange={(e) => setPayForm({ ...payForm, cardZip: e.target.value })}
              inputClassName="text-center"
            />
          </div>

          {/* Amount to Charge */}
          <InputField
            id="pay-card-amount"
            label="Amount to Charge ($ USD)"
            required
            type="text"
            placeholder="250.00"
            value={payForm.cardAmount}
            onChange={(e) => setPayForm({ ...payForm, cardAmount: e.target.value })}
            inputClassName="font-bold text-purple-300"
          />

          <div className="pt-2 flex flex-col gap-2">
            <span className="text-[10px] text-white/50 leading-tight">
              🔒 256-Bit SSL Encrypted Royal Caribbean Authorization
            </span>
            <FoolishShrimpButton
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 font-bold text-white uppercase text-xs tracking-wider cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "PROCESSING PAYMENT..." : "SUBMIT PAYMENT"}
            </FoolishShrimpButton>
          </div>
        </form>
      )}
    </div>
  );
}
