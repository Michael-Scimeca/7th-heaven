import { NextRequest, NextResponse } from "next/server";
import { requestTac } from "@/lib/north";
import { shopDb } from "@/lib/north-shop-db";

type CartItemInput = {
  variantId: string;
  productId: string;
  title: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
};

/**
 * POST /api/payment-test/north/tac
 * Body: { amount: string | number, items: CartItemInput[] }
 * Re-validates stock server-side (never trust the client's cart alone),
 * exchanges the cart total for a short-lived TAC token from EPX, and saves
 * a pending order keyed by the transaction number so
 * /api/payment-test/north/result can decrement stock once payment clears.
 * Mirrors North's tutorial CartModal.jsx `getTAC()`.
 */
export async function POST(req: NextRequest) {
  try {
    const { amount, items } = await req.json();
    const numericAmount = parseFloat(amount);

    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json({ error: "Cart total must be greater than $0." }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const cartItems = items as CartItemInput[];

    // Re-check stock against the database — the client-side disabled buttons
    // are a UX nicety, not a guarantee (someone could still race two tabs).
    const { data: variants, error: variantsError } = await shopDb
      .from("north_shop_variants")
      .select("id, label, stock_quantity")
      .in("id", cartItems.map((i) => i.variantId));

    if (variantsError) {
      return NextResponse.json({ error: "Failed to verify stock." }, { status: 500 });
    }

    const stockById = new Map((variants || []).map((v) => [v.id, v.stock_quantity]));
    for (const item of cartItems) {
      const available = stockById.get(item.variantId);
      if (available === undefined) {
        return NextResponse.json(
          { error: `${item.title} (${item.variantLabel}) is no longer available.` },
          { status: 409 }
        );
      }
      if (item.quantity > available) {
        return NextResponse.json(
          {
            error: `Only ${available} left of ${item.title} (${item.variantLabel}) — update your cart.`,
          },
          { status: 409 }
        );
      }
    }

    const formattedAmount = numericAmount.toFixed(2);
    const { tac, tranNbr, mock } = await requestTac(formattedAmount);

    const { error: orderError } = await shopDb.from("north_shop_orders").insert({
      tran_nbr: tranNbr,
      status: "pending",
      line_items: cartItems,
      total_amount: formattedAmount,
    });
    if (orderError) {
      console.error("[payment-test/north/tac] Failed to save pending order:", orderError);
      // Not fatal to checkout — payment can still proceed — but stock won't
      // auto-decrement for this order if we couldn't record it.
    }

    return NextResponse.json({ tac, amount: formattedAmount, tranNbr, mock });
  } catch (err) {
    console.error("[payment-test/north/tac] error:", err);
    const message = err instanceof Error ? err.message : "Failed to get a TAC from North.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
