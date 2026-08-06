import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const META_PATH = path.join(process.cwd(), "data", "fan-photos.json");

async function readPhotos() {
  if (!fs.existsSync(META_PATH)) return [];
  try {
    return JSON.parse(await fs.promises.readFile(META_PATH, "utf-8"));
  } catch {
    return [];
  }
}

// POST /api/fans/approve — approve or reject a fan photo
export async function POST(request: Request) {
  try {
    const { photoId, action } = await request.json();

    if (!photoId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const photos = await readPhotos();
    const idx = photos.findIndex((p: { id: string }) => p.id === photoId);

    if (idx === -1) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (action === "approve") {
      photos[idx].approved = true;
    } else {
      // Delete file and remove entry
      const filePath = path.join(process.cwd(), "public", photos[idx].src);
      if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
      photos.splice(idx, 1);
    }

    await fs.promises.writeFile(META_PATH, JSON.stringify(photos, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/fans/approve — get pending photos (admin)
export async function GET() {
  try {
    const photos = await readPhotos();
    const pending = photos.filter((p: { approved: boolean }) => !p.approved);
    return NextResponse.json(pending);
  } catch {
    return NextResponse.json([]);
  }
}
