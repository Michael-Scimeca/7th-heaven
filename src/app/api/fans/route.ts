import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("photo") as File[];
    const name = formData.get("name") as string;
    const venue = formData.get("venue") as string;
    const date = formData.get("date") as string;
    const caption = formData.get("caption") as string;

    if (!files.length || !name) {
      return NextResponse.json({ error: "Photo and name are required" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "fans");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    
    const metaPath = path.join(process.cwd(), "data", "fan-photos.json");
    const metaDir = path.dirname(metaPath);
    if (!fs.existsSync(metaDir)) fs.mkdirSync(metaDir, { recursive: true });

    let photos: Record<string, unknown>[] = [];
    if (fs.existsSync(metaPath)) {
      photos = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    }

    for (const file of files) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) continue;

      // Max 10MB
      if (file.size > 10 * 1024 * 1024) continue;

      const ext = file.name.split(".").pop() || "jpg";
      const filename = `fan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = path.join(uploadDir, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      const entry = {
        id: `fp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        filename,
        src: `/uploads/fans/${filename}`,
        name,
        venue: venue || "",
        date: date || "",
        caption: caption || "",
        submittedAt: new Date().toISOString(),
        approved: false,
      };

      photos.push(entry);
    }

    fs.writeFileSync(metaPath, JSON.stringify(photos, null, 2));

    return NextResponse.json({ success: true, message: "Photos submitted for review!" });
  } catch (error) {
    console.error("Fan photo upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const returnAll = searchParams.get("all") === "true";

    const metaPath = path.join(process.cwd(), "data", "fan-photos.json");
    if (!fs.existsSync(metaPath)) {
      return NextResponse.json([]);
    }
    const photos = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    
    if (returnAll) {
      return NextResponse.json(photos);
    }

    // Only return approved photos by default
    const approved = photos.filter((p: { approved: boolean }) => p.approved);
    return NextResponse.json(approved);
  } catch {
    return NextResponse.json([]);
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, action } = await request.json();
    if (!id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const metaPath = path.join(process.cwd(), "data", "fan-photos.json");
    if (!fs.existsSync(metaPath)) return NextResponse.json({ error: "No data found" }, { status: 404 });

    let photos = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    const photoIndex = photos.findIndex((p: any) => p.id === id);

    if (photoIndex === -1) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

    if (action === 'approve') {
      photos[photoIndex].approved = true;
    } else if (action === 'reject') {
      // Optional: Delete the file from the filesystem here if desired
      const photoPath = path.join(process.cwd(), "public", photos[photoIndex].src);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
      
      photos = photos.filter((p: any) => p.id !== id);
    }

    fs.writeFileSync(metaPath, JSON.stringify(photos, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fan photo moderation error:", error);
    return NextResponse.json({ error: "Moderation failed" }, { status: 500 });
  }
}
