import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-utils";
import { shopDb } from "@/lib/north-shop-db";

/**
 * PATCH /api/admin/shop-inventory/variants/[id]
 * Updates a single variant — this is the "set stock limits" endpoint:
 * label, price, stockQuantity, lowStockThreshold, active, sortOrder.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.label !== undefined) update.label = body.label;
    if (body.sku !== undefined) update.sku = body.sku;
    if (body.price !== undefined) update.price = body.price;
    if (body.stockQuantity !== undefined) {
      if (body.stockQuantity < 0) {
        return NextResponse.json({ error: "Stock quantity can't be negative." }, { status: 400 });
      }
      update.stock_quantity = body.stockQuantity;
    }
    if (body.lowStockThreshold !== undefined) update.low_stock_threshold = body.lowStockThreshold;
    if (body.active !== undefined) update.active = body.active;
    if (body.sortOrder !== undefined) update.sort_order = body.sortOrder;

    const { error } = await shopDb.from("north_shop_variants").update(update).eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Failed to update variant." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/shop-inventory/variants/:id] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update variant." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/shop-inventory/variants/[id]
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const { error } = await shopDb.from("north_shop_variants").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Failed to delete variant." }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/shop-inventory/variants/:id] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete variant." }, { status: 500 });
  }
}
