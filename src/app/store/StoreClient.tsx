"use client";

import { useState } from "react";

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  quantityAvailable: number | null;
  images: { edges: { node: { url: string; altText: string } }[] };
  variants: { edges: { node: { id: string; price: { amount: string; currencyCode: string }; quantityAvailable?: number } }[] };
};

export default function StoreClient({ initialProducts }: { initialProducts: ShopifyProduct[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Create a mapping or guess the category based on tags or productType. 
  // For now, let's just use "All" or simulate categories since Shopify data might not be categorized.
  const categories = ["All", "Apparel", "Music", "Accessories"];

  // Filter products by title keywords (simulated categories for now)
  const filtered = initialProducts.filter(p => {
    if (activeCategory === "All") return true;
    const t = p.title.toLowerCase();
    if (activeCategory === "Apparel" && (t.includes("shirt") || t.includes("hoodie") || t.includes("hat") || t.includes("tee"))) return true;
    if (activeCategory === "Music" && (t.includes("cd") || t.includes("vinyl") || t.includes("music"))) return true;
    if (activeCategory === "Accessories" && (t.includes("mug") || t.includes("pin") || t.includes("poster"))) return true;
    return false;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Apparel": return "👕";
      case "Music": return "💿";
      case "Accessories": return "🛍️";
      default: return "🛒";
    }
  };

  const handleCheckout = async (variantId: string) => {
    try {
      // Use the shopify API to create a checkout
      const res = await fetch("/api/shopify/auth", { // Or whatever the checkout API is
        method: "POST",
        body: JSON.stringify({ variantId }),
      });
      // For now we can just redirect to the storefront url
      window.location.href = `https://demo-7thheaven.myshopify.com/cart/${variantId.split('/').pop()}:1`;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="py-32 bg-[var(--color-bg-primary)] min-h-screen" id="store">
      <div className="site-container">

        {/* Header */}
        <div className="mb-6 text-center">
          <span className="inline-block text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)]">
            Official Store
          </span>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight tracking-tight text-white">
            Band <span className="gradient-text">Merch</span>
          </h1>
          <p className="text-white/40 mt-4 max-w-lg mx-auto text-[0.9rem]">
            Apparel, Music, and more directly from the band.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-14">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[0.7rem] font-bold uppercase tracking-[0.1em] px-5 py-2.5 border transition-all cursor-pointer ${
                activeCategory === cat
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
              }`}
            >
              {cat !== "All" && <span className="mr-1.5">{getCategoryIcon(cat)}</span>}
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(product => {
            const variant = product.variants?.edges?.[0]?.node;
            const price = variant?.price?.amount ? `$${parseFloat(variant.price.amount).toFixed(2)}` : 'TBD';
            const imageUrl = product.images?.edges?.[0]?.node?.url;

            return (
              <div key={product.id} className="group border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 flex flex-col">
                <div className="relative aspect-square bg-[#0d0d15] flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl} alt={product.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl opacity-30">🛒</span>
                  )}
                  {product.quantityAvailable === 0 && (
                     <div className="absolute top-3 left-3 bg-red-500/80 backdrop-blur-sm text-white text-[0.55rem] font-bold uppercase tracking-wider px-3 py-1">
                       Sold Out
                     </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-[0.85rem] font-bold text-white leading-tight">{product.title}</h3>
                    <span className="text-[var(--color-accent)] font-bold text-[0.85rem] shrink-0">{price}</span>
                  </div>

                  {product.description && (
                    <p className="text-[0.7rem] text-white/30 mb-3 line-clamp-2">{product.description}</p>
                  )}

                  <div className="mt-auto pt-3">
                    <button
                      onClick={() => handleCheckout(variant.id)}
                      disabled={product.quantityAvailable === 0}
                      className="w-full block text-center bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 disabled:opacity-50 disabled:hover:bg-[var(--color-accent)] text-white font-bold text-[0.75rem] uppercase tracking-[0.1em] py-2.5 transition-all"
                    >
                      {product.quantityAvailable === 0 ? 'Sold Out' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
           <div className="text-center text-white/30 text-sm mt-10">No products found in this category.</div>
        )}

      </div>
    </section>
  );
}
