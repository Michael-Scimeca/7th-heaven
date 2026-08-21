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
        <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-cyan-300">
          {product.category}
        </span>
        {soldOut && (
          <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-widest bg-rose-600/90 text-white px-2.5 py-1 rounded-lg">
            Sold Out
          </span>
        )}
        {lowStock && (
          <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-widest bg-yellow-500/90 text-black px-2.5 py-1 rounded-lg">
            Only {selectedStock} left
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-white font-black text-base leading-tight">{product.title}</h3>
          <p className="text-white/40 text-xs mt-1 leading-relaxed">{product.description}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:line-through ${
                    selectedVariant.id === variant.id
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {variant.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-black text-[var(--color-accent)]">
            ${Number(selectedVariant.price).toFixed(2)}
          </span>
          <button
            type="button"
            disabled={soldOut || maxedOut}
            onClick={() => onAdd(selectedVariant.id)}
            className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
    <div className="min-h-screen bg-[#06060b] text-white pt-32 pb-24">
      {/* Header */}
      <div className="site-container max-w-5xl mx-auto px-6">
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-white transition-colors flex items-center gap-2 mb-6"
        >
          ← Back to Home
        </Link>

        <div className="mb-8">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-accent)] mb-1">
            North (EPX) Browser Post API — Test Shop
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-white tracking-wide">
            7th Heaven Shop
          </h1>
          <p className="text-white/40 text-sm mt-2 max-w-xl leading-relaxed">
            Add items to your cart, then checkout through North&apos;s Browser Post API. Card
            details are entered on a form that posts straight to EPX&apos;s servers — nothing
            sensitive ever touches this app. Stock is real and tracked in the database.
          </p>

          {mockMode && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold rounded-lg max-w-xl">
              🧪 TEST MODE — no real North (EPX) credentials are configured. Checkout will use a
              simulated TAC and let you fake an approved/declined result instead of contacting
              EPX. Set real credentials in <code className="font-mono">.env.local</code> and turn
              off <code className="font-mono">NORTH_MOCK_MODE</code> to go live.
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onClick={() => setShowLimitations(!showLimitations)}
              className="flex items-center gap-1.5 text-xs font-bold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg border border-purple-500/30 transition-colors"
            >
              ℹ️ What This Shop Can &amp; Can&apos;t Do (vs. Shopify)
            </button>
            <Link
              href="/admin/shop-inventory"
              className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-colors"
            >
              🛠️ Manage Inventory
            </Link>
          </div>
        </div>

        {/* ── North vs. Shopify capability breakdown ── */}
        {showLimitations && (
          <div className="mb-8 bg-[#0e0e18] border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-wide">
                  North (EPX) vs. Shopify — What&apos;s Actually Here
                </h3>
                <p className="text-white/40 text-xs mt-1">
                  North&apos;s Browser Post API is a payment terminal, not a storefront. This page
                  is a custom shop wired to real inventory, but there&apos;s still real ground
                  Shopify covers that this doesn&apos;t.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLimitations(false)}
                className="text-white/40 hover:text-white text-xs uppercase font-bold shrink-0 ml-4"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-white/70">
              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-emerald-400 font-black uppercase text-[10px] tracking-wider block mb-1">
                  ✅ Real Inventory Tracking
                </span>
                <p className="text-white/60 leading-relaxed">
                  Products and variants live in Supabase with real per-variant stock counts.
                  Sold-out sizes/formats/colors disable themselves automatically.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-emerald-400 font-black uppercase text-[10px] tracking-wider block mb-1">
                  ✅ Order Records &amp; Stock Decrement
                </span>
                <p className="text-white/60 leading-relaxed">
                  Checkout creates a pending order with the full cart snapshot. Once North
                  confirms payment, stock decrements and the order is marked paid.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-emerald-400 font-black uppercase text-[10px] tracking-wider block mb-1">
                  ✅ Catalog Admin
                </span>
                <p className="text-white/60 leading-relaxed">
                  <Link href="/admin/shop-inventory" className="underline hover:text-white">
                    /admin/shop-inventory
                  </Link>{" "}
                  lets you add products, set prices, and adjust stock limits without touching code.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-rose-300 font-black uppercase text-[10px] tracking-wider block mb-1">
                  ❌ Customer Accounts &amp; Order History
                </span>
                <p className="text-white/60 leading-relaxed">
                  No login, no past-orders list for shoppers. North&apos;s API only ever sees a
                  single transaction — it has no concept of a returning customer.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-rose-300 font-black uppercase text-[10px] tracking-wider block mb-1">
                  ❌ Discounts, Tax &amp; Shipping Calculation
                </span>
                <p className="text-white/60 leading-relaxed">
                  The cart total is just the sum of line items. No promo codes, no sales tax, no
                  shipping rates — all things Shopify (or its apps) compute automatically.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-rose-300 font-black uppercase text-[10px] tracking-wider block mb-1">
                  ❌ Abandoned Cart Recovery &amp; Analytics
                </span>
                <p className="text-white/60 leading-relaxed">
                  Nothing emails a shopper who leaves items in their cart, and there&apos;s no
                  sales dashboard beyond the raw order list. That&apos;s Shopify (or a marketing
                  app) territory.
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <span className="text-cyan-300 font-black uppercase text-[10px] tracking-wider block mb-1">
                  ✅ QR Codes
                </span>
                <p className="text-white/60 leading-relaxed">
                  Not Shopify-specific — a QR code is just a link. The Shopify shop at{" "}
                  <code className="text-white font-mono">/qr/merch</code> already has one; the
                  same could be added here.
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
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors shrink-0 ${activeCategory === cat
                  ? "bg-cyan-500 text-black"
                  : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowCart(true)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-[var(--color-accent)] rounded-lg text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            🛒 Cart ({cart.getNumberOfCartItems()})
          </button>
        </div>

        {/* Product grid */}
        {loadingProducts ? (
          <p className="text-white/40 text-sm py-12 text-center">Loading products…</p>
        ) : productsError ? (
          <p className="text-rose-400 text-sm py-12 text-center">⚠️ {productsError}</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-white/40 text-sm py-12 text-center">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e0e18] border border-white/[0.12] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-white font-black text-lg uppercase tracking-wide">My Cart</h2>
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="text-white/40 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {cart.items.length === 0 ? (
              <p className="text-white/50 text-sm py-8 text-center">Your cart is empty.</p>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => {
                  const entry = variantLookup.get(item.id);
                  const stock = entry ? Number(entry.variant.stock_quantity) : Infinity;
                  const atMax = item.quantity >= stock;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-xl p-3"
                    >
                      <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-black/40">
                        <Image src={item.imageUrl} alt={item.title} fill sizes="56px" unoptimized className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{item.title}</p>
                        <p className="text-white/40 text-xs">{item.variantLabel}</p>
                        <p className="text-[var(--color-accent)] font-bold text-xs mt-0.5">
                          ${item.unitPrice.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => cart.removeOneItemFromCart(item.id)}
                          className="w-7 h-7 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-white/70 hover:text-white text-sm font-bold"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={atMax}
                          onClick={() => handleCartIncrement(item.id)}
                          className="w-7 h-7 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-white/70 hover:text-white text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => cart.deleteItemFromCart(item.id)}
                        className="text-white/30 hover:text-rose-400 text-sm px-1"
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
              <div className="p-3 border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-bold leading-normal">
                ⚠️ {checkoutError}
              </div>
            )}

            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <span className="text-white/50 text-sm font-bold uppercase tracking-wider">Total</span>
              <span className="text-2xl font-black text-[var(--color-accent)]">
                ${cart.getTotalCost().toFixed(2)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                disabled={cart.items.length === 0 || startingCheckout}
                onClick={handleCheckout}
                className="flex-1 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-black text-xs uppercase tracking-widest rounded-lg transition-colors disabled:opacity-40"
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
