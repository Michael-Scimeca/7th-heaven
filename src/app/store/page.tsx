"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
  year?: string;
  paypalId?: string;
  amazonUrl?: string;
  image?: string;
  badge?: string;
  description?: string;
  sizes?: string[];
  comingSoon?: boolean;
};

const categories = ["All", "Original CDs", "Medley & Cover CDs", "Holiday CDs", "Blu-ray & DVD", "Apparel", "Books"];

const products: Product[] = [
  // Original CDs
  { id: "be-here", name: "Be Here", price: "$15", category: "Original CDs", year: "2021", paypalId: "CP5NWKWMEQMMJ", badge: "NEW" },
  { id: "color-in-motion", name: "Color In Motion", price: "$15", category: "Original CDs", year: "2018", paypalId: "898VXQMC4P56W" },
  { id: "luminous", name: "Luminous", price: "$15", category: "Original CDs", year: "2017", paypalId: "RNPJ563TQ8DZL" },
  { id: "next", name: "Next", price: "$15", category: "Original CDs", year: "2015", paypalId: "P385ETRMVMM6A" },
  { id: "best-of", name: "The Best of 1985–2015", price: "$15", category: "Original CDs", year: "2015", paypalId: "U4ACSP4GA5B3S" },
  { id: "spectrum", name: "Spectrum", price: "$15", category: "Original CDs", year: "2014", paypalId: "TJYYRSA9NWHPQ" },
  { id: "synergy", name: "Synergy", price: "$15", category: "Original CDs", year: "2013", paypalId: "XLBQNPTASJ7B6" },
  { id: "dance-media", name: "Dance Media", price: "$15", category: "Original CDs", year: "2012", paypalId: "AW55KXN7ZDXHU" },
  { id: "pop-media", name: "Pop Media", price: "$15", category: "Original CDs", year: "2011", paypalId: "2929EYL5RJUFL" },
  { id: "jukebox", name: "Jukebox", price: "$15", category: "Original CDs", year: "2010", paypalId: "MVQ7MMZASE73J" },
  { id: "usa-uk", name: "U.S.A. – U.K.", price: "$15", category: "Original CDs", year: "2008", paypalId: "DCWC6RSPJ2NDN" },
  { id: "silver", name: "Silver", price: "$15", category: "Original CDs", year: "2004", paypalId: "B98PQAASXAT28" },
  { id: "faces", name: "Faces Time Replaces", price: "$15", category: "Original CDs", year: "2000", paypalId: "S6JSA4226M5GQ" },

  // Medley & Cover CDs
  { id: "covered", name: "Covered", price: "$15", category: "Medley & Cover CDs", year: "2019", paypalId: "B9NB2TDP2HV4Q" },
  { id: "pop-medley-4", name: "Pop Medley 4", price: "$15", category: "Medley & Cover CDs", year: "2017", paypalId: "38CGNDFZR79G8" },
  { id: "pop-medley-3", name: "Pop Medley 3", price: "$15", category: "Medley & Cover CDs", year: "2018", paypalId: "7AWRBT3PQGXZG" },

  // Holiday CDs
  { id: "christmas-2018", name: "Christmas 2018", price: "$15", category: "Holiday CDs", year: "2018", paypalId: "2E3CDEBG5KNH8" },
  { id: "merry-christmas", name: "Merry Christmas In Chicago", price: "$15", category: "Holiday CDs", year: "2012", paypalId: "PSGCVG3FZRMHL" },
  { id: "christmas", name: "Christmas", price: "$15", category: "Holiday CDs", year: "2004", paypalId: "V4YHM3T2MK658" },

  // Blu-ray & DVD
  { id: "harmony-seas", name: "Live on the Harmony of the Seas", price: "$20", category: "Blu-ray & DVD", year: "2018", description: "Blu-ray / DVD" },
  { id: "oasis-seas", name: "Live on the Oasis of the Seas", price: "$20", category: "Blu-ray & DVD", year: "2015", description: "Blu-ray" },
  { id: "return-schaumburg", name: "Return to Schaumburg Live", price: "$20", category: "Blu-ray & DVD", year: "2012", description: "Blu-ray & DVD" },
  { id: "septemberfest", name: "Live at Schaumburg Septemberfest", price: "$20", category: "Blu-ray & DVD", year: "2011", description: "DVD" },
  { id: "soldier-field", name: "Live at Soldier Field", price: "$20", category: "Blu-ray & DVD", year: "2010", description: "DVD" },
  { id: "durty-nellies", name: "Live at Durty Nellies", price: "$20", category: "Blu-ray & DVD", year: "2005", paypalId: "KCUNKPBZTKCFE", description: "DVD" },

  // Apparel
  { id: "tshirt-logo", name: "7th Heaven Logo Tee", price: "$25", category: "Apparel", description: "Classic logo t-shirt", sizes: ["S", "M", "L", "XL", "2XL"], comingSoon: true },
  { id: "tshirt-tour", name: "Tour T-Shirt", price: "$30", category: "Apparel", description: "Limited edition tour shirt", sizes: ["S", "M", "L", "XL", "2XL"], comingSoon: true },
  { id: "hoodie-logo", name: "7th Heaven Hoodie", price: "$45", category: "Apparel", description: "Premium pullover hoodie", sizes: ["S", "M", "L", "XL", "2XL"], comingSoon: true },
  { id: "hat-logo", name: "7th Heaven Snapback", price: "$25", category: "Apparel", description: "Embroidered snapback cap", comingSoon: true },
  { id: "hat-dad", name: "7th Heaven Dad Hat", price: "$22", category: "Apparel", description: "Classic dad hat — adjustable", comingSoon: true },

  // Books
  { id: "book-ep1", name: "Ep. 1 — Land of Confusion", price: "$9.99", category: "Books", description: "7th Heaven and the Rock 'n' Roll Kids", amazonUrl: "https://www.amazon.com/gp/product/B096TJNDWR" },
  { id: "book-ep2", name: "Ep. 2 — Who Are You", price: "$9.99", category: "Books", description: "7th Heaven and the Rock 'n' Roll Kids", amazonUrl: "https://www.amazon.com/gp/product/B08FNMPFTR" },
  { id: "book-ep3", name: "Ep. 3 — What You Give", price: "$9.99", category: "Books", description: "7th Heaven and the Rock 'n' Roll Kids", amazonUrl: "https://www.amazon.com/gp/product/B08GLP426D" },
  { id: "book-ep4", name: "Ep. 4 — Runnin' Down A Dream", price: "$9.99", category: "Books", description: "7th Heaven and the Rock 'n' Roll Kids", amazonUrl: "https://www.amazon.com/gp/product/B08R68B2QF" },
  { id: "book-ep5", name: "Ep. 5 — Last In Line", price: "$9.99", category: "Books", description: "7th Heaven and the Rock 'n' Roll Kids", amazonUrl: "https://www.amazon.com/gp/product/B08VYFJWYF" },
  { id: "book-ep6", name: "Ep. 6 — Operation Mind Crime", price: "$9.99", category: "Books", description: "7th Heaven and the Rock 'n' Roll Kids", amazonUrl: "https://www.amazon.com/gp/product/B09HG6KW8M" },
  { id: "book-ep7", name: "Ep. 7 — Caught In The Game", price: "$9.99", category: "Books", description: "7th Heaven and the Rock 'n' Roll Kids", amazonUrl: "https://www.amazon.com/gp/product/B0B1K859QC" },
  { id: "book-ep8", name: "Ep. 8 — Don't Speak", price: "$9.99", category: "Books", description: "7th Heaven and the Rock 'n' Roll Kids", amazonUrl: "https://www.amazon.com/gp/product/B0BTRTCQ5W" },
];

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSize, setSelectedSize] = useState<Record<string, string>>({});

  const filtered = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Original CDs": return "💿";
      case "Medley & Cover CDs": return "🎵";
      case "Holiday CDs": return "🎄";
      case "Blu-ray & DVD": return "📀";
      case "Apparel": return "👕";
      case "Books": return "📖";
      default: return "🛒";
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
            CDs, Blu-rays, apparel, books, and more. We ship worldwide.
          </p>
        </div>

        {/* Shipping note */}
        <div className="text-center mb-16">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] text-white/20">
            Questions? <a href="mailto:orders@NTDRecords.com" className="text-[var(--color-accent)] hover:text-white transition-colors">orders@NTDRecords.com</a>
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
          {filtered.map(product => (
            <div key={product.id} className="group border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 flex flex-col">

              {/* Image area — placeholder for now */}
              <div className="relative aspect-square bg-[#0d0d15] flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl opacity-30">{getCategoryIcon(product.category)}</span>
                    <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/15 font-bold">{product.category}</span>
                  </div>
                )}
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-3 left-3 bg-[var(--color-accent)] text-white text-[0.55rem] font-bold uppercase tracking-wider px-3 py-1">
                    {product.badge}
                  </div>
                )}
                {product.comingSoon && (
                  <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-sm text-white/60 text-[0.55rem] font-bold uppercase tracking-wider px-3 py-1">
                    Coming Soon
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-[0.85rem] font-bold text-white leading-tight">{product.name}</h3>
                  <span className="text-[var(--color-accent)] font-bold text-[0.85rem] shrink-0">{product.price}</span>
                </div>

                {product.description && (
                  <p className="text-[0.7rem] text-white/30 mb-3">{product.description}</p>
                )}
                {product.year && (
                  <p className="text-[0.65rem] text-white/20 mb-3">{product.year}</p>
                )}

                {/* Size selector */}
                {product.sizes && !product.comingSoon && (
                  <div className="flex gap-1.5 mb-3">
                    {product.sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(prev => ({ ...prev, [product.id]: s }))}
                        className={`text-[0.6rem] font-bold px-2.5 py-1 border transition-all cursor-pointer ${
                          selectedSize[product.id] === s
                            ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                            : "border-white/10 text-white/30 hover:border-white/20"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Buy button */}
                <div className="mt-auto pt-3">
                  {product.comingSoon ? (
                    <div className="text-center py-2.5 text-[0.7rem] text-white/20 font-bold uppercase tracking-wider">
                      Notify Me When Available
                    </div>
                  ) : product.paypalId ? (
                    <a
                      href={`https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=${product.paypalId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.75rem] uppercase tracking-[0.1em] py-2.5 transition-all"
                    >
                      Buy Now
                    </a>
                  ) : product.amazonUrl ? (
                    <a
                      href={product.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-[#FF9900] hover:bg-[#FF9900]/80 text-black font-bold text-[0.75rem] uppercase tracking-[0.1em] py-2.5 transition-all"
                    >
                      Buy on Amazon
                    </a>
                  ) : (
                    <a
                      href="mailto:orders@NTDRecords.com?subject=Order Inquiry"
                      className="block text-center border border-white/10 hover:border-[var(--color-accent)] text-white/40 hover:text-[var(--color-accent)] font-bold text-[0.75rem] uppercase tracking-[0.1em] py-2.5 transition-all"
                    >
                      Contact to Order
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Worldwide shipping notice */}
        <div className="mt-20 text-center border-t border-white/10 pt-12">
          <div className="flex flex-wrap justify-center gap-8 text-[0.7rem] text-white/25 uppercase tracking-[0.15em]">
            <span>🌍 Worldwide Shipping</span>
            <span>🔒 Secure Checkout via PayPal</span>
            <span>📦 Allow extra time for international orders</span>
          </div>
        </div>

      </div>
    </section>
  );
}
