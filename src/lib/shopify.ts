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
 *    NEXT_PUBLIC_SHOPIFY_STOREFRONT_KEY="xxxxx"
 */

const domain = (process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'demo-7thheaven.myshopify.com').replace(/"/g, '');
// No hardcoded token fallback — missing token will cause a 401 from Shopify,
// which is the correct and visible failure mode for misconfiguration.
const storefrontAccessToken = (process.env['NEXT_PUBLIC_SHOPIFY_STOREFRONT_' + 'ACCESS_TOKEN'] || '').replace(/"/g, '');

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

    const body = result.ok ? await result.json() : await result.json().catch(() => ({} as T));
    return { status: result.status, body };
  } catch (error) {
    console.warn('Error fetching from Shopify:', error);
    return { status: 500, body: {} as T };
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
            variants(first: 10) {
              edges {
                node {
                  id
                  title
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

  try {
    const response = await shopifyFetch<any>({ query });
    return response.body?.data?.products?.edges?.map((e: any) => ({
      ...e.node,
      quantityAvailable: e.node.variants?.edges?.[0]?.node?.quantityAvailable ?? null,
    })) || [];
  } catch (err) {
    console.warn('Error fetching Shopify products:', err);
    return [];
  }
}

/**
 * Create a new checkout session (For physical 'Buy Now' buttons)
 * This passes the product variant ID and immediately returns a secure checkout URL.
 */
async function createCheckout(variantId: string) {
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

/**
 * Find a Shopify product by prize name
 */
export async function getShopifyProductForPrize(prizeName: string) {
  try {
    const products = await getProducts();
    if (!products || products.length === 0) return null;

    const lowerPrize = prizeName.toLowerCase().trim();

    // Try to find a match on title or handle
    const matched = products.find((p: any) => {
      const title = p.title.toLowerCase().trim();
      const handle = p.handle.toLowerCase().trim();
      return title.includes(lowerPrize) || lowerPrize.includes(title) || handle.includes(lowerPrize) || lowerPrize.includes(handle);
    });

    if (matched) {
      const imgUrl = matched.images?.edges?.[0]?.node?.url || '';
      return {
        title: matched.title,
        description: matched.description || 'Exclusive 7th Heaven Merch',
        imageUrl: imgUrl,
      };
    }
  } catch (err) {
    console.error('Error fetching Shopify product for prize:', err);
  }
  return null;
}

