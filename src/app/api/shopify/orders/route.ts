/**
 * Shopify Admin API — Sales & Inventory Data
 * 
 * Uses REST API for orders (more reliable with token scopes)
 * Falls back to product/inventory data if no orders exist.
 */

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.replace(/"/g, '') || '';
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.replace(/"/g, '') || '';

async function shopifyREST(endpoint: string) {
  const res = await fetch(`https://${domain}/admin/api/2025-01/${endpoint}`, {
    headers: { 'X-Shopify-Access-Token': adminToken },
    cache: 'no-store',
  });
  return res.json();
}

async function shopifyGQL(query: string) {
  const res = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
    body: JSON.stringify({ query }),
    cache: 'no-store',
  });
  return res.json();
}

export async function GET(req: Request) {
  if (!adminToken || !domain) {
    return NextResponse.json({ error: 'Shopify credentials not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30');

  try {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // 1. Try fetching orders via REST API
    let orders: any[] = [];
    let hasOrderAccess = false;
    try {
      const ordersData = await shopifyREST(`orders.json?limit=250&status=any&created_at_min=${sinceDate}`);
      if (ordersData.orders) {
        orders = ordersData.orders;
        hasOrderAccess = true;
      }
    } catch {}

    // 2. Always fetch products for inventory data
    const productsResult = await shopifyGQL(`{
      products(first: 50) {
        edges {
          node {
            id title handle totalInventory
            priceRangeV2 { maxVariantPrice { amount currencyCode } minVariantPrice { amount currencyCode } }
            variants(first: 10) { edges { node { id title price inventoryQuantity } } }
            images(first: 1) { edges { node { url altText } } }
          }
        }
      }
    }`);

    const products = productsResult.data?.products?.edges?.map((e: any) => e.node) || [];
    const totalInventory = products.reduce((s: number, p: any) => s + (p.totalInventory || 0), 0);
    const inventoryValue = products.reduce((s: number, p: any) => {
      return s + (p.variants?.edges || []).reduce((vs: number, v: any) => {
        return vs + (parseFloat(v.node.price || '0') * Math.max(v.node.inventoryQuantity || 0, 0));
      }, 0);
    }, 0);

    // Build product list for display
    const productList = products.map((p: any) => ({
      title: p.title, handle: p.handle, inventory: p.totalInventory || 0,
      minPrice: parseFloat(p.priceRangeV2?.minVariantPrice?.amount || '0'),
      maxPrice: parseFloat(p.priceRangeV2?.maxVariantPrice?.amount || '0'),
      image: p.images?.edges?.[0]?.node?.url || null,
      variants: (p.variants?.edges || []).map((v: any) => ({
        title: v.node.title, price: parseFloat(v.node.price || '0'), inventory: v.node.inventoryQuantity || 0,
      })),
    }));

    if (hasOrderAccess && orders.length > 0) {
      // Full order data available
      const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total_price || '0'), 0);
      const totalRefunded = orders.reduce((s, o) => s + (o.refunds || []).reduce((rs: number, r: any) =>
        rs + (r.transactions || []).reduce((ts: number, t: any) => ts + parseFloat(t.amount || '0'), 0), 0), 0);
      const totalDiscounts = orders.reduce((s, o) => s + parseFloat(o.total_discounts || '0'), 0);
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      const productSales: Record<string, { title: string; qty: number; revenue: number }> = {};
      orders.forEach(o => {
        (o.line_items || []).forEach((li: any) => {
          const key = li.title;
          if (!productSales[key]) productSales[key] = { title: key, qty: 0, revenue: 0 };
          productSales[key].qty += li.quantity;
          productSales[key].revenue += parseFloat(li.price || '0') * li.quantity;
        });
      });

      const dailyRevenue: Record<string, number> = {};
      orders.forEach(o => {
        const day = new Date(o.created_at).toISOString().split('T')[0];
        dailyRevenue[day] = (dailyRevenue[day] || 0) + parseFloat(o.total_price || '0');
      });

      return NextResponse.json({
        mode: 'orders',
        summary: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders: orders.length,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          totalRefunded: Math.round(totalRefunded * 100) / 100,
          totalDiscounts: Math.round(totalDiscounts * 100) / 100,
          netRevenue: Math.round((totalRevenue - totalRefunded) * 100) / 100,
        },
        statusBreakdown: {
          paid: orders.filter(o => o.financial_status === 'paid').length,
          pending: orders.filter(o => o.financial_status === 'pending').length,
          refunded: orders.filter(o => ['refunded', 'partially_refunded'].includes(o.financial_status)).length,
          fulfilled: orders.filter(o => o.fulfillment_status === 'fulfilled').length,
          unfulfilled: orders.filter(o => !o.fulfillment_status || o.fulfillment_status === 'unfulfilled').length,
        },
        topProducts: Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
        dailyRevenue,
        orders: orders.slice(0, 50).map(o => ({
          id: o.id, name: o.name, createdAt: o.created_at,
          total: parseFloat(o.total_price || '0'),
          currency: o.currency || 'USD',
          financialStatus: (o.financial_status || '').toUpperCase(),
          fulfillmentStatus: (o.fulfillment_status || 'UNFULFILLED').toUpperCase(),
          customer: o.customer ? {
            name: [o.customer.first_name, o.customer.last_name].filter(Boolean).join(' ') || 'Guest',
            email: o.customer.email, ordersCount: o.customer.orders_count || 1,
          } : { name: 'Guest', email: '', ordersCount: 1 },
          itemCount: (o.line_items || []).reduce((s: number, li: any) => s + li.quantity, 0),
          items: (o.line_items || []).map((li: any) => ({
            title: li.title, variant: li.variant_title,
            quantity: li.quantity, price: parseFloat(li.price || '0'),
          })),
        })),
        inventory: {
          totalProducts: products.length, totalInventory,
          inventoryValue: Math.round(inventoryValue * 100) / 100,
        },
        products: productList,
        period: `${days} days`,
      });
    }

    // No orders (or no access) — show inventory-focused view
    return NextResponse.json({
      mode: hasOrderAccess ? 'orders' : 'inventory',
      needsOrderScope: !hasOrderAccess,
      summary: hasOrderAccess ? {
        totalRevenue: 0, totalOrders: 0, avgOrderValue: 0,
        totalRefunded: 0, totalDiscounts: 0, netRevenue: 0,
      } : {
        totalProducts: products.length,
        totalVariants: products.reduce((s: number, p: any) => s + (p.variants?.edges?.length || 0), 0),
        totalInventory, inventoryValue: Math.round(inventoryValue * 100) / 100,
      },
      statusBreakdown: hasOrderAccess ? { paid: 0, pending: 0, refunded: 0, fulfilled: 0, unfulfilled: 0 } : undefined,
      topProducts: [],
      dailyRevenue: {},
      orders: [],
      inventory: { totalProducts: products.length, totalInventory, inventoryValue: Math.round(inventoryValue * 100) / 100 },
      products: productList,
      period: `${days} days`,
    });

  } catch (err: any) {
    console.error('Shopify API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch Shopify data' }, { status: 500 });
  }
}
