import { NextResponse } from "next/server";
import { publishToGroup, type NtfyGroup } from "@/lib/ntfy";
import { sanitizeInput } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      group = "fans",
      title = "7th Heaven Test Push Alert",
      message = "🚨 Real-time push notification test from 7th Heaven! Your alerts are working perfectly.",
    } = body;

    const validGroups: NtfyGroup[] = ["fans", "crew", "cruise", "admins"];
    if (!validGroups.includes(group)) {
      return NextResponse.json({ error: "Invalid group target" }, { status: 400 });
    }

    const cleanTitle = sanitizeInput(title);
    const cleanMessage = sanitizeInput(message);

    const result = await publishToGroup(group as NtfyGroup, {
      title: cleanTitle,
      message: cleanMessage,
      priority: "high",
      tags: ["bell", "rocket", "guitar"],
    });

    return NextResponse.json({ ok: true, group, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to trigger test push" }, { status: 500 });
  }
}
