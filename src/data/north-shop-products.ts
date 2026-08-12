// Demo product catalog for the /payment-test North (EPX) shopping cart.
// This is a static catalog (not tied to Shopify) — it exists to exercise the
// North Browser Post API cart + checkout flow end to end. Swap in real
// inventory later if this becomes more than a test page.

export type ShopVariant = {
  /** Unique across the whole catalog — used as the cart line-item key. */
  id: string;
  /** Shown to the shopper: a size ("M"), a format ("Vinyl"), or a color. */
  label: string;
  price: number;
};

export type ShopProduct = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: "Shirts" | "Albums" | "Hats";
  variantKind: "Size" | "Format" | "Color";
  variants: ShopVariant[];
};

export const SHOP_PRODUCTS: ShopProduct[] = [
  // ── Shirts ──
  {
    id: "logo-tee",
    title: "Official 7th Heaven Logo Tee",
    description: "100% ring-spun cotton crewneck tee with the classic band crest.",
    imageUrl: "/images/merch/logo-tee.png",
    category: "Shirts",
    variantKind: "Size",
    variants: [
      { id: "logo-tee-S", label: "S", price: 35 },
      { id: "logo-tee-M", label: "M", price: 35 },
      { id: "logo-tee-L", label: "L", price: 35 },
      { id: "logo-tee-XL", label: "XL", price: 35 },
      { id: "logo-tee-2XL", label: "2XL", price: 38 },
    ],
  },
  {
    id: "tour-hoodie",
    title: "2026 Tour Hoodie",
    description: "Ultra-heavyweight fleece hoodie with tour dates printed on the back.",
    imageUrl: "/images/merch/hoodie.png",
    category: "Shirts",
    variantKind: "Size",
    variants: [
      { id: "tour-hoodie-S", label: "S", price: 65 },
      { id: "tour-hoodie-M", label: "M", price: 65 },
      { id: "tour-hoodie-L", label: "L", price: 65 },
      { id: "tour-hoodie-XL", label: "XL", price: 65 },
      { id: "tour-hoodie-2XL", label: "2XL", price: 68 },
    ],
  },

  // ── Albums ──
  {
    id: "color-in-motion",
    title: "Color in Motion",
    description: "The album that put 7th Heaven on the map. Pick your format.",
    imageUrl: "/images/album/colot-in-motion.png",
    category: "Albums",
    variantKind: "Format",
    variants: [
      { id: "color-in-motion-vinyl", label: "Vinyl LP", price: 30 },
      { id: "color-in-motion-cd", label: "CD", price: 18 },
      { id: "color-in-motion-cassette", label: "Cassette", price: 15 },
    ],
  },
  {
    id: "be-here",
    title: "Be Here",
    description: "Fan-favorite release, remastered. Pick your format.",
    imageUrl: "/images/album/Be-Here.png",
    category: "Albums",
    variantKind: "Format",
    variants: [
      { id: "be-here-vinyl", label: "Vinyl LP", price: 30 },
      { id: "be-here-cd", label: "CD", price: 18 },
    ],
  },
  {
    id: "luminous",
    title: "Luminous",
    description: "The latest studio record. Pick your format.",
    imageUrl: "/images/album/luminous.png",
    category: "Albums",
    variantKind: "Format",
    variants: [
      { id: "luminous-vinyl", label: "Vinyl LP", price: 32 },
      { id: "luminous-cd", label: "CD", price: 18 },
    ],
  },

  // ── Hats ──
  {
    id: "snapback",
    title: "7th Heaven Snapback",
    description: "Structured 6-panel snapback with embroidered logo.",
    imageUrl: "/images/merch/hoodie.png",
    category: "Hats",
    variantKind: "Color",
    variants: [
      { id: "snapback-black", label: "Black", price: 28 },
      { id: "snapback-cyan", label: "Cyan", price: 28 },
      { id: "snapback-purple", label: "Purple", price: 28 },
    ],
  },
  {
    id: "dad-hat",
    title: "Tour Dad Hat",
    description: "Unstructured low-profile dad hat, adjustable strap.",
    imageUrl: "/images/merch/logo-tee.png",
    category: "Hats",
    variantKind: "Color",
    variants: [
      { id: "dad-hat-black", label: "Black", price: 25 },
      { id: "dad-hat-stone", label: "Stone", price: 25 },
    ],
  },
];
