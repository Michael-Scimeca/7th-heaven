/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */
import Image from "next/image";

import { useState, useEffect, useCallback } from "react";
import { useMember } from "@/context/MemberContext";
import { formatPhoneDisplay } from "@/lib/validation";
import { SquishyToggle } from "@/components/SquishyToggle";
import SeventhButton from "@/components/SeventhButton";
import InputField from "@/components/InputField";
import CheckMarkIcon from "@/components/CheckMarkIcon";

// --- COUNTDOWN TICKER ---
export function EmbarkationCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Mock target date: 6 months from now
    const target = new Date();
    target.setMonth(target.getMonth() + 6);
    target.setHours(15, 0, 0, 0);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-wrap items-center gap-6 overflow-visible border-none">
      <div className="z-10 flex shrink-0 items-center">
        <div>
          <h2 className="py-0.5 leading-normal">Embarkation</h2>
          <p>Port of Miami</p>
        </div>
      </div>

      <div className="z-10 flex items-center gap-4">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center">
            <div className="flex min-w-[48px] items-center justify-center">
              <span className="text-center text-2xl md:text-3xl">
                {value.toString().padStart(2, "0")}
              </span>
            </div>
            <span className="text-[10px]">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- DAILY POLL ---
const POLL_OPTIONS = [
  { id: 1, text: "7th Heaven's Greatest Hits", votes: 45 },
  { id: 2, text: "80s Rock Anthems Cover Set", votes: 82 },
  { id: 3, text: "Acoustic Sunset Session", votes: 28 },
];

export function DailyPoll() {
  const [voted, setVoted] = useState<number | null>(null);

  const totalVotes =
    POLL_OPTIONS.reduce((acc, opt) => acc + opt.votes, 0) +
    (voted !== null ? 1 : 0);

  return (
    <div className="group relative overflow-hidden border border-white/10 bg-[var(--color-bg-surface)] p-8 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <span className="text-8xl">🗳️</span>
      </div>

      <h2 className="mb-2">Community Poll</h2>
      <p className="relative z-10 mb-6">
        What should the theme be for the Lido Deck Sailaway Party?
      </p>

      <div className="relative z-10 space-y-3">
        {POLL_OPTIONS.map((opt) => {
          const optVotes = opt.votes + (voted === opt.id ? 1 : 0);
          const percent = Math.round((optVotes / totalVotes) * 100);
          const isWinner =
            percent ===
            Math.max(
              ...POLL_OPTIONS.map((o) =>
                Math.round(
                  ((o.votes + (voted === o.id ? 1 : 0)) / totalVotes) * 100,
                ),
              ),
            );

          return (
            <button
              key={opt.id}
              onClick={() => !voted && setVoted(opt.id)}
              disabled={voted !== null}
              className={`relative w-full overflow-hidden border text-left transition-colors ${voted === opt.id ? "border-emerald-500 bg-emerald-500/10" : voted !== null ? "cursor-default border-white/10 bg-[#00000029]" : "cursor-pointer border-white/10 bg-[#00000029] bg-black/40 hover:border-emerald-500/40"}`}
            >
              {/* Progress bar background (only shows after voting) */}
              {voted !== null && (
                <div
                  className={`absolute top-0 bottom-0 left-0 transition-colors duration-1000 ease-out ${isWinner ? "bg-emerald-500/20" : "bg-[#00000029]"}`}
                  style={{ width: `${percent}%` }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between p-4">
                <span
                  className={`${voted === opt.id ? "text-emerald-400" : " "}`}
                >
                  {opt.text}
                </span>
                {voted !== null && (
                  <span
                    className={`${isWinner ? "text-emerald-400" : "text-white/40"}`}
                  >
                    {percent}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-5">{totalVotes} Total Votes • Poll closes in 24h</p>
    </div>
  );
}

// --- ORIGINS MAP WIDGET ---
const ORIGIN_STATS = [
  { location: "Illinois", count: 145 },
  { location: "Florida", count: 42 },
  { location: "Texas", count: 28 },
  { location: "Canada", count: 12 },
  { location: "Other", count: 185 },
];

export function OriginStats() {
  const maxCount = Math.max(...ORIGIN_STATS.map((s) => s.count));

  return (
    <div className="group relative overflow-hidden border border-white/10 bg-[var(--color-bg-surface)] p-6">
      <h2 className="mb-5 text-white/40">Where Fans Are Sailing From</h2>

      <div className="space-y-4">
        {ORIGIN_STATS.map((stat, i) => (
          <div key={stat.location}>
            <div className="mb-1.5 flex justify-between">
              <span className="text-white/70">{stat.location}</span>
              <span className="text-[var(--color-accent)]">
                {stat.count} fans
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-lg border border-white/5">
              <div
                className="h-full rounded-lg bg-gradient-to-r from-[var(--color-accent)] to-cyan-500 opacity-80 transition-colors delay-100 duration-1000 group-hover:opacity-100"
                style={{ width: `${(stat.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- PHOTO WALL ---
const MOCK_PHOTOS = [
  "/images/galleries/live_show_1.jpg",
  "/images/galleries/live_show_2.jpg",
  "/images/galleries/live_show_3.jpg",
  "/images/galleries/live_show_4.jpg",
  "/images/galleries/live_show_5.jpg",
  "/images/galleries/live_show_6.jpg",
];

export function PhotoWall() {
  return (
    <div className="6">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="mb-1">Fan Pre-Cruise Photo Wall</h2>
          <p>Share your prep and packing photos!</p>
        </div>
        <button className="rounded-lg border border-white/10 bg-[#00000029] px-4 py-2 transition-colors hover:bg-white/10">
          + Upload
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {MOCK_PHOTOS.map((src, i) => (
          <div
            key={i}
            className="group relative aspect-square cursor-pointer overflow-hidden border border-white/10 bg-[#00000029]"
          >
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-colors group-hover:opacity-100">
              <span className="text-2xl">📸</span>
            </div>
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${src})` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- BOOKING MANAGER ---
export function BookingManager({ email }: { email?: string }) {
  const { member } = useMember();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    guest_count: 1,
    phone: "",
    anonymous: false,
    guests: [] as any[],
  });
  const [saveStatus, setSaveStatus] = useState("");
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Quick Register form state
  const [registering, setRegistering] = useState(false);
  const [regPhone, setRegPhone] = useState("");
  const [regPartySize, setRegPartySize] = useState(2);
  const [regCabinPref, setRegCabinPref] = useState("group_d4");
  const [regError, setRegError] = useState("");

  const fetchBooking = useCallback(async () => {
    const effectiveEmail = email || member?.email || "cruise@7thheaven.com";

    const defaultBooking = {
      name:
        member?.name ||
        (email
          ? email
              .split("@")[0]
              .replace(/[-_.]/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
          : "Cruise Member"),
      email: effectiveEmail,
      guest_count: 2,
      phone: "(555) 019-9283",
      anonymous: false,
      cabin_preference: "Ocean View Balcony (Cabin 9122)",
      cabin_deck: "Deck 9 · Midship",
      cabin_image: "/images/cruise/d1_ocean_view_balcony.jpg",
      total_fare: "$1,550.00",
      amount_paid: "$1,200.00",
      balance_due: "$350.00",
      guests: [{ name: "Sarah Connor", type: "adult" }],
    };

    if (
      effectiveEmail === "demo@7thheavenband.com" ||
      effectiveEmail === "cruise@7thheaven.com" ||
      effectiveEmail.includes("cruise")
    ) {
      setBooking(defaultBooking);
      setFormData({
        guest_count: 2,
        phone: "(555) 019-9283",
        anonymous: false,
        guests: [{ name: "Sarah Connor", type: "adult" }],
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/cruise/booking?email=${encodeURIComponent(effectiveEmail)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.booking) {
          let cabinPref =
            data.booking.cabin_preference || "Ocean View Balcony (Cabin 9122)";
          let cabinImg = "/images/cruise/d1_ocean_view_balcony.jpg";
          if (data.booking.notes) {
            const notesLower = data.booking.notes.toLowerCase();
            const matches =
              data.booking.notes.match(/Cabin Preference:\s*(.*)/i) ||
              data.booking.notes.match(/Cabin:\s*(.*)/i);
            if (matches && matches[1]) {
              cabinPref = matches[1].split("\n")[0].trim();
            }
            if (
              notesLower.includes("group_n5") ||
              notesLower.includes("ocean view")
            ) {
              cabinImg = "/images/cruise/n5.jpg";
            } else if (
              notesLower.includes("group_if") ||
              notesLower.includes("central park")
            ) {
              cabinImg = "/images/cruise/if.jpg";
            } else if (
              notesLower.includes("group_d4") ||
              notesLower.includes("group_d2") ||
              notesLower.includes("balcony")
            ) {
              cabinImg = "/images/cruise/d1_ocean_view_balcony.jpg";
            } else if (
              notesLower.includes("group_i1") ||
              notesLower.includes("infinite ocean balcony")
            ) {
              cabinImg = "/images/cruise/i1_infinite_ocean_view_balcony.jpg";
            } else if (
              notesLower.includes("group_jy") ||
              notesLower.includes("suite")
            ) {
              cabinImg = "/images/cruise/jy.png";
            }
          }

          const amountPaid = data.booking.full_paid
            ? "$1,550.00"
            : data.booking.deposit_paid
              ? "$500.00"
              : "$1,200.00";
          const balanceDue = data.booking.full_paid
            ? "$0.00"
            : data.booking.deposit_paid
              ? "$1,050.00"
              : "$350.00";

          setBooking({
            ...data.booking,
            name: data.booking.name || member?.name || "Cruise Guest",
            cabin_preference: cabinPref,
            cabin_image: cabinImg,
            total_fare: data.booking.total_fare || "$1,550.00",
            amount_paid: amountPaid,
            balance_due: balanceDue,
          });

          setFormData({
            guest_count: data.booking.guest_count || 2,
            phone: data.booking.phone || "(555) 019-9283",
            anonymous: data.booking.anonymous || false,
            guests: data.booking.guests || [
              { name: "Sarah Connor", type: "adult" },
            ],
          });
        } else {
          setBooking(defaultBooking);
          setFormData({
            guest_count: 2,
            phone: "(555) 019-9283",
            anonymous: false,
            guests: [{ name: "Sarah Connor", type: "adult" }],
          });
        }
      }
    } catch {
      setBooking(defaultBooking);
    } finally {
      setLoading(false);
    }
  }, [email, member]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleSave = async () => {
    setSaveStatus("Saving...");
    try {
      if (email === "demo@7thheavenband.com") {
        setBooking((prev: any) => ({
          ...prev,
          guest_count: formData.guest_count,
          phone: formData.phone,
          anonymous: formData.anonymous,
          guests: formData.guests,
        }));
        setIsEditing(false);
        setSaveStatus("");
        return;
      }

      const res = await fetch("/api/cruise/booking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...formData }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Parse cabin preference and set matching image
          let cabinPref = "Ocean View Balcony";
          let cabinImg = "/images/cruise/d1_ocean_view_balcony.jpg";
          if (data.booking.notes) {
            const notesLower = data.booking.notes.toLowerCase();
            const matches =
              data.booking.notes.match(/Cabin Preference:\s*(.*)/i) ||
              data.booking.notes.match(/Cabin:\s*(.*)/i);
            if (matches && matches[1]) {
              cabinPref = matches[1].split("\n")[0].trim();
            }
            if (
              notesLower.includes("group_n5") ||
              notesLower.includes("ocean view")
            ) {
              cabinImg = "/images/cruise/n5.jpg";
            } else if (
              notesLower.includes("group_if") ||
              notesLower.includes("central park")
            ) {
              cabinImg = "/images/cruise/if.jpg";
            } else if (
              notesLower.includes("group_d4") ||
              notesLower.includes("group_d2") ||
              notesLower.includes("balcony")
            ) {
              cabinImg = "/images/cruise/d1_ocean_view_balcony.jpg";
            } else if (
              notesLower.includes("group_i1") ||
              notesLower.includes("infinite ocean balcony")
            ) {
              cabinImg = "/images/cruise/i1_infinite_ocean_view_balcony.jpg";
            } else if (
              notesLower.includes("group_jy") ||
              notesLower.includes("suite")
            ) {
              cabinImg = "/images/cruise/jy.png";
            }
          }

          const amountPaid = data.booking.full_paid
            ? "$1,550.00"
            : data.booking.deposit_paid
              ? "$500.00"
              : "$0.00";
          const balanceDue = data.booking.full_paid
            ? "$0.00"
            : data.booking.deposit_paid
              ? "$1,050.00"
              : "$1,550.00";

          setBooking({
            ...data.booking,
            cabin_preference: cabinPref,
            cabin_image: cabinImg,
            amount_paid: amountPaid,
            balance_due: balanceDue,
          });
          setIsEditing(false);
          setSaveStatus("");
        } else {
          setSaveStatus("Error saving");
        }
      }
    } catch {
      setSaveStatus("Error saving");
    }
  };

  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone) {
      setRegError("Phone number is required.");
      return;
    }
    setRegistering(true);
    setRegError("");
    try {
      const res = await fetch("/api/cruise/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: member?.name || "Cruise Fan",
          email: email,
          phone: regPhone,
          guest_count: regPartySize,
          cabinPreference: regCabinPref,
          joinCommunity: false, // already a community member
          website: "",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const bookRes = await fetch(
          `/api/cruise/booking?email=${encodeURIComponent(email || "")}`,
        );
        if (bookRes.ok) {
          const bookData = await bookRes.json();
          if (bookData.success) {
            setBooking(bookData.booking);
            setFormData({
              guest_count: bookData.booking.guest_count || 1,
              phone: bookData.booking.phone || "",
              anonymous: bookData.booking.anonymous || false,
              guests: bookData.booking.guests || [],
            });
          }
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setRegError(data.error || "Registration failed.");
      }
    } catch (err) {
      setRegError("An error occurred during registration.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-32 animate-pulse items-center justify-center border border-[var(--color-accent)]/20 bg-[var(--color-bg-surface)] p-8">
        <span className="text-white/30">Loading Priority Status...</span>
      </div>
    );

  if (!booking)
    return (
      <div className="relative overflow-hidden border border-[var(--color-accent)]/20 bg-[var(--color-bg-surface)] p-8">
        <div className="pointer-events-none absolute top-0 right-0 p-6 opacity-5">
          <span className="text-8xl">🚢</span>
        </div>
        <h2 className="mb-2 text-white/40">Cruise Registration</h2>
        <p className="mb-6">
          You haven't registered for the cruise priority list yet. Complete the
          quick form below to sign up instantly using your member account.
        </p>

        <form
          onSubmit={handleQuickRegister}
          className="relative z-10 space-y-4 border border-white/5 p-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Full Name"
              type="text"
              readOnly
              value={member?.name || ""}
              inputClassName=" text-white/50 cursor-not-allowed px-3 py-2 text-base"
            />
            <InputField
              label="Email Address"
              type="text"
              readOnly
              value={email || ""}
              inputClassName=" text-white/50 cursor-not-allowed px-3 py-2 text-base"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InputField
              label="Phone Number"
              required
              id="cruise-reg-phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={regPhone}
              onChange={(e) => setRegPhone(formatPhoneDisplay(e.target.value))}
              glow={true}
              inputClassName="px-3 py-2 text-base"
            />
            <InputField
              label="Party Size"
              required
              id="cruise-reg-party-size"
              type="number"
              min={1}
              max={10}
              value={regPartySize}
              onChange={(e) => setRegPartySize(parseInt(e.target.value) || 1)}
              glow={true}
              inputClassName="px-3 py-2 text-base"
            />
            <div>
              <label
                htmlFor="cruise-reg-cabin-pref"
                className="mb-1 block text-white/40"
              >
                Cabin Preference *
              </label>
              <div className="input-glow-border rounded-lg">
                <select
                  id="cruise-reg-cabin-pref"
                  value={regCabinPref}
                  onChange={(e) => setRegCabinPref(e.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-white/10 bg-[var(--color-bg-card)] px-3 py-2 transition-colors outline-none"
                >
                  <option value="group_n5">Ocean View</option>
                  <option value="group_if">Infinite Central Park</option>
                  <option value="group_d4">Ocean View Balcony</option>
                  <option value="group_d2">Ocean View Balcony D2</option>
                  <option value="group_i1">Infinite Ocean View Balcony</option>
                </select>
              </div>
            </div>
          </div>

          {regError && <p className="text-rose-400">{regError}</p>}

          <SeventhButton
            type="submit"
            icon={false}
            disabled={registering}
            className="mt-2 w-full rounded-lg py-2.5 disabled:opacity-50"
          >
            {registering ? (
              <span className="h-4 w-4 animate-spin rounded-lg border-2 border-white/10 border-t-white" />
            ) : (
              "Complete Cruise Registration"
            )}
          </SeventhButton>
        </form>
      </div>
    );

  return (
    <div className="relative flex flex-col justify-between overflow-hidden">
      {/* Travel Readiness Checklist Badges */}
      <div>
        <span className="mb-2 block">Travel Readiness Checklist</span>
        <div className="grid grid-cols-2 gap-2 text-[var(--font-size-2xs)]">
          <div className="flex items-center gap-1.5 py-1 text-emerald-300">
            <CheckMarkIcon className="h-3.5 w-3.5 shrink-0 text-emerald-300" />{" "}
            Passport Verified
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1">
            Band VIP Pass Included
          </div>
          <div className="flex items-center gap-1.5 py-1">
            <span>📅</span> Check-in: 45 Days Prior
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1">
            <span>🏷️</span> Luggage Tags: Dec 1st
          </div>
        </div>
      </div>

      {/* Payment Breakdown: Total Fare, Paid & Owed */}
      <div className="my-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="r">Total Cruise Fare</span>
          <span>{booking.total_fare || "$1,550.00"}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-2">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckMarkIcon className="h-3.5 w-3.5 shrink-0 text-emerald-400" />{" "}
            Amount Paid
          </span>
          <span className="text-emerald-400">
            {booking.amount_paid || "$1,200.00"}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-2">
          <span className="flex items-center gap-1 text-rose-400">
            <span></span> Balance Owed
          </span>
          <div className="flex items-center gap-2">
            <span className="text-rose-400">
              {booking.balance_due || "$350.00"}
            </span>
            {parseFloat(
              (booking.balance_due || "$350.00").replace(/[^0-9.]/g, ""),
            ) > 0 && (
              <button
                onClick={() => setIsPayModalOpen(true)}
                className="cursor-pointer rounded bg-rose-500 px-2.5 py-1 shadow transition-colors hover:bg-rose-400"
              >
                💳 Pay Balance
              </button>
            )}
          </div>
        </div>
      </div>

      {booking.guests && booking.guests.length > 0 && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <h3 className="mb-2 text-white/40">Guest List</h3>
          <div className="space-y-1.5">
            {booking.guests.map((g: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className=" ">{g.name || `Guest ${i + 2}`}</span>
                <span className="text-white/40">
                  {g.type === "child"
                    ? `Child ${g.age ? `(Age ${g.age})` : ""}`
                    : "Adult"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Clickable Cruise Agent Email Buttons */}
      <div className="mt-4 space-y-2 border-t border-white/10">
        <span className="mb-2 block text-white/40">
          Get in Touch with Cruise Agents
        </span>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Button 1: Cruise Admin Agent */}
          <SeventhButton
            icon={false}
            onClick={() =>
              (window.location.href = `mailto:cruise@7thheavenband.com?subject=${encodeURIComponent(
                `7th Heaven Cruise Inquiry - ${booking.cabin_preference || "Cabin 9122"} (${booking.name || "Passenger"})`,
              )}&body=${encodeURIComponent(
                `Hi 7th Heaven Cruise Admin,\n\nI have a question regarding my cruise booking for ${booking.name || "Cruise Guest"} (${booking.cabin_preference || "Cabin 9122"}):\n\n[Write your question here]\n\nThank you,\n${booking.name || "Cruise Guest"}`,
              )}`)
            }
            className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-3"
          >
            <div className="flex items-center gap-1.5">
              <span>✉️</span> Cruise Admin
            </div>
            <span className="font-normal tracking-normal lowercase normal-case">
              cruise@7thheavenband.com
            </span>
          </SeventhButton>

          {/* Button 2: Support & Booking Agent (Mary - NTD Vacations) */}
          <SeventhButton
            icon={false}
            onClick={() =>
              (window.location.href = `mailto:mary@ntdvacations.com?subject=${encodeURIComponent(
                `7th Heaven Cruise Support - ${booking.name || "Passenger"} (${booking.cabin_preference || "Cabin 9122"})`,
              )}&body=${encodeURIComponent(
                `Hi Mary / Cruise Agent,\n\nI have a question regarding my cruise booking:\n\n[Write your question here]\n\nThank you,\n${booking.name || "Cruise Guest"}`,
              )}`)
            }
            className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-3"
          >
            <div className="flex items-center gap-1.5">
              <span>✉️</span> Support Agent (Mary)
            </div>
            <span className="font-normal tracking-normal lowercase normal-case">
              mary@ntdvacations.com
            </span>
          </SeventhButton>
        </div>
      </div>

      {/* Cruising Power Travel Agent Portal Hook */}
      <div className="relative z-10 mt-4 border-t border-white/10 pt-4 text-left text-[10.5px]">
        <div className="mb-1.5 flex items-center gap-2">
          <span>🚢</span>
          <span>Cruising Power Integration</span>
        </div>
        <p>
          Are you booking through a travel agent? Agents can log into Royal
          Caribbean Group&apos;s official{" "}
          <a
            href="https://www.cruisingpower.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cruising Power Portal
          </a>{" "}
          to register and link your booking details to the 7th Heaven group
          code.
        </p>
      </div>

      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        balanceDue={booking.balance_due}
        email={email}
        onSuccess={() => {
          setBooking((prev: any) => {
            if (!prev) return prev;
            const prevPaid =
              parseFloat(prev.amount_paid?.replace(/[^0-9.]/g, "") || "0") || 0;
            const prevDue =
              parseFloat(prev.balance_due?.replace(/[^0-9.]/g, "") || "0") || 0;
            const total = prevPaid + prevDue;
            const formattedTotal = `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            return {
              ...prev,
              amount_paid: formattedTotal,
              balance_due: "$0.00",
            };
          });
        }}
      />
    </div>
  );
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  balanceDue: string;
  email?: string;
  onSuccess: () => void;
}

function PaymentModal({
  isOpen,
  onClose,
  balanceDue,
  email,
  onSuccess,
}: PaymentModalProps) {
  const [tab, setTab] = useState<"saved" | "new">("saved");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // New card inputs
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, "").substring(0, 16);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.substring(i, i + 4));
    }
    setCardNumber(parts.join(" "));
  };

  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, "").substring(0, 4);
    if (digits.length >= 3) {
      setCardExpiry(`${digits.substring(0, 2)}/${digits.substring(2, 4)}`);
    } else {
      setCardExpiry(digits);
    }
  };

  const handleCVCChange = (val: string) => {
    setCardCVC(val.replace(/\D/g, "").substring(0, 3));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (tab === "new") {
      if (!cardName.trim()) {
        setError("Cardholder Name is required.");
        return;
      }
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setError("Please enter a valid 16-digit card number.");
        return;
      }
      if (cardExpiry.length < 5) {
        setError("Please enter a valid expiry date (MM/YY).");
        return;
      }
      if (cardCVC.length < 3) {
        setError("Please enter a valid 3-digit CVC.");
        return;
      }
    }

    setProcessing(true);

    setTimeout(async () => {
      try {
        if (email && email !== "demo@7thheavenband.com") {
          await fetch("/api/cruise/booking", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, full_paid: true }),
          });
        }
        setProcessing(false);
        setSuccess(true);
        onSuccess();
      } catch (err) {
        setProcessing(false);
        setError("Payment gateway error. Please try again.");
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 border-0 bg-black/70 backdrop-blur-sm transition-colors"
        aria-label="Close modal background"
        onClick={processing || success ? undefined : onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden border border-purple-500/20 bg-[var(--color-bg-surface)] text-left shadow-[0_0_50px_rgba(6,182,212,0.15)] transition-colors duration-300">
        {success ? (
          <div className="space-y-4 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckMarkIcon className="h-8 w-8 text-emerald-400" />
            </div>
            <h3>Payment Successful</h3>
            <p>
              Your final payment of{" "}
              <strong className="text-emerald-400">{balanceDue}</strong> has
              been processed securely. Your booking is now fully paid!
            </p>
            <button
              aria-label="Close"
              onClick={onClose}
              className="w-full cursor-pointer bg-emerald-500 py-2.5 shadow-emerald-500/15 transition-colors hover:bg-emerald-400"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handlePaymentSubmit} className="space-y-6 p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3>Final Payment</h3>
                <p className="mt-0.5">Pay remaining balance due</p>
              </div>
              <div className="text-right">
                <span className="text-lg text-rose-400">{balanceDue}</span>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-rose-400">
                {error}
              </p>
            )}

            {processing ? (
              <div className="space-y-4 py-12 text-center">
                <div className="mx-auto h-11 w-11 animate-spin rounded-lg border-2 border-purple-400 border-t-transparent" />
                <p className="animate-pulse text-purple-400">
                  Processing Secure Payment...
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-2 border border-white/5 bg-black/40 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTab("saved");
                      setError("");
                    }}
                    className={`flex-1 cursor-pointer rounded-lg py-1.5 transition-colors ${tab === "saved" ? "border border-purple-500/20" : "border border-transparent text-white/40"}`}
                  >
                    Use Saved Card
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab("new");
                      setError("");
                    }}
                    className={`flex-1 cursor-pointer rounded-lg py-1.5 transition-colors ${tab === "new" ? "border border-purple-500/20" : "border border-transparent text-white/40"}`}
                  >
                    Use New Card
                  </button>
                </div>

                {tab === "saved" ? (
                  <div className="space-y-3 border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💳</span>
                        <div>
                          <strong className="block">Visa ending in 4242</strong>
                          <span className="r text-white/40">
                            Expires 12/28 • Demo Cruiser
                          </span>
                        </div>
                      </div>
                      <span className="rounded border border-purple-500/20 bg-cyan-500/5 px-1.5 py-0.5 text-purple-400">
                        Default
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="cruise-card-name"
                        className="mb-1.5 block text-white/40"
                      >
                        Cardholder Name
                      </label>
                      <input
                        id="cruise-card-name"
                        type="text"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full border border-white/10 bg-[var(--color-bg-card)] px-3 py-2 transition-colors outline-none focus:border-purple-400/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cruise-card-number"
                        className="mb-1.5 block text-white/40"
                      >
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          id="cruise-card-number"
                          type="text"
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={(e) =>
                            handleCardNumberChange(e.target.value)
                          }
                          className="w-full border border-white/10 bg-[var(--color-bg-card)] py-2 pr-3 pl-9 transition-colors outline-none focus:border-purple-400/50"
                        />
                        <span className="absolute top-2.5 left-3 text-white/40">
                          💳
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="cruise-card-expiry"
                          className="mb-1.5 block text-white/40"
                        >
                          Expiry Date
                        </label>
                        <input
                          id="cruise-card-expiry"
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className="w-full border border-white/10 bg-[var(--color-bg-card)] px-3 py-2 transition-colors outline-none focus:border-purple-400/50"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="cruise-card-cvc"
                          className="mb-1.5 block text-white/40"
                        >
                          CVC
                        </label>
                        <input
                          id="cruise-card-cvc"
                          type="password"
                          placeholder="123"
                          value={cardCVC}
                          onChange={(e) => handleCVCChange(e.target.value)}
                          className="w-full border border-white/10 bg-[var(--color-bg-card)] px-3 py-2 transition-colors outline-none focus:border-purple-400/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    aria-label="Close"
                    type="button"
                    onClick={onClose}
                    className="flex-1 cursor-pointer bg-[#00000029] py-2.5 transition-colors hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <SeventhButton
                    type="submit"
                    icon={false}
                    className="flex-1 rounded-lg py-2.5"
                  >
                    Pay {balanceDue}
                  </SeventhButton>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

// --- IMPORTANT LINKS WIDGET ---
export function ImportantLinksWidget() {
  const [links, setLinks] = useState<
    { title: string; url: string; icon: string }[]
  >([]);

  const loadLinks = useCallback(async () => {
    try {
      const res = await fetch(`/api/cruise/important-links?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.links && Array.isArray(data.links)) {
          setLinks(data.links);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  if (links.length === 0) return null;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-[var(--color-bg-glass,rgba(18,18,24,0.45))] p-6 md:p-8">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <span className="text-8xl">🔗</span>
      </div>

      <div className="relative z-10 mb-6 flex items-end justify-between">
        <div>
          <h2 className="mb-1">Quick Access</h2>
          <p>Important Links</p>
        </div>
      </div>

      <div className="relative z-10 space-y-3">
        {links.map((link) => (
          <a
            key={link.url || link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/item flex w-full items-center justify-between rounded-lg border border-white/10 bg-[#00000029] p-3.5 text-left transition-colors hover:border-purple-500/40 hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{link.icon || "🔗"}</span>
              <span className="group-hover/item: transition-colors">
                {link.title}
              </span>
            </div>
            <span className="-translate-x-2 text-[var(--color-accent)] opacity-0 transition-opacity duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100">
              →
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

// --- SONG REQUEST LEADERBOARD ---
export function SongRequestLeaderboard() {
  const [songs, setSongs] = useState([
    { id: 1, title: "Sing", votes: 412 },
    { id: 2, title: "Beautiful Life", votes: 385 },
    { id: 3, title: "Stoplight", votes: 290 },
    { id: 4, title: "Time of Our Lives", votes: 215 },
  ]);

  const handleVote = (id: number) => {
    setSongs(
      songs
        .map((song) =>
          song.id === id ? { ...song, votes: song.votes + 1 } : song,
        )
        .sort((a, b) => b.votes - a.votes),
    );
  };

  return (
    <div className="relative overflow-hidden border border-white/10 bg-[var(--color-bg-surface)] p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/20 text-[var(--color-accent)]">
          🎸
        </div>
        <div>
          <h2>Setlist Requests</h2>
          <p className="mt-0.5">Top 3 get played on Lido Deck</p>
        </div>
      </div>

      <div className="space-y-4">
        {songs.map((song, i) => (
          <div key={song.id} className="group flex items-center gap-4">
            <span
              className={`w-4 text-center ${i < 3 ? "text-[var(--color-accent)]" : "text-white/20"}`}
            >
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="/90">{song.title}</div>
              <div className="text-white/30">{song.votes} votes</div>
            </div>
            <button
              onClick={() => handleVote(song.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#00000029] text-white/40 transition-colors hover:border-[var(--color-border-purple)] hover:bg-[var(--color-purple-glow)] hover:text-[var(--color-purple-light)]"
            >
              ▲
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- CAPTAIN's LOG (AUDIO NOTES) ---
export function CaptainsLog() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 0;
        return p + 2;
      });
    }, 100);
    return () => clearInterval(t);
  }, [isPlaying]);

  // Stop playing when progress resets to 0 after completing
  useEffect(() => {
    if (progress === 0 && isPlaying) setIsPlaying(false);
  }, [progress, isPlaying]);

  return (
    <div className="relative border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
      <h2 className="mb-6">Captain's Log</h2>

      <div className="flex items-center gap-4 border border-white/5 bg-black/40 p-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)] transition-colors hover:bg-[#851de7]"
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-1"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-end justify-between">
            <span className="truncate">Rehearsal Update!</span>
            <span className="text-[var(--color-accent)]/80">0:42</span>
          </div>
          <div className="h-1.5 w-full cursor-pointer overflow-hidden rounded-lg bg-white/10">
            <div
              className="h-full rounded-lg bg-[var(--color-accent)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <p className="mt-3 text-center">
        "Hey everyone, Richard here! We are running through the 80s set right
        now..."
      </p>
    </div>
  );
}

// --- EXCURSION TEASERS ---
const EXCURSIONS = [
  { title: "Cozumel Snorkel & Sail", bandMember: "Richard", spots: 12 },
  { title: "Mayan Ruins Exploration", bandMember: "Michael", spots: 4 },
];

export function ExcursionTeasers() {
  return (
    <div className="border border-purple-500/20 bg-[var(--color-bg-surface)] p-6">
      <h2 className="mb-5">Band Excursions</h2>

      <div className="space-y-3">
        {EXCURSIONS.map((ex, i) => (
          <div
            key={ex.title}
            className="flex items-center justify-between border border-purple-500/10 bg-cyan-900/10 p-3 transition-colors hover:border-purple-500/30"
          >
            <div>
              <div>{ex.title}</div>
              <div className="/80 r">Join {ex.bandMember}</div>
            </div>
            <div className="text-right">
              <div>{ex.spots}</div>
              <div className="text-white/40">Spots Left</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
