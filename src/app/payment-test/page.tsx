"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useNorthCart } from "@/context/NorthCartContext";

const CATEGORIES = ["All", "Shirts", "Albums", "Hats"] as const;

type ApiVariant = {
  id: string;
  label: string;
  price: number | string;
  stock_quantity: number | string;
  low_stock_threshold: number | string;
};

type ApiProduct = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: "Shirts" | "Albums" | "Hats";
  variant_kind: "Size" | "Format" | "Color";
  variants: ApiVariant[];
};

function ProductCard({
  product,
  cartQuantities,
  onAdd,
}: {
  product: ApiProduct;
  cartQuantities: Map<string, number>;
  onAdd: (variantId: string) => void;
}) {
  const [userSelectedVariantId, setUserSelectedVariantId] = useState<string | null>(null);
  const selectedVariant =
    product.variants.find((v) => v.id === userSelectedVariantId) || product.variants[0];
  const selectedStock = Number(selectedVariant.stock_quantity);
  const inCart = cartQuantities.get(selectedVariant.id) || 0;
  const soldOut = selectedStock <= 0;
  const maxedOut = inCart >= selectedStock;
  const lowStock = !soldOut && selectedStock <= Number(selectedVariant.low_stock_threshold);

  return (
    <div className="bg-white/[0.04] border border-white/[0.12] rounded-lg overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-black/40">
        <Image
          src={product.image_url}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
          className="object-cover"
        />
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase    bg-black/70 backdrop-blur-[45px] px-2.5 py-1 rounded-lg border border-white/10 text-cyan-300">
          {product.category}
        </span>
        {soldOut && (
          <span className="absolute top-3 right-3 text-[10px] font-bold uppercase    bg-rose-600/90 text-white px-2.5 py-1 rounded-lg">
            Sold Out
          </span>
        )}
        {lowStock && (
          <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase    bg-yellow-500/90 text-black px-2.5 py-1 rounded-lg">
            Only {selectedStock} left
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-white font-bold leading-tight">{product.title}</h3>
          <p className="mt-1 leading-relaxed">{product.description}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase  text-white/40 block mb-1.5">
            {product.variant_kind}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {product.variants.map((variant) => {
              const variantSoldOut = Number(variant.stock_quantity) <= 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={variantSoldOut}
                  onClick={() => setUserSelectedVariantId(variant.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:line-through ${selectedVariant.id === variant.id ? "bg-[var(--color-accent)] text-white"
                    : " bg-[#00000029]    border border-white/10  text-white  hover:text-white"
                    }`}
                >
                  {variant.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-[var(--color-accent)]">
            ${Number(selectedVariant.price).toFixed(2)}
          </span>
          <button
            type="button"
            disabled={soldOut || maxedOut}
            onClick={() => onAdd(selectedVariant.id)}
            className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase  rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {soldOut ? "Sold Out" : maxedOut ? "Max in Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentTestShopPage() {
  const router = useRouter();
  const cart = useNorthCart();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [showCart, setShowCart] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [startingCheckout, setStartingCheckout] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [showLimitations, setShowLimitations] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  // eslint-disable-next-line react-doctor/nextjs-no-client-fetch-for-server-data, react-doctor/no-fetch-in-effect
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/payment-test/north/status");
        if (!res.ok) return;
        const data = await res.json();
        if (active && data) setMockMode(!!data.mock);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // eslint-disable-next-line react-doctor/nextjs-no-client-fetch-for-server-data, react-doctor/no-fetch-in-effect
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/payment-test/products");
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setProductsError(data.error || "Failed to load products.");
        } else {
          setProducts(data);
        }
      } catch {
        if (active) setProductsError("Failed to load products.");
      } finally {
        if (active) setLoadingProducts(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const variantLookup = useMemo(() => {
    const map = new Map<string, { product: ApiProduct; variant: ApiVariant }>();
    for (const product of products) {
      for (const variant of product.variants) {
        map.set(variant.id, { product, variant });
      }
    }
    return map;
  }, [products]);

  const cartQuantities = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cart.items) map.set(item.id, item.quantity);
    return map;
  }, [cart.items]);

  const filteredProducts =
    activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

  const handleAdd = (variantId: string) => {
    const entry = variantLookup.get(variantId);
    if (!entry) return;
    const { product, variant } = entry;
    const stock = Number(variant.stock_quantity);
    const alreadyInCart = cartQuantities.get(variantId) || 0;
    if (alreadyInCart >= stock) return; // guarded by disabled button too

    cart.addOneItemToCart({
      id: variantId,
      productId: product.id,
      title: product.title,
      variantLabel: variant.label,
      imageUrl: product.image_url,
      unitPrice: Number(variant.price),
    });
    setShowCart(true);
  };

  const handleCartIncrement = (variantId: string) => {
    const entry = variantLookup.get(variantId);
    const stock = entry ? Number(entry.variant.stock_quantity) : Infinity;
    const current = cartQuantities.get(variantId) || 0;
    if (current >= stock) return;
    const item = cart.items.find((i) => i.id === variantId);
    if (!item) return;
    cart.addOneItemToCart({
      id: item.id,
      productId: item.productId,
      title: item.title,
      variantLabel: item.variantLabel,
      imageUrl: item.imageUrl,
      unitPrice: item.unitPrice,
    });
  };

  const handleCheckout = async () => {
    setCheckoutError("");
    if (cart.items.length === 0) return;

    setStartingCheckout(true);
    try {
      const amount = cart.getTotalCost().toFixed(2);
      const items = cart.items.map((item) => ({
        variantId: item.id,
        productId: item.productId,
        title: item.title,
        variantLabel: item.variantLabel,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      }));

      const res = await fetch("/api/payment-test/north/tac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, items }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start checkout with North.");
      }

      localStorage.setItem("7h_north_tac_v1", data.tac);
      localStorage.setItem("7h_north_amount_v1", data.amount);
      localStorage.setItem("7h_north_tran_nbr_v1", data.tranNbr);
      localStorage.setItem("7h_north_mock_v1", data.mock ? "1" : "0");
      router.push("/payment-test/checkout");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong starting checkout.";
      setCheckoutError(message);
      setStartingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white pt-32 pb-24">
      {/* Header */}
      <div className="site-container max-w-5xl mx-auto px-6">
        <Link
          href="/"
          className="font-bold uppercase  text-purple-400 hover:text-white transition-colors flex items-center gap-2 mb-6"
        >
          ← Back to Home
        </Link>

        <div className="mb-8">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)] mb-1">
            Official Band Store &amp; Apparel
          </span>
          <h1 className="text-3xl md:text-4xl font-bold uppercase text-white tracking-wide">
            7th Heaven Official Merch Store
          </h1>
          <p className="mt-2 max-w-xl leading-relaxed">
            Get official 7th Heaven shirts, CDs, albums, hats, and exclusive band gear with secure direct checkout and fast shipping.
          </p>

          {mockMode && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-bold rounded-lg max-w-xl">
              🧪 TEST MODE — checkout using simulated TAC for testing payment processing.
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onClick={() => setShowLimitations(!showLimitations)}
              className="flex items-center gap-1.5 font-bold text-purple-300 bg-purple-500/10 hover:bg- purple-white/20 px-3 py-1.5 rounded-lg border border-purple-500/30 transition-colors"
            >
              ✨ Store Features &amp; Capabilities
            </button>
            <Link
              href="/admin/shop-inventory"
              className="flex items-center gap-1.5 font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-colors"
            >
              🛠️ Manage Inventory
            </Link>
          </div>
        </div>

        {/* ── Store Features Breakdown ── */}
        {showLimitations && (
          <div className="mb-8 bg-[#0e0e18] border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-white font-bold uppercase tracking-wide">
                  7th Heaven Direct Store Features &amp; Architecture
                </h3>
                <p className="mt-1">
                  Custom high-speed merchandise storefront with direct merchant payment routing and real-time inventory synchronization.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLimitations(false)}
                className="text-white/40 hover:text-white uppercase font-bold shrink-0 ml-4"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white/70">
              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-emerald-400 font-bold uppercase text-[10px]  block mb-1">
                  ✅ Real-Time Inventory Tracking
                </span>
                <p className="leading-relaxed">
                  Products and variants sync live with per-variant stock counts. Sold-out sizes/formats/colors disable themselves automatically.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-emerald-400 font-bold uppercase text-[10px]  block mb-1">
                  ✅ Order Snapshot &amp; Stock Decrement
                </span>
                <p className="leading-relaxed">
                  Checkout creates a pending order with full line-item snapshots. Once payment confirms, stock decrements automatically.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-emerald-400 font-bold uppercase text-[10px]  block mb-1">
                  ✅ Catalog Admin &amp; Stock Control
                </span>
                <p className="leading-relaxed">
                  <Link href="/admin/shop-inventory" className="underline hover:text-white">
                    /admin/shop-inventory
                  </Link>{" "}
                  lets admins add products, set prices, and adjust stock limits seamlessly.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-purple-300 font-bold uppercase text-[10px]  block mb-1">
                  ⚡ Streamlined Fast Checkout
                </span>
                <p className="leading-relaxed">
                  Direct guest payment gateway allowing fans to complete orders instantly without mandatory account creation or password friction.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-purple-300 font-bold uppercase text-[10px]  block mb-1">
                  ⚡ Direct Merchant Security
                </span>
                <p className="leading-relaxed">
                  Payment credentials route securely to merchant servers so sensitive card data is never stored locally on application servers.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-purple-300 font-bold uppercase text-[10px]  block mb-1">
                  ⚡ Instant Email Order Confirmation
                </span>
                <p className="leading-relaxed">
                  Every order generates an itemized receipt email for the buyer and alerts band staff for quick packing and shipping.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-cyan-300 font-bold uppercase text-[10px]  block mb-1">
                  ✅ Concert QR Code Ordering
                </span>
                <p className="leading-relaxed">
                  Concertgoers can scan official QR codes at live shows to order apparel directly from their mobile phones for venue pickup or delivery.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Roadmap: features buildable on North's actual API suite ── */}
        {showRoadmap && (
          <div className="mb-8 bg-[#0e0e18] border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-white font-bold uppercase tracking-wide">
                  Roadmap: Closing the Gap With North&apos;s Real API Suite
                </h3>
                <p className="mt-1 max-w-2xl">
                  This page only uses North&apos;s Browser Post API — one product in a larger
                  suite. North (EPX) also publishes a Recurring Billing API, Gateway Invoicing
                  API, Embedded Checkout, and reporting APIs. Combined with the inventory/order
                  system already built here, most of the &quot;❌&quot; items above have a real,
                  buildable path — no Shopify migration required.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRoadmap(false)}
                className="text-white/40 hover:text-white uppercase font-bold shrink-0 ml-4"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white/70">
              <div className="bg-black/40 border border-emerald-500/20 rounded-lg p-3">
                <span className="text-emerald-400 font-bold uppercase text-[10px]  block mb-1">
                  🔁 Fan Club / Merch Subscriptions
                </span>
                <p className="leading-relaxed">
                  North&apos;s <strong className="text-white">Recurring Billing API</strong>{" "}
                  supports weekly/bi-weekly/monthly charges with pause, resume, and cancel at any
                  time. Could power a &quot;merch box of the month&quot; or paid fan-club tier —
                  something Shopify needs a subscriptions app for.
                </p>
              </div>

              <div className="bg-black/40 border border-emerald-500/20 rounded-lg p-3">
                <span className="text-emerald-400 font-bold uppercase text-[10px]  block mb-1">
                  💳 Saved Cards &amp; Refunds
                </span>
                <p className="leading-relaxed">
                  Every transaction through North&apos;s Recurring Billing API is tokenized. That
                  token can issue refunds against a past charge and, longer-term, let a returning
                  fan skip re-entering their card. Refunds today would need to go through North&apos;s
                  merchant portal or a tokenized-refund call, not this page.
                </p>
              </div>

              <div className="bg-black/40 border border-emerald-500/20 rounded-lg p-3">
                <span className="text-emerald-400 font-bold uppercase text-[10px]  block mb-1">
                  🧾 Custom / VIP Order Invoicing
                </span>
                <p className="leading-relaxed">
                  North&apos;s <strong className="text-white">Gateway Invoicing API</strong> is
                  built for mail-order/telephone-order flows — send a fan a payment link for a
                  custom bundle, signed vinyl, or VIP package without them touching the storefront.
                </p>
              </div>

              <div className="bg-black/40 border border-emerald-500/20 rounded-lg p-3">
                <span className="text-emerald-400 font-bold uppercase text-[10px]  block mb-1">
                  📊 Real Sales Dashboard
                </span>
                <p className="leading-relaxed">
                  North&apos;s Merchant Reporting and Gateway Business Reporting APIs expose
                  settlement and transaction data that could feed a revenue dashboard inside{" "}
                  <Link href="/admin/shop-inventory" className="underline hover:text-white">
                    /admin/shop-inventory
                  </Link>{" "}
                  — closer to Shopify Analytics than the raw order list is today.
                </p>
              </div>

              <div className="bg-black/40 border border-emerald-500/20 rounded-lg p-3">
                <span className="text-emerald-400 font-bold uppercase text-[10px]  block mb-1">
                  🖥️ Embedded Checkout Upgrade
                </span>
                <p className="leading-relaxed">
                  North offers a hosted <strong className="text-white">Embedded Checkout</strong>{" "}
                  widget as an alternative to a raw Browser Post form — same PCI-scope benefit,
                  nicer built-in card-entry UI, without hand-rolling every field.
                </p>
              </div>

              <div className="bg-black/40 border border-emerald-500/20 rounded-lg p-3">
                <span className="text-emerald-400 font-bold uppercase text-[10px]  block mb-1">
                  🏬 In-Person + Online, One Inventory
                </span>
                <p className="leading-relaxed">
                  North also does card-present/in-person payments. Ringing up merch-table sales
                  against the same Supabase stock table this shop already uses would keep online
                  and in-person inventory in sync — genuine Shopify POS parity.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-yellow-300 font-bold uppercase text-[10px]  block mb-1">
                  🛠️ Not North — Custom-Built Only
                </span>
                <p className="leading-relaxed">
                  Customer accounts/order history (hook into the site&apos;s existing member
                  login), discount codes and sales tax (apply before requesting the TAC), and
                  abandoned-cart emails (the site already has Resend/Twilio wired up elsewhere)
                  are all outside North&apos;s API — they&apos;d be built on this app&apos;s own
                  infrastructure, same as Shopify apps bolt on top of Shopify&apos;s core.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category tabs + cart button */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg font-bold uppercase  transition-colors shrink-0 ${activeCategory === cat ? "bg-cyan-500 text-black"
                  : " bg-[#00000029]    border border-white/10  text-white  hover:text-white"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowCart(true)}
            className="px-4 py-2.5 bg-[#00000029] border border-white/10 hover:border-[var(--color-accent)] rounded-lg font-bold uppercase  transition-colors flex items-center gap-2"
          >
            🛒 Cart ({cart.getNumberOfCartItems()})
          </button>
        </div>

        {/* Product grid */}
        {loadingProducts ? (
          <p className="py-12 text-center">Loading products…</p>
        ) : productsError ? (
          <p className="text-rose-400 py-12 text-center">⚠️ {productsError}</p>
        ) : filteredProducts.length === 0 ? (
          <p className="py-12 text-center">
            No products yet.{" "}
            <Link href="/admin/shop-inventory" className="underline hover:text-white">
              Add some in the inventory admin.
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantities={cartQuantities}
                onAdd={handleAdd}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-[45px] flex items-center justify-center p-4">
          <div className="bg-[#0e0e18] border border-white/[0.12] rounded-lg max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-white font-bold uppercase tracking-wide">My Cart</h2>
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="text-white/40 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {cart.items.length === 0 ? (
              <p className="py-8 text-center">Your cart is empty.</p>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => {
                  const entry = variantLookup.get(item.id);
                  const stock = entry ? Number(entry.variant.stock_quantity) : Infinity;
                  const atMax = item.quantity >= stock;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-lg p-3"
                    >
                      <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden bg-black/40">
                        <Image src={item.imageUrl} alt={item.title} fill sizes="56px" unoptimized className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{item.title}</p>
                        <p className="">{item.variantLabel}</p>
                        <p className="font-bold mt-0.5">
                          ${item.unitPrice.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => cart.removeOneItemFromCart(item.id)}
                          className="w-7 h-7 flex items-center justify-center bg-[#00000029] border border-white/10 rounded-lg text-white/70 hover:text-white font-bold"
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={atMax}
                          onClick={() => handleCartIncrement(item.id)}
                          className="w-7 h-7 flex items-center justify-center bg-[#00000029] border border-white/10 rounded-lg text-white/70 hover:text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => cart.deleteItemFromCart(item.id)}
                        className="text-white/30 hover:text-rose-400 px-1"
                        aria-label={`Remove ${item.title}`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {checkoutError && (
              <div className="p-3 border border-rose-500/20 bg-rose-500/10 text-rose-400 font-bold leading-normal">
                ⚠️ {checkoutError}
              </div>
            )}

            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <span className="text-white/50 font-bold uppercase tracking-wider">Total</span>
              <span className="text-2xl font-bold text-[var(--color-accent)]">
                ${cart.getTotalCost().toFixed(2)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="flex-1 py-3 bg-[#00000029] hover:bg-white/10 border border-white/10 text-white font-bold uppercase    rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                disabled={cart.items.length === 0 || startingCheckout}
                onClick={handleCheckout}
                className="flex-1 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase    rounded-lg transition-colors disabled:opacity-40"
              >
                {startingCheckout ? "Starting…" : "Checkout with North"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
