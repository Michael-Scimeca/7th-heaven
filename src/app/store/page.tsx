import type { Metadata } from "next";
import StoreClient, { ShopifyProduct } from "./StoreClient";
import { getProducts } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Official Merch Store — 7th Heaven",
  description: "Shop official 7th Heaven band merchandise, apparel, CDs, and more.",
};

// Revalidate every 60 seconds — keeps inventory fresh without blocking every request
export const revalidate = 60;

export default async function StorePage() {
  let products: ShopifyProduct[] = [];

  try {
    products = await getProducts();
  } catch (err) {
    console.error("Failed to fetch shopify products:", err);
  }

  return (
    <>
      <StoreClient initialProducts={products} />
    </>
  );
}
