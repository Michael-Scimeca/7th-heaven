import { NextResponse } from "next/server";
import { sanityClient, sanityWriteClient } from "@/lib/sanity";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function extractYouTubeId(urlOrId: string): string {
  const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) return match[1];
  const clean = urlOrId.trim();
  if (clean.length === 11 && /^[\w-]+$/.test(clean)) return clean;
  return clean;
}

export async function GET() {
  try {
    const sanityVideos = await sanityClient.fetch<Array<{
      _id: string;
      title: string;
      youtubeId: string;
      category: string;
      year?: number;
      duration?: string;
      description?: string;
    }>>(`*[_type == "video"] | order(year desc) {
      _id,
      title,
      youtubeId,
      category,
      year,
      duration,
      description
    }`);

    return NextResponse.json({ success: true, videos: sanityVideos || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, videos: [], error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, youtubeUrl, category, year, duration, description } = body;

    if (!title || !youtubeUrl || !category) {
      return NextResponse.json({ error: "Title, YouTube URL/ID, and Category are required." }, { status: 400 });
    }

    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId || youtubeId.length !== 11) {
      return NextResponse.json({ error: "Invalid YouTube URL or Video ID. Please check the link." }, { status: 400 });
    }

    const newVideoDoc = {
      _type: "video",
      title: title.trim(),
      youtubeId,
      category,
      year: year ? parseInt(year, 10) : new Date().getFullYear(),
      duration: duration?.trim() || "3:30",
      description: description?.trim() || "",
    };

    let docId = "";
    if (process.env.SANITY_API_TOKEN) {
      const created = await sanityWriteClient.create(newVideoDoc);
      docId = created._id;
    } else {
      docId = `local-vid-${Date.now()}`;
    }

    revalidatePath("/media");

    return NextResponse.json({
      success: true,
      video: {
        id: youtubeId,
        _id: docId,
        title: newVideoDoc.title,
        category: newVideoDoc.category,
        year: newVideoDoc.year,
        duration: newVideoDoc.duration,
        description: newVideoDoc.description,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save video to Sanity." }, { status: 500 });
  }
}
