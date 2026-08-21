import { createClient } from "@supabase/supabase-js";

/**
 * Shared Supabase admin client + types for the North shop's inventory
 * tables (products, variants, orders). See
 * supabase/migration_021_north_shop_inventory.sql for the schema.
 */
export const shopDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type ShopVariantRow = {
  id: string;
  product_id: string;
  label: string;
  sku: string | null;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  active: boolean;
  sort_order: number;
};

export type ShopProductRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  category: "Shirts" | "Albums" | "Hats";
  variant_kind: "Size" | "Format" | "Color";
  active: boolean;
  sort_order: number;
};

export type ShopProductWithVariants = ShopProductRow & {
  variants: ShopVariantRow[];
};

/** Fetches all products with their variants, sorted for display. */
export async function fetchProductsWithVariants(
  opts: { activeOnly: boolean }
): Promise<ShopProductWithVariants[]> {
  let productQuery = shopDb
    .from("north_shop_products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (opts.activeOnly) {
    productQuery = productQuery.eq("active", true);
  }

  const { data: products, error: productsError } = await productQuery;
  if (productsError) throw productsError;
  if (!products || products.length === 0) return [];

  let variantQuery = shopDb
    .from("north_shop_variants")
    .select("*")
    .in("product_id", products.map((p) => p.id))
    .order("sort_order", { ascending: true });
  if (opts.activeOnly) {
    variantQuery = variantQuery.eq("active", true);
  }

  const { data: variants, error: variantsError } = await variantQuery;
  if (variantsError) throw variantsError;

  return products.map((product) => ({
    ...product,
    variants: (variants || []).filter((v) => v.product_id === product.id),
  }));
}
