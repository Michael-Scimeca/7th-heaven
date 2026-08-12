/**
 * North (EPX) Browser Post API helpers for the /payment-test shop.
 *
 * Reference: https://developer.north.com/blog/embedded-payments-react-app-shopping-cart
 *            https://developer.north.com/blog/embedded-payments-react-app
 *
 * Flow:
 *  1. Client sends the cart total to POST /api/payment-test/north/tac.
 *  2. This server calls EPX's key-exchange service with our MAC secret and
 *     gets back a short-lived TAC (terminal authorization code) token.
 *  3. The client renders a real <form> that POSTs the TAC + card details
 *     straight to EPX's servers (https://services.epxuap.com/browserpost/).
 *     Card data never touches our server.
 *  4. EPX redirects the customer's browser to our REDIRECT_URL with the
 *     transaction result as a POST body — handled by
 *     /api/payment-test/north/result.
 */

const KEY_EXCHANGE_URL = "https://keyexch.epxuap.com";
export const BROWSER_POST_URL = "https://services.epxuap.com/browserpost/";

export type NorthConfig = {
  mac: string;
  tranGroup: string;
  custNbr: string;
  dbaNbr: string;
  merchNbr: string;
  terminalNbr: string;
  industryType: string;
  tranCode: string;
  redirectUrl: string;
};

/**
 * Reads North merchant config from env. Throws a clear error naming the
 * missing variable(s) instead of failing with an opaque downstream error.
 */
export function getNorthConfig(): NorthConfig {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const required = {
    mac: process.env.MAC,
    custNbr: process.env.NEXT_PUBLIC_NORTH_CUST_NBR,
    dbaNbr: process.env.NEXT_PUBLIC_NORTH_DBA_NBR,
    merchNbr: process.env.NEXT_PUBLIC_NORTH_MERCH_NBR,
    terminalNbr: process.env.NEXT_PUBLIC_NORTH_TERMINAL_NBR,
  };

  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(
      `North (EPX) is not configured — missing env var(s): ${missing.join(", ")}. ` +
        `Add them to .env.local (see the North section near the Stripe config).`
    );
  }

  return {
    mac: required.mac!,
    tranGroup: process.env.TRAN_GROUP || "SALE",
    custNbr: required.custNbr!,
    dbaNbr: required.dbaNbr!,
    merchNbr: required.merchNbr!,
    terminalNbr: required.terminalNbr!,
    industryType: process.env.NEXT_PUBLIC_NORTH_INDUSTRY_TYPE || "E",
    tranCode: process.env.NEXT_PUBLIC_NORTH_TRAN_CODE || "SALE",
    redirectUrl: `${siteUrl}/api/payment-test/north/result`,
  };
}

/** Generates a numeric transaction number (max 10 digits, per North's docs). */
export function generateTranNbr(): string {
  return String(Math.floor(100000000 + Math.random() * 900000000));
}

/**
 * Extracts the TAC token from EPX's key-exchange XML response.
 * EPX's reference Node implementation just grabs the first <FIELD> element's
 * text content (via jsdom's `querySelector("FIELD").textContent`) — this
 * does the same thing with a small regex so we don't need a DOM dependency
 * in a serverless function.
 */
export function parseTacFromXml(xml: string): string {
  const match = xml.match(/<FIELD[^>]*>([\s\S]*?)<\/FIELD>/i);
  if (!match || !match[1].trim()) {
    throw new Error("Could not find a TAC value in EPX's response.");
  }
  return match[1].trim();
}

/** Calls EPX's key-exchange service and returns a TAC for the given amount. */
export async function requestTac(amount: string): Promise<{ tac: string; tranNbr: string }> {
  const config = getNorthConfig();
  const tranNbr = generateTranNbr();

  const body = new URLSearchParams({
    amount,
    MAC: config.mac,
    TRAN_NBR: tranNbr,
    TRAN_GROUP: config.tranGroup,
    REDIRECT_URL: config.redirectUrl,
  });

  const res = await fetch(KEY_EXCHANGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });

  const xml = await res.text();
  const tac = parseTacFromXml(xml);
  return { tac, tranNbr };
}
