/* eslint-disable react-doctor/no-giant-component */
"use client";
import Image from 'next/image';

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
    description: "Ultra-heavyweight premium fleece hoodie featuring 2026 Tour dates on back and metallic chest logo.",
    price: "65.00",
    imageUrl: "/images/merch-covered.png",
    category: "Apparel",
    inStock: true,
    stockCount: 14,
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "prod-tee-01",
    title: "Official 7th Heaven Logo Tee",
    handle: "official-7th-heaven-logo-tee",
    description: "100% ring-spun organic cotton crewneck tee with vintage distressed band crest.",
    price: "35.00",
    imageUrl: "/images/merch-logo-tee.png",
    category: "Apparel",
    inStock: true,
    stockCount: 22,
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
  },
  {
    id: "prod-poster-01",
    title: "Live Concert Poster (Band Signed)",
    handle: "live-concert-poster-signed",
    description: "Limited edition 18x24 high-gloss show poster hand-signed by all band members at the venue.",
    price: "40.00",
    imageUrl: "/images/band-performance.png",
    category: "Signed",
    inStock: true,
    stockCount: 5,
  },
  {
    id: "prod-album-01",
    title: "Color in Motion — Collector Vinyl",
    handle: "color-in-motion-vinyl",
    description: "Heavyweight 180g translucent cyan vinyl pressing of the hit album 'Color in Motion'.",
    price: "30.00",
    imageUrl: "/images/merch-color-in-motion.png",
    category: "Music",
    inStock: true,
    stockCount: 8,
  },
  {
    id: "prod-bluray-01",
    title: "Live in Concert Blu-Ray + CD Set",
    handle: "live-in-concert-bluray-cd",
    description: "Full 4K concert film + 24-track audio CD recorded live at the Riviera Theatre.",
    price: "25.00",
    imageUrl: "/images/merch-live-bluray.png",
    category: "Music",
    inStock: true,
    stockCount: 19,
  },
  {
    id: "prod-tee-02",
    title: "'Be Here' Album Artwork Tee",
    handle: "be-here-album-artwork-tee",
    description: "Soft heather black tee featuring artwork from the fan-favorite 'Be Here' release.",
    price: "35.00",
    imageUrl: "/images/merch-be-here.png",
    category: "Apparel",
    inStock: true,
    stockCount: 11,
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
];

export default function MerchQRClient({ initialProducts }: { initialProducts: any[] }) {
  // Map Shopify products to MerchProduct interface if present
  const displayProducts: MerchProduct[] = (initialProducts && initialProducts.length > 0)
    ? initialProducts.map((p: any) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      description: p.description || "Official 7th Heaven Band Merchandise",
      price: p.variants?.edges?.[0]?.node?.price?.amount || "35.00",
      imageUrl: p.images?.edges?.[0]?.node?.url || "/images/merch-logo-tee.png",
      category: "Apparel",
      inStock: (p.quantityAvailable ?? 1) > 0,
      stockCount: p.quantityAvailable ?? 10,
      sizes: ["S", "M", "L", "XL", "2XL"],
    }))
    : FALLBACK_PRODUCTS;

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedProduct, setSelectedProduct] = useState<MerchProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("L");

  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"pickup" | "shipping">("pickup");
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
  const [showSwitchToShippingModal, setShowSwitchToShippingModal] = useState(false);
  const [switchOrderTarget, setSwitchOrderTarget] = useState<OrderRecord | null>(null);

  // Shopify documentation info popup state
  const [showShopifyGuide, setShowShopifyGuide] = useState(false);
  // Venue QR Sign Modal state
  const [showQRSignModal, setShowQRSignModal] = useState(false);

  // Load saved orders from localStorage
  useEffect(() => {
    try {
      const existing = localStorage.getItem("7h_qr_merch_orders_v1") || localStorage.getItem("7h_qr_merch_orders");
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
  const filteredProducts = displayProducts.filter(p => {
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
    if (fulfillmentMethod === "shipping" && (!street || !city || !state || !zip)) return;

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
      status: fulfillmentMethod === "pickup" ? "pending_pickup" : "shipping_requested",
      customerName,
      customerEmail,
      shippingAddress: fulfillmentMethod === "shipping" ? { street, city, state, zip } : undefined,
      createdAt: Date.now(),
    };

    // Save order locally
    const updatedOrders = [newOrder, ...savedOrdersRef.current];
    savedOrdersRef.current = updatedOrders;
    setActiveOrder(newOrder);
    localStorage.setItem("7h_qr_merch_orders_v1", JSON.stringify(updatedOrders));

    // Also push to band Merch Queue in localStorage for live merch desk scanner
    try {
      const queueRaw = localStorage.getItem("merch_pickup_queue_v1") || localStorage.getItem("merch_pickup_queue") || "[]";
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

    const updated = savedOrdersRef.current.map(order => {
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
    <div className="min-h-screen bg-[#06060b] text-white pt-[72px]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top QR Banner Header ── */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-cyan-950/40 via-[#090912] to-[#06060b] py-8 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-3">

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-cyan-500/30 text-purple-400text-xs font-bold uppercase tracking-widest animate-pulse">
            <span className="w-2 h-2 rounded-lg bg-cyan-400"></span>
            Show Night QR Express Store
          </div>

          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wider text-white">
            7th Heaven <span className="text-cyan-400">Merch Express</span>
          </h1>

          <p className="max-w-xl mx-auto">
            Order directly from your phone! Pick up your merch at the band table tonight or ship straight to your doorstep.
          </p>

          {/* Live Scannable QR Code Card */}
          <div className="bg-[#0b0b14]/90 border border-cyan-500/40 p-4 max-w-xs mx-auto shadow-[0_0_30px_rgba(6,182,212,0.25)] flex flex-col items-center space-y-2">
            <span className="font-bold uppercase tracking-[0.2em] text-cyan-400">📱 Scan QR Code to Test</span>
            <div className="w-44 h-44 bg-white p-2.5 border border-white/10">
              <Image width={200} height={200} unoptimized
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://7thheavenband.com/qr/merch')}`}
                alt="7th Heaven QR Merch Code"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-mono text-white/50 tracking-wider">7THHEAVENBAND.COM/QR/MERCH</span>
          </div>

          {/* Quick Fulfillment Mode Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-2 font-bold text-[var(--color-accent)] bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-[var(--color-accent)]/30">
              <span>🎪</span> Table Pickup Ready
            </div>
            <div className="flex items-center gap-2 font-bold text-purple-400 px-3 py-1.5 rounded-lg border border-cyan-500/20">
              <span>📦</span> Nationwide Shipping
            </div>
            <button aria-label="Action button"
              onClick={() => setShowQRSignModal(true)}
              className="flex items-center gap-1.5 font-bold text-cyan-300 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-colors cursor-pointer"
            >
              <span>🖨️</span> Printable Venue QR Sign
            </button>
            <button aria-label="Action button"
              onClick={() => setShowShopifyGuide(!showShopifyGuide)}
              className="flex items-center gap-1.5 font-bold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg border border-purple-500/30 transition-colors cursor-pointer"
            >
              <span>🔗</span> Shopify Integration Info
            </button>
          </div>

        </div>
      </div>

      {/* ── Expandable Shopify Integration Blueprint Section ── */}
      {showShopifyGuide && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="bg-[#0e0e18] border border-purple-500/30 p-6 relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.1)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🛍️</span>
                <div>
                  <h3 className="text-white font-bold uppercase tracking-wide">Shopify Storefront Integration Blueprint</h3>
                  <p className="">How this page connects live to your Shopify Storefront API</p>
                </div>
              </div>
              <button aria-label="Action button"
                onClick={() => setShowShopifyGuide(false)}
                className="text-white/40 hover:text-white uppercase font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-white/70">
              <p>
                This QR Merch page is fully pre-wired to pull real-time inventory, variants, prices, and images from your band's Shopify store using the official <code className="text-cyan-300 font-mono">Storefront GraphQL API</code>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="bg-black/40 border border-white/10 p-3">
                  <span className="text-cyan-400 font-bold uppercase tracking-wider block mb-1">Step 1: Environment Variables</span>
                  <p className="">Add these 2 variables to your <code className="text-white font-mono">.env.local</code> file:</p>
                  <pre className="p-2 rounded font-mono text-cyan-300 mt-2 overflow-x-auto">
                    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="7th-heaven-store.myshopify.com"{"\n"}
                    {'NEXT_PUBLIC_SHOPIFY_STOREFRONT_' + 'ACCESS_TOKEN'}="your_token_here"
                  </pre>
                </div>

                <div className="bg-black/40 border border-white/10 p-3">
                  <span className="text-[var(--color-accent)] font-bold uppercase tracking-wider block mb-1">Step 2: GraphQL Query Fetch</span>
                  <p className="">
                    The server page calls <code className="text-white font-mono">getProducts()</code> in <code className="text-white font-mono">src/lib/shopify.ts</code> to fetch live products, tags, and stock counts.
                  </p>
                </div>

                <div className="bg-black/40 border border-white/10 p-3">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider block mb-1">Step 3: Table Pickup & QR PIN Sync</span>
                  <p className="">
                    Orders with Merch Table Pick-Up generate a instant 4-digit PIN (<code className="text-white font-mono">PU-XXXX</code>) that automatically syncs to the band's <code className="text-white font-mono">/merch</code> desk scanner dashboard.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-yellow-300 text-[var(--font-size-2xs)] flex items-center justify-between">
                <span>💡 <strong>Developer Note:</strong> Currently rendering clean fallback products until live Shopify keys are saved in environment variables.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Active Order / Ticket Banner (If user placed an order) ── */}
      {activeOrder && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="bg-gradient-to-r from-cyan-950/80 via-[#0f0f1c] to-purple-950/80 border border-cyan-500/40 p-5 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col md:flex-row items-center justify-between gap-4">

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 overflow-hidden border border-white/10 shrink-0 bg-black">
                <Image width={200} height={200} unoptimized src={activeOrder.productImage} alt={activeOrder.productTitle} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-purple-400border border-cyan-500/30">
                    {activeOrder.fulfillment === "pickup" ? "🎪 Table Pickup" : "📦 Shipped Delivery"}
                  </span>
                  <span className="text-white/40">Order #{activeOrder.id.slice(-6)}</span>
                </div>
                <h4 className="text-white font-bold mt-0.5">{activeOrder.productTitle}</h4>
                {activeOrder.size && <p className="">Size: <strong className="text-white">{activeOrder.size}</strong></p>}
              </div>
            </div>

            {/* If Table Pickup -> Show PIN Code and Switch to Shipping option */}
            {activeOrder.fulfillment === "pickup" && (
              <div className="flex items-center gap-4 shrink-0">
                <div className="bg-black/60 border border-cyan-500/40 px-4 py-2 text-center shadow-inner">
                  <span className="text-[var(--font-size-4xs)] font-bold uppercase tracking-widest text-purple-400block">Table Pickup PIN</span>
                  <span className="text-2xl font-bold tracking-widest text-white tabular-nums">{activeOrder.pin}</span>
                </div>

                <button aria-label="Action button"
                  onClick={() => {
                    setSwitchOrderTarget(activeOrder);
                    setShowSwitchToShippingModal(true);
                  }}
                  className="px-4 py-2.5 bg-purple-500/20 hover:bg-yellow-500/30 border border-purple-500/40 text-yellow-300 font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🏃</span> Left the show? Switch to Shipping
                </button>
              </div>
            )}

            {activeOrder.fulfillment === "shipping" && (
              <div className="text-right shrink-0">
                <span className="text-[var(--color-accent)] font-bold flex items-center gap-1">
                  <span>✓</span> Shipping Address Saved
                </span>
                <p className="mt-0.5 max-w-[200px] truncate">
                  {activeOrder.shippingAddress?.street}, {activeOrder.shippingAddress?.city}
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Category Filter Tabs ── */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {["All", "Apparel", "Music", "Signed"].map(cat => (
            <button aria-label="Action button"
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 font-bold uppercase tracking-wider transition-colors duration-300 shrink-0 cursor-pointer ${activeCategory === cat ?"bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105"
                : " bg-[#00000029]    border border-white/10  text-white  hover:text-white hover:bg-white/10"
                }`}
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
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-[var(--color-bg-surface)] border border-white/10 overflow-hidden hover:border-cyan-500/50 transition-colors duration-500 group flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.5)]"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-square bg-black/60 overflow-hidden">
                  <Image width={200} height={200} unoptimized
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Category Tag */}
                  <span className="absolute top-3 left-3 font-bold uppercase tracking-widest bg-black/70 backdrop-blur-[45px] px-2.5 py-1 rounded-lg border border-white/10 text-cyan-300">
                    {product.category}
                  </span>

                  {/* Stock status badge */}
                  {product.stockCount && product.stockCount <= 5 && (
                    <span className="absolute bottom-3 left-3 font-bold uppercase tracking-widest bg-red-500/80 text-white px-2.5 py-1 rounded-lg animate-pulse">
                      ⚡ Only {product.stockCount} Left at Desk!
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 space-y-2">
                  <h3 className="text-white font-bold group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Price & Buy Action */}
              <div className="p-5 pt-0 flex items-center justify-between gap-3">
                <div>
                  <span className="text-white/40 block font-bold">Price</span>
                  <span className="text-xl font-bold text-cyan-400">${product.price}</span>
                </div>

                <button aria-label="Action button"
                  onClick={() => handleOpenCheckout(product)}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-[45px] flex items-center justify-center p-4">
          <div className="bg-[#0e0e18] border border-cyan-500/40 rounded-lg max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Image width={200} height={200} unoptimized src={selectedProduct.imageUrl} alt={selectedProduct.title} className="w-12 h-12 object-cover border border-white/10" />
                <div>
                  <h3 className="text-white font-bold line-clamp-1">{selectedProduct.title}</h3>
                  <p className="text-cyan-400 font-bold">${selectedProduct.price}</p>
                </div>
              </div>
              <button aria-label="Action button"
                onClick={() => setShowCheckout(false)}
                className="text-white/40 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteOrder} className="space-y-5">

              {/* Size Selector if available */}
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div>
                  <span className="font-bold uppercase tracking-wider text-white/70 block mb-2">Select Size</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map(size => (
                      <button aria-label="Action button"
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-10 font-bold transition-colors cursor-pointer ${selectedSize === size ?"bg-cyan-500 text-black border border-cyan-400  font-bold  shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                          : " bg-[#00000029]    border border-white/10  text-white  hover:text-white"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fulfillment Method Selector */}
              <div>
                <span className="font-bold uppercase tracking-wider text-white/70 block mb-2">Fulfillment Option</span>
                <div className="grid grid-cols-2 gap-3">

                  {/* Option 1: Merch Table Pickup */}
                  <button aria-label="Action button"
                    type="button"
                    onClick={() => setFulfillmentMethod("pickup")}
                    className={`p-4 border text-left transition-colors cursor-pointer ${fulfillmentMethod ==="pickup"
                      ? "bg-cyan-500/15 border-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                      : " bg-[#00000029]    border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                  >
                    <span className="text-xl block mb-1">🎪</span>
                    <span className="font-bold uppercase tracking-wide block text-white">Merch Table Pickup</span>
                    <span className="text-purple-400font-bold block mt-0.5">Free Instant Pickup</span>
                  </button>

                  {/* Option 2: Home Delivery Shipping */}
                  <button aria-label="Action button"
                    type="button"
                    onClick={() => setFulfillmentMethod("shipping")}
                    className={`p-4 border text-left transition-colors cursor-pointer ${fulfillmentMethod ==="shipping"
                      ? "bg-purple-500/15 border-purple-500 text-white shadow-[0_0_20px_rgba(255,10,61,0.2)]"
                      : " bg-[#00000029]    border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                  >
                    <span className="text-xl block mb-1">📦</span>
                    <span className="font-bold uppercase tracking-wide block text-white">Ship to My Address</span>
                    <span className="text-purple-300 font-bold block mt-0.5">Standard Carrier</span>
                  </button>

                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="space-y-3 pt-2">
                <div>
                  <label htmlFor="qr-merch-customer-name" className="text-[var(--font-size-2xs)] font-bold uppercase text-white/50 block mb-1">Your Full Name</label>
                  <input aria-label="Input field"
                    id="qr-merch-customer-name"
                    type="text"
                    required
                    placeholder="e.g. Alex Miller"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-[#00000029] border border-white/10 px-4 py-3 text-white focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="qr-merch-customer-email" className="text-[var(--font-size-2xs)] font-bold uppercase text-white/50 block mb-1">Email Address for Receipt & PIN</label>
                  <input aria-label="Input field"
                    id="qr-merch-customer-email"
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#00000029] border border-white/10 px-4 py-3 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              {/* Shipping Address Inputs if Shipping selected */}
              {fulfillmentMethod === "shipping" && (
                <div className="space-y-3 pt-2 border-t border-white/10 transition-opacity duration-300 animate-in fade-in">
                  <p className="font-bold uppercase tracking-wider">Shipping Address</p>
                  <div>
                    <input aria-label="Input field"
                      type="text"
                      required
                      placeholder="Street Address"
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      className="w-full bg-[#00000029] border border-white/10 px-4 py-3 text-white focus:border-purple-500 outline-none mb-2"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input aria-label="Input field"
                        type="text"
                        required
                        placeholder="City"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="bg-[#00000029] border border-white/10 px-3 py-2.5 text-white focus:border-purple-500 outline-none"
                      />
                      <input aria-label="Input field"
                        type="text"
                        required
                        placeholder="State"
                        value={state}
                        onChange={e => setState(e.target.value)}
                        className="bg-[#00000029] border border-white/10 px-3 py-2.5 text-white focus:border-purple-500 outline-none"
                      />
                      <input aria-label="Input field"
                        type="text"
                        required
                        placeholder="ZIP Code"
                        value={zip}
                        onChange={e => setZip(e.target.value)}
                        className="bg-[#00000029] border border-white/10 px-3 py-2.5 text-white focus:border-purple-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button aria-label="Action button"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-black font-bold uppercase tracking-widest transition-colors shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:opacity-90 cursor-pointer"
              >
                {isSubmitting ? "Processing Order..." : `Complete Purchase — $${selectedProduct.price}`}
              </button>

            </form>

          </div>
        </div>
      )}

      {/* ── MISSED PICKUP TO SHIPPING CONVERSION MODAL ── */}
      {showSwitchToShippingModal && switchOrderTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-[45px] flex items-center justify-center p-4">
          <div className="bg-[#0e0e18] border border-purple-500/40 rounded-lg max-w-md w-full p-6 sm:p-8 space-y-5 shadow-[0_0_40px_rgba(234,179,8,0.25)]">

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏃</span>
                <div>
                  <h3 className="text-white font-bold uppercase tracking-wide">Left the Show? Switch to Shipping</h3>
                  <p className="">Enter your delivery address below</p>
                </div>
              </div>
              <button aria-label="Action button" onClick={() => setShowSwitchToShippingModal(false)} className="text-white/40 hover:text-white text-base">✕</button>
            </div>

            <p className="leading-relaxed">
              No problem! If you couldn't grab <strong className="text-white">{switchOrderTarget.productTitle}</strong> at the merch desk before leaving, enter your mailing address and we'll ship it directly to you.
            </p>

            <form onSubmit={handleSwitchToDelivery} className="space-y-3">
              <input aria-label="Input field"
                type="text"
                required
                placeholder="Street Address"
                value={street}
                onChange={e => setStreet(e.target.value)}
                className="w-full bg-[#00000029] border border-white/10 px-4 py-3 text-white focus:border-yellow-400 outline-none"
              />

              <div className="grid grid-cols-3 gap-2">
                <input aria-label="Input field"
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="bg-[#00000029] border border-white/10 px-3 py-2.5 text-white focus:border-yellow-400 outline-none"
                />
                <input aria-label="Input field"
                  type="text"
                  required
                  placeholder="State"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="bg-[#00000029] border border-white/10 px-3 py-2.5 text-white focus:border-yellow-400 outline-none"
                />
                <input aria-label="Input field"
                  type="text"
                  required
                  placeholder="ZIP Code"
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  className="bg-[#00000029] border border-white/10 px-3 py-2.5 text-white focus:border-yellow-400 outline-none"
                />
              </div>

              <button aria-label="Action button"
                type="submit"
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)] cursor-pointer mt-2"
              >
                Confirm Delivery Address & Convert Order
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ── PRINTABLE QR VENUE SIGN MODAL ── */}
      {showQRSignModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-[45px] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--color-bg-surface)] border border-cyan-500/50 rounded-lg max-w-md w-full p-6 sm:p-8 space-y-6 text-center shadow-[0_0_60px_rgba(6,182,212,0.3)]">

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-bold uppercase tracking-widest text-cyan-400">Venue Printable QR Sign</span>
              <button aria-label="Action button" onClick={() => setShowQRSignModal(false)} className="text-white/40 hover:text-white font-bold cursor-pointer">✕ Close</button>
            </div>

            <div className="p-6 bg-gradient-to-b from-[#091a28] to-[#0a0a12] border-2 border-cyan-400 relative">
              <span className="font-bold uppercase tracking-[0.3em] text-cyan-300 block mb-1">7th Heaven Band</span>
              <h2 className="font-bold uppercase text-white tracking-wider mb-1">Scan for Express Merch</h2>
              <p className="mb-5">Pick Up at Band Table or Ship to Your Door</p>

              {/* Scannable QR Code Image */}
              <div className="w-56 h-56 mx-auto bg-white p-3 shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center mb-4">
                <Image width={200} height={200} unoptimized
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('https://7thheavenband.com/qr/merch')}`}
                  alt="Scan to order 7th Heaven Merch"
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="font-mono text-purple-400tracking-wider">7THHEAVENBAND.COM/QR/MERCH</p>
            </div>

            <div className="flex gap-3">
              <button aria-label="Action button"
                onClick={() => window.print()}
                className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-widest transition-colors cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                🖨️ Print / Save Sign
              </button>
              <button aria-label="Action button"
                onClick={() => setShowQRSignModal(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest cursor-pointer"
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
