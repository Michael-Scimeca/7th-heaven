import { NextResponse } from "next/server";
import { publishToGroup, getNtfyTopic, NTFY_SERVER } from "@/lib/ntfy";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, url, crewName } = body;

    const pushTitle = title || `🔴 7th Heaven Live Broadcast Started!`;
    const pushMessage = message || `${crewName || "7th Heaven"} is live right now! Click to join the live stream.`;
    const clickUrl = url || "http://localhost:3000/live";

    const result = await publishToGroup("fans", {
      title: pushTitle,
      message: pushMessage,
      click: clickUrl,
      priority: "high",
      tags: ["radio", "live", "guitar"],
    });

    // Fallback: also attempt ntfy.sh direct push to default public topic 7thheaven-fans if env topic isn't set
    const fansTopic = getNtfyTopic("fans") || "7thheaven-fans";
    let fallbackResult = null;
    try {
      const res = await fetch(`${NTFY_SERVER}/${fansTopic}`, {
        method: "POST",
        headers: {
          Title: pushTitle,
          Priority: "high",
          Tags: "radio,live,guitar",
          Click: clickUrl,
        },
        body: pushMessage,
      });
      fallbackResult = { ok: res.ok, status: res.status };
    } catch (e: any) {
      fallbackResult = { ok: false, error: e?.message };
    }

    return NextResponse.json({
      ok: true,
      message: "Push notification dispatched to Fans!",
      result,
      fallbackResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to dispatch push notification." },
      { status: 500 }
    );
  }
}
