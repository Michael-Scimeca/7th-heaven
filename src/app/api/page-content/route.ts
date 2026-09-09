import { NextRequest, NextResponse } from "next/server";
import { fetchPageContent } from "@/lib/sanity";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") || "home";
    const data = await fetchPageContent(key);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API/page-content] Error fetching Sanity page content:", error);
    return NextResponse.json({ success: false, data: null, error: "Failed to fetch page content" }, { status: 500 });
  }
}
