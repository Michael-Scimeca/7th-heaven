import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const shop = url.searchParams.get('shop');

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided by Shopify. Go to http://localhost:3000/api/shopify/auth first.' });
  }

  const clientId = 'e90f4f4c865cd5d68c360b31ded44347';
  const clientSecret = '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';

  try {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error, description: data.error_description });
    }

    return NextResponse.json({ 
      STEP_1: "SUCCESS! COPY THE TOKEN BELOW.", 
      STEP_2: "PUT THIS IN YOUR .env.local AS: SHOPIFY_ADMIN_ACCESS_TOKEN=", 
      STEP_3: "THEN RESTART npm run dev",
      SHOPIFY_ADMIN_ACCESS_TOKEN: data.access_token 
    });

  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
