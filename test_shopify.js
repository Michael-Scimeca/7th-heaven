const domain = "7th-heaven-7012.myshopify.com";
const token = "dde0af1227c5562a26fc65c5d97353cd";

async function run() {
  const endpoint = `https://${domain}/api/2024-01/graphql.json`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token,
  };

  const q1 = `{ products(first: 1) { edges { node { variants(first: 1) { edges { node { id } } } } } } }`;
  const res1 = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({query: q1}) });
  const data1 = await res1.json();
  const variantId = data1.data.products.edges[0].node.variants.edges[0].node.id;

  const q2 = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          message
        }
      }
    }
  `;
  const res2 = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: q2,
      variables: { input: { lines: [{ merchandiseId: variantId, quantity: 1 }] } }
    })
  });
  const data2 = await res2.json();
  console.log("Cart URL:", data2.data?.cartCreate?.cart?.checkoutUrl);
}
run();
