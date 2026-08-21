import { NextResponse } from "next/server";
import { fetchProductsWithVariants } from "@/lib/north-shop-db";

/**
 * GET /api/payment-test/products
 * Public: active products + active variants with live stock, for the
 * /payment-test shop page. Replaces the old static north-shop-products.ts
 * import now that inventory is real.
 */
export async function GET() {
  try {
    const products = await fetchProductsWithVariants({ activeOnly: true });
    // Only surface products that still have at least one purchasable variant.
    const purchasable = products.filter((p) => p.variants.length > 0);
    return NextResponse.json(purchasable);
  } catch (err) {
    console.error("[payment-test/products] GET error:", err);
    return NextResponse.json({ error: "Failed to load products." }, { status: 500 });
  }
}
