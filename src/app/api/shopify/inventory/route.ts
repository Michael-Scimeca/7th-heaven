/**
 * Shopify Admin API — Real-Time Inventory
 * 
 * Uses the Admin API for accurate, real-time inventory counts.
 * The Storefront API has sync delays and only shows inventory
 * from locations assigned to the Online Store channel.
 * 
 * Setup:
 * 1. Go to Shopify Admin → Settings → Apps → Develop apps
 * 2. Open your app → Admin API access scopes
 * 3. Enable: read_products, read_inventory
 * 4. Install/reinstall the app
 * 5. Copy the Admin API access token to .env.local:
 *    SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_xxxxx"
 */

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.replace(/"/g, '') || '';
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.replace(/"/g, '') || '';
const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN?.replace(/"/g, '') || '';

export async function GET() {
  if (adminToken) {
    try {
      const res = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
        body: JSON.stringify({
          query: `{
            products(first: 20) {
              edges {
                node {
                  id
                  title
                  handle
                  description
                  totalInventory
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  variants(first: 5) {
                    edges {
                      node {
                        id
                        title
                        price
                        inventoryQuantity
                      }
                    }
                  }
                }
              }
            }
          }`
        }),
        cache: 'no-store',
      });

      const data = await res.json();
      const products = data.data?.products?.edges?.map((e: any) => ({
        ...e.node,
        quantityAvailable: e.node.totalInventory,
        variants: {
          edges: e.node.variants.edges.map((v: any) => ({
            node: {
              id: v.node.id,
              price: { amount: v.node.price, currencyCode: 'USD' },
              quantityAvailable: v.node.inventoryQuantity,
            }
          }))
        }
      })) || [];

      return NextResponse.json({ products, source: 'admin' });
    } catch (err) {
      console.error('Admin API failed, falling back to Storefront:', err);
    }
  }

  // Fallback: Storefront API
  try {
    const res = await fetch(`https://${domain}/api/2025-01/graphql.json?t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      body: JSON.stringify({
        query: `{
          products(first: 20) {
            edges {
              node {
                id
                title
                handle
                description
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 5) {
                  edges {
                    node {
                      id
                      price { amount currencyCode }
                      quantityAvailable
                    }
                  }
                }
              }
            }
          }
        }`
      }),
      cache: 'no-store',
    });

    const data = await res.json();
    const products = data.data?.products?.edges?.map((e: any) => ({
      ...e.node,
      quantityAvailable: e.node.variants?.edges?.[0]?.node?.quantityAvailable ?? null,
    })) || [];

    return NextResponse.json({ products, source: 'storefront' });
  } catch (err) {
    return NextResponse.json({ products: [], source: 'error', error: String(err) }, { status: 500 });
  }
}
