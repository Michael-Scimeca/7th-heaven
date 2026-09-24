"use client";

import { useEffect, useMemo, useState } from "react";
import { useTransition } from "@/context/TransitionContext";
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
  const [userSelectedVariantId, setUserSelectedVariantId] = useState<
    string | null
  >(null);
  const selectedVariant =
    product.variants.find((v) => v.id === userSelectedVariantId) ||
    product.variants[0];
  const selectedStock = Number(selectedVariant.stock_quantity);
  const inCart = cartQuantities.get(selectedVariant.id) || 0;
  const soldOut = selectedStock <= 0;
  const maxedOut = inCart >= selectedStock;
  const lowStock =
    !soldOut && selectedStock <= Number(selectedVariant.low_stock_threshold);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-white/[0.04]">
      <div className="relative aspect-square bg-black/40">
        <Image
          src={product.image_url}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
          className="object-cover"
        />
        <span className="absolute top-3 left-3 rounded-lg border border-white/10 bg-black/70 px-2.5 py-1 text-[10px] backdrop-blur-[45px]">
          {product.category}
        </span>
        {soldOut && (
          <span className="absolute top-3 right-3 rounded-lg bg-rose-600/90 px-2.5 py-1 text-[10px]">
            Sold Out
          </span>
        )}
        {lowStock && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-yellow-500/90 px-2.5 py-1 text-[10px]">
            Only {selectedStock} left
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3>{product.title}</h3>
          <p>{product.description}</p>
        </div>

        <div>
          <span className="mb-1.5 block text-[10px] text-white/40">
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
                  className={`rounded-lg px-3 py-1.5 transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-30 ${selectedVariant.id === variant.id ? "bg-[var(--color-accent)]" : "border border-white/10 bg-[#00000029] hover:text-white"}`}
                >
                  {variant.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg text-[var(--color-accent)]">
            ${Number(selectedVariant.price).toFixed(2)}
          </span>
          <button
            type="button"
            disabled={soldOut || maxedOut}
            onClick={() => onAdd(selectedVariant.id)}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 transition-colors hover:bg-[var(--color-accent)]/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {soldOut ? "Sold Out" : maxedOut ? "Max in Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentTestShopPage() {
  const { requestTransition } = useTransition();
  const cart = useNorthCart();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<(typeof CATEGORIES)[number]>("All");
  const [showCart, setShowCart] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [startingCheckout, setStartingCheckout] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [showLimitations, setShowLimitations] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showCreditGuide, setShowCreditGuide] = useState(true);

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
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

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
      requestTransition("/payment-test/checkout");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong starting checkout.";
      setCheckoutError(message);
      setStartingCheckout(false);
    }
  };

  return (
    <div className="page-container min-h-screen pb-24">
      {/* Header */}
      <div className="site-container mx-auto max-w-5xl px-6">
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-purple-400 transition-colors hover:text-white"
        >
          ← Back to Home
        </Link>

        <div className="mb-8">
          <span className="mb-1 inline-block text-[10px]">
            Official Band Store &amp; Apparel
          </span>
          <h1 className="text-3xl md:text-4xl">
            7th Heaven Official Merch Store
          </h1>
          <p className="mt-2 max-w-xl">
            Get official 7th Heaven shirts, CDs, albums, hats, and exclusive
            band gear with secure direct checkout and fast shipping.
          </p>

          {mockMode && (
            <div className="mt-4 max-w-xl rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-yellow-300">
              🧪 TEST MODE — checkout using simulated TAC for testing payment
              processing.
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowCreditGuide(!showCreditGuide)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-emerald-300 transition-colors hover:bg-emerald-500/20"
            >
              💳 Credit System &amp; Processing Guide{" "}
              {showCreditGuide ? "▲" : "▼"}
            </button>
            <button
              type="button"
              onClick={() => setShowLimitations(!showLimitations)}
              className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-purple-300 transition-colors hover:bg-purple-500/20"
            >
              ✨ Store Features &amp; Architecture
            </button>
            <Link
              href="/admin/shop-inventory"
              className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-cyan-500/10 px-3 py-1.5 transition-colors hover:bg-cyan-500/20"
            >
              🛠️ Manage Inventory
            </Link>
          </div>
        </div>

        {/* ── Credit System Setup & Architecture Discussion ── */}
        {showCreditGuide && (
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-emerald-500/40 bg-[#0a0f1d] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-emerald-500/20 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💳</span>
                <div>
                  <h2 className="text-lg">
                    Credit Processing &amp; Merchant System Setup
                  </h2>
                  <p className="mt-0.5 text-xs text-emerald-400/90">
                    Step-by-step technical breakdown for configuring North
                    Merchant Processing &amp; Fan Store Credits
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreditGuide(false)}
                className="ml-4 shrink-0 text-xs text-white/40 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div className="flex flex-col gap-2 rounded-xl border border-emerald-500/20 bg-black/50 p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400 bg-emerald-500/20 text-xs text-emerald-300">
                    1
                  </span>
                  <h4 className=" ">Merchant Environment Setup</h4>
                </div>
                <p className="text-xs leading-relaxed text-white/70">
                  To accept live credit card transactions, configure server
                  credentials in your{" "}
                  <code className="rounded bg-black/60 px-1.5 py-0.5 text-emerald-300">
                    .env.local
                  </code>
                  :
                </p>
                <div className="space-y-1 rounded-lg border border-white/5 bg-black/80 p-2.5 font-mono text-[11px] text-emerald-300">
                  <div>NORTH_MERCHANT_ID=your_merchant_id</div>
                  <div>NORTH_TERMINAL_ID=your_terminal_id</div>
                  <div>NORTH_API_SECRET=your_secret_key</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-emerald-500/20 bg-black/50 p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400 bg-emerald-500/20 text-xs text-emerald-300">
                    2
                  </span>
                  <h4 className=" ">TAC Tokenization Flow</h4>
                </div>
                <p className="text-xs leading-relaxed text-white/70">
                  Cart checkout triggers{" "}
                  <code className="rounded bg-black/60 px-1.5 py-0.5 text-emerald-300">
                    /api/payment-test/north/tac
                  </code>{" "}
                  to request a temporary{" "}
                  <strong>Transaction Access Code (TAC)</strong>. Card numbers
                  are posted directly to North&apos;s SSL gateway endpoint so
                  PCI compliance remains zero-overhead for our server.
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-emerald-500/20 bg-black/50 p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400 bg-emerald-500/20 text-xs text-emerald-300">
                    3
                  </span>
                  <h4 className=" ">Verification &amp; Inventory Sync</h4>
                </div>
                <p className="text-xs leading-relaxed text-white/70">
                  Upon gateway approval, North redirects to{" "}
                  <code className="rounded bg-black/60 px-1.5 py-0.5 text-emerald-300">
                    /api/payment-test/north/result
                  </code>
                  . The route verifies gateway signatures, decrements stock for
                  each variant, and marks the order paid in Supabase.
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-emerald-500/20 bg-black/50 p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400 bg-emerald-500/20 text-xs text-emerald-300">
                    4
                  </span>
                  <h4 className=" ">Fan Loyalty &amp; Store Credit</h4>
                </div>
                <p className="text-xs leading-relaxed text-white/70">
                  Fans earn 5% back in store credits on every purchase. Credits
                  automatically convert to discount tokens redeemable at
                  checkout or applied towards VIP meet-and-greet passes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Store Features Breakdown ── */}
        {showLimitations && (
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-purple-500/30 bg-[#0e0e18] p-6">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3>7th Heaven Direct Store Features &amp; Architecture</h3>
                <p>
                  Custom high-speed merchandise storefront with direct merchant
                  payment routing and real-time inventory synchronization.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLimitations(false)}
                className="ml-4 shrink-0 text-white/40 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 text-white/70 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <span className="mb-1 block text-[10px] text-emerald-400">
                  ✅ Real-Time Inventory Tracking
                </span>
                <p>
                  Products and variants sync live with per-variant stock counts.
                  Sold-out sizes/formats/colors disable themselves
                  automatically.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <span className="mb-1 block text-[10px] text-emerald-400">
                  ✅ Order Snapshot &amp; Stock Decrement
                </span>
                <p>
                  Checkout creates a pending order with full line-item
                  snapshots. Once payment confirms, stock decrements
                  automatically.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <span className="mb-1 block text-[10px] text-emerald-400">
                  ✅ Catalog Admin &amp; Stock Control
                </span>
                <p>
                  <Link
                    href="/admin/shop-inventory"
                    className="hover:text-white"
                  >
                    /admin/shop-inventory
                  </Link>{" "}
                  lets admins add products, set prices, and adjust stock limits
                  seamlessly.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <span className="mb-1 block text-[10px] text-purple-300">
                  ⚡ Streamlined Fast Checkout
                </span>
                <p>
                  Direct guest payment gateway allowing fans to complete orders
                  instantly without mandatory account creation or password
                  friction.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <span className="mb-1 block text-[10px] text-purple-300">
                  ⚡ Direct Merchant Security
                </span>
                <p>
                  Payment credentials route securely to merchant servers so
                  sensitive card data is never stored locally on application
                  servers.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <span className="mb-1 block text-[10px] text-purple-300">
                  ⚡ Instant Email Order Confirmation
                </span>
                <p>
                  Every order generates an itemized receipt email for the buyer
                  and alerts band staff for quick packing and shipping.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <span className="mb-1 block text-[10px]">
                  ✅ Concert QR Code Ordering
                </span>
                <p>
                  Concertgoers can scan official QR codes at live shows to order
                  apparel directly from their mobile phones for venue pickup or
                  delivery.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Roadmap: features buildable on North's actual API suite ── */}
        {showRoadmap && (
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#0e0e18] p-6">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3>
                  Roadmap: Closing the Gap With North&apos;s Real API Suite
                </h3>
                <p className="max-w-2xl">
                  This page only uses North&apos;s Browser Post API — one
                  product in a larger suite. North (EPX) also publishes a
                  Recurring Billing API, Gateway Invoicing API, Embedded
                  Checkout, and reporting APIs. Combined with the
                  inventory/order system already built here, most of the
                  &quot;❌&quot; items above have a real, buildable path — no
                  Shopify migration required.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRoadmap(false)}
                className="ml-4 shrink-0 text-white/40 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 text-white/70 md:grid-cols-2">
              <div className="rounded-lg border border-emerald-500/20 bg-black/40 p-3">
                <span className="mb-1 block text-[10px] text-emerald-400">
                  🔁 Fan Club / Merch Subscriptions
                </span>
                <p>
                  North&apos;s <strong>Recurring Billing API</strong> supports
                  weekly/bi-weekly/monthly charges with pause, resume, and
                  cancel at any time. Could power a &quot;merch box of the
                  month&quot; or paid fan-club tier — something Shopify needs a
                  subscriptions app for.
                </p>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-black/40 p-3">
                <span className="mb-1 block text-[10px] text-emerald-400">
                  💳 Saved Cards &amp; Refunds
                </span>
                <p>
                  Every transaction through North&apos;s Recurring Billing API
                  is tokenized. That token can issue refunds against a past
                  charge and, longer-term, let a returning fan skip re-entering
                  their card. Refunds today would need to go through
                  North&apos;s merchant portal or a tokenized-refund call, not
                  this page.
                </p>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-black/40 p-3">
                <span className="mb-1 block text-[10px] text-emerald-400">
                  🧾 Custom / VIP Order Invoicing
                </span>
                <p>
                  North&apos;s <strong>Gateway Invoicing API</strong> is built
                  for mail-order/telephone-order flows — send a fan a payment
                  link for a custom bundle, signed vinyl, or VIP package without
                  them touching the storefront.
                </p>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-black/40 p-3">
                <span className="mb-1 block text-[10px] text-emerald-400">
                  📊 Real Sales Dashboard
                </span>
                <p>
                  North&apos;s Merchant Reporting and Gateway Business Reporting
                  APIs expose settlement and transaction data that could feed a
                  revenue dashboard inside{" "}
                  <Link
                    href="/admin/shop-inventory"
                    className="hover:text-white"
                  >
                    /admin/shop-inventory
                  </Link>{" "}
                  — closer to Shopify Analytics than the raw order list is
                  today.
                </p>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-black/40 p-3">
                <span className="mb-1 block text-[10px] text-emerald-400">
                  🖥️ Embedded Checkout Upgrade
                </span>
                <p>
                  North offers a hosted <strong>Embedded Checkout</strong>{" "}
                  widget as an alternative to a raw Browser Post form — same
                  PCI-scope benefit, nicer built-in card-entry UI, without
                  hand-rolling every field.
                </p>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-black/40 p-3">
                <span className="mb-1 block text-[10px] text-emerald-400">
                  🏬 In-Person + Online, One Inventory
                </span>
                <p>
                  North also does card-present/in-person payments. Ringing up
                  merch-table sales against the same Supabase stock table this
                  shop already uses would keep online and in-person inventory in
                  sync — genuine Shopify POS parity.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <span className="mb-1 block text-[10px] text-yellow-300">
                  🛠️ Not North — Custom-Built Only
                </span>
                <p>
                  Customer accounts/order history (hook into the site&apos;s
                  existing member login), discount codes and sales tax (apply
                  before requesting the TAC), and abandoned-cart emails (the
                  site already has Resend/Twilio wired up elsewhere) are all
                  outside North&apos;s API — they&apos;d be built on this
                  app&apos;s own infrastructure, same as Shopify apps bolt on
                  top of Shopify&apos;s core.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category tabs + cart button */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-lg px-4 py-2 transition-colors ${activeCategory === cat ? "bg-cyan-500 text-black" : "border border-white/10 bg-[#00000029] hover:text-white"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowCart(true)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#00000029] px-4 py-2.5 transition-colors hover:border-[var(--color-accent)]"
          >
            🛒 Cart ({cart.getNumberOfCartItems()})
          </button>
        </div>

        {/* Product grid */}
        {loadingProducts ? (
          <p className="py-12 text-center">Loading products…</p>
        ) : productsError ? (
          <p className="py-12 text-center text-rose-400">⚠️ {productsError}</p>
        ) : filteredProducts.length === 0 ? (
          <p className="py-12 text-center">
            No products yet.{" "}
            <Link href="/admin/shop-inventory" className="hover:text-white">
              Add some in the inventory admin.
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-[45px]">
          <div className="max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-lg border border-white/[0.12] bg-[#0e0e18] p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2>My Cart</h2>
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="p-1 text-lg text-white/40 hover:text-white"
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
                  const stock = entry
                    ? Number(entry.variant.stock_quantity)
                    : Infinity;
                  const atMax = item.quantity >= stock;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-black/40">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="56px"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{item.title}</p>
                        <p>{item.variantLabel}</p>
                        <p className="mt-0.5">
                          ${item.unitPrice.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => cart.removeOneItemFromCart(item.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#00000029] text-white/70 hover:text-white"
                        >
                          −
                        </button>
                        <span className="w-5 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          disabled={atMax}
                          onClick={() => handleCartIncrement(item.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#00000029] text-white/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => cart.deleteItemFromCart(item.id)}
                        className="px-1 text-white/30 hover:text-rose-400"
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
              <div className="border border-rose-500/20 bg-rose-500/10 p-3 leading-normal text-rose-400">
                ⚠️ {checkoutError}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="r text-white/50">Total</span>
              <span className="text-2xl text-[var(--color-accent)]">
                ${cart.getTotalCost().toFixed(2)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="flex-1 rounded-lg border border-white/10 bg-[#00000029] py-3 transition-colors hover:bg-white/10"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                disabled={cart.items.length === 0 || startingCheckout}
                onClick={handleCheckout}
                className="flex-1 rounded-lg bg-[var(--color-accent)] py-3 transition-colors hover:bg-[var(--color-accent)]/80 disabled:opacity-40"
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
