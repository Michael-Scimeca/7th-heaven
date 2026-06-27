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
    const safetyFlagsRaw = formData.get("safety_flags") as string;

    // Parse client-side ML safety flags (filename → flag)
    let safetyFlags: Record<string, string> = {};
    if (safetyFlagsRaw) {
      try { safetyFlags = JSON.parse(safetyFlagsRaw); } catch {}
    }

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
      // Validate file type (allow images and videos)
      const isVideo = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".mov");
      const isImage = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type);
      
      if (!isImage && !isVideo) continue;

      // Max 15MB for videos, 10MB for images
      const maxSize = isVideo ? 15 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) continue;

      let finalFilename = '';
      let fileTypeField: 'image' | 'video' = 'image';
      
      // Check if this file was flagged by the client-side ML scanner
      const flag = safetyFlags[file.name] || '';

      if (isVideo) {
        fileTypeField = 'video';
        finalFilename = `fan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`;
        const finalPath = path.join(uploadDir, finalFilename);
        
        // Write original to temporary file first
        const origExt = file.name.split(".").pop() || "mp4";
        const tempFilename = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${origExt}`;
        const tempPath = path.join(uploadDir, tempFilename);
        
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(tempPath, buffer);
        
        // Run compression with FFmpeg
        let compressed = false;
        try {
          const { execSync } = require("child_process");
          // Ensure scaling is even number for H264 (-2 handles this in scale)
          const ffmpegCmd = `/opt/homebrew/bin/ffmpeg -y -i "${tempPath}" -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 128k "${finalPath}"`;
          execSync(ffmpegCmd, { stdio: "ignore" });
          compressed = true;
        } catch (err) {
          console.error("FFmpeg compression failed, falling back to original upload:", err);
        }
        
        if (compressed) {
          // Delete temp file
          try { fs.unlinkSync(tempPath); } catch {}
        } else {
          // Fallback: rename/move temp file to the final filename (or fallback filename)
          const fallbackExt = origExt.toLowerCase() === 'mov' ? 'mov' : 'mp4';
          finalFilename = `fan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fallbackExt}`;
          const fallbackFinalPath = path.join(uploadDir, finalFilename);
          try {
            fs.renameSync(tempPath, fallbackFinalPath);
          } catch (renameErr) {
            console.error("Failed to rename temp file, writing directly:", renameErr);
            fs.writeFileSync(fallbackFinalPath, buffer);
            try { fs.unlinkSync(tempPath); } catch {}
          }
        }
      } else {
        fileTypeField = 'image';
        const ext = file.name.split(".").pop() || "jpg";
        finalFilename = `fan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const filePath = path.join(uploadDir, finalFilename);
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
      }

      const entry = {
        id: `fp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        filename: finalFilename,
        src: `/uploads/fans/${finalFilename}`,
        type: fileTypeField,
        name,
        venue: venue || "",
        date: date || "",
        caption: caption || "",
        submittedAt: new Date().toISOString(),
        approved: false,
        // Safety metadata — flagged photos appear with a warning in admin moderation
        ...(flag ? { safety_flag: flag } : {}),
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
    if (!id || !['approve', 'reject', 'flag'].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const metaPath = path.join(process.cwd(), "data", "fan-photos.json");
    if (!fs.existsSync(metaPath)) return NextResponse.json({ error: "No data found" }, { status: 404 });

    let photos = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    const photoIndex = photos.findIndex((p: any) => p.id === id);

    if (photoIndex === -1) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

    if (action === 'approve') {
      photos[photoIndex].approved = true;
      photos[photoIndex].flagged = false;
      photos[photoIndex].safety_flag = undefined;
    } else if (action === 'reject') {
      // Optional: Delete the file from the filesystem here if desired
      const photoPath = path.join(process.cwd(), "public", photos[photoIndex].src);
      if (fs.existsSync(photoPath)) {
        try { fs.unlinkSync(photoPath); } catch {}
      }
      
      photos = photos.filter((p: any) => p.id !== id);
    } else if (action === 'flag') {
      photos[photoIndex].flagged = true;
    }

    fs.writeFileSync(metaPath, JSON.stringify(photos, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fan photo moderation error:", error);
    return NextResponse.json({ error: "Moderation failed" }, { status: 500 });
  }
}
