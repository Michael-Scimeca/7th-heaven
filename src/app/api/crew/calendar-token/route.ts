import { NextRequest, NextResponse } from "next/server";
import { generateCrewCalendarToken } from "@/lib/crew-calendar-auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const crewId = searchParams.get("crewId");

  if (!crewId) {
    return NextResponse.json({ error: "crewId is required" }, { status: 400 });
  }

  const token = generateCrewCalendarToken(crewId);
  return NextResponse.json({ token, crewId });
}
