/**
 * Shopify Admin API — Adjust Inventory
 * 
 * Decrements the inventory of a specified variant upon simulated purchase completion.
 */

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.replace(/"/g, '') || '';
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.replace(/"/g, '') || '';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { variantId, quantity = 1 } = body;

    if (!variantId) {
      return NextResponse.json({ error: 'variantId is required' }, { status: 400 });
    }

    // If Shopify credentials are not configured, perform a mock response
    if (!adminToken || !domain) {
      console.warn('[Shopify Admin API Mock] Credentials not configured. Simulating successful inventory decrement.');
      return NextResponse.json({
        success: true,
        mocked: true,
        variantId,
        decrementedQuantity: quantity,
        message: 'Mock successful. Configure SHOPIFY_ADMIN_ACCESS_TOKEN and NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN to perform real adjustments.'
      });
    }

    // Step 1: Query the Variant to get inventoryItemId and locationId
    const queryRes = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({
        query: `
          query getVariantInventory($id: ID!) {
            node(id: $id) {
              ... on ProductVariant {
                id
                inventoryItem {
                  id
                  inventoryLevels(first: 1) {
                    edges {
                      node {
                        location {
                          id
                        }
                      }
                    }
                  }
                }
              }
            }
            locations(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
        variables: { id: variantId },
      }),
      cache: 'no-store',
    });

    if (!queryRes.ok) {
      const errText = await queryRes.text();
      return NextResponse.json({ error: `Shopify query failed: ${errText}` }, { status: queryRes.status });
    }

    const queryData = await queryRes.json();
    const variantNode = queryData?.data?.node;
    const inventoryItemId = variantNode?.inventoryItem?.id;
    const locationId = variantNode?.inventoryItem?.inventoryLevels?.edges?.[0]?.node?.location?.id 
                     || queryData?.data?.locations?.edges?.[0]?.node?.id;

    if (!inventoryItemId) {
      return NextResponse.json({ error: `Could not retrieve inventoryItemId for variant ${variantId}.` }, { status: 404 });
    }

    if (!locationId) {
      return NextResponse.json({ error: `Could not determine stocked location for variant ${variantId} and no default locations exist.` }, { status: 400 });
    }

    // Step 2: Perform the inventoryAdjustQuantities mutation to decrement inventory
    const adjustRes = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({
        query: `
          mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
            inventoryAdjustQuantities(input: $input) {
              inventoryAdjustmentGroup {
                createdAt
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: {
            reason: "correction",
            name: "available",
            changes: [
              {
                inventoryItemId: inventoryItemId,
                locationId: locationId,
                delta: -quantity,
              }
            ]
          }
        }
      }),
      cache: 'no-store',
    });

    if (!adjustRes.ok) {
      const errText = await adjustRes.text();
      return NextResponse.json({ error: `Shopify adjust failed: ${errText}` }, { status: adjustRes.status });
    }

    const adjustData = await adjustRes.json();
    const userErrors = adjustData?.data?.inventoryAdjustQuantities?.userErrors || [];

    if (userErrors.length > 0) {
      return NextResponse.json({ error: 'Shopify mutation errors', userErrors }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      variantId,
      inventoryItemId,
      locationId,
      decrementedQuantity: quantity
    });

  } catch (err: any) {
    console.error('Error adjusting Shopify inventory:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
