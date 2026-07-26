"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/context/MemberContext";
import { formatPhoneDisplay, isValidEmail } from "@/lib/validation";
import {
  BANDS_DATA,
  PORTS_DATA,
  FAQS_EXTENDED,
  CRUISE_HISTORY,
  ITINERARY_2027,
  ITINERARY_2028,
} from "./cruiseData";
import CruiseSnakeItinerary from "@/components/CruiseSnakeItinerary";
import CruiseVideoGallery from "@/components/CruiseVideoGallery";
import CruiseHistoryTimeline from "@/components/CruiseHistoryTimeline";

function mapToSnakeItinerary(itinData: typeof ITINERARY_2027) {
  const COLOR_THEMES = ["#06b6d4", "#3b82f6", "#a855f7", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#64748b"];
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
    day: 1, port: "Port Canaveral, FL (Orlando)", label: "Embarkation", icon: "🚢", type: "depart",
    photo: "/images/cruise/miami.png",
    schedule: [
      { time: "12:00 PM", event: "Boarding begins at Port Canaveral", cat: "ship" },
      { time: "2:00 PM",  event: "Cabins open — explore the brand new Star of the Seas", cat: "explore" },
      { time: "4:30 PM",  event: "🎸 Sail-Away Concert — AquaDome / Pool Deck", cat: "band" },
      { time: "8:00 PM",  event: "Group Dinner - Eat together in Main Dining Room", cat: "food" },
    ],
  },
  {
    day: 2, port: "Perfect Day at CocoCay, Bahamas", label: "Private Island", icon: "🏝️", type: "island",
    photo: "/images/cruise/cozumel.png",
    schedule: [
      { time: "8:00 AM",  event: "Arrive at Royal Caribbean's Private Island", cat: "ship" },
      { time: "11:00 AM", event: "Chill Island beach day & waterslides", cat: "explore" },
      { time: "2:00 PM",  event: "🎸 Poolside Acoustic Set at Coco Beach Club", cat: "band" },
      { time: "5:00 PM",  event: "All aboard CocoCay pier", cat: "ship" },
    ],
  },
  {
    day: 3, port: "At Sea", label: "Sea Day", icon: "🌊", type: "sea",
    photo: "/images/cruise/at-sea.png",
    schedule: [
      { time: "10:00 AM", event: "Free play at Thrill Waterpark on ship", cat: "explore" },
      { time: "1:00 PM",  event: "🎸 Q&A session with 7th Heaven in Music Hall", cat: "band" },
      { time: "4:00 PM",  event: "Cocktail hours with other fans", cat: "food" },
      { time: "8:30 PM",  event: "🎸 Full Electric Concert - Royal Theater", cat: "band" },
    ],
  },
  {
    day: 4, port: "Charlotte Amalie, St. Thomas", label: "Port Day", icon: "🏝️", type: "island",
    photo: "/images/cruise/grand-cayman.png",
    schedule: [
      { time: "8:00 AM",  event: "Dock in beautiful St. Thomas", cat: "ship" },
      { time: "10:00 AM", event: "Magen's Bay beach excursion", cat: "explore" },
      { time: "3:00 PM",  event: "Shopping & local sight-seeing in Charlotte Amalie", cat: "explore" },
      { time: "9:00 PM",  event: "🎸 Under-the-stars deck concert", cat: "band" },
    ],
  },
  {
    day: 5, port: "Philipsburg, St. Maarten", label: "Port Day", icon: "🏝️", type: "island",
    photo: "/images/cruise/roatan.png",
    schedule: [
      { time: "8:00 AM",  event: "Dock in St. Maarten", cat: "ship" },
      { time: "10:30 AM", event: "Maho Beach plane spotting excursion", cat: "explore" },
      { time: "1:00 PM",  event: "French side culinary tour (Marigot)", cat: "food" },
      { time: "8:00 PM",  event: "🎸 Themed night & group deck party", cat: "band" },
    ],
  },
  {
    day: 6, port: "At Sea", label: "Grand Finale", icon: "🎸", type: "sea",
    photo: "/images/cruise/concert.png",
    schedule: [
      { time: "11:00 AM", event: "Farewell pool deck celebration", cat: "explore" },
      { time: "3:00 PM",  event: "🎸 Acoustic requests & farewell lounge jam", cat: "band" },
      { time: "8:00 PM",  event: "🎸 7th Heaven Grand Finale Show", cat: "band" },
      { time: "10:30 PM", event: "Late night passenger lounge after-party", cat: "band" },
    ],
  },
  {
    day: 7, port: "Port Canaveral, FL", label: "Disembarkation", icon: "⚓", type: "depart",
    photo: "/images/cruise/miami.png",
    schedule: [
      { time: "7:00 AM",  event: "Arrive back in Port Canaveral", cat: "ship" },
      { time: "9:00 AM",  event: "🎸 Group photo with the band - pool deck", cat: "band" },
      { time: "10:00 AM", event: "Disembarkation begins", cat: "ship" },
    ],
  },
];

const ITIN_TYPE_ACCENT: Record<string, string> = {
  island: "text-cyan-400", sea: "text-purple-400", depart: "text-amber-400",
};
const ITIN_TYPE_BAR: Record<string, string> = {
  island: "from-cyan-500 to-emerald-400", sea: "from-purple-500 to-[var(--color-accent)]", depart: "from-amber-500 to-orange-400",
};
const ITIN_CAT_DOT: Record<string, string> = {
  band: "bg-[var(--color-accent)] shadow-[0_0_6px_rgba(133,29,239,0.8)]",
  explore: "bg-cyan-400", food: "bg-emerald-400", ship: "bg-white/25",
};
const ITIN_CAT_TEXT: Record<string, string> = {
  band: "text-white font-semibold", explore: "text-white/70", food: "text-white/60", ship: "text-white/35",
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

export default function CruisePage() {
  const supabase = createClient();
  const router = useRouter();
  const { isLoggedIn, member, openModal } = useMember();
  const [signupStatus, setSignupStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({ 
    name: "", email: "", phone: "", notes: "", anonymous: false, 
    joinCommunity: true, website: "", guestCount: 1, cabinPreference: "",
    dob1: "", crownAnchor1: "", tshirtSize1: "L",
    cardName1: "", cardNumber1: "", cardExpiry1: "", cardCvv1: "", cardZip1: "", cardAmount1: "250.00",
    cardName2: "", cardNumber2: "", cardExpiry2: "", cardCvv2: "", cardZip2: "", cardAmount2: "250.00",
    splitPayment: false,
    insurance: "no", prepaidGratuities: "yes", howHeard: "7th Heaven"
  });

  const [activeAnchor, setActiveAnchor] = useState("book-now");
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

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["book-now", "itinerary", "bands-ports", "pricing", "ship-explorer", "faqs"];
      const scrollPosition = window.scrollY + 350; // Offset for highlights

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveAnchor(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [activeItinYear, setActiveItinYear] = useState<2027 | 2028>(2027);
  const [activePriceYear, setActivePriceYear] = useState<2027 | 2028>(2027);
  const [foodTypeTab, setFoodTypeTab] = useState<"included" | "paid">("included");

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

  const GUEST_COLORS = ["#3b82f6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#8b5cf6", "#f97316"];

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
  const [joinedFans, setJoinedFans] = useState<{name: string; guest_count: number; anonymous: boolean; created_at: string}[]>([]);
  const [totalGuests, setTotalGuests] = useState<number>(0);

  const AVATAR_COLORS = ["#851DEF", "#3b82f6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#8b5cf6"];

  useEffect(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    setSignatureDate(`${mm}/${dd}/${yyyy}`);

    const loadStats = async () => {
      try {
        const res = await fetch('/api/cruise/count');
        if (res.ok) {
          const data = await res.json();
          setSignupCount(data.signupCount);
          setTotalGuests(data.totalGuests);
          setJoinedFans(data.joinedFans);
        }
      } catch {}
    };
    loadStats();
  }, []);

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
    const activeCount = 1 + guests.filter(g => g.active).length;
    const totalDeposit = activeCount * 250;
    if (formData.splitPayment && activeCount > 1) {
      setFormData(prev => ({
        ...prev,
        cardAmount1: (totalDeposit / 2).toFixed(2),
        cardAmount2: (totalDeposit / 2).toFixed(2),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        cardAmount1: totalDeposit.toFixed(2),
        cardAmount2: "250.00",
      }));
    }
  }, [formData.splitPayment, guests]);

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

    // Validate DOB Guest 1
    if (!formData.dob1) {
      setFormError('Guest 1 Date of Birth is required.');
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
        if (!g.dob) {
          setFormError(`Please enter Guest ${i + 2} Date of Birth.`);
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
T-shirt: ${g.tshirtSize}
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
T-shirt: ${bookingMeta.primaryGuest.tshirtSize}
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
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setFormError('This email has already signed up!');
          setSignupStatus("error");
          return;
        }
        setFormError(data.error || 'Something went wrong. Try again.');
        throw new Error(data.error || 'Signup failed');
      }
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
        joinCommunity: true, website: "", guestCount: 1, cabinPreference: "",
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
    <div className="min-h-screen">

      {/* ── TOP ALERT BANNER: CRUCIAL PASSPORT REQUIREMENTS ── */}
      <div className="bg-amber-950/80 border-b border-amber-500/40 backdrop-blur-md pt-24 pb-3.5 px-6 relative z-30 text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-3.5">
          <span className="text-2xl shrink-0">🛂</span>
          <div className="flex-1">
            <h4 className="text-xs md:text-sm font-black text-amber-400 uppercase tracking-wider">
              Crucial Passport Requirements
            </h4>
            <p className="text-xs md:text-sm text-white font-semibold leading-relaxed mt-0.5">
              A physical passport book valid for 6 months post-cruise is highly recommended for all travelers. For closed-loop U.S. sailings, a certified state birth certificate accompanied by a government-issued photo ID is legally acceptable, but a passport is always the safest method. Visas may be required depending on nationality. Check <a href="http://travel.state.gov" target="_blank" rel="noopener noreferrer" className="text-amber-300 font-extrabold underline hover:text-white">travel.state.gov</a> to ensure compliance.
            </p>
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative flex flex-col justify-center overflow-hidden pt-12 pb-16">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="/images/cruise-hero.png"
          >
            <source src="/movie/cruise.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-[var(--color-bg-primary)]" />
        </div>

        {/* Hero Text */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mb-10">
          {/* Cruise Line & Booking Center Pill Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-[0.25em] mb-6 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            ROYAL CARIBBEAN INTERNATIONAL · OFFICIAL GROUP CRUISE
          </div>

          {/* Main Title: Cruise Name */}
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white drop-shadow-2xl leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            7TH HEAVEN <span className="accent-gradient-text">FAN CRUISE</span>
          </h1>

          {/* Cruise Ship Names Subtitle */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm font-extrabold uppercase tracking-widest text-white/70">
            <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/15 text-cyan-300">
              🚢 STAR OF THE SEAS (2027)
            </span>
            <span className="text-white/30">•</span>
            <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/15 text-amber-300">
              🚢 LEGEND OF THE SEAS (2028)
            </span>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: CABINS & PRICING (AT TOP) ── */}
      <section id="pricing" className="py-16 site-container -mt-20 md:-mt-32 relative z-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Staterooms <span className="accent-gradient-text"> & Cruise Rates</span>
            </h2>
            <p className="text-white/45 mt-4 text-xs md:text-sm leading-relaxed">
              Browse group rate options, prevailing market rates, suite class inclusions, and booking cancellation terms.
            </p>

            {/* Pricing Year Toggle */}
            <div className="flex gap-2 justify-center mt-8">
              <button
                type="button"
                onClick={() => setActivePriceYear(2027)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activePriceYear === 2027
                    ? "bg-cyan-500 text-black font-black"
                    : "bg-white/5 text-white/50 border border-white/10 hover:text-white"
                }`}
              >
                2027 Star of the Seas (7-Night)
              </button>
              <button
                type="button"
                onClick={() => setActivePriceYear(2028)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activePriceYear === 2028
                    ? "bg-amber-500 text-black font-black"
                    : "bg-white/5 text-white/50 border border-white/10 hover:text-white"
                }`}
              >
                2028 Legend of the Seas (8-Night)
              </button>
            </div>
          </div>

          {/* Cancellation & Policy Guidelines — 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 text-left border-b border-white/10 pb-12">
            <div className="bg-transparent border-0 p-4 relative text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-black uppercase text-white tracking-wide">Booking Policy</h3>
              </div>
              <p className="text-sm font-black text-amber-400 uppercase tracking-widest mb-4">
                Book through us to participate
              </p>
              <p className="text-base text-white/80 leading-relaxed mb-6">
                To be part of our events, eat dinner together with the band and fans, and for us to assist you, your reservation <strong>must</strong> be placed under our official group booking.
              </p>
              <div className="py-2 space-y-3">
                <p className="text-base text-white/80">
                  📧 <strong>Need help?</strong> <a href="mailto:info@NTDVacations.com" className="text-[var(--color-accent)] hover:text-white underline font-bold transition-all">info@NTDVacations.com</a>
                </p>
                <p className="text-base text-white/80">
                  💳 <strong>Deposit:</strong> $250 per person to secure cabin.
                </p>
                <p className="text-base text-white/80">
                  📅 <strong>Final Payment:</strong> {activePriceYear === 2027 ? "October 1, 2026" : "October 1, 2027"}.
                </p>
              </div>
            </div>

            <div className="bg-transparent border-0 p-4 relative text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🏷️</span>
                <h3 className="text-lg font-black uppercase text-white tracking-wide">Best Rate Guarantee</h3>
              </div>
              <p className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-4">
                Flexible rates & price drop matching
              </p>
              <ul className="space-y-4 text-base text-white/80 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span>We book in multiple ways: Group Rate, Prevailing Rate, Sales, and Promotions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span>We match rates & automatically re-roll your room if prices drop before final payment!</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><strong>Group Rate:</strong> Gratuities fully included.</span>
                </li>
              </ul>
            </div>

            <div className="bg-transparent border-0 p-4 relative text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📅</span>
                <h3 className="text-lg font-black uppercase text-white tracking-wide">Cancellation Policy</h3>
              </div>
              <p className="text-sm font-black text-purple-400 uppercase tracking-widest mb-4">
                Refund terms before booking
              </p>
              <div className="space-y-4 text-base text-white/80 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-white uppercase tracking-wider text-xs mb-1">Group Rate Rooms:</h4>
                  {activePriceYear === 2027 ? (
                    <ul className="list-disc pl-5 space-y-1 text-base text-white/80">
                      <li>Cancel before May 12, 2026: <strong>No penalty</strong></li>
                      <li>May 12, 2026 – July 12, 2026: <strong>$50 pp fee</strong></li>
                      <li>July 13, 2026 – Sept 10, 2026: <strong>$100 pp fee</strong></li>
                      <li>Sept 11, 2026 – Nov 10, 2026: <strong>$200 pp fee</strong></li>
                      <li>After Nov 10, 2026: <strong>50% cost</strong></li>
                      <li>After Dec 10, 2026: <strong>No refund</strong></li>
                    </ul>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1 text-base text-white/80">
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
                  <h4 className="font-extrabold text-white uppercase tracking-wider text-xs mb-1">Prevailing Rate:</h4>
                  <p className="text-base text-white/80">Cancel by {activePriceYear === 2027 ? "Oct 10, 2026" : "Oct 1, 2027"} for no penalty.</p>
                </div>
              </div>
            </div>

            {/* Column 4: Passport Requirements */}
            <div className="bg-transparent border-0 p-4 relative text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🛂</span>
                <h3 className="text-lg font-black uppercase text-white tracking-wide">Passport Requirements</h3>
              </div>
              <p className="text-sm font-black text-amber-300 uppercase tracking-widest mb-4">
                Essential travel document guidelines
              </p>
              <div className="space-y-4 text-base text-white/80 leading-relaxed">
                <p>
                  A physical passport book valid for 6 months post-cruise is <strong>highly recommended</strong> for all travelers.
                </p>
                <p>
                  For closed-loop U.S. sailings, a certified state birth certificate accompanied by a government-issued photo ID is legally acceptable, but a passport is always the safest method.
                </p>
                <p>
                  Visas may be required depending on nationality. Check <a href="http://travel.state.gov" target="_blank" rel="noopener noreferrer" className="text-amber-400 font-bold underline hover:text-white">travel.state.gov</a> to ensure compliance.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="space-y-16">
            {/* GROUP RATES */}
            <div className="bg-transparent p-0 relative text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-2">
                <div>
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">Exclusive Group Deal</span>
                  <h3 className="text-2xl md:text-3xl font-black uppercase text-white mt-1">Limited Group Rate Cabins ({activePriceYear})</h3>
                </div>
                <div className="max-w-md text-xs md:text-sm leading-relaxed text-cyan-200/90 font-medium">
                  💡 <strong>ALL-INCLUSIVE:</strong> Prices include Cabin, Gratuities, Taxes, and Port Fees (Based on Double Occupancy).
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activePriceYear === 2027
                  ? [
                      { code: "Q2", title: "Interior Plus", price: "$1,683.27", status: "soldout", badge: "Group Rate Sold Out - Book Prevailing", image: "/images/cruise/q2_interior_plus.jpg", icon: "🚪", selectValue: "group_n5" },
                      { code: "N5", title: "Ocean View", price: "$1,883.27", status: "warning", badge: "1 Cabin Left!", image: "/images/cruise/n5.jpg", icon: "🌊", inclusions: "Gratuities Included", selectValue: "group_n5" },
                      { code: "IF", title: "Infinite Central Park", price: "$2,033.27", status: "warning", badge: "2 Cabins Left!", image: "/images/cruise/if.jpg", icon: "🌳", inclusions: "Gratuities Included", selectValue: "group_if" },
                      { code: "D4", title: "Ocean View Balcony", price: "$2,433.27", status: "info", badge: "10 Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", icon: "🌅", inclusions: "Gratuities Included", selectValue: "group_d4" },
                      { code: "D2", title: "Ocean View Balcony", price: "$2,483.27", status: "info", badge: "11 Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", icon: "🌅", inclusions: "Gratuities Included", selectValue: "group_d2" },
                      { code: "I1", title: "Infinite Ocean View Balcony", price: "$2,583.27", status: "warning", badge: "5 Cabins Left!", image: "/images/cruise/i1_infinite_ocean_view_balcony.jpg", icon: "🚢", inclusions: "Gratuities Included", selectValue: "group_i1" },
                      { code: "IG", title: "Infinite Grand Suite", price: "Prevailing", status: "soldout", badge: "Sold Out - Prevailing Only", image: "/images/cruise/icon_ig_infinite_grand_suite_320x171.jpg", icon: "👑", selectValue: "prev_jy" },
                    ]
                  : [
                      { code: "Q2", title: "Interior Plus", price: "$1,832.98", status: "info", badge: "Available", image: "/images/cruise/q2_interior_plus.jpg", icon: "🚪", inclusions: "Gratuities Included", selectValue: "group_n5" },
                      { code: "IF", title: "Infinite Central Park", price: "$2,032.98", status: "info", badge: "Available", image: "/images/cruise/if.jpg", icon: "🌳", inclusions: "Gratuities Included", selectValue: "group_if" },
                      { code: "N5", title: "Ocean View", price: "$2,162.98", status: "info", badge: "Available", image: "/images/cruise/n5.jpg", icon: "🌊", inclusions: "Gratuities Included", selectValue: "group_n5" },
                      { code: "D4", title: "Ocean View Balcony", price: "$2,472.98", status: "info", badge: "Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", icon: "🌅", inclusions: "Gratuities Included", selectValue: "group_d4" },
                      { code: "D2", title: "Ocean View Balcony", price: "$2,492.98", status: "info", badge: "Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", icon: "🌅", inclusions: "Gratuities Included", selectValue: "group_d2" },
                      { code: "I1", title: "Infinite Ocean View Balcony", price: "$2,522.98", status: "info", badge: "Available", image: "/images/cruise/i1_infinite_ocean_view_balcony.jpg", icon: "🚢", inclusions: "Gratuities Included", selectValue: "group_i1" },
                      { code: "JY", title: "Sky Junior Suite", price: "$8,122.98", status: "warning", badge: "1 Available!", image: "/images/cruise/jy.png", icon: "👑", inclusions: "Gratuities Included", selectValue: "prev_jy" },
                      { code: "IG", title: "Infinite Grand Suite", price: "$7,195.98", status: "warning", badge: "1 Available!", image: "/images/cruise/icon_ig_infinite_grand_suite_320x171.jpg", icon: "👑", inclusions: "Gratuities Included", selectValue: "prev_jy" },
                    ]
                ).map((room, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectCabin(room.selectValue)}
                    className="bg-transparent border-0 p-2 flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02]"
                  >
                    <div>
                      {room.image && (
                        <div className="relative h-40 w-full overflow-hidden rounded-xl mb-4 text-center">
                          <img src={room.image} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="flex justify-between items-start gap-2 mb-3 text-left">
                        <span className="text-xl">{room.icon}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                          room.status === "soldout" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          room.status === "warning" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        }`}>{room.badge}</span>
                      </div>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-0.5">{room.code} Category</span>
                      <h4 className="text-base font-extrabold text-white uppercase tracking-tight text-left">{room.title}</h4>
                    </div>

                    <div className="mt-3 pt-1 text-left">
                      {room.price === "Prevailing" ? (
                        <p className="text-2xs text-white/40 italic font-medium">Prevailing Rates Only</p>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-white">{room.price}</span>
                          <span className="text-[10px] text-white/40 uppercase font-semibold">USD pp</span>
                        </div>
                      )}
                      {room.inclusions && (
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mt-1">✓ {room.inclusions}</span>
                      )}
                      <button 
                        type="button"
                        className="mt-3 w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 group-hover:text-white font-black text-2xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                      >
                        <span>Select & Book Cabin</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </button>
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
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-accent)]">Variable Market Pricing</span>
                    <h3 className="text-xl md:text-2xl font-black uppercase text-white mt-1">Prevailing Rate Cabins (2027)</h3>
                  </div>
                  <div className="max-w-md text-2xs leading-relaxed text-purple-200/90 font-medium">
                    ⚠️ <strong>NOTICE:</strong> Gratuities are <strong>NOT included</strong> in rates below (Pre-paid gratuities are $129.50 PP • $147 PP for Suites). Non-refundable deposits.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { code: "ZI", title: "Inside GTY", price: "$1,430.77", label: "Guaranteed Cabin", image: "/images/cruise/q2_interior_plus.jpg", icon: "🚪", selectValue: "prev_zi" },
                    { code: "YO", title: "Ocean View GTY", price: "$1,691.27", label: "Guaranteed Cabin", image: "/images/cruise/n5.jpg", icon: "🌊", selectValue: "prev_yo", isHighlighted: true },
                    { code: "IF", title: "Infinite Central Park", price: "$1,907.27", label: "Central Park View", image: "/images/cruise/if.jpg", icon: "🌳", selectValue: "prev_if" },
                    { code: "XB", title: "Oceanview Balcony GTY", price: "$1,903.77", label: "Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", icon: "🌅", selectValue: "prev_xb" },
                    { code: "I1", title: "Infinite Ocean View Balcony", price: "$2,237.77", label: "Balcony Access", image: "/images/cruise/i1_infinite_ocean_view_balcony.jpg", icon: "🚢", selectValue: "prev_i1" },
                    { code: "JY", title: "Sky Junior Suite", price: "$5,157.77", label: "Suite Class Luxury", image: "/images/cruise/jy.png", icon: "👑", selectValue: "prev_jy" },
                  ].map((room, idx) => {
                    const isYo = room.code === "YO";
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectCabin(room.selectValue)}
                        className={`p-3.5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] relative ${
                          isYo
                            ? 'bg-purple-950/40 border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] ring-2 ring-purple-500/50'
                            : 'bg-transparent border-0'
                        }`}
                      >
                        {isYo && (
                          <div className="absolute -top-3 left-4 bg-purple-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full tracking-widest shadow-lg flex items-center gap-1.5 border border-purple-400 z-10">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            RECOMMENDED OCEAN VIEW
                          </div>
                        )}
                        <div>
                          {room.image && (
                            <div className="relative h-40 w-full overflow-hidden rounded-xl mb-4 text-center">
                              <img src={room.image} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          )}
                          <div className="flex justify-between items-start gap-2 mb-3 text-left">
                            <span className="text-2xl">{room.icon}</span>
                            <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded tracking-wider ${
                              isYo ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40' : 'text-white/40'
                            }`}>{room.label}</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${isYo ? 'text-purple-300' : 'text-white/30'}`}>{room.code} Category</span>
                          <h4 className={`text-base font-extrabold uppercase tracking-tight mt-0.5 text-left ${isYo ? 'text-purple-200' : 'text-white'}`}>{room.title}</h4>
                        </div>

                        <div className="mt-4 pt-2 text-left">
                          <div className="flex items-baseline gap-1.5">
                            <span className={`text-xl font-black ${isYo ? 'text-purple-300' : 'text-white'}`}>{room.price}</span>
                            <span className="text-2xs text-white/40">USD pp</span>
                          </div>
                          <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold block mt-1">Rates as of June 27, 2026</span>
                          <button 
                            type="button"
                            className={`mt-4 w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              isYo
                                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-400'
                                : 'bg-[var(--color-accent)]/15 hover:bg-[var(--color-accent)]/30 border border-[var(--color-accent)]/30 text-purple-300 group-hover:text-white shadow-[0_0_12px_rgba(133,29,239,0.15)]'
                            }`}
                          >
                            <span>Select Prevailing Rate</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>



          {/* Stateroom Suite Class Perks */}
          <div className="pt-16">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-accent)] mb-3 px-4 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
                Accommodations Guide
              </span>
              <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                Stateroom Catalog & Suite Perks
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
              {/* Stateroom Categories Tab Column */}
              <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black uppercase text-white tracking-widest mb-6 border-b border-white/5 pb-3">Stateroom Categories</h3>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { id: "suites", label: "👑 Royal Suites", desc: "Star Class, Sky Class, and Sea Class accommodations." },
                      { id: "balcony", label: "🌅 Balconies & Infinite", desc: "Private sliding glass doors opening to ocean breeze." },
                      { id: "ocean", label: "🌊 Ocean View", desc: "Large windows overlooking port approaches." },
                      { id: "interior", label: "🚪 Interior Rooms", desc: "Efficient, comfortable, and budget-friendly." },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStateroomTab(tab.id as any)}
                        className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer ${
                          stateroomTab === tab.id
                            ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)]/50"
                            : "bg-black/20 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">{tab.label}</h4>
                        <p className="text-xs text-white/60 mt-1 leading-relaxed">{tab.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 bg-black/40 border border-white/5 p-5 rounded-2xl">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest mb-3">Available layouts:</h4>
                  {stateroomTab === "suites" && (
                    <div className="space-y-2 text-sm text-white/80 font-medium">
                      <p>• Ultimate Family Townhouse</p>
                      <p>• Royal Loft Suite</p>
                      <p>• Owner&apos;s Suite</p>
                      <p>• Grand Suite (1 Bedroom & 2 Bedroom)</p>
                      <p>• Sky Junior Suite</p>
                      <p>• Surfside Family Suite</p>
                    </div>
                  )}
                  {stateroomTab === "balcony" && (
                    <div className="space-y-2 text-sm text-white/80 font-medium">
                      <p>• Infinite Ocean View Balcony</p>
                      <p>• Infinite Central Park Balcony</p>
                      <p>• Ocean View Balcony</p>
                      <p>• Central Park View Balcony</p>
                      <p>• Surfside Family View Balcony</p>
                    </div>
                  )}
                  {stateroomTab === "ocean" && (
                    <div className="space-y-2 text-sm text-white/80 font-medium">
                      <p>• Panoramic Ocean View</p>
                      <p>• Ocean View</p>
                    </div>
                  )}
                  {stateroomTab === "interior" && (
                    <div className="space-y-2 text-sm text-white/80 font-medium">
                      <p>• Interior</p>
                      <p>• Spacious Interior</p>
                      <p>• Central Park View Interior</p>
                      <p>• Surfside Family View Interior</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Suite Class Benefits Column (Span 2) */}
              <div className="lg:col-span-2 bg-[#0d0d14] border border-cyan-500/20 p-6 md:p-8 rounded-3xl flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
                    <div>
                      <span className="text-xs font-black uppercase tracking-[0.25em] text-[var(--color-accent)]">VIP Experiences</span>
                      <h3 className="text-2xl md:text-3xl font-black uppercase text-white mt-1">Suite Class Perks</h3>
                    </div>
                    <div className="flex gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5">
                      {(["sea", "sky", "star"] as const).map(perk => (
                        <button
                          key={perk}
                          type="button"
                          onClick={() => setSuiteTab(perk)}
                          className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                            suiteTab === perk
                              ? "bg-[var(--color-accent)] text-white shadow-[0_0_15px_rgba(133,29,239,0.4)]"
                              : "bg-transparent text-white/40 hover:text-white"
                          }`}
                        >
                          {perk} Class
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Benefits List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-sm md:text-base text-white/90 font-medium leading-relaxed">
                    {suiteTab === "sea" && [
                      "Dedicated check-in line",
                      "Priority boarding",
                      "Dinner at Coastal Kitchen (subject to availability)*",
                      "All-day access to Star | Sky | Sea dining",
                      "Royal Caribbean plush bathrobes for use onboard",
                      "Luxury pillow top mattress and linen",
                      "Luxury bathroom amenities",
                      "Lavazza Espresso coffee machine"
                    ].map((perk, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <span className="text-purple-400 font-black text-base shrink-0">✓</span>
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
                    ].map((perk, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <span className="text-cyan-400 font-black text-base shrink-0">✓</span>
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
                    ].map((perk, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <span className="text-amber-400 font-black text-base shrink-0">✓</span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimers & Notes */}
                <div className="mt-8 border-t border-white/10 pt-4 text-xs text-white/50 space-y-1.5 leading-relaxed">
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
      <section id="book-now" className="py-16 site-container relative z-20">
        <div id="signup" className="relative z-10">
          <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-8 md:p-10 shadow-[0_8px_64px_rgba(0,0,0,0.4)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 text-left">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight mb-1" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                      Official <span className="accent-gradient-text">Booking Form</span>
                    </h2>
                    <p className="text-white/40 text-sm">
                      Secure your cabin reservation directly under the 7th Heaven group rate. <strong className="text-cyan-400">Group ID: 3325680</strong>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="booking-form-card bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    {/* Header Banner representing the PDF top section */}
                    <div className="booking-header-banner border-b border-white/10 p-5 text-center">
                      <h2 className="text-sm font-black uppercase tracking-wider text-white">7 NIGHT EASTERN CARIBBEAN CRUISE — ORLANDO, FL • COCOCAY • ST. THOMAS • ST. MAARTEN</h2>
                      <p className="text-xs text-cyan-400 font-extrabold uppercase mt-1">STAR OF THE SEAS — ROYAL CARIBBEAN (JANUARY 10, 2027 - JANUARY 17, 2027)</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase mt-0.5">GROUP I.D. 3325680 • Official Travel Agency: NTD Vacations (877-683-9753)</p>
                    </div>

                    {/* GUEST 1 (Primary Booker) */}
                    <div className="booking-section-container border-b border-white/15 bg-white/[0.02]">
                      <div className="booking-section-header bg-white/[0.08] px-5 py-3 border-b border-white/15 flex items-center justify-between">
                        <span className="text-sm font-black uppercase tracking-wider text-white">Guest 1 (Primary Booker)</span>
                        <span className="text-xs font-extrabold uppercase tracking-widest text-purple-100 bg-purple-600 px-3 py-1 rounded-full shadow-md border border-purple-400">Primary</span>
                      </div>
                      <div className="booking-grid grid grid-cols-1 md:grid-cols-2">
                        {/* Name */}
                        <div className="booking-cell border-b md:border-r border-white/15 p-4 focus-within:border-cyan-400 focus-within:bg-cyan-500/10 transition-all">
                          <label className="booking-label block text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5">Full Legal Name (as spelled on passport) *</label>
                          <input type="text" required placeholder="Guest 1 Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="booking-input w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.08]" />
                        </div>
                        {/* DOB */}
                        <div className="booking-cell border-b border-white/15 p-4 focus-within:border-cyan-400 focus-within:bg-cyan-500/10 transition-all">
                          <label className="booking-label block text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5">Date of Birth *</label>
                          <input type="text" required placeholder="MM/DD/YYYY" value={formData.dob1} onChange={e => setFormData({...formData, dob1: e.target.value})} className="booking-input w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.08]" />
                        </div>
                        {/* Phone */}
                        <div className="booking-cell border-b md:border-r border-white/15 p-4 focus-within:border-cyan-400 focus-within:bg-cyan-500/10 transition-all">
                          <label className="booking-label block text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5">Phone Number *</label>
                          <input type="tel" required placeholder="(555) 123-4567" value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhoneDisplay(e.target.value)})} className="booking-input w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.08]" />
                        </div>
                        {/* Email */}
                        <div className="booking-cell border-b border-white/15 p-4 focus-within:border-cyan-400 focus-within:bg-cyan-500/10 transition-all">
                          <label className="booking-label block text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5">Email Address *</label>
                          <input type="email" required placeholder="name@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="booking-input w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.08]" />
                        </div>
                        {/* T-Shirt Size */}
                        <div className="booking-cell md:border-r border-white/15 p-4 focus-within:border-cyan-400 focus-within:bg-cyan-500/10 transition-all relative">
                          <label className="booking-label block text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5">T-Shirt Size</label>
                          <select value={formData.tshirtSize1} onChange={e => setFormData({...formData, tshirtSize1: e.target.value})} className="booking-input w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-base font-semibold text-white focus:outline-none cursor-pointer appearance-none">
                            {["S", "M", "L", "XL", "XXL", "3XL"].map(sz => <option key={sz} value={sz} className="bg-[#0b0b12] text-white font-bold">{sz}</option>)}
                          </select>
                        </div>
                        {/* Crown & Anchor */}
                        <div className="booking-cell p-4 focus-within:border-cyan-400 focus-within:bg-cyan-500/10 transition-all">
                          <label className="booking-label block text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5">Crown & Anchor Number (if applicable)</label>
                          <input type="text" placeholder="Loyalty Number" value={formData.crownAnchor1} onChange={e => setFormData({...formData, crownAnchor1: e.target.value})} className="booking-input w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.08]" />
                        </div>
                      </div>

                      {/* Customization toggles mirroring the Guest 1 page elements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-white/15">
                        <div className="booking-cell border-b md:border-b-0 md:border-r border-white/15 p-4 flex flex-col justify-between">
                          <label className="booking-label block text-xs font-black text-cyan-300 uppercase tracking-wider mb-2.5">Do you want travel protection insurance? *</label>
                          <div className="flex gap-3">
                            {["yes", "no"].map(opt => (
                              <button key={opt} type="button" onClick={() => setFormData(f => ({...f, insurance: opt}))}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer shadow-md ${formData.insurance === opt ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]" : "bg-white/10 border-white/20 text-white/80 hover:text-white hover:bg-white/20"}`}>
                                {opt === "yes" ? "Yes, Protect" : "No, Decline"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="booking-cell p-4 flex flex-col justify-between">
                          <label className="booking-label block text-xs font-black text-purple-300 uppercase tracking-wider mb-2.5">Do you want pre-paid gratuities? *</label>
                          <div className="flex gap-3">
                            {["yes", "no"].map(opt => (
                              <button key={opt} type="button" onClick={() => setFormData(f => ({...f, prepaidGratuities: opt}))}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer shadow-md ${formData.prepaidGratuities === opt ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "bg-white/10 border-white/20 text-white/80 hover:text-white hover:bg-white/20"}`}>
                                {opt === "yes" ? "Yes, Include" : "No, Exclude"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ADDITIONAL GUESTS (Guest 2, Guest 3, Guest 4) */}
                    {guests.map((g, i) => {
                      const guestNum = i + 2;
                      return (
                        <div key={i} className={`booking-section-container border-b border-white/15 transition-all duration-300 ${g.active ? "bg-white/[0.02] opacity-100" : "bg-black/20 opacity-60 print:booking-inactive"}`}>
                          {/* Section Header with checkbox activator */}
                          <div className="booking-section-header bg-white/[0.06] px-5 py-3 border-b border-white/15 flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              id={`guest-active-${guestNum}`} 
                              checked={g.active} 
                              onChange={e => toggleGuestActive(i, e.target.checked)} 
                              className="no-print w-5 h-5 rounded border-white/30 bg-white/10 accent-cyan-400 cursor-pointer" 
                            />
                            <label htmlFor={`guest-active-${guestNum}`} className="text-sm font-black uppercase tracking-wider text-white cursor-pointer select-none">
                              Include Guest {guestNum} in Cabin Reservation
                            </label>
                          </div>

                          {g.active ? (
                            <div className="booking-grid grid grid-cols-1 md:grid-cols-2">
                              {/* Name */}
                              <div className="booking-cell border-b md:border-r border-white/15 p-4 focus-within:border-cyan-400 focus-within:bg-cyan-500/10 transition-all">
                                <label className="booking-label block text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5">Full Legal Name (as spelled on passport) *</label>
                                <input type="text" required placeholder={`Guest ${guestNum} Full Name`} value={g.name} onChange={e => updateGuest(i, "name", e.target.value)} className="booking-input w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.08]" />
                              </div>
                              {/* DOB */}
                              <div className="booking-cell border-b border-white/15 p-4 focus-within:border-cyan-400 focus-within:bg-cyan-500/10 transition-all">
                                <label className="booking-label block text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5">Date of Birth *</label>
                                <input type="text" required placeholder="MM/DD/YYYY" value={g.dob} onChange={e => updateGuest(i, "dob", e.target.value)} className="booking-input w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.08]" />
                              </div>
                              {/* Phone */}
                              <div className="booking-cell border-b md:border-r border-white/15 p-4 focus-within:border-cyan-400 focus-within:bg-cyan-500/10 transition-all">
                                <label className="booking-label block text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5">Phone Number (Optional)</label>
                                <input type="tel" placeholder="(555) 123-4567" value={g.phone} onChange={e => updateGuest(i, "phone", formatPhoneDisplay(e.target.value))} className="booking-input w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.08]" />
                              </div>
                              {/* Email */}
                              <div className="booking-cell border-b border-white/15 p-4 focus-within:border-cyan-400 focus-within:bg-cyan-500/10 transition-all">
                                <label className="booking-label block text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5">Email Address (Optional)</label>
                                <input type="email" placeholder="name@example.com" value={g.email} onChange={e => updateGuest(i, "email", e.target.value)} className="booking-input w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.08]" />
                              </div>
                              {/* T-Shirt Size */}
                              <div className="booking-cell md:border-r border-white/15 p-4 focus-within:border-cyan-400 focus-within:bg-cyan-500/10 transition-all relative">
                                <label className="booking-label block text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5">T-Shirt Size</label>
                                <select value={g.tshirtSize} onChange={e => updateGuest(i, "tshirtSize", e.target.value)} className="booking-input w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-base font-semibold text-white focus:outline-none cursor-pointer appearance-none">
                                  {["S", "M", "L", "XL", "XXL", "3XL"].map(sz => <option key={sz} value={sz} className="bg-[#0b0b12] text-white font-bold">{sz}</option>)}
                                </select>
                              </div>
                              {/* Crown & Anchor */}
                              <div className="booking-cell p-4 focus-within:border-cyan-400 focus-within:bg-cyan-500/10 transition-all">
                                <label className="booking-label block text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5">Crown & Anchor Number (if applicable)</label>
                                <input type="text" placeholder="Loyalty Number" value={g.crownAnchor} onChange={e => updateGuest(i, "crownAnchor", e.target.value)} className="booking-input w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.08]" />
                              </div>
                            </div>
                          ) : (
                            <div className="py-6 text-center text-white/25 text-2xs font-bold uppercase tracking-widest no-print select-none">
                              No Passenger Registered in Slot {guestNum}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* CABIN CATEGORY SELECTION */}
                    <div className="booking-section-container border-b border-white/10 bg-white/[0.01]">
                      <div className="booking-section-header bg-white/[0.03] px-4 py-2 border-b border-white/10">
                        <span className="text-xs font-black uppercase tracking-wider text-white">WHAT CATEGORY ROOM DO YOU WANT TO BOOK?</span>
                      </div>
                      <div className="p-3.5 focus-within:bg-cyan-500/5 transition-all">
                        <select value={formData.cabinPreference} onChange={e => setFormData(f => ({...f, cabinPreference: e.target.value}))} required
                          className="booking-input w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer appearance-none py-1">
                          <option value="" disabled className="bg-[#0b0b12]">-- Select Cabin Category --</option>
                          <optgroup label="Group Rates (Gratuities, Taxes & Fees Included)" className="bg-[#0b0b12]">
                            <option value="group_n5" className="bg-[#0b0b12]">N5 - Ocean View ($1,883.27 pp) - 1 Left</option>
                            <option value="group_if" className="bg-[#0b0b12]">IF - Infinite Central Park ($2,033.27 pp) - 2 Left</option>
                            <option value="group_d4" className="bg-[#0b0b12]">D4 - Ocean View Balcony ($2,433.27 pp) - 10 Left</option>
                            <option value="group_d2" className="bg-[#0b0b12]">D2 - Ocean View Balcony ($2,483.27 pp) - 11 Left</option>
                            <option value="group_i1" className="bg-[#0b0b12]">I1 - Infinite Ocean View Balcony ($2,583.27 pp) - 5 Left</option>
                          </optgroup>
                          <optgroup label="Prevailing Rates (Gratuities NOT Included, Taxes & Fees Included)" className="bg-[#0b0b12]">
                            <option value="prev_zi" className="bg-[#0b0b12]">ZI - Inside GTY ($1,430.77 pp)</option>
                            <option value="prev_yo" className="bg-[#0b0b12] text-purple-300 font-bold">🟣 YO - Ocean View GTY ($1,691.27 pp) ★ FEATURED</option>
                            <option value="prev_if" className="bg-[#0b0b12]">IF - Infinite Central Park ($1,907.27 pp)</option>
                            <option value="prev_xb" className="bg-[#0b0b12]">XB - Oceanview Balcony GTY ($1,903.77 pp) - 8 Left</option>
                            <option value="prev_i1" className="bg-[#0b0b12]">I1 - Infinite Ocean View Balcony ($2,237.77 pp)</option>
                            <option value="prev_jy" className="bg-[#0b0b12]">JY - Sky Junior Suite ($5,157.77 pp)</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {/* PAYMENT DETAILS */}
                    <div className="booking-section-container border-b border-white/10 bg-white/[0.01]">
                      <div className="booking-section-header bg-white/[0.03] px-4 py-2 border-b border-white/10 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-white">PAYMENT INFORMATION (DEPOSIT DEALS)</span>
                        <span className="no-print text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded tracking-widest">SECURE STAGING</span>
                      </div>
                      <div className="p-4 text-2xs text-white/45 leading-relaxed border-b border-white/5">
                        A $250.00 per-person deposit is required to secure your cabin under our group code. Payments are mock-processed for staging.
                      </div>

                      {/* Card 1 */}
                      <div className="p-4 border-b border-white/10">
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-3">Card 1 - Deposit Details</span>
                        <div className="booking-grid grid grid-cols-1 md:grid-cols-2">
                          <div className="booking-cell border-b md:border-r border-white/10 p-3">
                            <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Your Full Name on the Card *</label>
                            <input type="text" required placeholder="Name on Card" value={formData.cardName1} onChange={e => setFormData({...formData, cardName1: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
                          </div>
                          <div className="booking-cell border-b border-white/10 p-3">
                            <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Credit Card Number *</label>
                            <input type="text" required placeholder="Credit Card Number" value={formData.cardNumber1} onChange={e => setFormData({...formData, cardNumber1: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
                          </div>
                          <div className="booking-cell md:border-r border-white/10 p-3">
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Exp. Date *</label>
                                <input type="text" required placeholder="MM/YY" value={formData.cardExpiry1} onChange={e => setFormData({...formData, cardExpiry1: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white text-center focus:outline-none" />
                              </div>
                              <div>
                                <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">3 Digit *</label>
                                <input type="text" required placeholder="CVC" value={formData.cardCvv1} onChange={e => setFormData({...formData, cardCvv1: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white text-center focus:outline-none" />
                              </div>
                              <div>
                                <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Billing Zip *</label>
                                <input type="text" required placeholder="Billing Zip" value={formData.cardZip1} onChange={e => setFormData({...formData, cardZip1: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white text-center focus:outline-none" />
                              </div>
                            </div>
                          </div>
                          <div className="booking-cell p-3 flex flex-col justify-end">
                            <div className="flex justify-between items-center bg-black/40 p-2 rounded-xl border border-white/5">
                              <span className="booking-label text-[9px] font-bold text-white/40 uppercase tracking-widest">Amount to Charge</span>
                              <input type="text" required value={formData.cardAmount1} onChange={e => setFormData({...formData, cardAmount1: e.target.value})} className="booking-input w-24 bg-transparent border-none text-right text-sm font-black text-white outline-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 2 Split Option */}
                      {guests.filter(g => g.active).length > 0 && (
                        <div className="p-4 border-b border-white/10 no-print">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={formData.splitPayment} 
                              onChange={e => setFormData({...formData, splitPayment: e.target.checked})} 
                              className="w-4 h-4 rounded border-white/20 bg-white/5 accent-cyan-400 cursor-pointer" 
                            />
                            <span className="text-2xs font-bold uppercase tracking-widest text-cyan-400 group-hover:text-cyan-300">Split deposit payment between Card 1 and Card 2</span>
                          </label>
                        </div>
                      )}

                      {/* Card 2 Details */}
                      {formData.splitPayment && guests.filter(g => g.active).length > 0 && (
                        <div className="p-4 bg-white/[0.01]">
                          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-3">Card 2 - Split Details</span>
                          <div className="booking-grid grid grid-cols-1 md:grid-cols-2">
                            <div className="booking-cell border-b md:border-r border-white/10 p-3">
                              <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Your Full Name on the Card *</label>
                              <input type="text" required placeholder="Name on Card" value={formData.cardName2} onChange={e => setFormData({...formData, cardName2: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
                            </div>
                            <div className="booking-cell border-b border-white/10 p-3">
                              <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Credit Card Number *</label>
                              <input type="text" required placeholder="Credit Card Number" value={formData.cardNumber2} onChange={e => setFormData({...formData, cardNumber2: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
                            </div>
                            <div className="booking-cell md:border-r border-white/10 p-3">
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Exp. Date *</label>
                                  <input type="text" required placeholder="MM/YY" value={formData.cardExpiry2} onChange={e => setFormData({...formData, cardExpiry2: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white text-center focus:outline-none" />
                                </div>
                                <div>
                                  <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">3 Digit *</label>
                                  <input type="text" required placeholder="CVC" value={formData.cardCvv2} onChange={e => setFormData({...formData, cardCvv2: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white text-center focus:outline-none" />
                                </div>
                                <div>
                                  <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Billing Zip *</label>
                                  <input type="text" required placeholder="Billing Zip" value={formData.cardZip2} onChange={e => setFormData({...formData, cardZip2: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white text-center focus:outline-none" />
                                </div>
                              </div>
                            </div>
                            <div className="booking-cell p-3 flex flex-col justify-end">
                              <div className="flex justify-between items-center bg-black/40 p-2 rounded-xl border border-white/5">
                                <span className="booking-label text-[9px] font-bold text-white/40 uppercase tracking-widest">Amount to Charge</span>
                                <input type="text" required value={formData.cardAmount2} onChange={e => setFormData({...formData, cardAmount2: e.target.value})} className="booking-input w-24 bg-transparent border-none text-right text-sm font-black text-white outline-none" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NOTES & CONSENT */}
                    <div className="booking-section-container border-b border-white/10 bg-white/[0.01]">
                      <div className="booking-section-header bg-white/[0.03] px-4 py-2 border-b border-white/10">
                        <span className="text-xs font-black uppercase tracking-wider text-white">ADDITIONAL NOTES & DIGITIAL SIGNATURE</span>
                      </div>
                      
                      <div className="p-4 border-b border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">How Did You Hear About Us? (Which Band?)</label>
                            <input type="text" required placeholder="e.g. 7th Heaven" value={formData.howHeard} onChange={e => setFormData(f => ({...f, howHeard: e.target.value}))} className="booking-input w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                          </div>
                          <div>
                            <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Dining Requests, Special Occasion, or Custom Details</label>
                            <textarea placeholder="e.g. Early seating dinner, celebrating 10th anniversary" value={formData.notes} onChange={e => setFormData(f => ({...f, notes: e.target.value}))} rows={2} className="booking-input w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-[var(--color-accent)] focus:outline-none resize-none" />
                          </div>
                        </div>
                      </div>

                      {/* SIGNATURE FIELDS */}
                      <div className="booking-grid grid grid-cols-1 md:grid-cols-2">
                        {/* E-Signature */}
                        <div className="booking-cell border-b md:border-b-0 md:border-r border-white/10 p-3 focus-within:border-cyan-500/50 focus-within:bg-cyan-500/5 transition-all">
                          <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Date & E-Signature (Type full name to sign) *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Type legal name to sign" 
                            value={signature} 
                            onChange={e => setSignature(e.target.value)} 
                            className="booking-signature-input signature-font w-full bg-transparent text-lg text-cyan-400 placeholder:text-white/10 focus:outline-none py-0.5" 
                          />
                        </div>
                        {/* Signature Date */}
                        <div className="booking-cell p-3 bg-white/[0.005]">
                          <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Date Signed</label>
                          <input type="text" readOnly value={signatureDate} className="booking-input w-full bg-transparent text-sm text-white/50 focus:outline-none cursor-not-allowed" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit & Print buttons */}
                  <div className="space-y-4 no-print mt-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={formData.anonymous} onChange={e => setFormData(f => ({...f, anonymous: e.target.checked}))}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--color-accent)] cursor-pointer" />
                      <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Keep my name anonymous on the public roster list</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={formData.joinCommunity} onChange={e => setFormData(f => ({...f, joinCommunity: e.target.checked}))}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 accent-cyan-400 cursor-pointer" />
                      <div className="flex-1">
                        <p className="text-xs text-white/65 group-hover:text-white transition-colors font-bold">Join the 7th Heaven Cruise Community</p>
                        <p className="text-[10px] text-white/30">Get early access to deck plans, song request polls, and pre-cruise passenger chat rooms.</p>
                      </div>
                    </label>

                    {/* Honeypot */}
                    <div className="hidden" aria-hidden="true">
                      <input type="text" name="website" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} tabIndex={-1} autoComplete="off" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <button type="submit" disabled={signupStatus === "submitting"}
                        className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)] disabled:opacity-70 cursor-pointer">
                        {signupStatus === "submitting" ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : "Submit Cruise Booking"}
                      </button>
                      
                      <button type="button" onClick={() => window.print()}
                        className="w-full border border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-500/10 text-cyan-400 font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition-all hover:bg-cyan-500/25 cursor-pointer text-center">
                        🖨️ Print / Save Booking Form
                      </button>
                    </div>

                    <p className="text-[10px] text-white/25 text-center leading-relaxed">
                      By submitting, you confirm you are 18 years of age or older and agree to our <a href="/privacy" className="text-white/40 underline hover:text-white/60 transition-colors">Privacy Policy</a> and <a href="/terms" className="text-white/40 underline hover:text-white/60 transition-colors">Terms of Service</a>. You'll receive a confirmation email.
                    </p>
                    {signupStatus === "error" && <p className="text-rose-400 text-xs text-center">{formError || 'Something went wrong. Try again.'}</p>}
                  </div>
                </form>
              </div>

            {/* Sidebar Column: NTD Vacations Contacts & Payment Portal */}
            <div className="lg:col-span-1 text-left space-y-8">
              {/* Online Payment Portal Link */}
              <div className="bg-[#0b0b12] border border-purple-500/20 p-6 rounded-2xl text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[60px]" />
                <span className="text-3xl block mb-2">💳</span>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Already Booked?</h4>
                <p className="text-2xs text-white/40 mt-1 leading-normal">
                  Submit additional payments, modify balances, or authorize custom charges directly with the Royal Caribbean processor.
                </p>
                <a 
                  href="https://www.chicagomusiccruise.com/payment.html" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-black uppercase tracking-wider text-2xs rounded-lg transition-all"
                >
                  Go to Payment Portal
                </a>
              </div>

              {/* Travel coordinators list */}
              <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-white border-b border-white/5 pb-3">Travel Coordinators</h3>
                <div className="space-y-6">
                  {[
                    { name: "Richard Hofherr", role: "CEO / Booking & Media", phone: "(877) 683-9753 ext 5", email: "info@NTDVacations.com" },
                    { name: "Mary Grivas", role: "Excursions / Hotels & Air", phone: "(877) 683-9753 ext 5", email: "Mary@NTDVacations.com" },
                    { name: "Alan McRae", role: "Schedules & Logistics", phone: "(877) 683-9753 ext 5", email: "alan@NTDVacations.com" },
                  ].map((coord, idx) => (
                    <div key={idx} className="leading-normal pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <h4 className="text-lg font-black text-white">{coord.name}</h4>
                      <p className="text-xs text-white/50 font-bold uppercase tracking-wider mt-0.5">{coord.role}</p>
                      <p className="text-sm text-white/70 font-mono mt-1">{coord.phone}</p>
                      <a href={`mailto:${coord.email}`} className="text-base md:text-lg text-cyan-400 font-black hover:underline block mt-1 tracking-wide">{coord.email}</a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voyage Interest Tracker */}
              <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-3">Voyage Tracker</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-white">{signupCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mt-1">Cabins</p>
                  </div>
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-white">{totalGuests}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mt-1">Passengers</p>
                  </div>
                </div>
              </div>

              {/* Who's Booked */}
              {joinedFans.length > 0 && (
                <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-3">Who&apos;s Booked</h3>
                  <div className="flex items-center mb-4">
                    <div className="flex -space-x-2">
                      {joinedFans.slice(0, 8).map((fan, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-[#0d0d14] shrink-0 relative z-[1] hover:z-10 hover:scale-110 transition-transform cursor-default"
                          style={{ backgroundColor: fan.anonymous ? '#374151' : AVATAR_COLORS[i % AVATAR_COLORS.length], zIndex: 8 - i }}
                          title={fan.anonymous ? 'Anonymous Fan' : fan.name}
                        >
                          {fan.anonymous ? '?' : fan.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {joinedFans.length > 8 && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white/60 bg-white/10 border-2 border-[#0d0d14] shrink-0">
                          +{joinedFans.length - 8}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                    {joinedFans.map((fan, i) => (
                      <span key={i} className="text-2xs text-white/40">
                        {fan.anonymous ? 'Anonymous' : fan.name.split(' ')[0]}
                        {fan.guest_count > 1 && <span className="text-white/20"> +{fan.guest_count - 1}</span>}
                        {i < joinedFans.length - 1 && <span className="text-white/15 mx-0.5">·</span>}
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
      <section id="artists" className="pt-16 pb-12 site-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">Headline Musical Acts</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-white leading-none mt-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Featured <span className="accent-gradient-text">Artists</span>
          </h2>
          <p className="text-white/45 mt-3 text-xs md:text-sm leading-relaxed">
            Meet the headlining bands performing live concert sets, acoustic pool jams, and theater shows throughout the voyage.
          </p>
        </div>

        {/* Bands/Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {BANDS_DATA.map((band, idx) => (
            <div key={idx} className="bg-transparent border-0 p-4 text-left flex flex-col justify-between relative overflow-hidden">
              <div>
                <span className="text-4xl block mb-4">{band.logo}</span>
                <h3 className="text-xl font-black uppercase text-white tracking-wide">{band.name}</h3>
                <p className="text-white/50 text-xs md:text-sm mt-3 leading-relaxed">{band.desc}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                <a href={band.website} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 font-bold uppercase tracking-wider hover:text-white transition-colors underline">Visit Band Site →</a>
                <a href="mailto:info@NTDVacations.com?subject=Join Band Lineup Request" className="text-[10px] text-white/30 uppercase tracking-widest hover:text-white transition-all">Booking Inquiries</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 1: ITINERARIES & DATES ── */}
      <section id="itinerary" className="py-20 site-container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Day-by-Day <span className="accent-gradient-text">Schedules</span>
            </h2>
            <p className="text-white/45 mt-4 text-xs md:text-sm leading-relaxed">
              Explore daily port calls, cruising coordinates, sail-away party times, and exclusive fan concerts.
            </p>

            {/* Itinerary Year Toggle */}
            <div className="flex gap-2 justify-center mt-8">
              <button
                type="button"
                onClick={() => setActiveItinYear(2027)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeItinYear === 2027
                    ? "bg-cyan-500 text-black font-black"
                    : "bg-white/5 text-white/50 border border-white/10 hover:text-white"
                }`}
              >
                2027 Star of the Seas (7-Night)
              </button>
              <button
                type="button"
                onClick={() => setActiveItinYear(2028)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeItinYear === 2028
                    ? "bg-amber-500 text-black font-black"
                    : "bg-white/5 text-white/50 border border-white/10 hover:text-white"
                }`}
              >
                2028 Legend of the Seas (8-Night)
              </button>
            </div>
          </div>

          {/* 3D Snake Itinerary Timeline Component */}
          <CruiseSnakeItinerary itinerary={mapToSnakeItinerary(activeItinYear === 2027 ? ITINERARY_2027 : ITINERARY_2028)} />
        </section>

      {/* ── SECTION 2: PORTS OF CALL ── */}
      <section id="ports" className="pt-10 pb-20 site-container">
          {/* Ports of Call Section */}
          <div>
            <div className="text-center md:text-left mb-10">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">Destination Explorer</span>
              <h3 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-tight mt-0.5" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                Ports of Call Catalog
              </h3>
            </div>

            {/* LAYOUT 1: GRID VIEW */}
            {portLayoutMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left animate-fadeIn">
                {PORTS_DATA.map((port, idx) => (
                  <div key={idx} className="bg-[#0b0b12] border border-white/10 hover:border-cyan-500/40 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/10">
                    <div className="h-48 w-full relative overflow-hidden bg-black/60">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b12] via-transparent to-black/30 z-10" />
                      {port.image && <img src={port.image} alt={port.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                      <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/70 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-black uppercase tracking-widest text-cyan-400">
                        Port Call #{idx + 1}
                      </span>
                    </div>
                    <div className="p-6 relative z-20 -mt-8">
                      <h4 className="text-base font-extrabold text-white uppercase tracking-tight mb-2 group-hover:text-cyan-300 transition-colors">{port.name}</h4>
                      <p className="text-white/50 text-xs leading-relaxed">{port.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LAYOUT 2: SPOTLIGHT HERO VIEW */}
            {portLayoutMode === "spotlight" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-fadeIn">
                {/* Main Featured Hero Card */}
                <div className="lg:col-span-2 bg-[#0c0c14] border border-cyan-500/30 rounded-3xl overflow-hidden relative shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                  <div className="h-72 md:h-96 w-full relative overflow-hidden bg-black">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-black/40 to-transparent z-10" />
                    {PORTS_DATA[activeSpotlightPort].image && (
                      <img src={PORTS_DATA[activeSpotlightPort].image} alt={PORTS_DATA[activeSpotlightPort].name} className="w-full h-full object-cover scale-105" />
                    )}
                    <div className="absolute top-6 left-6 z-20 bg-cyan-500 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                      ⭐ Featured Destination Spotlight
                    </div>
                  </div>
                  <div className="p-8 relative z-20 -mt-16">
                    <h3 className="text-2xl md:text-4xl font-black uppercase text-white tracking-tight mb-3" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                      {PORTS_DATA[activeSpotlightPort].name}
                    </h3>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6">
                      {PORTS_DATA[activeSpotlightPort].desc}
                    </p>
                    <div className="flex flex-wrap gap-4 items-center">
                      <button 
                        type="button" 
                        onClick={() => document.getElementById("book-now")?.scrollIntoView({ behavior: "smooth" })}
                        className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all cursor-pointer border-none"
                      >
                        Book Cruise & Visit {PORTS_DATA[activeSpotlightPort].name.split(',')[0]}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar Selectors */}
                <div className="space-y-3">
                  <span className="text-2xs font-bold text-white/40 uppercase tracking-widest block mb-2">Select Destination to Preview:</span>
                  {PORTS_DATA.map((port, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSpotlightPort(idx)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-4 ${
                        activeSpotlightPort === idx
                          ? "bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                          : "bg-[#08080d] border-white/5 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black">
                        {port.image && <img src={port.image} alt={port.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-bold uppercase truncate ${activeSpotlightPort === idx ? "text-cyan-400" : "text-white"}`}>
                          {port.name}
                        </h4>
                        <span className="text-[10px] text-white/35 font-mono">Port #{idx + 1}</span>
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
                  <button
                    type="button"
                    onClick={() => {
                      if (portCarouselRef.current) portCarouselRef.current.scrollBy({ left: -360, behavior: "smooth" });
                    }}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (portCarouselRef.current) portCarouselRef.current.scrollBy({ left: 360, behavior: "smooth" });
                    }}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all"
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
                      key={idx} 
                      className="w-[320px] md:w-[380px] shrink-0 snap-start bg-[#0b0b12] border border-white/10 hover:border-cyan-500/40 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1"
                    >
                      <div className="h-52 w-full relative overflow-hidden bg-black/60">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b12] via-transparent to-black/30 z-10" />
                        {port.image && <img src={port.image} alt={port.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                        <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/70 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-black uppercase tracking-widest text-cyan-400">
                          {idx + 1} / {PORTS_DATA.length}
                        </span>
                      </div>
                      <div className="p-6 relative z-20 -mt-8">
                        <h4 className="text-base font-extrabold text-white uppercase tracking-tight mb-2 group-hover:text-cyan-300 transition-colors">{port.name}</h4>
                        <p className="text-white/50 text-xs leading-relaxed">{port.desc}</p>
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
                  <div key={idx} className="bg-[#0b0b12] border border-white/10 hover:border-cyan-500/30 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-6 transition-all duration-300 hover:bg-white/[0.02]">
                    <div className="w-full md:w-48 h-32 md:h-28 rounded-xl overflow-hidden bg-black relative shrink-0">
                      {port.image && <img src={port.image} alt={port.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />}
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 rounded text-[9px] font-black text-cyan-400 uppercase">
                        Port #{idx + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-black uppercase text-white tracking-tight">{port.name}</h4>
                      </div>
                      <p className="text-white/50 text-xs md:text-sm leading-relaxed">{port.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById("book-now")?.scrollIntoView({ behavior: "smooth" })}
                      className="shrink-0 px-4 py-2 bg-white/5 hover:bg-cyan-500 hover:text-black border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      Book →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>



      {/* ── SECTION 4: SHIP EXPLORER ── */}
      <section id="ship-explorer" className="py-20 site-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Ship Specifications <span className="accent-gradient-text">& Inclusions</span>
            </h2>
            <p className="text-white/45 mt-4 text-xs md:text-sm leading-relaxed">
              Explore structural specs, dining options (included vs fee-based), entertainment venues, and bars on our state-of-the-art vessel.
            </p>
          </div>

          {/* Specs & Dimensions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 text-center">
            {[
              { label: "Gross Tonnage", value: "248,663 GT", icon: "⚖️" },
              { label: "Total Length", value: "1,196.9 Feet", icon: "📐" },
              { label: "Total Width", value: "159.1 Feet", icon: "↔️" },
              { label: "Decks Tall", value: "20 Decks", icon: "🏢" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-transparent p-4 transition-colors">
                <span className="text-3xl block mb-2">{stat.icon}</span>
                <span className="text-[10px] text-white/40 font-black uppercase tracking-wider block">{stat.label}</span>
                <span className="text-lg md:text-xl font-black text-white mt-1 block">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Dining Tab Section */}
          <div className="bg-transparent p-0 text-left mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-black uppercase text-white">Dining Explorer Guide</h3>
                <p className="text-xs text-white/40 mt-1">Discover included food spots and premium specialty restaurants.</p>
              </div>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0 self-center">
                <button
                  type="button"
                  onClick={() => setFoodTypeTab("included")}
                  className={`px-4 py-2 rounded-lg text-2xs font-black uppercase tracking-widest transition-all cursor-pointer border-none ${
                    foodTypeTab === "included" ? "bg-cyan-500 text-black font-black" : "bg-transparent text-white/40 hover:text-white"
                  }`}
                >
                  Included (Free)
                </button>
                <button
                  type="button"
                  onClick={() => setFoodTypeTab("paid")}
                  className={`px-4 py-2 rounded-lg text-2xs font-black uppercase tracking-widest transition-all cursor-pointer border-none ${
                    foodTypeTab === "paid" ? "bg-cyan-500 text-black font-black" : "bg-transparent text-white/40 hover:text-white"
                  }`}
                >
                  Specialty (With Fee)
                </button>
              </div>
            </div>

            {/* Food Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-white/80">
              {(foodTypeTab === "included"
                ? [
                    { name: "Windjammer Buffet", img: "/images/venues/dining_buffet.png", tag: "Buffet" },
                    { name: "Main Dining Room", img: "/images/venues/dining_steakhouse.png", tag: "Main Dining" },
                    { name: "Park Cafe", img: "/images/venues/trellis.png", tag: "Deli & Bites" },
                    { name: "Pearl Cafe", img: "/images/venues/trellis.png", tag: "24/7 Snacks" },
                    { name: "Sorrento's Pizza", img: "/images/venues/lime_coconut.png", tag: "Fresh Pizza" },
                    { name: "Basecamp", img: "/images/venues/hideaway.png", tag: "Casual Eats" },
                    { name: "Surfside Bites", img: "/images/venues/surf.png", tag: "Quick Service" },
                    { name: "Surfside Eatery", img: "/images/venues/dining_buffet.png", tag: "Family Buffet" },
                    { name: "El Loco Fresh", img: "/images/venues/lime_coconut.png", tag: "Mexican" },
                    { name: "Creme De La Crepe", img: "/images/venues/trellis.png", tag: "Creperie" },
                    { name: "Pig Out BBQ", img: "/images/venues/lime_coconut.png", tag: "BBQ Grill" },
                    { name: "Toast & Garden", img: "/images/venues/trellis.png", tag: "Breakfast" },
                    { name: "Mai Thai", img: "/images/venues/hideaway.png", tag: "Asian Fusion" },
                    { name: "Feta Mediterranean", img: "/images/venues/trellis.png", tag: "Greek & Med" },
                    { name: "La Cocinita", img: "/images/venues/lime_coconut.png", tag: "Street Food" },
                    { name: "Sprinkles Ice Cream", img: "/images/venues/surf.png", tag: "Soft Serve" },
                    { name: "Coastal Kitchen (Suites)", img: "/images/venues/dining_steakhouse.png", tag: "Suite Dining" },
                    { name: "The Grove (Suites)", img: "/images/venues/hideaway.png", tag: "Suite Buffet" },
                    { name: "Vitality Cafe", img: "/images/venues/trellis.png", tag: "Healthy Eats" },
                    { name: "Room Service (Breakfast)", img: "/images/venues/dining_buffet.png", tag: "In-Stateroom" },
                  ]
                : [
                    { name: "Chops Grille", img: "/images/venues/dining_steakhouse.png", tag: "Steakhouse" },
                    { name: "Izumi Hibachi", img: "/images/venues/dining_steakhouse.png", tag: "Teppanyaki" },
                    { name: "Izumi Sushi", img: "/images/venues/hideaway.png", tag: "Sushi Bar" },
                    { name: "Izumi in the Park", img: "/images/venues/trellis.png", tag: "Walk-Up Asian" },
                    { name: "Hooked Seafood", img: "/images/venues/dining_buffet.png", tag: "Seafood" },
                    { name: "Giovanni's Italian Kitchen", img: "/images/venues/trellis.png", tag: "Trattoria" },
                    { name: "Playmakers Sports Bar", img: "/images/venues/lime_coconut.png", tag: "Pub & Arcade" },
                    { name: "Lincoln Park Supper Club", img: "/images/venues/dining_steakhouse.png", tag: "Fine Dining" },
                    { name: "Desserted Milkshake Bar", img: "/images/venues/surf.png", tag: "Over-the-Top Shakes" },
                    { name: "Pier 7", img: "/images/venues/lime_coconut.png", tag: "Beach Club" },
                    { name: "Celebration Table", img: "/images/venues/dining_steakhouse.png", tag: "VIP Dining" },
                    { name: "Starbucks Coffee", img: "/images/venues/trellis.png", tag: "Espresso Bar" },
                    { name: "Sugar Beach", img: "/images/venues/surf.png", tag: "Candy & Treats" },
                    { name: "Room Service (Lunch/Dinner)", img: "/images/venues/dining_steakhouse.png", tag: "24/7 In-Room" },
                    { name: "Trellis Bar Dining", img: "/images/venues/trellis.png", tag: "Outdoor Dining" },
                  ]
              ).map((food, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 bg-transparent hover:bg-white/[0.04] p-2.5 rounded-2xl transition-all duration-300 group cursor-pointer"
                >
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={food.img}
                      alt={food.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-white text-sm md:text-base leading-snug group-hover:text-cyan-300 transition-colors">
                      {food.name}
                    </p>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-full inline-block mt-1.5 font-bold">
                      {food.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bars, Lounges, and Entertainment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
            {/* Bars & Clubs */}
            <div className="bg-transparent p-0">
              <h3 className="text-lg font-black uppercase text-white tracking-wider mb-6 border-b border-white/10 pb-3 flex items-center justify-between">
                <span>Bars, Clubs & Lounges</span>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                  20 VENUES ONBOARD
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-white/80">
                {[
                  { name: "Lime & Coconut Bar", img: "/images/venues/lime_coconut.png", tag: "Poolside" },
                  { name: "Rye & Beam", img: "/images/venues/lime_coconut.png", tag: "Bourbon" },
                  { name: "Lemon Post Bar", img: "/images/venues/lime_coconut.png", tag: "Outdoor" },
                  { name: "Swim & Tonic Pool Bar", img: "/images/venues/lime_coconut.png", tag: "Swim-Up" },
                  { name: "The Hideaway Lounge", img: "/images/venues/hideaway.png", tag: "Adults Only" },
                  { name: "Vue Bar", img: "/images/venues/hideaway.png", tag: "Ocean View" },
                  { name: "Overlook Bar & Pods", img: "/images/venues/hideaway.png", tag: "AquaDome" },
                  { name: "Basecamp Bar", img: "/images/venues/hideaway.png", tag: "Thrill Zone" },
                  { name: "Trellis Bar", img: "/images/venues/trellis.png", tag: "Central Park" },
                  { name: "Boleros Latin Bar", img: "/images/venues/trellis.png", tag: "Latin Dance" },
                  { name: "Cantina Fresca", img: "/images/venues/trellis.png", tag: "Mexican" },
                  { name: "Bubbles Champagne Bar", img: "/images/venues/trellis.png", tag: "Champagne" },
                  { name: "Point & Feather Pub", img: "/images/venues/lime_coconut.png", tag: "English Pub" },
                  { name: "Schooner Bar", img: "/images/venues/hideaway.png", tag: "Piano Lounge" },
                  { name: "1400 Lobby Bar", img: "/images/venues/trellis.png", tag: "Atrium" },
                  { name: "Dueling Pianos Lounge", img: "/images/venues/lime_coconut.png", tag: "Live Music" },
                  { name: "Lou's Jazz & Blues", img: "/images/venues/hideaway.png", tag: "Jazz Club" },
                  { name: "Music Hall Lounge", img: "/images/venues/trellis.png", tag: "Rock Venue" },
                  { name: "Playmakers Lounge", img: "/images/venues/lime_coconut.png", tag: "Sports & Arcade" },
                  { name: "Casino Royale Bar", img: "/images/venues/hideaway.png", tag: "Casino Lounge" },
                ].map((bar, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-transparent hover:bg-white/[0.04] p-2.5 rounded-2xl transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bar.img}
                        alt={bar.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-white text-sm md:text-base leading-snug group-hover:text-cyan-300 transition-colors">
                        {bar.name}
                      </p>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-full inline-block mt-1.5 font-bold">
                        {bar.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kids & Family Areas */}
            <div className="bg-transparent p-0">
              <h3 className="text-lg font-black uppercase text-white tracking-wider mb-6 border-b border-white/10 pb-3 flex items-center justify-between">
                <span>Onboard Entertainment & Family Areas</span>
                <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                  ATTRACTIONS
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-white/80">
                {[
                  { name: "Back to the Future Musical", img: "/images/venues/broadway.png", tag: "Broadway Show" },
                  { name: "Flowrider Surf Simulator", img: "/images/venues/surf.png", tag: "Surf Simulator" },
                  { name: "Absolute Zero Ice Rink", img: "/images/venues/hideaway.png", tag: "Ice Arena" },
                  { name: "Torque Racing Arena", img: "/images/venues/lime_coconut.png", tag: "E-Karting" },
                  { name: "SOL Pool Zone", img: "/images/venues/lime_coconut.png", tag: "Top Deck Pool" },
                  { name: "Create! Art Studio", img: "/images/venues/trellis.png", tag: "Craft Studio" },
                  { name: "The Price is Right Game", img: "/images/venues/broadway.png", tag: "Game Show" },
                  { name: "The Quest Adult Game", img: "/images/venues/broadway.png", tag: "Adult Show" },
                  { name: "Comedy Live Theater", img: "/images/venues/broadway.png", tag: "Standup Comedy" },
                  { name: "Headliner Concert Stage", img: "/images/venues/broadway.png", tag: "Live Concerts" },
                  { name: "Spotlight Karaoke Box", img: "/images/venues/lime_coconut.png", tag: "Karaoke" },
                  { name: "Music Hall Nightclub", img: "/images/venues/trellis.png", tag: "Nightclub" },
                  { name: "Ultimate Family Townhouse", img: "/images/venues/hideaway.png", tag: "3-Story Suite" },
                  { name: "Splashaway Bay", img: "/images/venues/lime_coconut.png", tag: "Water Park" },
                  { name: "Adrenaline Peak Climb", img: "/images/venues/surf.png", tag: "Rock Climbing" },
                  { name: "Adventure Ocean Kids Club", img: "/images/venues/trellis.png", tag: "Youth Program" },
                  { name: "Central Park Gardens", img: "/images/venues/trellis.png", tag: "Nature Park" },
                  { name: "Lost Dunes Mini Golf", img: "/images/venues/surf.png", tag: "Mini Golf" },
                  { name: "Surfside Carousel", img: "/images/venues/lime_coconut.png", tag: "Carousel" },
                  { name: "Royal Theater Mainstage", img: "/images/venues/broadway.png", tag: "Main Theater" },
                ].map((act, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-transparent hover:bg-white/[0.04] p-2.5 rounded-2xl transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={act.img}
                        alt={act.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-white text-sm md:text-base leading-snug group-hover:text-purple-300 transition-colors">
                        {act.name}
                      </p>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-full inline-block mt-1.5 font-bold">
                        {act.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      {/* ── SECTION 5: FAQS & HISTORY ── */}
      <section id="faqs" className="py-20 site-container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Cruise FAQs <span className="accent-gradient-text">& Travel History</span>
            </h2>
            <p className="text-white/45 mt-4 text-xs md:text-sm leading-relaxed">
              Find answers to important passport requirements, dining configurations, and explore our 25-year cruising history timeline.
            </p>
          </div>

          {/* FAQs List */}
          <div className="space-y-4 mb-16 text-left">
            {FAQS_EXTENDED.map((faq, i) => (
              <div key={i} className="border border-white/5 bg-black/10 rounded-2xl overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors cursor-pointer border-none bg-transparent"
                >
                  <span className="font-bold text-sm md:text-base text-white pr-4">{faq.q}</span>
                  <span className={`text-white/30 text-lg transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-xs md:text-sm text-white/40 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Cruise History Section with 6 Interactive Layout Modes */}
          <CruiseHistoryTimeline history={CRUISE_HISTORY} />
        </section>
      </div>
    );
}
