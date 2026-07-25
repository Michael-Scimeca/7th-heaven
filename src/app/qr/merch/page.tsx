import { getProducts } from "@/lib/shopify";
import MerchQRClient from "./MerchQRClient";

export const dynamic = "force-dynamic";

export default async function MerchQRPage() {
  let products = [];
  try {
    products = await getProducts();
  } catch (err) {
    console.warn("[QR Merch Page] Shopify fetch warning, using fallback products catalog:", err);
  }

  return <MerchQRClient initialProducts={products} />;
}
