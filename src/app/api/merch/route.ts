import { NextResponse } from "next/server";
import { getProducts } from "@/lib/shopify";

export async function GET() {
  try {
    const products = await getProducts();
    // Return first 3 products for the fan dashboard quick shop
    const featured = products.slice(0, 3).map((p: any) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      image: p.images?.edges?.[0]?.node?.url || null,
      price: p.variants?.edges?.[0]?.node?.price?.amount || '0',
      variantId: p.variants?.edges?.[0]?.node?.id || null,
    }));
    return NextResponse.json(featured);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
