import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-utils";
import { shopDb } from "@/lib/north-shop-db";

/**
 * POST /api/admin/shop-inventory/variants
 * Adds a new size/format/color variant to an existing product.
 * Body: { productId, label, price, stockQuantity, lowStockThreshold?, sku? }
 */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { productId, label, price, stockQuantity, lowStockThreshold, sku } = body;

    if (!productId || !label || price === undefined) {
      return NextResponse.json(
        { error: "productId, label, and price are required." },
        { status: 400 }
      );
    }

    const { data: existing } = await shopDb
      .from("north_shop_variants")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await shopDb
      .from("north_shop_variants")
      .insert({
        product_id: productId,
        label,
        sku: sku || null,
        price,
        stock_quantity: stockQuantity ?? 0,
        low_stock_threshold: lowStockThreshold ?? 5,
        sort_order: (existing?.sort_order ?? -1) + 1,
      })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Failed to add variant." }, { status: 400 });
    }

    return NextResponse.json({ success: true, variant: data });
  } catch (err) {
    console.error("[admin/shop-inventory/variants] POST error:", err);
    return NextResponse.json({ error: "Failed to add variant." }, { status: 500 });
  }
}
