import { NextRequest, NextResponse } from "next/server";
import { getNtfyTopic, NTFY_SERVER, type NtfyGroup } from "@/lib/ntfy";

/**
 * Public lookup for a group's ntfy topic + server, used by the /notifications
 * page to build a real subscribe link/QR code at request time.
 *
 * Deliberately excludes "admins" — that topic is only ever shown inside the
 * logged-in admin dashboard, never on a page anyone can load. Fans/crew/cruise
 * topics are meant to be handed out (that's how people subscribe), so serving
 * them here is the same trust level as printing them on the page itself.
 */
const PUBLIC_GROUPS: NtfyGroup[] = ["fans", "crew", "cruise"];

export async function GET(request: NextRequest) {
  const groupParam = request.nextUrl.searchParams.get("group") || "fans";

  if (!PUBLIC_GROUPS.includes(groupParam as NtfyGroup)) {
    return NextResponse.json(
      { ok: false, error: "Unknown or restricted group." },
      { status: 400 }
    );
  }

  const group = groupParam as NtfyGroup;
  const topic = getNtfyTopic(group);

  if (!topic) {
    return NextResponse.json({ ok: true, configured: false, group });
  }

  return NextResponse.json({
    ok: true,
    configured: true,
    group,
    topic,
    server: NTFY_SERVER,
  });
}
