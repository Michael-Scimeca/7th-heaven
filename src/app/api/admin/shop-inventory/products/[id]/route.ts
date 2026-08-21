import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-utils";
import { shopDb } from "@/lib/north-shop-db";

/**
 * PATCH /api/admin/shop-inventory/products/[id]
 * Updates top-level product fields (title, description, image, category,
 * active toggle, sort order). Variant edits go through /variants/[id].
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.title !== undefined) update.title = body.title;
    if (body.description !== undefined) update.description = body.description;
    if (body.imageUrl !== undefined) update.image_url = body.imageUrl;
    if (body.category !== undefined) update.category = body.category;
    if (body.variantKind !== undefined) update.variant_kind = body.variantKind;
    if (body.active !== undefined) update.active = body.active;
    if (body.sortOrder !== undefined) update.sort_order = body.sortOrder;

    const { error } = await shopDb.from("north_shop_products").update(update).eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Failed to update product." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/shop-inventory/products/:id] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/shop-inventory/products/[id]
 * Deletes the product and its variants (ON DELETE CASCADE).
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const { error } = await shopDb.from("north_shop_products").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Failed to delete product." }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/shop-inventory/products/:id] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
