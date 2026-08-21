import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-utils";
import { shopDb, fetchProductsWithVariants } from "@/lib/north-shop-db";

/**
 * GET /api/admin/shop-inventory/products
 * Admin-only: returns every product (including inactive ones) with variants.
 */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const products = await fetchProductsWithVariants({ activeOnly: false });
    return NextResponse.json(products);
  } catch (err) {
    console.error("[admin/shop-inventory/products] GET error:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

/**
 * POST /api/admin/shop-inventory/products
 * Body: { slug, title, description?, imageUrl?, category, variantKind,
 *         sortOrder?, variants: [{ label, price, stockQuantity, lowStockThreshold?, sku? }] }
 */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { slug, title, description, imageUrl, category, variantKind, sortOrder, variants } = body;

    if (!slug || !title || !category || !variantKind) {
      return NextResponse.json(
        { error: "slug, title, category, and variantKind are required." },
        { status: 400 }
      );
    }
    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: "At least one variant (size/format/color) is required." },
        { status: 400 }
      );
    }

    const { data: product, error: productError } = await shopDb
      .from("north_shop_products")
      .insert({
        slug,
        title,
        description: description || "",
        image_url: imageUrl || "",
        category,
        variant_kind: variantKind,
        sort_order: sortOrder ?? 0,
      })
      .select()
      .single();

    if (productError || !product) {
      const message = productError?.code === "23505" ? `Slug "${slug}" is already in use.` : "Failed to create product.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const variantRows = variants.map((v: any, i: number) => ({
      product_id: product.id,
      label: v.label,
      sku: v.sku || null,
      price: v.price,
      stock_quantity: v.stockQuantity ?? 0,
      low_stock_threshold: v.lowStockThreshold ?? 5,
      sort_order: i,
    }));

    const { error: variantsError } = await shopDb.from("north_shop_variants").insert(variantRows);
    if (variantsError) {
      // Roll back the orphaned product if variant creation failed.
      await shopDb.from("north_shop_products").delete().eq("id", product.id);
      return NextResponse.json({ error: "Failed to create variants." }, { status: 400 });
    }

    return NextResponse.json({ success: true, productId: product.id });
  } catch (err) {
    console.error("[admin/shop-inventory/products] POST error:", err);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
