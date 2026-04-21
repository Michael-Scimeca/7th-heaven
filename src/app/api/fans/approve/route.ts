import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// POST /api/fans/approve — approve or reject a fan photo
export async function POST(request: Request) {
  try {
    const { photoId, action } = await request.json();

    if (!photoId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const metaPath = path.join(process.cwd(), "data", "fan-photos.json");
    if (!fs.existsSync(metaPath)) {
      return NextResponse.json({ error: "No photos found" }, { status: 404 });
    }

    const photos = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    const idx = photos.findIndex((p: { id: string }) => p.id === photoId);

    if (idx === -1) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (action === "approve") {
      photos[idx].approved = true;
    } else {
      // Delete file and remove entry
      const filePath = path.join(process.cwd(), "public", photos[idx].src);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      photos.splice(idx, 1);
    }

    fs.writeFileSync(metaPath, JSON.stringify(photos, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/fans/approve — get pending photos (admin)
export async function GET() {
  try {
    const metaPath = path.join(process.cwd(), "data", "fan-photos.json");
    if (!fs.existsSync(metaPath)) return NextResponse.json([]);

    const photos = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    const pending = photos.filter((p: { approved: boolean }) => !p.approved);
    return NextResponse.json(pending);
  } catch {
    return NextResponse.json([]);
  }
}
