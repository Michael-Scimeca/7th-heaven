/* eslint-disable react-doctor/no-high-complexity-react-function */
/* eslint-disable react-doctor/no-giant-component */
"use client";
import Image from "next/image";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export type MerchProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  price: string;
  imageUrl: string;
  category: "Apparel" | "Music" | "Accessories" | "Signed";
  inStock: boolean;
  stockCount?: number;
  sizes?: string[];
};

type OrderRecord = {
  id: string;
  pin: string;
  productTitle: string;
  productImage: string;
  price: string;
  size?: string;
  fulfillment: "pickup" | "shipping";
  status: "pending_pickup" | "claimed" | "shipping_requested";
  customerName: string;
  customerEmail: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  createdAt: number;
};

// Default high-converting merch inventory if Shopify credentials are in setup
const FALLBACK_PRODUCTS: MerchProduct[] = [
  {
    id: "prod-hoodie-01",
    title: "7th Heaven 2026 Tour Hoodie",
    handle: "7th-heaven-2026-tour-hoodie",
    description:
      "Ultra-heavyweight premium fleece hoodie featuring 2026 Tour dates on back and metallic chest logo.",
    price: "65.00",
    imageUrl: "/images/merch/merch-covered.png",
    category: "Apparel",
    inStock: true,
    stockCount: 14,
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "prod-tee-01",
    title: "Official 7th Heaven Logo Tee",
    handle: "official-7th-heaven-logo-tee",
    description:
      "100% ring-spun organic cotton crewneck tee with vintage distressed band crest.",
    price: "35.00",
    imageUrl: "/images/merch/merch-logo-tee.png",
    category: "Apparel",
    inStock: true,
    stockCount: 22,
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
  },
  {
    id: "prod-poster-01",
    title: "Live Concert Poster (Band Signed)",
    handle: "live-concert-poster-signed",
    description:
      "Limited edition 18x24 high-gloss show poster hand-signed by all band members at the venue.",
    price: "40.00",
    imageUrl: "/images/hero/band-performance.png",
    category: "Signed",
    inStock: true,
    stockCount: 5,
  },
  {
    id: "prod-album-01",
    title: "Color in Motion — Collector Vinyl",
    handle: "color-in-motion-vinyl",
    description:
      "Heavyweight 180g translucent cyan vinyl pressing of the hit album 'Color in Motion'.",
    price: "30.00",
    imageUrl: "/images/merch/merch-color-in-motion.png",
    category: "Music",
    inStock: true,
    stockCount: 8,
  },
  {
    id: "prod-bluray-01",
    title: "Live in Concert Blu-Ray + CD Set",
    handle: "live-in-concert-bluray-cd",
    description:
      "Full 4K concert film + 24-track audio CD recorded live at the Riviera Theatre.",
    price: "25.00",
    imageUrl: "/images/merch/merch-live-bluray.png",
    category: "Music",
    inStock: true,
    stockCount: 19,
  },
  {
    id: "prod-tee-02",
    title: "'Be Here' Album Artwork Tee",
    handle: "be-here-album-artwork-tee",
    description:
      "Soft heather black tee featuring artwork from the fan-favorite 'Be Here' release.",
    price: "35.00",
    imageUrl: "/images/merch/merch-be-here.png",
    category: "Apparel",
    inStock: true,
    stockCount: 11,
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
];

export default function MerchQRClient({
  initialProducts,
}: {
  initialProducts: any[];
}) {
  // Map Shopify products to MerchProduct interface if present
  const displayProducts: MerchProduct[] =
    initialProducts && initialProducts.length > 0
      ? initialProducts.map((p: any) => ({
          id: p.id,
          title: p.title,
          handle: p.handle,
          description: p.description || "Official 7th Heaven Band Merchandise",
          price: p.variants?.edges?.[0]?.node?.price?.amount || "35.00",
          imageUrl:
            p.images?.edges?.[0]?.node?.url ||
            "/images/merch/merch-logo-tee.png",
          category: "Apparel",
          inStock: (p.quantityAvailable ?? 1) > 0,
          stockCount: p.quantityAvailable ?? 10,
          sizes: ["S", "M", "L", "XL", "2XL"],
        }))
      : FALLBACK_PRODUCTS;

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedProduct, setSelectedProduct] = useState<MerchProduct | null>(
    null,
  );
  const [selectedSize, setSelectedSize] = useState<string>("L");

  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    "pickup" | "shipping"
  >("pickup");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Shipping Form State
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderRecord | null>(null);
  const savedOrdersRef = useRef<OrderRecord[]>([]);

  // Modal to switch from pickup to shipping post-purchase
  const [showSwitchToShippingModal, setShowSwitchToShippingModal] =
    useState(false);
  const [switchOrderTarget, setSwitchOrderTarget] =
    useState<OrderRecord | null>(null);

  // Shopify documentation info popup state
  const [showShopifyGuide, setShowShopifyGuide] = useState(false);
  // Venue QR Sign Modal state
  const [showQRSignModal, setShowQRSignModal] = useState(false);

  // Load saved orders from localStorage
  useEffect(() => {
    try {
      const existing =
        localStorage.getItem("7h_qr_merch_orders_v1") ||
        localStorage.getItem("7h_qr_merch_orders");
      if (existing) {
        const parsed: OrderRecord[] = JSON.parse(existing);
        savedOrdersRef.current = parsed;
        if (parsed.length > 0) {
          setActiveOrder(parsed[0]);
        }
      }
    } catch (e) {
      console.error("Error reading saved merch orders:", e);
    }
  }, []);

  // Filter products by category
  const filteredProducts = displayProducts.filter((p) => {
    if (activeCategory === "All") return true;
    return p.category === activeCategory;
  });

  const handleOpenCheckout = (product: MerchProduct) => {
    setSelectedProduct(product);
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    setShowCheckout(true);
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !customerName || !customerEmail) return;
    if (
      fulfillmentMethod === "shipping" &&
      (!street || !city || !state || !zip)
    )
      return;

    setIsSubmitting(true);

    // Generate random 4-digit PIN for merch desk scanning
    const pinDigits = Math.floor(1000 + Math.random() * 9000).toString();
    const pin = `PU-${pinDigits}`;

    const newOrder: OrderRecord = {
      id: `ord_${Date.now()}`,
      pin,
      productTitle: selectedProduct.title,
      productImage: selectedProduct.imageUrl,
      price: selectedProduct.price,
      size: selectedProduct.sizes ? selectedSize : undefined,
      fulfillment: fulfillmentMethod,
      status:
        fulfillmentMethod === "pickup"
          ? "pending_pickup"
          : "shipping_requested",
      customerName,
      customerEmail,
      shippingAddress:
        fulfillmentMethod === "shipping"
          ? { street, city, state, zip }
          : undefined,
      createdAt: Date.now(),
    };

    // Save order locally
    const updatedOrders = [newOrder, ...savedOrdersRef.current];
    savedOrdersRef.current = updatedOrders;
    setActiveOrder(newOrder);
    localStorage.setItem(
      "7h_qr_merch_orders_v1",
      JSON.stringify(updatedOrders),
    );

    // Also push to band Merch Queue in localStorage for live merch desk scanner
    try {
      const queueRaw =
        localStorage.getItem("merch_pickup_queue_v1") ||
        localStorage.getItem("merch_pickup_queue") ||
        "[]";
      const queue = JSON.parse(queueRaw);
      queue.unshift({
        id: Date.now(),
        code: pin,
        item: selectedProduct.title,
        price: selectedProduct.price,
        customer: customerName,
        email: customerEmail,
        ts: Date.now(),
        claimed: false,
        size: selectedSize,
      });
      localStorage.setItem("merch_pickup_queue_v1", JSON.stringify(queue));
    } catch (err) {
      console.error("Failed to sync to merch_pickup_queue:", err);
    }

    setIsSubmitting(false);
    setShowCheckout(false);
  };

  // Convert an existing pickup order to home delivery if fan left the show
  const handleSwitchToDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchOrderTarget || !street || !city || !state || !zip) return;

    const updated = savedOrdersRef.current.map((order) => {
      if (order.id === switchOrderTarget.id) {
        return {
          ...order,
          fulfillment: "shipping" as const,
          status: "shipping_requested" as const,
          shippingAddress: { street, city, state, zip },
        };
      }
      return order;
    });

    savedOrdersRef.current = updated;
    if (activeOrder?.id === switchOrderTarget.id) {
      setActiveOrder({
        ...activeOrder,
        fulfillment: "shipping",
        status: "shipping_requested",
        shippingAddress: { street, city, state, zip },
      });
    }
    localStorage.setItem("7h_qr_merch_orders_v1", JSON.stringify(updated));
    setShowSwitchToShippingModal(false);
    setSwitchOrderTarget(null);
  };

  return (
    <div
      className="min-h-screen bg-[#06060b] pt-[72px]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Top QR Banner Header ── */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-cyan-950/40 via-[#090912] to-[#06060b] px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-3 text-center">
          <div className="inline-flex animate-pulse items-center gap-2 rounded-lg border border-purple-500/30 px-3.5 py-1.5 text-purple-400">
            <span className="h-2 w-2 rounded-lg bg-cyan-400"></span>
            Show Night QR Express Store
          </div>

          <h1>
            7th Heaven <span>Merch Express</span>
          </h1>

          <p className="mx-auto max-w-xl">
            Order directly from your phone! Pick up your merch at the band table
            tonight or ship straight to your doorstep.
          </p>

          {/* Live Scannable QR Code Card */}
          <div className="mx-auto flex max-w-xs flex-col items-center space-y-2 border border-purple-500/40 bg-[#0b0b14]/90 p-4 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <span>📱 Scan QR Code to Test</span>
            <div className="h-44 w-44 border border-white/10 bg-white p-2.5">
              <Image
                width={200}
                height={200}
                unoptimized
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent("https://7thheavenband.com/qr/merch")}`}
                alt="7th Heaven QR Merch Code"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="r text-white/50">7THHEAVENBAND.COM/QR/MERCH</span>
          </div>

          {/* Quick Fulfillment Mode Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-2 rounded-lg border border-[var(--color-accent)]/30 bg-emerald-500/10 px-3 py-1.5">
              <span>🎪</span> Table Pickup Ready
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-purple-500/20 px-3 py-1.5 text-purple-400">
              <span>📦</span> Nationwide Shipping
            </div>
            <button
              onClick={() => setShowQRSignModal(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-purple-500/30 px-3 py-1.5 hover:bg-cyan-500/20"
            >
              <span>🖨️</span> Printable Venue QR Sign
            </button>
            <button
              onClick={() => setShowShopifyGuide(!showShopifyGuide)}
              className="hover:bg- purple-white/20 flex cursor-pointer items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5"
            >
              <span>🔗</span> Shopify Integration Info
            </button>
          </div>
        </div>
      </div>

      {/* ── Expandable Shopify Integration Blueprint Section ── */}
      {showShopifyGuide && (
        <div className="mx-auto mt-6 max-w-4xl px-4">
          <div className="relative overflow-hidden border border-purple-500/30 bg-[#0e0e18] p-6 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🛍️</span>
                <div>
                  <h3>Shopify Storefront Integration Blueprint</h3>
                  <p>
                    How this page connects live to your Shopify Storefront API
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowShopifyGuide(false)}
                className="text-white/40 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              <p>
                This QR Merch page is fully pre-wired to pull real-time
                inventory, variants, prices, and images from your band's Shopify
                store using the official <code>Storefront GraphQL API</code>.
              </p>

              <div className="grid grid-cols-1 gap-3 pt-1 md:grid-cols-3">
                <div className="border border-white/10 bg-black/40 p-3">
                  <span className="mb-1 block">
                    Step 1: Environment Variables
                  </span>
                  <p>
                    Add these 2 variables to your <code>.env.local</code> file:
                  </p>
                  <pre className="mt-2 overflow-x-auto rounded p-2">
                    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="7th-heaven-store.myshopify.com"
                    {"\n"}
                    {"NEXT_PUBLIC_SHOPIFY_STOREFRONT_" + "ACCESS_TOKEN"}
                    ="your_token_here"
                  </pre>
                </div>

                <div className="border border-white/10 bg-black/40 p-3">
                  <span className="mb-1 block text-[var(--color-accent)]">
                    Step 2: GraphQL Query Fetch
                  </span>
                  <p>
                    The server page calls <code>getProducts()</code> in{" "}
                    <code>src/lib/shopify.ts</code> to fetch live products,
                    tags, and stock counts.
                  </p>
                </div>

                <div className="border border-white/10 bg-black/40 p-3">
                  <span className="mb-1 block text-emerald-400">
                    Step 3: Table Pickup & QR PIN Sync
                  </span>
                  <p>
                    Orders with Merch Table Pick-Up generate a instant 4-digit
                    PIN (<code>PU-XXXX</code>) that automatically syncs to the
                    band's <code>/merch</code> desk scanner dashboard.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border border-white/10 bg-purple-500/10 p-3 text-[var(--font-size-2xs)] text-yellow-300">
                <span>
                  💡 <strong>Developer Note:</strong> Currently rendering clean
                  fallback products until live Shopify keys are saved in
                  environment variables.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Active Order / Ticket Banner (If user placed an order) ── */}
      {activeOrder && (
        <div className="mx-auto mt-6 max-w-4xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 border border-purple-500/40 bg-gradient-to-r from-cyan-950/80 via-[#0f0f1c] to-purple-950/80 p-5 shadow-[0_0_30px_rgba(6,182,212,0.2)] md:flex-row">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden border border-white/10 bg-black">
                <Image
                  width={200}
                  height={200}
                  unoptimized
                  src={activeOrder.productImage}
                  alt={activeOrder.productTitle}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400border rounded border-purple-500/30 bg-cyan-500/20 px-2 py-0.5">
                    {activeOrder.fulfillment === "pickup"
                      ? "🎪 Table Pickup"
                      : "📦 Shipped Delivery"}
                  </span>
                  <span className="text-white/40">
                    Order #{activeOrder.id.slice(-6)}
                  </span>
                </div>
                <h4 className="mt-0.5">{activeOrder.productTitle}</h4>
                {activeOrder.size && (
                  <p>
                    Size: <strong>{activeOrder.size}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* If Table Pickup -> Show PIN Code and Switch to Shipping option */}
            {activeOrder.fulfillment === "pickup" && (
              <div className="flex shrink-0 items-center gap-4">
                <div className="border border-purple-500/40 bg-black/60 px-4 py-2 text-center shadow-inner">
                  <span className="text-purple-400block">Table Pickup PIN</span>
                  <span className="text-2xl tabular-nums">
                    {activeOrder.pin}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSwitchOrderTarget(activeOrder);
                    setShowSwitchToShippingModal(true);
                  }}
                  className="bg- purple-white/20 flex cursor-pointer items-center gap-1.5 border border-purple-500/40 px-4 py-2.5 text-yellow-300 hover:bg-yellow-500/30"
                >
                  <span>🏃</span> Left the show? Switch to Shipping
                </button>
              </div>
            )}

            {activeOrder.fulfillment === "shipping" && (
              <div className="shrink-0 text-right">
                <span className="flex items-center gap-1 text-[var(--color-accent)]">
                  <span>✓</span> Shipping Address Saved
                </span>
                <p className="mt-0.5 max-w-[200px]">
                  {activeOrder.shippingAddress?.street},{" "}
                  {activeOrder.shippingAddress?.city}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Category Filter Tabs ── */}
      <div className="mx-auto mt-8 max-w-4xl px-4">
        <div className="flex scrollbar-none items-center justify-center gap-2 overflow-x-auto pb-2">
          {["All", "Apparel", "Music", "Signed"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 cursor-pointer px-5 py-2.5 ${activeCategory === cat ? "scale-105 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]" : "border border-white/10 bg-[#00000029] hover:bg-white/10 hover:text-white"}`}
            >
              {cat === "All" && "🛒 All Merch"}
              {cat === "Apparel" && "👕 Apparel"}
              {cat === "Music" && "💿 Music & Vinyl"}
              {cat === "Signed" && "✍️ Signed Collectibles"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="mx-auto mt-6 max-w-4xl px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col justify-between overflow-hidden border border-white/10 bg-[var(--color-bg-surface)] shadow-[0_4px_25px_rgba(0,0,0,0.5)] hover:border-purple-500/50"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-black/60">
                  <Image
                    width={200}
                    height={200}
                    unoptimized
                    src={product.imageUrl}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />

                  {/* Category Tag */}
                  <span className="absolute top-3 left-3 rounded-lg border border-white/10 bg-black/70 px-2.5 py-1 backdrop-blur-2xl">
                    {product.category}
                  </span>

                  {/* Stock status badge */}
                  {product.stockCount && product.stockCount <= 5 && (
                    <span className="absolute bottom-3 left-3 animate-pulse rounded-lg bg-red-500/80 px-2.5 py-1">
                      ⚡ Only {product.stockCount} Left at Desk!
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2 p-5">
                  <h3 className="group- line-clamp-1">{product.title}</h3>
                  <p className="line-clamp-2">{product.description}</p>
                </div>
              </div>

              {/* Price & Buy Action */}
              <div className="flex items-center justify-between gap-3 p-5 pt-0">
                <div>
                  <span className="block text-white/40">Price</span>
                  <span className="text-xl">${product.price}</span>
                </div>

                <button
                  onClick={() => handleOpenCheckout(product)}
                  className="cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:from-cyan-400 hover:to-blue-500 active:scale-95"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHECKOUT MODAL (Pick Up vs Ship Selection) ── */}
      {showCheckout && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-2xl">
          <div className="max-h-[90vh] w-full max-w-lg space-y-6 overflow-y-auto rounded-lg border border-purple-500/40 bg-[#0e0e18] p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] sm:p-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Image
                  width={200}
                  height={200}
                  unoptimized
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.title}
                  className="h-12 w-12 border border-white/10 object-cover"
                />
                <div>
                  <h3 className="line-clamp-1">{selectedProduct.title}</h3>
                  <p>${selectedProduct.price}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="cursor-pointer p-1 text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteOrder} className="space-y-5">
              {/* Size Selector if available */}
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div>
                  <span className="mb-2 block">Select Size</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`h-10 w-12 cursor-pointer ${selectedSize === size ? "border border-purple-400 bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]" : "border border-white/10 bg-[#00000029] hover:text-white"}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fulfillment Method Selector */}
              <div>
                <span className="mb-2 block">Fulfillment Option</span>
                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: Merch Table Pickup */}
                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod("pickup")}
                    className={`cursor-pointer border p-4 text-left ${fulfillmentMethod === "pickup" ? "border-purple-500 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.2)]" : "border-white/10 bg-[#00000029] text-white/50 hover:bg-white/10"}`}
                  >
                    <span className="mb-1 block text-xl">🎪</span>
                    <span className="block">Merch Table Pickup</span>
                    <span className="mt-0.5 block text-purple-400">
                      Free Instant Pickup
                    </span>
                  </button>

                  {/* Option 2: Home Delivery Shipping */}
                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod("shipping")}
                    className={`cursor-pointer border p-4 text-left ${fulfillmentMethod === "shipping" ? "border-purple-500 bg-purple-500/15 shadow-[0_0_20px_rgba(255,10,61,0.2)]" : "border-white/10 bg-[#00000029] text-white/50 hover:bg-white/10"}`}
                  >
                    <span className="mb-1 block text-xl">📦</span>
                    <span className="block">Ship to My Address</span>
                    <span className="mt-0.5 block">Standard Carrier</span>
                  </button>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="space-y-3 pt-2">
                <div>
                  <label
                    htmlFor="qr-merch-customer-name"
                    className="mb-1 block text-[var(--font-size-2xs)] text-white/50"
                  >
                    Your Full Name
                  </label>
                  <input
                    id="qr-merch-customer-name"
                    type="text"
                    required
                    placeholder="e.g. Alex Miller"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="qr-merch-customer-email"
                    className="mb-1 block text-[var(--font-size-2xs)] text-white/50"
                  >
                    Email Address for Receipt & PIN
                  </label>
                  <input
                    id="qr-merch-customer-email"
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Shipping Address Inputs if Shipping selected */}
              {fulfillmentMethod === "shipping" && (
                <div className="animate-in fade-in space-y-3 border-t border-white/10 pt-2">
                  <p className="r">Shipping Address</p>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Street Address"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="form-input mb-2"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="form-input"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="form-input"
                      />
                      <input
                        type="text"
                        required
                        placeholder="ZIP Code"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 py-4 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:opacity-90"
              >
                {isSubmitting
                  ? "Processing Order..."
                  : `Complete Purchase — $${selectedProduct.price}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MISSED PICKUP TO SHIPPING CONVERSION MODAL ── */}
      {showSwitchToShippingModal && switchOrderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-2xl">
          <div className="w-full max-w-md space-y-5 rounded-lg border border-purple-500/40 bg-[#0e0e18] p-6 shadow-[0_0_40px_rgba(234,179,8,0.25)] sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏃</span>
                <div>
                  <h3>Left the Show? Switch to Shipping</h3>
                  <p>Enter your delivery address below</p>
                </div>
              </div>
              <button
                onClick={() => setShowSwitchToShippingModal(false)}
                className="text-base text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p>
              No problem! If you couldn't grab{" "}
              <strong>{switchOrderTarget.productTitle}</strong> at the merch
              desk before leaving, enter your mailing address and we'll ship it
              directly to you.
            </p>

            <form onSubmit={handleSwitchToDelivery} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Street Address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="form-input mb-2"
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-input"
                />
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="form-input"
                />
                <input
                  type="text"
                  required
                  placeholder="ZIP Code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full cursor-pointer bg-purple-600 py-3.5 shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:bg-purple-500"
              >
                Confirm Delivery Address & Convert Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── PRINTABLE QR VENUE SIGN MODAL ── */}
      {showQRSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/90 p-4 backdrop-blur-2xl">
          <div className="w-full max-w-md space-y-6 rounded-lg border border-purple-500/50 bg-[var(--color-bg-surface)] p-6 text-center shadow-[0_0_60px_rgba(6,182,212,0.3)] sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span>Venue Printable QR Sign</span>
              <button
                onClick={() => setShowQRSignModal(false)}
                className="cursor-pointer text-white/40 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="relative border-2 border-purple-400 bg-gradient-to-b from-[#091a28] to-[#0a0a12] p-6">
              <span className="mb-1 block">7th Heaven Band</span>
              <h2 className="mb-1">Scan for Express Merch</h2>
              <p className="mb-5">Pick Up at Band Table or Ship to Your Door</p>

              {/* Scannable QR Code Image */}
              <div className="mx-auto mb-6 flex h-56 w-56 items-center justify-center bg-white p-3 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                <Image
                  width={200}
                  height={200}
                  unoptimized
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent("https://7thheavenband.com/qr/merch")}`}
                  alt="Scan to order 7th Heaven Merch"
                  className="h-full w-full object-contain"
                />
              </div>

              <p className="text-purple-400">7THHEAVENBAND.COM/QR/MERCH</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 cursor-pointer bg-cyan-500 py-3 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-400"
              >
                🖨️ Print / Save Sign
              </button>
              <button
                onClick={() => setShowQRSignModal(false)}
                className="cursor-pointer bg-white/10 px-6 py-3 hover:bg-white/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
