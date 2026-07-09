"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/context/MemberContext";
import { formatPhoneDisplay, isValidEmail } from "@/lib/validation";

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
  const [signatureDate, setSignatureDate] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  });

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
    <div className="min-h-screen bg-[var(--color-bg-primary)]">

      {/* ── HERO + SIGNUP (unified) ── */}
      <section id="signup" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-52 pb-32">
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
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Cruise Booking Center
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white drop-shadow-2xl" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            7th Heaven <span className="accent-gradient-text">Cruise</span>
          </h1>
          <p className="text-xl text-white/60 mt-6 max-w-3xl mx-auto leading-relaxed">
            7 nights on Royal Caribbean&apos;s brand new Star of the Seas. Port Canaveral • CocoCay • St. Thomas • St. Maarten. The ultimate fan rock show.
          </p>
        </div>

        {/* Signup Form Card */}
        <div id="signup" className="relative z-10 site-container mt-[100px]">
          {/* 2028 Cruise Announcement Callout */}
          <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest mb-1.5">
                Now Booking 2028
              </span>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                2028 Chicago Music Cruise — Legend of the Seas
              </h4>
              <p className="text-2xs text-white/50 leading-relaxed">
                8-Night Southern Caribbean Voyage • Depart January 8, 2028 • Royal Caribbean
              </p>
            </div>
            <a 
              href="mailto:info@NTDVacations.com?subject=Booking 2028 Chicago Music Cruise - Legend of the Seas"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-2xs rounded-lg transition-all shrink-0 text-center animate-pulse"
            >
              Book 2028 Here
            </a>
          </div>

          <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-8 md:p-10 shadow-[0_8px_64px_rgba(0,0,0,0.4)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form Column */}
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
                {!isLoggedIn && (
                  <button 
                    onClick={() => openModal("login")}
                    className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] hover:text-white transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-full border border-[var(--color-accent)]/30 flex items-center justify-center group-hover:border-[var(--color-accent)] transition-all">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </span>
                    Sign In to Autofill
                  </button>
                )}
                {isLoggedIn && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified User: {member?.name}
                  </div>
                )}
              </div>

              {signupStatus === "success" ? (
                <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                  <span className="text-4xl block mb-4">🚢</span>
                  <h3 className="text-white font-black text-xl uppercase italic">Your Booking Request Submitted!</h3>
                  <p className="text-emerald-400 text-sm mt-3 leading-relaxed">
                    Thank you, {formData.name ? formData.name.split(' ')[0] : 'Captain'}! We have registered your reservation interest. Check <strong className="text-white">{formData.email}</strong> for your confirmation email details. Our travel managers at NTD Vacations will reach out to verify room assignments.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="space-y-6">
                  {/* PRINT OVERRIDES & CURSIVE SIGNATURE FONT */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    .signature-font {
                      font-family: 'Brush Script MT', 'Dancing Script', 'Reenie Beanie', cursive, sans-serif;
                    }
                    @media print {
                      /* Hide non-print areas */
                      header, footer, nav, video, .no-print, button, .interest-tracker, .timeline-section, .whats-included-section, .faq-section, .cta-section, .announcement-banner, #signup > div:not(.site-container) {
                        display: none !important;
                      }
                      
                      /* Reset background & text colors */
                      body, html, main, #signup {
                        background: white !important;
                        color: black !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        min-height: auto !important;
                      }

                      /* Full-width document container */
                      .site-container {
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                      }

                      /* Printable document container styling */
                      .booking-form-card {
                        background: white !important;
                        color: black !important;
                        border: 2px solid black !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        padding: 20px !important;
                        width: 100% !important;
                      }

                      .booking-header-banner {
                        background: black !important;
                        color: white !important;
                        border-bottom: 2px solid black !important;
                        padding: 12px !important;
                        text-align: center !important;
                      }

                      .booking-header-banner h2, .booking-header-banner p {
                        color: white !important;
                      }

                      .booking-section-container {
                        border: 1px solid black !important;
                        background: white !important;
                        margin-bottom: 16px !important;
                        border-radius: 0 !important;
                      }

                      .booking-section-header {
                        background: #f0f0f0 !important;
                        color: black !important;
                        border-bottom: 1px solid black !important;
                        padding: 6px 12px !important;
                        font-weight: bold !important;
                      }

                      .booking-grid {
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                        border-collapse: collapse !important;
                      }

                      .booking-cell {
                        border-top: 1px solid black !important;
                        border-left: 1px solid black !important;
                        background: transparent !important;
                        padding: 6px 10px !important;
                      }

                      /* Clean up table-like cell borders */
                      .booking-grid > .booking-cell:nth-child(2n+1) {
                        border-left: none !important;
                      }
                      
                      .booking-grid > .booking-cell:nth-child(1),
                      .booking-grid > .booking-cell:nth-child(2) {
                        border-top: none !important;
                      }

                      .booking-label {
                        color: #222 !important;
                        font-size: 8px !important;
                        font-weight: bold !important;
                        text-transform: uppercase !important;
                      }

                      .booking-input {
                        color: black !important;
                        background: transparent !important;
                        border: none !important;
                        border-bottom: 1px dotted black !important;
                        padding: 2px 0 !important;
                        font-size: 11px !important;
                        width: 100% !important;
                      }

                      select.booking-input {
                        -webkit-appearance: none !important;
                        -moz-appearance: none !important;
                        appearance: none !important;
                      }

                      .booking-signature-input {
                        font-family: 'Brush Script MT', 'Dancing Script', 'Reenie Beanie', cursive, sans-serif !important;
                        font-size: 20px !important;
                        color: black !important;
                        border: none !important;
                        border-bottom: 1px solid black !important;
                      }

                      .booking-inactive {
                        display: none !important;
                      }
                    }
                  ` }} />

                  {/* HIGH FIDELITY DIGITAL PDF FORM CONTAINER */}
                  <div className="booking-form-card bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    {/* Header Banner representing the PDF top section */}
                    <div className="booking-header-banner bg-[var(--color-bg-primary)] border-b border-white/10 p-5 text-center">
                      <h2 className="text-sm font-black uppercase tracking-wider text-white">7 NIGHT EASTERN CARIBBEAN CRUISE — ORLANDO, FL • COCOCAY • ST. THOMAS • ST. MAARTEN</h2>
                      <p className="text-xs text-cyan-400 font-extrabold uppercase mt-1">STAR OF THE SEAS — ROYAL CARIBBEAN (JANUARY 10, 2027 - JANUARY 17, 2027)</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase mt-0.5">GROUP I.D. 3325680 • Official Travel Agency: NTD Vacations (877-683-9753)</p>
                    </div>

                    {/* GUEST 1 (Primary Booker) */}
                    <div className="booking-section-container border-b border-white/10 bg-white/[0.01]">
                      <div className="booking-section-header bg-white/[0.03] px-4 py-2 border-b border-white/10 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-white">Guest 1 (Primary Booker)</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded border border-[var(--color-accent)]/20">Primary</span>
                      </div>
                      <div className="booking-grid grid grid-cols-1 md:grid-cols-2">
                        {/* Name */}
                        <div className="booking-cell border-b md:border-r border-white/10 p-3 focus-within:border-cyan-500/50 focus-within:bg-cyan-500/5 transition-all">
                          <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Full Legal Name (as spelled on passport) *</label>
                          <input type="text" required placeholder="Guest 1 Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
                        </div>
                        {/* DOB */}
                        <div className="booking-cell border-b border-white/10 p-3 focus-within:border-cyan-500/50 focus-within:bg-cyan-500/5 transition-all">
                          <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Date of Birth *</label>
                          <input type="text" required placeholder="MM/DD/YYYY" value={formData.dob1} onChange={e => setFormData({...formData, dob1: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
                        </div>
                        {/* Phone */}
                        <div className="booking-cell border-b md:border-r border-white/10 p-3 focus-within:border-cyan-500/50 focus-within:bg-cyan-500/5 transition-all">
                          <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Phone Number *</label>
                          <input type="tel" required placeholder="(555) 123-4567" value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhoneDisplay(e.target.value)})} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
                        </div>
                        {/* Email */}
                        <div className="booking-cell border-b border-white/10 p-3 focus-within:border-cyan-500/50 focus-within:bg-cyan-500/5 transition-all">
                          <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Email Address *</label>
                          <input type="email" required placeholder="name@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
                        </div>
                        {/* T-Shirt Size */}
                        <div className="booking-cell md:border-r border-white/10 p-3 focus-within:border-cyan-500/50 focus-within:bg-cyan-500/5 transition-all relative">
                          <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">T-Shirt Size</label>
                          <select value={formData.tshirtSize1} onChange={e => setFormData({...formData, tshirtSize1: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer appearance-none">
                            {["S", "M", "L", "XL", "XXL", "3XL"].map(sz => <option key={sz} value={sz} className="bg-[#0b0b12] text-white">{sz}</option>)}
                          </select>
                        </div>
                        {/* Crown & Anchor */}
                        <div className="booking-cell p-3 focus-within:border-cyan-500/50 focus-within:bg-cyan-500/5 transition-all">
                          <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Crown & Anchor Number (if applicable)</label>
                          <input type="text" placeholder="Loyalty Number" value={formData.crownAnchor1} onChange={e => setFormData({...formData, crownAnchor1: e.target.value})} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
                        </div>
                      </div>

                      {/* Customization toggles mirroring the Guest 1 page elements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-white/10">
                        <div className="booking-cell border-b md:border-b-0 md:border-r border-white/10 p-3 flex flex-col justify-between">
                          <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-2">Do you want travel protection insurance? *</label>
                          <div className="flex gap-2">
                            {["yes", "no"].map(opt => (
                              <button key={opt} type="button" onClick={() => setFormData(f => ({...f, insurance: opt}))}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${formData.insurance === opt ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400" : "bg-white/5 border-white/5 text-white/40"}`}>
                                {opt === "yes" ? "Yes, Protect" : "No, Decline"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="booking-cell p-3 flex flex-col justify-between">
                          <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-2">Do you want pre-paid gratuities? *</label>
                          <div className="flex gap-2">
                            {["yes", "no"].map(opt => (
                              <button key={opt} type="button" onClick={() => setFormData(f => ({...f, prepaidGratuities: opt}))}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${formData.prepaidGratuities === opt ? "bg-[var(--color-accent)]/20 border-[var(--color-accent)]/30 text-[var(--color-accent)]" : "bg-white/5 border-white/5 text-white/40"}`}>
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
                        <div key={i} className={`booking-section-container border-b border-white/10 transition-all duration-300 ${g.active ? "bg-white/[0.01] opacity-100" : "bg-black/10 opacity-50 print:booking-inactive"}`}>
                          {/* Section Header with checkbox activator */}
                          <div className="booking-section-header bg-white/[0.02] px-4 py-2.5 border-b border-white/10 flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              id={`guest-active-${guestNum}`} 
                              checked={g.active} 
                              onChange={e => toggleGuestActive(i, e.target.checked)} 
                              className="no-print w-4 h-4 rounded border-white/20 bg-white/5 accent-cyan-400 cursor-pointer" 
                            />
                            <label htmlFor={`guest-active-${guestNum}`} className="text-xs font-black uppercase tracking-wider text-white cursor-pointer select-none">
                              Include Guest {guestNum} in Cabin Reservation
                            </label>
                          </div>

                          {g.active ? (
                            <div className="booking-grid grid grid-cols-1 md:grid-cols-2">
                              {/* Name */}
                              <div className="booking-cell border-b md:border-r border-white/10 p-3 focus-within:border-cyan-500/50 focus-within:bg-cyan-500/5 transition-all">
                                <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Full Legal Name (as spelled on passport) *</label>
                                <input type="text" required placeholder={`Guest ${guestNum} Name`} value={g.name} onChange={e => updateGuest(i, "name", e.target.value)} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
                              </div>
                              {/* DOB */}
                              <div className="booking-cell border-b border-white/10 p-3 focus-within:border-cyan-500/50 focus-within:bg-cyan-500/5 transition-all">
                                <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Date of Birth *</label>
                                <input type="text" required placeholder="MM/DD/YYYY" value={g.dob} onChange={e => updateGuest(i, "dob", e.target.value)} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
                              </div>
                              {/* Phone */}
                              <div className="booking-cell border-b md:border-r border-white/10 p-3 focus-within:border-cyan-500/50 focus-within:bg-cyan-500/5 transition-all">
                                <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Phone Number (Optional)</label>
                                <input type="tel" placeholder="(555) 123-4567" value={g.phone} onChange={e => updateGuest(i, "phone", formatPhoneDisplay(e.target.value))} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
                              </div>
                              {/* Email */}
                              <div className="booking-cell border-b border-white/10 p-3 focus-within:border-cyan-500/50 focus-within:bg-cyan-500/5 transition-all">
                                <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Email Address (Optional)</label>
                                <input type="email" placeholder="name@example.com" value={g.email} onChange={e => updateGuest(i, "email", e.target.value)} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
                              </div>
                              {/* T-Shirt Size */}
                              <div className="booking-cell md:border-r border-white/10 p-3 focus-within:border-cyan-500/50 focus-within:bg-cyan-500/5 transition-all relative">
                                <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">T-Shirt Size</label>
                                <select value={g.tshirtSize} onChange={e => updateGuest(i, "tshirtSize", e.target.value)} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer appearance-none">
                                  {["S", "M", "L", "XL", "XXL", "3XL"].map(sz => <option key={sz} value={sz} className="bg-[#0b0b12] text-white">{sz}</option>)}
                                </select>
                              </div>
                              {/* Crown & Anchor */}
                              <div className="booking-cell p-3 focus-within:border-cyan-500/50 focus-within:bg-cyan-500/5 transition-all">
                                <label className="booking-label block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Crown & Anchor Number (if applicable)</label>
                                <input type="text" placeholder="Loyalty Number" value={g.crownAnchor} onChange={e => updateGuest(i, "crownAnchor", e.target.value)} className="booking-input w-full bg-transparent text-sm text-white focus:outline-none" />
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
                            <option value="prev_yo" className="bg-[#0b0b12]">YO - Ocean View GTY ($1,691.27 pp)</option>
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
              )}
            </div>

            {/* Sidebar Column */}
            <div className="flex flex-col gap-6">
              {/* How it works */}
              <div className="p-5 bg-white/[0.04] backdrop-blur-md border border-white/[0.1] rounded-2xl text-left">
                <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-3">Booking Process</p>
                <div className="space-y-4">
                  {[
                    "Fill out guest names, DOBs, and t-shirt sizes",
                    "Enter deposit payment card details ($250/pp)",
                    "Submit booking request to lock in group rates",
                    "Receive confirmation email & access the Passenger Lounge"
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center text-2xs font-black text-[var(--color-accent)] shrink-0">{i+1}</span>
                      <p className="text-xs text-white/50 leading-normal">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Portal Card */}
              <div className="p-5 rounded-2xl bg-purple-950/15 border border-purple-500/20 text-left">
                <h4 className="text-xs font-black uppercase text-white tracking-wider mb-1">Already Booked?</h4>
                <p className="text-2xs text-white/45 leading-relaxed mb-4">
                  Need to make a deposit or pay off your cabin balance? Access our secure online payment portal to submit transaction details.
                </p>
                <a 
                  href="/cruise/payment"
                  className="w-full block text-center py-2.5 border border-purple-500/30 hover:border-purple-500/60 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-purple-500/25"
                >
                  Make a Payment
                </a>
              </div>

              {/* Fan Interest Tracker */}
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--color-accent)] mb-1 text-left">Voyage Interest Tracker</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.04] border border-white/[0.1] rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-white">{signupCount}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mt-1">Cabins</p>
                </div>
                <div className="bg-white/[0.04] border border-white/[0.1] rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-white">{totalGuests}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mt-1">Passengers</p>
                </div>
              </div>

              {/* Who's Joined */}
              {joinedFans.length > 0 && (
                <div className="p-5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-left">
                  <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-4">Who&apos;s Booked</p>
                  <div className="flex items-center mb-4">
                    <div className="flex -space-x-2">
                      {joinedFans.slice(0, 8).map((fan, i) => (
                        <div
                          key={i}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-[#0d0d14] shrink-0 relative z-[1] hover:z-10 hover:scale-110 transition-transform cursor-default"
                          style={{ backgroundColor: fan.anonymous ? '#374151' : AVATAR_COLORS[i % AVATAR_COLORS.length], zIndex: 8 - i }}
                          title={fan.anonymous ? 'Anonymous Fan' : fan.name}
                        >
                          {fan.anonymous ? '?' : fan.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {joinedFans.length > 8 && (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white/60 bg-white/10 border-2 border-[#0d0d14] shrink-0">
                          +{joinedFans.length - 8}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                    {joinedFans.map((fan, i) => (
                      <span key={i} className="text-xs text-white/40">
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

      {/* ── OFFICIAL BOOKING DETAILS SECTION ── */}
      <section className="py-20 bg-black/40 border-y border-white/5 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="site-container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-cyan-400 mb-3 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              Official Booking Guide
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              How to Book <span className="accent-gradient-text">& Join Us</span>
            </h2>
            <p className="text-white/45 mt-4 text-sm md:text-base leading-relaxed">
              Ensure you are part of the official 7th Heaven group events, dining, and custom fan activities by reserving through our certified travel partner.
            </p>
          </div>

          {/* Crucial Booking Policy, How To Book, & Cancellation Guides */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 text-left">
            <div className="bg-gradient-to-br from-[#0c051a] to-[#140b28] border border-[var(--color-accent)]/20 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-accent)]/10 rounded-full blur-[80px]" />
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-black uppercase text-white tracking-wide">Crucial Booking Policy</h3>
              </div>
              <p className="text-sm font-black text-amber-400 uppercase tracking-widest mb-4">
                You must be booked through us to participate
              </p>
              <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-6">
                To be part of our events, eat dinner together with the band and fans, and for us to assist you, your reservation <strong>must</strong> be placed under our official group booking.
              </p>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <p className="text-xs text-white/50">
                  📧 <strong>Need help?</strong> <a href="mailto:info@NTDVacations.com" className="text-[var(--color-accent)] hover:text-white underline font-bold transition-all">info@NTDVacations.com</a>
                </p>
                <p className="text-xs text-white/50">
                  💳 <strong>Deposit:</strong> $250 per person to secure your cabin and rate.
                </p>
                <p className="text-xs text-white/50">
                  📅 <strong>Final Payment Deadline:</strong> October 1, 2026.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#050c1a] to-[#0b1428] border border-cyan-500/20 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]" />
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚙️</span>
                <h3 className="text-lg font-black uppercase text-white tracking-wide">How To Book</h3>
              </div>
              <p className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-4">
                Flexible rates, rate matching & price drops
              </p>
              <ul className="space-y-3 text-xs text-white/60 leading-normal">
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span>We book in multiple ways: Group Rate, Prevailing Rate, Sales, and Promotions. We can book any room category available.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span>We match and often beat rates you find elsewhere. We also automatically re-roll your room if prices drop before October 1, 2026!</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><strong>Group Rate Inclusions:</strong> If you book under our group rate cabins, gratuities are fully included.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><strong>GTY (Guarantee) Rooms:</strong> Please note that GTY cabin assignments are made by Royal Caribbean later and may feature obstructed views or poor ship placement.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#100318] to-[#1d0d2b] border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px]" />
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📅</span>
                <h3 className="text-lg font-black uppercase text-white tracking-wide">Cancellation Policy</h3>
              </div>
              <p className="text-sm font-black text-purple-400 uppercase tracking-widest mb-4">
                Understand your refund terms before booking
              </p>
              <div className="space-y-4 text-xs text-white/60 leading-relaxed">
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-2xs mb-1">Group Rate Rooms:</h4>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Cancel before May 12, 2026: <strong>No penalty</strong></li>
                    <li>May 12, 2026 – July 12, 2026: <strong>$50 pp fee</strong></li>
                    <li>July 13, 2026 – Sept 10, 2026: <strong>$100 pp fee</strong></li>
                    <li>Sept 11, 2026 – Nov 10, 2026: <strong>$200 pp fee</strong></li>
                    <li>After Nov 10, 2026: <strong>50% of cabin cost</strong></li>
                    <li>After Dec 10, 2026: <strong>No refund</strong></li>
                    <li><em>No insurance? Future cruise credit option ($100 change fee pp).</em></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-2xs mb-0.5">Prevailing Rate (Refundable):</h4>
                  <p>Cancel by Oct 10, 2026 for no penalty. After Oct 12: lose 25% • After Oct 27: lose 50% • After Nov 10: lose 100%.</p>
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-2xs mb-0.5">Prevailing Rate (Non-Refundable):</h4>
                  <p>Deposit is lost upon cancellation. After Oct 12: lose 25% + deposit • After Oct 27: lose 50% + deposit • After Nov 10: lose 100% + deposit.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── CABIN CATOLOG: GROUP RATES VS PREVAILING RATES ── */}
          <div className="space-y-16">
            {/* GROUP RATES */}
            <div className="bg-[#0b0b12] border border-cyan-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-white/5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">Exclusive Group Deal</span>
                  <h3 className="text-xl md:text-2xl font-black uppercase text-white mt-1">Limited Group Rate Cabins</h3>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-4 py-2.5 max-w-md text-2xs leading-relaxed text-cyan-200/90 font-medium">
                  💡 <strong>ALL-INCLUSIVE:</strong> Prices include Cabin, Gratuities, Taxes, and Port Fees (Based on Double Occupancy).
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { code: "Q2", title: "Interior Plus", price: "$1,683.27", status: "soldout", badge: "Group Rate Sold Out - Book Prevailing", image: "/images/cruise/q2_interior_plus.jpg", icon: "🚪" },
                  { code: "N5", title: "Ocean View", price: "$1,883.27", status: "warning", badge: "1 Cabin Left!", image: "/images/cruise/n5.jpg", icon: "🌊", inclusions: "Gratuities Included" },
                  { code: "IF", title: "Infinite Central Park", price: "$2,033.27", status: "warning", badge: "2 Cabins Left!", image: "/images/cruise/if.jpg", icon: "🌳", inclusions: "Gratuities Included" },
                  { code: "D4", title: "Ocean View Balcony", price: "$2,433.27", status: "info", badge: "10 Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", icon: "🌅", inclusions: "Gratuities Included" },
                  { code: "D2", title: "Ocean View Balcony", price: "$2,483.27", status: "info", badge: "11 Available", image: "/images/cruise/d1_ocean_view_balcony.jpg", icon: "🌅", inclusions: "Gratuities Included" },
                  { code: "I1", title: "Infinite Ocean View Balcony", price: "$2,583.27", status: "warning", badge: "5 Cabins Left!", image: "/images/cruise/i1_infinite_ocean_view_balcony.jpg", icon: "🚢", inclusions: "Gratuities Included" },
                  { code: "IG", title: "Infinite Grand Suite", price: "Prevailing", status: "soldout", badge: "Sold Out - Prevailing Only", image: "/images/cruise/icon_ig_infinite_grand_suite_320x171.jpg", icon: "👑" },
                ].map((room, idx) => (
                  <div key={idx} className={`bg-black/30 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                    room.status === "soldout" ? "border-white/5 opacity-55" :
                    room.status === "warning" ? "border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)] hover:border-amber-500/50" :
                    "border-white/10 hover:border-cyan-500/40"
                  }`}>
                    <div>
                      {room.image && (
                        <div className="relative h-40 w-full overflow-hidden rounded-xl mb-4 border border-white/5">
                          <img src={room.image} alt={room.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="text-2xl">{room.icon}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                          room.status === "soldout" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          room.status === "warning" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        }`}>{room.badge}</span>
                      </div>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{room.code} Category</span>
                      <h4 className="text-base font-extrabold text-white uppercase tracking-tight mt-0.5">{room.title}</h4>
                    </div>

                    <div className="mt-6 border-t border-white/5 pt-4">
                      {room.price === "Prevailing" ? (
                        <p className="text-xs text-white/40 italic font-medium">Prevailing Rates Only</p>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-white">{room.price}</span>
                          <span className="text-2xs text-white/40">USD pp</span>
                        </div>
                      )}
                      {room.inclusions && (
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mt-1">✓ {room.inclusions}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PREVAILING RATES */}
            <div className="bg-[#0b0b12] border border-[var(--color-accent)]/20 rounded-3xl p-6 md:p-8 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-accent)]/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-white/5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-accent)]">Variable Market Pricing</span>
                  <h3 className="text-xl md:text-2xl font-black uppercase text-white mt-1">Prevailing Rate Cabins</h3>
                </div>
                <div className="bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/25 rounded-xl px-4 py-2.5 max-w-md text-2xs leading-relaxed text-purple-200/90 font-medium">
                  ⚠️ <strong>NOTICE:</strong> Gratuities are <strong>NOT included</strong> in rates below (Pre-paid gratuities are $129.50 PP • $147 PP for Suites). Non-refundable deposits.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { code: "ZI", title: "Inside GTY", price: "$1,430.77", label: "Guaranteed Cabin", image: "/images/cruise/q2_interior_plus.jpg", icon: "🚪" },
                  { code: "YO", title: "Ocean View GTY", price: "$1,691.27", label: "Guaranteed Cabin", image: "/images/cruise/n5.jpg", icon: "🌊" },
                  { code: "IF", title: "Infinite Central Park", price: "$1,907.27", label: "Central Park View", image: "/images/cruise/if.jpg", icon: "🌳" },
                  { code: "XB", title: "Oceanview Balcony GTY", price: "$1,903.77", label: "8 Cabins Left!", image: "/images/cruise/d1_ocean_view_balcony.jpg", icon: "🌅", warning: true },
                  { code: "I1", title: "Infinite Ocean View Balcony", price: "$2,237.77", label: "Balcony Access", image: "/images/cruise/i1_infinite_ocean_view_balcony.jpg", icon: "🚢" },
                  { code: "JY", title: "Sky Junior Suite", price: "$5,157.77", label: "Suite Class Luxury", image: "/images/cruise/jy.png", icon: "👑" },
                ].map((room, idx) => (
                  <div key={idx} className={`bg-black/30 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                    room.warning ? "border-amber-500/30 hover:border-amber-500/50" : "border-white/10 hover:border-[var(--color-accent)]/30"
                  }`}>
                    <div>
                      {room.image && (
                        <div className="relative h-40 w-full overflow-hidden rounded-xl mb-4 border border-white/5">
                          <img src={room.image} alt={room.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="text-2xl">{room.icon}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                          room.warning ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse" : "bg-white/5 text-white/40 border border-white/10"
                        }`}>{room.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{room.code} Category</span>
                      <h4 className="text-base font-extrabold text-white uppercase tracking-tight mt-0.5">{room.title}</h4>
                    </div>

                    <div className="mt-6 border-t border-white/5 pt-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-white">{room.price}</span>
                        <span className="text-2xs text-white/40">USD pp</span>
                      </div>
                      <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold block mt-1">Rates as of June 27, 2026</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATEROOM CATEGORIES & SUITE PERKS ── */}
      <section className="py-20 bg-black/20 border-b border-white/5 relative">
        <div className="site-container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-accent)] mb-3 px-4 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
              Accommodations Guide
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-white leading-none" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Stateroom Catalog <span className="text-cyan-400">& Suite Perks</span>
            </h2>
            <p className="text-white/45 mt-4 text-sm md:text-base leading-relaxed">
              Explore the main stateroom layouts available on the Star of the Seas and the exclusive luxury benefits of booking Suite Class.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
            {/* Stateroom Categories Tab Column */}
            <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black uppercase text-white tracking-widest mb-6 border-b border-white/5 pb-3">Stateroom Categories</h3>
                
                <div className="flex flex-col gap-2">
                  {[
                    { id: "suites", title: "Suites", desc: "Ultimate luxury and service" },
                    { id: "balcony", title: "Balcony", desc: "Private outdoor balcony access" },
                    { id: "ocean", title: "Ocean View", desc: "Stunning sea & destination views" },
                    { id: "interior", title: "Interior", desc: "Spacious and comfortable interior" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStateroomTab(tab.id as any)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        stateroomTab === tab.id
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                          : "bg-transparent border-transparent text-white/50 hover:bg-white/[0.02] hover:text-white"
                      }`}
                    >
                      <p className="font-extrabold text-sm uppercase tracking-wider">{tab.title}</p>
                      <p className="text-2xs opacity-85 mt-0.5">{tab.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content list */}
              <div className="mt-8 bg-black/40 border border-white/5 p-4 rounded-2xl">
                {stateroomTab === "suites" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">👑 Star Class Suites</p>
                      <p className="text-xs text-white/70 mt-1">Ultimate Family Townhouse, Royal Loft Suite, Icon Loft Suite</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">⭐ Sky Class Suites</p>
                      <p className="text-xs text-white/70 mt-1">Owner’s Suite, Sunset Corner Suite, Sunset Suite, Infinite Grand Suite, Grand Suite, Panoramic Suite, Sky Junior Suite</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">✨ Sea Class Suites</p>
                      <p className="text-xs text-white/70 mt-1">Sunset Junior Suite, Surfside Family Suite, Junior Suite, Suite/Deluxe Guarantee</p>
                    </div>
                  </div>
                )}
                {stateroomTab === "balcony" && (
                  <div className="space-y-2 text-xs text-white/70">
                    <p>• Infinite Ocean View Balcony</p>
                    <p>• Infinite Family Balcony</p>
                    <p>• Ocean View Balcony</p>
                    <p>• Central Park View Balcony</p>
                    <p>• Surfside Family View Balcony</p>
                  </div>
                )}
                {stateroomTab === "ocean" && (
                  <div className="space-y-2 text-xs text-white/70">
                    <p>• Panoramic Ocean View</p>
                    <p>• Ocean View</p>
                  </div>
                )}
                {stateroomTab === "interior" && (
                  <div className="space-y-2 text-xs text-white/70">
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
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-accent)]">VIP Experiences</span>
                    <h3 className="text-xl md:text-2xl font-black uppercase text-white mt-1">Suite Class Perks</h3>
                  </div>
                  <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                    {(["sea", "sky", "star"] as const).map(perk => (
                      <button
                        key={perk}
                        type="button"
                        onClick={() => setSuiteTab(perk)}
                        className={`px-3.5 py-1.5 rounded-lg text-2xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                          suiteTab === perk
                            ? "bg-[var(--color-accent)] text-white"
                            : "bg-transparent text-white/40 hover:text-white"
                        }`}
                      >
                        {perk} Class
                      </button>
                    ))}
                  </div>
                </div>

                {/* Benefits List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-white/60">
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
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-purple-400 font-extrabold shrink-0">✓</span>
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
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-cyan-400 font-extrabold shrink-0">✓</span>
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
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-amber-400 font-extrabold shrink-0">✓</span>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimers & Notes */}
              <div className="mt-8 border-t border-white/5 pt-4 text-[10px] text-white/30 space-y-1">
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

      {/* ── ITINERARY TIMELINE (Layout N style) ── */}
      <section className="mb-20">
        <div className="site-container mb-10 text-center">
          <h2 className="text-3xl font-black uppercase italic tracking-tight" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Day-by-Day <span className="accent-gradient-text">Schedule</span>
          </h2>
          <div className="flex items-center justify-center gap-5 mt-4 flex-wrap">
            {[{dot:"bg-[var(--color-accent)]",label:"Band"},{dot:"bg-cyan-400",label:"Excursion"},{dot:"bg-emerald-400",label:"Food"},{dot:"bg-white/25",label:"Ship"}].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                <span className="text-2xs font-bold uppercase tracking-widest text-white/30">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        {ITINERARY.map((day, i) => (
          <div key={day.day} className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} min-h-[480px] overflow-hidden`}>
            {/* Photo */}
            <div className="relative lg:w-[42%] h-56 lg:h-auto overflow-hidden">
              <img src={day.photo} alt={day.port} className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700" />
              <div className={`absolute inset-0 bg-gradient-to-${i % 2 === 0 ? "r" : "l"} from-transparent via-black/30 to-[var(--color-bg-primary)]`} />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent lg:hidden" />
              <div className="absolute top-5 left-5 bg-black/65 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10">
                <span className={`text-2xs font-black uppercase tracking-[0.3em] ${ITIN_TYPE_ACCENT[day.type]} block`}>Day {day.day}</span>
                <span className="text-2xl leading-none">{day.icon}</span>
              </div>
            </div>
            {/* Schedule */}
            <div className="flex-1 flex items-stretch px-8 lg:px-14 py-10">
              <div className="w-full max-w-xl mx-auto lg:mx-0">
                <div className="mb-6 pb-5 border-b border-white/[0.06]">
                  <span className={`text-2xs font-black uppercase tracking-[0.3em] ${ITIN_TYPE_ACCENT[day.type]}`}>{day.label}</span>
                  <h3 className="text-[clamp(1.6rem,4vw,2.5rem)] font-black italic uppercase text-white leading-none mt-0.5" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{day.port}</h3>
                </div>
                <div className="relative space-y-0">
                  <div className={`absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b ${ITIN_TYPE_BAR[day.type]} opacity-20`} />
                  {day.schedule.map((item, si) => (
                    <div key={si} className="relative flex items-start gap-4 pb-4 last:pb-0">
                      <div className={`shrink-0 w-4 h-4 rounded-full border-2 border-[var(--color-bg-primary)] mt-0.5 z-10 ${ITIN_CAT_DOT[item.cat]}`} />
                      <span className="shrink-0 text-2xs font-black text-white/20 w-16 pt-1 tabular-nums">{item.time}</span>
                      <span className={`text-sm leading-snug pt-0.5 ${ITIN_CAT_TEXT[item.cat]}`}>{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="site-container mb-20">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-8 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          What&apos;s <span className="accent-gradient-text">Included</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🎸", title: "Multiple Live Shows", desc: "Acoustic sets, full-band concerts, and exclusive jam sessions throughout the cruise." },
            { icon: "🤝", title: "Meet & Greet", desc: "Hang with the band in small groups. Photos, conversations, and fan-only moments." },
            { icon: "🍽️", title: "All Meals Included", desc: "Main dining, buffets, and room service included in your cabin rate." },
            { icon: "🏝️", title: "3 Island Stops", desc: "Cozumel, Grand Cayman, and Roatán with optional group excursions." },
            { icon: "🎉", title: "Exclusive Events", desc: "Sail-away party, sunset deck sessions, and a grand finale after-party." },
            { icon: "💰", title: "Group Rate Pricing", desc: "The more fans who sign up, the better the deal we negotiate for everyone." },
          ].map(item => (
            <div key={item.title} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-[var(--color-accent)]/30 transition-colors">
              <span className="text-2xl block mb-3">{item.icon}</span>
              <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
              <p className="text-sm text-white/35 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="site-container mb-16 pb-16">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-8 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Questions? <span className="accent-gradient-text">Answers.</span>
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors cursor-pointer">
                <span className="font-bold text-base text-white pr-4">{faq.q}</span>
                <span className={`text-white/30 text-lg transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-base text-white/40 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CRUISE COMMUNITY CTA ── */}
      <section className="site-container mb-16 pb-16">
        <div className="relative p-10 md:p-16 rounded-[2.5rem] overflow-hidden text-center bg-[#0d0d14] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
          <div className="absolute inset-0 opacity-10">
            <img src="/images/cruise-hero.png" alt="" className="w-full h-full object-cover grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/40 to-transparent" />
          </div>
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-widest mb-6">Authenticated Experience</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tight mb-4" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              The Cruise <span className="text-cyan-400">Community</span>
            </h2>
            <p className="text-white/50 text-base max-w-xl mx-auto mb-10 leading-relaxed">
              Don&apos;t just book — belong. Join the private hub for cruise attendees to vote on setlists, view deck maps, and meet other fans before we set sail.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#signup" className="px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#0d0d14] font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20">Join the Community</a>
              <a href="/cruise/dashboard" className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm rounded-xl border border-cyan-500/30 hover:border-cyan-500/60 transition-all">Passenger Lounge</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
