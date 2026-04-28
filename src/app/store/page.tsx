import type { Metadata } from "next";
import StoreClient, { ShopifyProduct } from "./StoreClient";
import { getProducts } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Official Merch Store — 7th Heaven",
  description: "Shop official 7th Heaven band merchandise, apparel, CDs, and more.",
};

// Force dynamic so we get live inventory from Shopify
export const dynamic = 'force-dynamic';

export default async function StorePage() {
  let products: ShopifyProduct[] = [];

  try {
    // Try to use the internal api route to get Admin inventory
    const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/api/shopify/inventory" || "http://localhost:3000/api/shopify/inventory", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      products = data.products;
    } else {
      // Fallback to the storefront API directly if the route fails
      products = await getProducts();
    }
  } catch (err) {
    console.error("Failed to fetch shopify inventory on server:", err);
    try {
       products = await getProducts();
    } catch(e) {}
  }

  return (
    <>
      <StoreClient initialProducts={products} />
    </>
  );
}
