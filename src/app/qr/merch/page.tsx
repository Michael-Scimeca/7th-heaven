import { Suspense } from "react";
import { getProducts } from "@/lib/shopify";
import MerchQRClient from "./MerchQRClient";

export const dynamic = "force-dynamic";

// The Shopify read is an uncached, request-time fetch (cache: 'no-store'
// inside getProducts()) -- under Cache Components that has to live inside
// a Suspense boundary rather than directly in the page body, so it's split
// out into its own component here.
async function MerchQRContent() {
  let products = [];
  try {
    products = await getProducts();
  } catch (err) {
    console.warn("[QR Merch Page] Shopify fetch warning, using fallback products catalog:", err);
  }

  return <MerchQRClient initialProducts={products} />;
}

function MerchQRFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-sm text-white/50">Loading merch…</div>
    </div>
  );
}

export default function MerchQRPage() {
  return (
    <Suspense fallback={<MerchQRFallback />}>
      <MerchQRContent />
    </Suspense>
  );
}
