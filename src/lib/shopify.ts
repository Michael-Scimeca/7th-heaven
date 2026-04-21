/**
 * Shopify Headless Commerce Integration
 * 
 * Instructions for the Band:
 * 1. Create a Shopify account.
 * 2. Go to Settings > Apps and sales channels > Develop apps.
 * 3. Create an app (e.g., "7th Heaven React App").
 * 4. Configure Storefront API Integration and select 'unauthenticated_read_product_listings' and related scopes.
 * 5. Drop the provided Public Access Token into your .env.local file:
 *    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
 *    NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN="xxxxx"
 */

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'demo-7thheaven.myshopify.com';
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || 'demo_token';

async function shopifyFetch<T>({ query, variables }: { query: string; variables?: any }): Promise<{ status: number; body: T }> {
  const endpoint = `https://${domain}/api/2025-01/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      // Always fetch fresh data — inventory changes in real-time
      cache: 'no-store',
    });

    const body = await result.json();
    return { status: result.status, body };
  } catch (error) {
    console.error('Error fetching from Shopify:', error);
    throw error;
  }
}

// -------------------------------------------------------------
// Core GraphQL Queries
// -------------------------------------------------------------

/**
 * Fetch all available products for a dedicated /shop page
 */
export async function getProducts() {
  const query = `
    query getProducts {
      products(first: 10) {
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
            variants(first: 1) {
              edges {
                node {
                  id
                  price {
                    amount
                    currencyCode
                  }
                  quantityAvailable
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch<any>({ query });
  return response.body.data?.products.edges.map((e: any) => ({
    ...e.node,
    quantityAvailable: e.node.variants?.edges?.[0]?.node?.quantityAvailable ?? null,
  })) || [];
}

/**
 * Create a new checkout session (For physical 'Buy Now' buttons)
 * This passes the product variant ID and immediately returns a secure checkout URL.
 */
export async function createCheckout(variantId: string) {
  const query = `
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    },
  };

  const response = await shopifyFetch<any>({ query, variables });
  return response.body.data?.cartCreate?.cart?.checkoutUrl;
}
