import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-utils";
import { shopDb } from "@/lib/north-shop-db";

/**
 * GET /api/admin/shop-inventory/orders
 * Admin-only: most recent orders (pending/paid/failed) with line items,
 * so the inventory page can show what's actually selling.
 */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { data, error } = await shopDb
      .from("north_shop_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("[admin/shop-inventory/orders] GET error:", err);
    return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
  }
}
