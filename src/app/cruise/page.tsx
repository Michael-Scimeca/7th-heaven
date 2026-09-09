/* eslint-disable react-doctor/jsx-max-depth */
/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */
import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTransition } from "@/context/TransitionContext";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/context/MemberContext";
import { formatPhoneDisplay } from "@/lib/validation";
import { useHeroParallax } from "@/lib/useHeroParallax";
import { SectionBadge } from "@/components/SectionBadge";
import InputField from "@/components/InputField";
import SquishyToggle from "@/components/SquishyToggle";
import Dropdown from "@/components/Dropdown";
import FoolishShrimpButton from "@/components/FoolishShrimpButton";
import dynamic from "next/dynamic";
import LazyMount from "@/components/LazyMount";

import CruiseHeroSection from "./components/CruiseHeroSection";

const CruiseCabinsPricingSection = dynamic(() => import("./components/CruiseCabinsPricingSection"), { ssr: false });
const CruisePortsCatalogSection = dynamic(() => import("./components/CruisePortsCatalogSection"), { ssr: false });
const CruiseShipExplorerSection = dynamic(() => import("./components/CruiseShipExplorerSection"), { ssr: false });
const CruiseFaqSection = dynamic(() => import("./components/CruiseFaqSection"), { ssr: false });

export default function CruisePage() {
  const supabase = createClient();
  const { requestTransition } = useTransition();
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

  const heroForegroundRef = useRef<HTMLDivElement>(null);
  const heroParallax = useHeroParallax({
    mediaRef: heroVideoRef,
    foregroundRef: heroForegroundRef,
    triggerSelector: "#cruise-hero",
    enabled: false,
  });

  const transitionDone = true;

  const [signupStatus, setSignupStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState(() => {
    const defaults = {
      name: "", email: "", phone: "", notes: "", anonymous: false,
      joinCommunity: true, cruiseNotifications: true, website: "", guestCount: 1, cabinPreference: "",
      dob1: "", crownAnchor1: "", tshirtSize1: "L",
      cardName1: "", cardNumber1: "", cardExpiry1: "", cardCvv1: "", cardZip1: "", cardAmount1: "250.00",
      cardName2: "", cardNumber2: "", cardExpiry2: "", cardCvv2: "", cardZip2: "", cardAmount2: "250.00",
      splitPayment: false,
      insurance: "no", prepaidGratuities: "yes", howHeard: "7th Heaven"
    };
    if (typeof window === "undefined") return defaults;
    try {
      const saved = localStorage.getItem("7h_cruise_cabin_draft_v1") || localStorage.getItem("7h_cruise_cabin_draft");
      if (saved) {
        return { ...defaults, ...JSON.parse(saved) };
      }
    } catch { }
    return defaults;
  });

  useEffect(() => {
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        window.dispatchEvent(new CustomEvent("7h:page:ready"));
      });
    } else {
      window.dispatchEvent(new CustomEvent("7h:page:ready"));
    }
  }, []);

  // Debounced auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
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
    }, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleSelectCabin = (selectVal?: string) => {
    if (selectVal) {
      setFormData((f: any) => ({ ...f, cabinPreference: selectVal }));
    }
    const target = document.getElementById("signup") || document.getElementById("book-now");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

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
    { active: false, name: "", email: "", phone: "", age: "", type: "adult", dob: "", crownAnchor: "", tshirtSize: "L" },
    { active: false, name: "", email: "", phone: "", age: "", type: "adult", dob: "", crownAnchor: "", tshirtSize: "L" },
    { active: false, name: "", email: "", phone: "", age: "", type: "adult", dob: "", crownAnchor: "", tshirtSize: "L" }
  ]);

  const [signature, setSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState("");

  const toggleGuestActive = (index: number, active: boolean) => {
    setGuests(prev => prev.map((g, i) => i === index ? { ...g, active } : g));
  };

  const updateGuest = (index: number, field: string, value: any) => {
    setGuests(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g));
  };

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

  useEffect(() => {
    if (isLoggedIn && member) {
      setFormData((prev: any) => ({
        ...prev,
        name: member.name || prev.name,
        email: member.email || prev.email,
        phone: prev.phone || "",
      }));
    }
  }, [isLoggedIn, member]);

  useEffect(() => {
    setFormData((prev: any) => {
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
    if (formData.website) return;
    setFormError('');

    if (!formData.name.trim()) { setFormError("Please enter Guest 1's full legal name."); return; }
    if (!formData.email.trim()) { setFormError("Please enter Guest 1's email address."); return; }
    if (!formData.phone.trim()) { setFormError("Please enter Guest 1's phone number."); return; }
    if (!signature.trim()) { setFormError("Please type your name in the E-Signature field."); return; }

    const activeGuests = guests.filter(g => g.active);
    for (let i = 0; i < activeGuests.length; i++) {
      if (!activeGuests[i].name.trim()) {
        setFormError(`Please enter Guest ${i + 2}'s full legal name.`);
        return;
      }
    }

    setSignupStatus("submitting");

    try {
      const totalPartyCount = 1 + activeGuests.length;
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes,
        anonymous: formData.anonymous,
        guest_count: totalPartyCount,
        cabin_preference: formData.cabinPreference || "group_n5",
        join_community: formData.joinCommunity,
        cruise_notifications: formData.cruiseNotifications,
        guests_json: [
          { name: formData.name, email: formData.email, phone: formData.phone, dob: formData.dob1, tshirt: formData.tshirtSize1, crown_anchor: formData.crownAnchor1, type: "primary" },
          ...activeGuests.map(g => ({ name: g.name, email: g.email, phone: g.phone, dob: g.dob, tshirt: g.tshirtSize, crown_anchor: g.crownAnchor, type: g.type }))
        ],
        insurance: formData.insurance,
        prepaid_gratuities: formData.prepaidGratuities,
        how_heard: formData.howHeard,
        signature: signature,
        signature_date: signatureDate,
        payment_split: formData.splitPayment,
        card1_amount: formData.cardAmount1,
        card2_amount: formData.splitPayment ? formData.cardAmount2 : "0.00"
      };

      const res = await fetch('/api/cruise/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to process booking.');
      }

      setSignupStatus("success");
      fetchCount();
      localStorage.removeItem("7h_cruise_cabin_draft_v1");
    } catch (err: any) {
      setSignupStatus("error");
      setFormError(err.message || 'Network error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white pt-[100px]">
      {/* SECTION 1: HERO */}
      <CruiseHeroSection
        heroVideoRef={heroVideoRef}
        heroForegroundRef={heroForegroundRef}
        heroMaskSettings={heroMaskSettings}
        heroVideoReady={heroVideoReady}
        setHeroVideoReady={setHeroVideoReady}
        heroParallax={heroParallax}
        setIsPaymentDropdownOpen={setIsPaymentDropdownOpen}
      />

      {transitionDone && (
        <>
          {/* SECTION 2: CABINS & PRICING */}
          <LazyMount minHeight="800px" rootMargin="300px 0px">
            <CruiseCabinsPricingSection
              handleSelectCabin={handleSelectCabin}
              handleSignup={handleSignup}
              formData={formData}
              setFormData={setFormData}
              guests={guests}
              toggleGuestActive={toggleGuestActive}
              updateGuest={updateGuest}
              signature={signature}
              setSignature={setSignature}
              signatureDate={signatureDate}
              signupStatus={signupStatus}
              formError={formError}
              isPaymentDropdownOpen={isPaymentDropdownOpen}
              setIsPaymentDropdownOpen={setIsPaymentDropdownOpen}
              signupCount={signupCount}
              totalGuests={totalGuests}
              joinedFans={joinedFans}
              CruiseCard1Section={CruiseCard1Section}
              CruiseCard2Section={CruiseCard2Section}
              CruiseNotesAndSignatureSection={CruiseNotesAndSignatureSection}
              PaymentPortalDropdownPanel={PaymentPortalDropdownPanel}
            />
          </LazyMount>

          {/* SECTION 3: PORTS OF CALL CATALOG */}
          <LazyMount minHeight="600px" rootMargin="300px 0px">
            <CruisePortsCatalogSection />
          </LazyMount>
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
            <input id="cruise-card-name-1" type="text" required placeholder="Name on Card" value={formData.cardName1} onChange={e => setFormData({ ...formData, cardName1: e.target.value })} className="booking-input w-full bg-black/50 border border-white/10 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
          </div>
        </div>
        <div className="booking-cell pb-4 pt-4">
          <label htmlFor="cruise-card-number-1" className="booking-label block font-bold text-white uppercase mb-1.5">Credit Card Number *</label>
          <div className="input-glow-border rounded-xl">
            <input id="cruise-card-number-1" type="text" required placeholder="Credit Card Number" value={formData.cardNumber1} onChange={e => setFormData({ ...formData, cardNumber1: e.target.value })} className="booking-input w-full bg-black/50 border border-white/10 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
          </div>
        </div>
        <div className="booking-cell pb-4 pt-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="cruise-card-exp-1" className="booking-label block font-bold text-white uppercase mb-1.5">Exp. Date *</label>
              <div className="input-glow-border rounded-xl">
                <input id="cruise-card-exp-1" type="text" required placeholder="MM/YY" value={formData.cardExpiry1} onChange={e => setFormData({ ...formData, cardExpiry1: e.target.value })} className="booking-input w-full bg-black/50 border border-white/10 px-3 py-2.5 text-base font-semibold text-white text-center placeholder:text-white/40 focus:outline-none rounded-lg" />
              </div>
            </div>
            <div>
              <label htmlFor="cruise-card-cvv-1" className="booking-label block font-bold text-white uppercase mb-1.5">3 Digit CVC *</label>
              <div className="input-glow-border rounded-xl">
                <input id="cruise-card-cvv-1" type="text" required placeholder="CVC" value={formData.cardCvv1} onChange={e => setFormData({ ...formData, cardCvv1: e.target.value })} className="booking-input w-full bg-black/50 border border-white/10 px-3 py-2.5 text-base font-semibold text-white text-center placeholder:text-white/40 focus:outline-none rounded-lg" />
              </div>
            </div>
            <div>
              <label htmlFor="cruise-card-zip-1" className="booking-label block font-bold text-white uppercase mb-1.5">Billing Zip *</label>
              <div className="input-glow-border rounded-xl">
                <input id="cruise-card-zip-1" type="text" required placeholder="Zip" value={formData.cardZip1} onChange={e => setFormData({ ...formData, cardZip1: e.target.value })} className="booking-input w-full bg-black/50 border border-white/10 px-3 py-2.5 text-base font-semibold text-white text-center placeholder:text-white/40 focus:outline-none rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <div className="booking-cell pb-4 pt-4">
          <label htmlFor="cruise-card-amount-1" className="booking-label block font-bold text-white uppercase mb-1.5">Amount to Charge ($ USD)</label>
          <div className="input-glow-border rounded-xl">
            <input id="cruise-card-amount-1" type="text" required value={formData.cardAmount1} onChange={e => setFormData({ ...formData, cardAmount1: e.target.value })} className="booking-input w-full bg-black/50 border border-white/10 px-3.5 py-2.5 text-base font-bold text-purple-300 focus:outline-none rounded-lg" />
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
            <input id="cruise-card-name-2" type="text" required placeholder="Name on Card" value={formData.cardName2} onChange={e => setFormData({ ...formData, cardName2: e.target.value })} className="booking-input w-full bg-black/50 border border-white/10 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
          </div>
        </div>
        <div className="booking-cell p-4">
          <label htmlFor="cruise-card-number-2" className="booking-label block font-bold text-white uppercase mb-1.5">Credit Card Number *</label>
          <div className="input-glow-border rounded-xl">
            <input id="cruise-card-number-2" type="text" required placeholder="Credit Card Number" value={formData.cardNumber2} onChange={e => setFormData({ ...formData, cardNumber2: e.target.value })} className="booking-input w-full bg-black/50 border border-white/10 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
          </div>
        </div>
        <div className="booking-cell p-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="cruise-card-exp-2" className="booking-label block font-bold text-white uppercase mb-1.5">Exp. Date *</label>
              <div className="input-glow-border rounded-xl">
                <input id="cruise-card-exp-2" type="text" required placeholder="MM/YY" value={formData.cardExpiry2} onChange={e => setFormData({ ...formData, cardExpiry2: e.target.value })} className="booking-input w-full bg-black/50 border border-white/10 px-3 py-2.5 text-base font-semibold text-white text-center placeholder:text-white/40 focus:outline-none rounded-lg" />
              </div>
            </div>
            <div>
              <label htmlFor="cruise-card-cvv-2" className="booking-label block font-bold text-white uppercase mb-1.5">3 Digit CVC *</label>
              <div className="input-glow-border rounded-xl">
                <input id="cruise-card-cvv-2" type="text" required placeholder="CVC" value={formData.cardCvv2} onChange={e => setFormData({ ...formData, cardCvv2: e.target.value })} className="booking-input w-full bg-black/50 border border-white/10 px-3 py-2.5 text-base font-semibold text-white text-center placeholder:text-white/40 focus:outline-none rounded-lg" />
              </div>
            </div>
            <div>
              <label htmlFor="cruise-card-zip-2" className="booking-label block font-bold text-white uppercase mb-1.5">Billing Zip *</label>
              <div className="input-glow-border rounded-xl">
                <input id="cruise-card-zip-2" type="text" required placeholder="Zip" value={formData.cardZip2} onChange={e => setFormData({ ...formData, cardZip2: e.target.value })} className="booking-input w-full bg-black/50 border border-white/10 px-3 py-2.5 text-base font-semibold text-white text-center placeholder:text-white/40 focus:outline-none rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <div className="booking-cell p-4">
          <label htmlFor="cruise-card-amount-2" className="booking-label block font-bold text-white uppercase mb-1.5">Amount to Charge ($ USD)</label>
          <div className="input-glow-border rounded-xl">
            <input id="cruise-card-amount-2" type="text" required value={formData.cardAmount2} onChange={e => setFormData({ ...formData, cardAmount2: e.target.value })} className="booking-input w-full bg-black/50 border border-white/10 px-3.5 py-2.5 text-base font-bold text-purple-300 focus:outline-none rounded-lg" />
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
        <span className="font-bold uppercase text-white">ADDITIONAL NOTES &amp; DIGITAL SIGNATURE</span>
      </div>

      <div className="py-3 border-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col justify-start">
            <label htmlFor="cruise-how-heard" className="booking-label block font-bold text-white uppercase mb-1.5">How Did You Hear About Us? (Which Band?)</label>
            <div className="input-glow-border rounded-xl">
              <input id="cruise-how-heard" type="text" required placeholder="e.g. 7th Heaven" value={formData.howHeard} onChange={e => setFormData(f => ({ ...f, howHeard: e.target.value }))} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col justify-start">
            <label htmlFor="cruise-dining-requests" className="booking-label block font-bold text-white uppercase mb-1.5">Dining Requests, Special Occasion, or Custom Details</label>
            <div className="input-glow-border rounded-xl">
              <textarea id="cruise-dining-requests" placeholder="e.g. Early seating dinner, celebrating 10th anniversary" value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} rows={2} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none resize-none rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="booking-grid grid grid-cols-1 md:grid-cols-2 border-0 items-start gap-4 mt-2">
        <div className="booking-cell border-0 py-3 px-0 flex flex-col justify-start">
          <label htmlFor="cruise-e-signature" className="booking-label block font-bold text-white uppercase mb-1.5">Date &amp; E-Signature (Type full name to sign) *</label>
          <div className="input-glow-border rounded-xl">
            <input
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
        <div className="booking-cell border-0 py-3 px-0 flex flex-col justify-start">
          <span className="booking-label block font-bold text-white uppercase mb-1.5">Date Signed</span>
          <div className="input-glow-border rounded-xl">
            <input type="text" readOnly value={signatureDate} className="booking-input w-full bg-black/50 border-0 px-3.5 py-2.5 text-base font-semibold text-white/80 focus:outline-none cursor-not-allowed rounded-lg" />
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
    setIsSubmitting(false);
    setSubmittedRef(`PAY-7H-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  return (
    <div className="mt-4 w-full text-left text-white animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-5 border-b border-white/10 pb-3">
        <div>
          <h3 className="font-bold uppercase text-white">MAKE A PAYMENT</h3>
          <p className="text-white/60 mt-0.5">Group ID: 3325680 · Official Travel Agency: NTD Vacations</p>
        </div>
      </div>

      {submittedRef ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h3 className="text-xl font-bold text-white">Payment Authorized!</h3>
          <p className="text-white/80 text-xs max-w-xs mx-auto">
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
            <InputField
              id="pay-booking-number"
              label="Booking Number"
              required
              type="text"
              placeholder="Enter Booking Number"
              value={payForm.bookingNumber}
              onChange={(e) => setPayForm({ ...payForm, bookingNumber: e.target.value })}
            />
            <InputField
              id="pay-email"
              label="Email Address"
              required
              type="email"
              placeholder="your@email.com"
              value={payForm.email}
              onChange={(e) => setPayForm({ ...payForm, email: e.target.value })}
            />
            <InputField
              id="pay-phone"
              label="Cell Phone"
              required
              type="tel"
              placeholder="(555) 000-0000"
              value={payForm.phone}
              onChange={(e) => setPayForm({ ...payForm, phone: formatPhoneDisplay(e.target.value) })}
            />
            <InputField
              id="pay-card-name"
              label="Your Name on Credit Card"
              required
              type="text"
              placeholder="Name on Credit Card"
              value={payForm.cardName}
              onChange={(e) => setPayForm({ ...payForm, cardName: e.target.value })}
            />
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
            <span className="text-[10px] text-white/50">
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
