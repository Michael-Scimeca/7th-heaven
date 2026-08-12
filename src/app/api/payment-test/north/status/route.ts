import { NextResponse } from "next/server";
import { isNorthMockMode } from "@/lib/north";

/**
 * GET /api/payment-test/north/status
 * Lets the client know whether North is running in mock mode (no real EPX
 * credentials configured) so the UI can show an honest "test mode" banner
 * instead of quietly pretending a real merchant account is connected.
 */
export async function GET() {
  return NextResponse.json({ mock: isNorthMockMode() });
}
