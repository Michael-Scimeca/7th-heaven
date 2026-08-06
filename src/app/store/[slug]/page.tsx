"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ProductDetailPage() {
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] text-white pt-32 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-6">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider mb-8">
          <Link href="/store" className="hover: text-[var(--color-accent)] transition-colors">Store</Link>
          <span>/</span>
          <span className="text-white/80">Apparel</span>
          <span>/</span>
          <span className="text-white">7H Classic Logo Tee</span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* Left: Product Image Container */}
          <div className="bg-[var(--color-bg-surface)] border border-white/5 p-8 rounded-3xl flex items-center justify-center aspect-square relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-[var(--color-accent)]/10 to-transparent opacity-40 blur-[80px]" />
            <span className="text-9xl relative z-10 filter drop-shadow-[0_0_30px_rgba(255,10,61,0.3)]">👕</span>
          </div>

          {/* Right: Product Info & Actions */}
          <div className="space-y-6">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest  text-[var(--color-accent)] mb-2 px-3 py-1 bg-[var(--color-accent)]/10 rounded-full">
                Featured Apparel
              </span>
              <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                7H Classic Logo Tee
              </h1>
              <p className="text-2xl font-bold text-white/90">$35.00</p>
            </div>

            <div className="h-px bg-white/10" />

            <p className="text-white/50 text-sm leading-relaxed">
              Represent the band with the official 7th Heaven Classic Logo Tee. Featuring a premium screen-printed 7th Heaven signature shield logo on the front and comfortable retail fit. Made of ultra-soft 100% combed ringspun cotton.
            </p>

            {/* Size Selector */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-white/40 font-bold block">
                Select Size
              </span>
              <div className="flex gap-2">
                {["S", "M", "L", "XL", "XXL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center font-bold text-sm border transition-colors cursor-pointer ${selectedSize === size
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-white"
                        : "border-white/10 text-white/40 hover:border-white/20 hover:text-white"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-white/40 font-bold block">
                Quantity
              </span>
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 w-fit px-2 py-1 rounded-lg">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer text-lg font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={() => {
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2000);
                }}
                className="w-full py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm transition-colors shadow-[0_0_30px_rgba(255,10,61,0.3)] hover:scale-[1.01]"
              >
                {added ? "✓ Added to Cart!" : "Add to Cart"}
              </button>

              <Link
                href="/store"
                className="w-full block text-center py-4 bg-white/5 hover:bg-white/10 text-white/70 font-bold uppercase tracking-widest text-sm transition-colors border border-white/5"
              >
                Back to Store
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
