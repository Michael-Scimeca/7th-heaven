import { NextRequest, NextResponse } from "next/server";
import { drainEmailQueue, getEmailQuotaStatus } from "@/lib/email-quota";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleDrain(req);
}

export async function POST(req: NextRequest) {
  return handleDrain(req);
}

async function handleDrain(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Basic bearer token check if CRON_SECRET is set
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quotaBefore = await getEmailQuotaStatus();
    const result = await drainEmailQueue();
    const quotaAfter = await getEmailQuotaStatus();

    return NextResponse.json({
      success: true,
      result,
      quotaBefore,
      quotaAfter,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Drain failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
