import { NextRequest, NextResponse } from "next/server";
import { requestTac } from "@/lib/north";

/**
 * POST /api/payment-test/north/tac
 * Body: { amount: string | number }
 * Exchanges the cart total for a short-lived TAC token from EPX, which the
 * client then submits (along with card details) directly to EPX's own
 * hosted form endpoint. Mirrors North's tutorial CartModal.jsx `getTAC()`.
 */
export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    const numericAmount = parseFloat(amount);

    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json({ error: "Cart total must be greater than $0." }, { status: 400 });
    }

    const formattedAmount = numericAmount.toFixed(2);
    const { tac, tranNbr, mock } = await requestTac(formattedAmount);

    return NextResponse.json({ tac, amount: formattedAmount, tranNbr, mock });
  } catch (err) {
    console.error("[payment-test/north/tac] error:", err);
    const message = err instanceof Error ? err.message : "Failed to get a TAC from North.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
