import { NextResponse } from 'next/server';

export async function GET() {
  const shop = '7th-heaven-7012.myshopify.com';
  const clientId = 'e90f4f4c865cd5d68c360b31ded44347';
  const scopes = 'read_products,read_inventory';
  const redirectUri = 'https://example.com';
  const nonce = '12345xyz'; 

  // Redirect to Shopify's OAuth permission screen
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=${nonce}`;

  return NextResponse.redirect(installUrl);
}
