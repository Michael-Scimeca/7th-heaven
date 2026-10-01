/* eslint-disable react-doctor/nextjs-no-client-fetch-for-server-data */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useTransition } from "@/context/TransitionContext";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  quantityAvailable: number | null;
  tags: string[];
  images: { edges: { node: { url: string; altText: string } }[] };
  variants: {
    edges: {
      node: {
        id: string;
        price: { amount: string; currencyCode: string };
        compareAtPrice?: { amount: string; currencyCode: string } | null;
        quantityAvailable?: number;
      };
    }[];
  };
};

function isOnSpecial(product: ShopifyProduct): boolean {
  // 1. Has a compare-at price (Shopify sale)
  const variant = product.variants?.edges?.[0]?.node;
  if (
    variant?.compareAtPrice?.amount &&
    parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount)
  ) {
    return true;
  }
  // 2. Tagged as special/featured/sale in Shopify
  const specialTags = ["special", "featured", "sale", "homepage", "promo"];
  if (product.tags?.some((t) => specialTags.includes(t.toLowerCase()))) {
    return true;
  }
  return false;
}

const DEMO_PRODUCTS: ShopifyProduct[] = [
  {
    id: "demo-1",
    title: "7H Classic Logo Tee",
    handle: "classic-logo-tee",
    description: "The must-have 7th Heaven tee for every real fan.",
    quantityAvailable: 24,
    tags: ["homepage", "featured"],
    images: {
      edges: [
        {
          node: {
            url: "https://img.youtube.com/vi/wDEXG3kHjqk/hqdefault.jpg",
            altText: "Classic Logo Tee",
          },
        },
      ],
    },
    variants: {
      edges: [
        {
          node: {
            id: "v1",
            price: { amount: "35.00", currencyCode: "USD" },
            compareAtPrice: { amount: "45.00", currencyCode: "USD" },
            quantityAvailable: 24,
          },
        },
      ],
    },
  },
  {
    id: "demo-2",
    title: "Tour Hoodie (Black)",
    handle: "tour-hoodie-black",
    description: "Heavyweight fleece with the 7H tour logo.",
    quantityAvailable: 12,
    tags: ["featured"],
    images: {
      edges: [
        {
          node: {
            url: "https://img.youtube.com/vi/C0PQYmyaTFk/hqdefault.jpg",
            altText: "Tour Hoodie",
          },
        },
      ],
    },
    variants: {
      edges: [
        {
          node: {
            id: "v2",
            price: { amount: "65.00", currencyCode: "USD" },
            compareAtPrice: { amount: "80.00", currencyCode: "USD" },
            quantityAvailable: 12,
          },
        },
      ],
    },
  },
  {
    id: "demo-3",
    title: "Signed Drumstick Set",
    handle: "signed-drumstick-set",
    description: "Drumsticks used & signed by Frankie Harchut. Limited stock!",
    quantityAvailable: 5,
    tags: ["homepage", "sale"],
    images: {
      edges: [
        {
          node: {
            url: "https://img.youtube.com/vi/UQBvl_wZ0ak/hqdefault.jpg",
            altText: "Signed Drumsticks",
          },
        },
      ],
    },
    variants: {
      edges: [
        {
          node: {
            id: "v3",
            price: { amount: "28.00", currencyCode: "USD" },
            compareAtPrice: { amount: "40.00", currencyCode: "USD" },
            quantityAvailable: 5,
          },
        },
      ],
    },
  },
];

export default function HomeMerch({ sanityContent }: { sanityContent?: any }) {
  const { requestTransition } = useTransition();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInventory = useCallback(async () => {
    try {
      const res = await fetch("/api/shopify/inventory");
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          const specials = data.products.filter((p: ShopifyProduct) =>
            isOnSpecial(p),
          );
          setProducts(specials.slice(0, 5));
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleBuy = useCallback(() => {
    requestTransition("/payment-test");
  }, [requestTransition]);

  if (loading) {
    return (
      <section
        id="merch"
        aria-labelledby="merch-heading"
        className="section cv-auto border-t border-white/10"
        style={{ "--cv-size": "1050px" } as React.CSSProperties}
      >
        <div className="site-container">
          <SectionHeader
            id="merch-heading"
            title="On Sale Now"
            badge="Specials"
            divider={false}
            action={
              <Link
                href="/merch"
                className="transition-colors border border-white/10 px-4 py-2 text-white/40 hover:text-white"
              >
                Shop All →
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02]"
              >
                <div className="aspect-square bg-white/[0.03]" />
                <div className="space-y-2 p-4">
                  <div className="h-2 w-16 rounded bg-[#00000029]" />
                  <div className="h-3 w-24 rounded bg-[#00000029]" />
                  <div className="h-3 w-12 rounded bg-[#00000029]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── END DEMO DATA ──────────────────────────────────────────────────────────

  // ── DEMO FALLBACK — DELETE BEFORE GO-LIVE ─────────────────────────────────
  // When Shopify has no specials, show demo items so the client can see this
  // section. Remove DEMO_PRODUCTS and this block + restore the `return null`
  // below once real Shopify products with sale/featured tags are configured.
  const displayProducts = products.length > 0 ? products : DEMO_PRODUCTS;
  // ── END DEMO FALLBACK ──────────────────────────────────────────────────────

  return (
    <section
      id="merch"
      aria-labelledby="merch-heading"
      className="section cv-auto border-t border-white/10"
      style={{ "--cv-size": "816px", "--cv-size-lg": "753px" } as React.CSSProperties}
    >
      <div className="site-container">
        <SectionHeader
          id="merch-heading"
          title={sanityContent?.merchTitle || "On Sale Now"}
          badge={sanityContent?.merchBadge || "Specials"}
          divider={false}
          action={
            <Link
              href="/merch"
              className="hover- color-transition rounded-[var(--radius-box)] border border-white/10 px-4 py-2 text-white/40"
            >
              {sanityContent?.merchCtaText || "Shop All →"}
            </Link>
          }
        />
        <div
          className={`grid gap-4 ${displayProducts.length <= 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"} `}
        >
          {displayProducts.map((product) => {
            const variant = product.variants?.edges?.[0]?.node;
            const price = variant?.price?.amount
              ? `$${parseFloat(variant.price.amount).toFixed(0)}`
              : "TBD";
            const compareAt = variant?.compareAtPrice?.amount
              ? `$${parseFloat(variant.compareAtPrice.amount).toFixed(0)}`
              : null;
            const imageUrl = product.images?.edges?.[0]?.node?.url;
            const soldOut = product.quantityAvailable === 0;

            return (
              <article
                key={product.id}
                className="color-transition group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02]"
              >
                {/* Sale Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="rounded-lg bg-red-500 px-2.5 py-1 text-[var(--font-size-2xs)] shadow-red-500/20">
                    Sale
                  </span>
                </div>
                <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-surface)]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="transition-transform object-cover group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingCart className="h-11 w-11 text-white/20" />
                    </div>
                  )}
                  {soldOut && (
                    <span className="absolute top-2 right-2 rounded bg-red-500/80 px-2 py-0.5 text-[var(--font-size-2xs)]">
                      Sold Out
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <h3 className="color-transition">
                    {product.title}
                  </h3>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-accent)]">
                        {price}
                      </span>
                      {compareAt && (
                        <span className="line-through text-white/40">{compareAt}</span>
                      )}
                    </div>
                    {soldOut ? (
                      <span className="text-[var(--font-size-2xs)] text-white/40">
                        Sold Out
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuy()}
                        className="transition-colors cursor-pointer text-[var(--font-size-2xs)] text-white/50 hover:text-white"
                      >
                        Buy →
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
