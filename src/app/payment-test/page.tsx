"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SHOP_PRODUCTS, ShopProduct } from "@/data/north-shop-products";
import { useNorthCart } from "@/context/NorthCartContext";

const CATEGORIES = ["All", "Shirts", "Albums", "Hats"] as const;

function ProductCard({
  product,
  onAdd,
}: {
  product: ShopProduct;
  onAdd: (variantId: string) => void;
}) {
  const [userSelectedVariantId, setUserSelectedVariantId] = useState<string | null>(null);
  const selectedVariant =
    product.variants.find((v) => v.id === userSelectedVariantId) || product.variants[0];

  return (
    <div className="bg-white/[0.04] border border-white/[0.12] rounded-lg  overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-black/40">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
          className="object-cover"
        />
        <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-cyan-300">
          {product.category}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-white font-black text-base leading-tight">{product.title}</h3>
          <p className="text-white/40 text-xs mt-1 leading-relaxed">{product.description}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">
            {product.variantKind}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setUserSelectedVariantId(variant.id)}
                className={`px-3 py-1.5  rounded-lg  text-xs font-bold transition-colors ${selectedVariant.id === variant.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
                  }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-black text-[var(--color-accent)]">
            ${selectedVariant.price.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={() => onAdd(selectedVariant.id)}
            className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentTestShopPage() {
  const router = useRouter();
  const cart = useNorthCart();
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [showCart, setShowCart] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [startingCheckout, setStartingCheckout] = useState(false);
  const [mockMode, setMockMode] = useState(false);

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

  const variantLookup = useMemo(() => {
    const map = new Map<string, { product: ShopProduct; label: string }>();
    for (const product of SHOP_PRODUCTS) {
      for (const variant of product.variants) {
        map.set(variant.id, { product, label: variant.label });
      }
    }
    return map;
  }, []);

  const filteredProducts =
    activeCategory === "All"
      ? SHOP_PRODUCTS
      : SHOP_PRODUCTS.filter((p) => p.category === activeCategory);

  const handleAdd = (variantId: string) => {
    const entry = variantLookup.get(variantId);
    if (!entry) return;
    const variant = entry.product.variants.find((v) => v.id === variantId)!;
    cart.addOneItemToCart({
      id: variantId,
      productId: entry.product.id,
      title: entry.product.title,
      variantLabel: entry.label,
      imageUrl: entry.product.imageUrl,
      unitPrice: variant.price,
    });
    setShowCart(true);
  };

  const handleCheckout = async () => {
    setCheckoutError("");
    if (cart.items.length === 0) return;

    setStartingCheckout(true);
    try {
      const amount = cart.getTotalCost().toFixed(2);
      const res = await fetch("/api/payment-test/north/tac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
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
            sensitive ever touches this app.
          </p>

          {mockMode && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold rounded-lg max-w-xl">
              🧪 TEST MODE — no real North (EPX) credentials are configured. Checkout will use a
              simulated TAC and let you fake an approved/declined result instead of contacting
              EPX. Set real credentials in <code className="font-mono">.env.local</code> and turn
              off <code className="font-mono">NORTH_MOCK_MODE</code> to go live.
            </div>
          )}
        </div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={handleAdd} />
          ))}
        </div>
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
                {cart.items.map((item) => (
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
                        className="w-7 h-7 flex items-center justify-center bg-white/5 border border-white/10  rounded-lg  text-white/70 hover:text-white text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          cart.addOneItemToCart({
                            id: item.id,
                            productId: item.productId,
                            title: item.title,
                            variantLabel: item.variantLabel,
                            imageUrl: item.imageUrl,
                            unitPrice: item.unitPrice,
                          })
                        }
                        className="w-7 h-7 flex items-center justify-center bg-white/5 border border-white/10  rounded-lg  text-white/70 hover:text-white text-sm font-bold"
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
                ))}
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
