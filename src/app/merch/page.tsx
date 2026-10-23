"use client";
/* eslint-disable react-doctor/no-giant-component */
/* oxlint-disable react-doctor/no-state-in-handlers-only, react-doctor/state-only-used-in-handlers */
/* eslint-disable react-doctor/no-state-in-handlers-only, react-doctor/state-only-used-in-handlers */

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMember } from "@/context/MemberContext";
import { supabase } from "@/lib/supabase-client";
import PageHero from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { ShoppingBag, Truck, ShieldCheck, Tag, Lock, CheckCircle2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PickupOrder {
  id: number;
  code: string;
  item: string;
  price: string;
  customer: string;
  email: string;
  ts: number;
  claimed: boolean;
  size?: string;
  color?: string;
}

interface RaffleWin {
  pin: string;
  winner: string;
  prize: string;
  crewSlug: string;
  ts: number;
}

// ─── Products ─────────────────────────────────────────────────────────────────
const FEATURED_PRODUCTS = [
  {
    id: "logo-tee",
    name: "Official 7th Heaven Band Logo Tee",
    price: "$25.00",
    category: "Apparel",
    image: "/images/merch/logo-tee.png",
    description:
      "Premium 100% pre-shrunk cotton black concert t-shirt featuring the iconic 7th Heaven red and silver emblem. Built to last through every high-energy show.",
  },
  {
    id: "tour-hoodie",
    name: "7th Heaven Midwest Tour Hoodie",
    price: "$55.00",
    category: "Apparel",
    image: "/images/merch/hoodie.png",
    description:
      "Heavyweight fleece pullover hoodie featuring the full list of Midwest tour stops, festival appearances, and the official band crest on the chest.",
  },
  {
    id: "vinyl-record",
    name: "7th Heaven Collector's Vinyl Record",
    price: "$30.00",
    category: "Music",
    image: "/images/merch/vinyl.png",
    description:
      "Limited edition 180-gram audiophile vinyl pressing featuring remastered greatest hits and live fan favorites from across four decades of music.",
  },
  {
    id: "album-collection",
    name: "7th Heaven CD & Studio Album Pack",
    price: "$20.00",
    category: "Music",
    image: "/images/merch/merch-be-here.png",
    description:
      "Full-length studio recordings and concert compilations. Includes high-quality liner notes, lyrics booklet, and commemorative band artwork.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRaffleWins(): RaffleWin[] {
  const wins: RaffleWin[] = [];
  if (typeof localStorage === "undefined") return wins;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.includes("raffle_sync")) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const data = JSON.parse(raw);
      if (data.status !== "complete") continue;
      const pins: string[] =
        data.winnerPins || (data.winnerPin ? [data.winnerPin] : []);
      pins.forEach((pin, idx) => {
        wins.push({
          pin,
          winner: data.winners?.[idx] || data.winners?.[0] || "Unknown",
          prize: data.prizes?.[idx]?.name || data.prizes?.[0]?.name || "Prize",
          crewSlug: key.replace("raffle_sync_", ""),
          ts: data.ts || 0,
        });
      });
    } catch { }
  }
  return wins;
}

// ─── Component ────────────────────────────────────────────────────────────────
function MerchDashboard() {
  const { member, openModal } = useMember();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "merch";
  const isMerch =
    isDemo ||
    member?.role === "merch" ||
    member?.role === "crew" ||
    member?.role === "admin";

  const [pickupQueue, setPickupQueue] = useState<PickupOrder[]>([]);
  const [, setRaffleWins] = useState<RaffleWin[]>([]);
  const [, setAwardedPins] = useState<Set<string>>(new Set());
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<{
    status: "valid" | "already_claimed" | "invalid";
    order?: PickupOrder;
  } | null>(null);

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;

    let targetCode = scanInput.trim().toUpperCase();
    if (!targetCode.startsWith("PU-") && /^\d+$/.test(targetCode)) {
      targetCode = `PU-${targetCode}`;
    }

    const queue: PickupOrder[] = JSON.parse(
      localStorage.getItem("merch_pickup_queue_v1") ||
      localStorage.getItem("merch_pickup_queue") ||
      "[]",
    );
    const orderIndex = queue.findIndex((o) => o.code === targetCode);

    if (orderIndex === -1) {
      setScanResult({ status: "invalid" });
    } else {
      const order = queue[orderIndex];
      if (order.claimed) {
        setScanResult({ status: "already_claimed", order });
      } else {
        queue[orderIndex].claimed = true;
        localStorage.setItem("merch_pickup_queue_v1", JSON.stringify(queue));
        setPickupQueue(queue);
        setScanResult({ status: "valid", order: queue[orderIndex] });
      }
    }
    setScanInput("");
  };

  const loadData = (isCancelled?: () => boolean) => {
    const queue: PickupOrder[] = JSON.parse(
      localStorage.getItem("merch_pickup_queue_v1") ||
      localStorage.getItem("merch_pickup_queue") ||
      "[]",
    );
    setPickupQueue(queue);
    setRaffleWins(getRaffleWins());

    const claimedLocal = JSON.parse(
      localStorage.getItem("claimed_raffle_pins_v1") ||
      localStorage.getItem("claimed_raffle_pins") ||
      "[]",
    );
    const claimedSet = new Set<string>(claimedLocal);

    supabase
      .from("raffles")
      .select("winner_pins")
      .eq("status", "complete")
      .then(({ data: dbRaffles }: any) => {
        if (isCancelled?.()) return;
        if (dbRaffles) {
          dbRaffles.forEach((raffle: any) => {
            let winnerPins = [];
            try {
              winnerPins =
                typeof raffle.winner_pins === "string"
                  ? JSON.parse(raffle.winner_pins)
                  : raffle.winner_pins;
            } catch { }

            if (Array.isArray(winnerPins)) {
              winnerPins.forEach((item: any) => {
                if (
                  item &&
                  typeof item === "object" &&
                  item.pin &&
                  item.claimed
                ) {
                  claimedSet.add(item.pin);
                }
              });
            }
          });
        }
        if (!isCancelled?.()) {
          setAwardedPins(claimedSet);
        }
      })
      .catch((err: any) => {
        console.error("Error loading claimed pins from Supabase:", err);
        if (!isCancelled?.()) {
          setAwardedPins(claimedSet);
        }
      });
  };

  useEffect(() => {
    let cancelled = false;
    const checkCancelled = () => cancelled;
    if (isDemo) {
      setPickupQueue([
        {
          id: 1,
          code: "PU-483920",
          item: "7H Classic Logo Tee",
          price: "35.00",
          customer: "ChicagoLou",
          email: "chicagolou@gmail.com",
          ts: Date.now() - 120000,
          claimed: false,
        },
        {
          id: 2,
          code: "PU-710234",
          item: "Tour Hoodie (Black)",
          price: "65.00",
          customer: "RichFam99",
          email: "richfam@yahoo.com",
          ts: Date.now() - 300000,
          claimed: false,
        },
        {
          id: 3,
          code: "PU-591847",
          item: "Drumstick Set (Signed)",
          price: "28.00",
          customer: "BeatsByMike",
          email: "beats@gmail.com",
          ts: Date.now() - 600000,
          claimed: true,
        },
      ]);
      setRaffleWins([
        {
          pin: "847392",
          winner: "ChicagoLou",
          prize: "Signed Drumsticks",
          crewSlug: "michael",
          ts: Date.now() - 900000,
        },
      ]);
      return;
    }
    if (isMerch) {
      loadData(checkCancelled);
    }
    const interval = setInterval(() => {
      if (isMerch) loadData(checkCancelled);
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isMerch, isDemo]);

  const pendingPickups = pickupQueue.filter((o) => !o.claimed);

  return (
    <main
      className="site-container page-container page-stack min-h-screen"
      id="merch-page"
    >
      {/* ── HERO HEADER ── */}
      <PageHero
        badge="Official Gear"
        title="7th Heaven Merchandise"
        titleId="merch-heading"
        subtitle="Official band t-shirts, concert hoodies, vinyl records, CDs, and concert pickup gear available online and at the live merch table."
        align="left"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#merch-catalog"
              className="btn-accent inline-flex items-center gap-2 rounded-[var(--radius-box)] bg-[var(--color-accent)] px-6 py-2.5 font-medium text-white transition-transform hover:scale-105"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Catalog
            </a>
            <a
              href="#merch-pickup-info"
              className="inline-flex items-center gap-2 rounded-[var(--radius-box)] border border-white/15 bg-white/5 px-5 py-2.5 font-medium text-white transition-colors hover:bg-white/10"
            >
              <Truck className="h-4 w-4" />
              Concert Table Pickup
            </a>
            {isMerch && (
              <span className="rounded-[var(--radius-box)] border border-purple-500/30 bg-purple-600/20 px-3 py-1 text-xs font-semibold text-purple-300">
                Staff Console Active
              </span>
            )}
          </div>
        }
      />

      {/* ── FEATURED PRODUCTS CATALOG (IMMEDIATE CONTENT) ── */}
      <section
        id="merch-catalog"
        aria-labelledby="merch-catalog-heading"
        className="section pt-0"
      >
        <SectionHeader
          id="merch-catalog-heading"
          title="Official Merchandise Catalog"
          visuallyHidden
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_PRODUCTS.map((prod) => (
            <article
              key={prod.id}
              className="flex flex-col justify-between overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] transition-colors hover:border-purple-500/40"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-black/40">
                <Image
                  src={prod.image}
                  alt={prod.name}
                  width={500}
                  height={500}
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="h-full w-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                />
                <span className="absolute top-3 right-3 rounded-full bg-purple-600/80 px-2.5 py-0.5 text-xs font-bold text-white shadow-md">
                  {prod.price}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-purple-400">
                    {prod.category}
                  </div>
                  <h3 className="mb-2 font-bold text-white">{prod.name}</h3>
                  <p className="mb-4 text-xs text-white/70 leading-relaxed">{prod.description}</p>
                </div>
                <div className="border-t border-white/10 pt-3 text-xs text-white/50 flex items-center justify-between">
                  <span>Concert Table Pickup</span>
                  <Tag className="h-3.5 w-3.5 text-purple-400" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── CONCERT TABLE PICKUP GUIDE ── */}
      <section
        id="merch-pickup-info"
        aria-labelledby="merch-pickup-heading"
        className="section"
      >
        <SectionHeader
          id="merch-pickup-heading"
          title="Concert Pickup & Payment Details"
          subtitle="Everything you need to know before visiting the merchandise booth."
        />
        <div className="mx-auto max-w-4xl grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h3 className="mb-2 font-bold text-white">Live Concert Table</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Find our physical merchandise table at every show near the main entrance or soundboard. Browse sizes, try on
              hoodies, and purchase gear directly on-site.
            </p>
          </div>

          <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mb-2 font-bold text-white">Accepted Payments</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              We accept cash, contactless tap-to-pay, Apple Pay, Google Pay, and all major credit cards including Visa,
              MasterCard, Discover, and American Express.
            </p>
          </div>

          <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="mb-2 font-bold text-white">VIP Raffle Claims</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              If you hold a winning digital raffle ticket from the 7th Heaven VIP Fan Club, present your digital winner PIN to
              the table staff after the show to claim your item.
            </p>
          </div>
        </div>
      </section>

      {/* ── THE MERCH TABLE TRADITION ── */}
      <section
        id="merch-story"
        aria-labelledby="merch-story-heading"
        className="section"
      >
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <h2 id="merch-story-heading" className="text-primary font-bold tracking-tight">
              The 7th Heaven Merch Table Tradition
            </h2>
            <p className="mt-3 text-secondary text-base leading-relaxed">
              Rock and roll memories you can wear and take home — built to last through decades of concerts.
            </p>
          </div>
          <div className="space-y-4 text-white/80 leading-relaxed lg:col-span-7">
            <p>
              For over four decades, the 7th Heaven merchandise table has been an essential fixture at every concert,
              summer festival, county fair, and casino showroom across the Midwest. Fans gather before the first chord and after the
              final encore to grab commemorative tour shirts, meet the crew, and connect with fellow concertgoers.
            </p>
            <p>
              All 7th Heaven apparel is crafted from premium, pre-shrunk cotton blends designed for lasting comfort,
              breathability, and durability. Beyond signature t-shirts and heavyweight fleece hoodies, our official line includes
              collectible 180-gram vinyl pressings, full-length CDs, signed stage drumsticks, and custom pick tins.
            </p>
          </div>
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS ── */}
      <section
        id="merch-faq"
        aria-labelledby="merch-faq-heading"
        className="section"
      >
        <SectionHeader
          id="merch-faq-heading"
          title="Merchandise Questions"
          subtitle="Answers to common questions regarding apparel, exchanges, and sizing."
        />
        <div className="mx-auto max-w-4xl grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6">
            <h3 className="mb-2 font-semibold text-white">What sizes do you carry?</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Our t-shirts and hoodies typically range from Adult Small through 3XL. Select items are also available in
              youth sizes upon request at live shows.
            </p>
          </div>
          <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6">
            <h3 className="mb-2 font-semibold text-white">Can I exchange an item for a different size?</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Yes, unwashed and unworn apparel can be exchanged for another size at any upcoming 7th Heaven concert table,
              provided the requested size is in stock.
            </p>
          </div>
          <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6">
            <h3 className="mb-2 font-semibold text-white">Are signed items available?</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Yes, the merchandise table regularly carries autographed drumheads, signed band photos, and CD copies. Feel free
              to ask our table staff which signed items are available for that night&apos;s show.
            </p>
          </div>
          <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6">
            <h3 className="mb-2 font-semibold text-white">How do I order before a show?</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Keep an eye on the official tour schedule. Pre-order portals for select major festival dates open 48 hours
              prior to showtime for guaranteed item reservation.
            </p>
          </div>
        </div>
      </section>

      {/* ── CREW & STAFF CONSOLE / LOGIN ── */}
      <section
        id="merch-staff-portal"
        aria-labelledby="merch-staff-heading"
        className="section border-t border-white/10"
      >
        <SectionHeader
          id="merch-staff-heading"
          title="Merch Team Console"
          subtitle="Staff tools for concert pickup order fulfillment and raffle ticket verification."
        />
        <div className="mx-auto max-w-xl rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-8 text-center">
          {isMerch ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-purple-400">
                <CheckCircle2 className="h-6 w-6" />
                <span className="font-semibold">Crew Member Authenticated</span>
              </div>
              <p className="text-sm text-white/70">
                You have {pendingPickups.length} pickup order{pendingPickups.length !== 1 ? "s" : ""} pending fulfillment.
              </p>
              <form onSubmit={handleVerifyCode} className="flex gap-2">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Enter Pickup Code (PU-XXXXXX)..."
                  className="flex-1 rounded-[var(--radius-box)] border border-white/20 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-purple-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="btn-accent cursor-pointer rounded-[var(--radius-box)] bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white transition-colors"
                >
                  Verify
                </button>
              </form>
              {scanResult && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    scanResult.status === "valid"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : scanResult.status === "already_claimed"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {scanResult.status === "valid" && `Order ${scanResult.order?.code} verified and marked as claimed!`}
                  {scanResult.status === "already_claimed" && `Order ${scanResult.order?.code} was already claimed.`}
                  {scanResult.status === "invalid" && "Invalid pickup code. Please check and try again."}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
                <Lock className="h-6 w-6" />
              </div>
              <p className="text-sm text-white/70">
                Authorized 7th Heaven merch team and crew members can sign in to access order barcode scanning, pickup queues,
                and digital raffle distribution.
              </p>
              <button
                type="button"
                onClick={() => openModal()}
                className="btn-accent inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-box)] bg-[var(--color-accent)] px-6 py-2.5 font-medium text-white transition-transform hover:scale-105"
              >
                Crew Portal Sign In
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function MerchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <MerchDashboard />
    </Suspense>
  );
}
