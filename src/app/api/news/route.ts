import { NextResponse } from "next/server";
import { sanityClient, sanityWriteClient } from "@/lib/sanity";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sanityNews = await sanityClient.fetch<Array<{
      _id: string;
      title: string;
      content: string;
      date?: string;
      category?: string;
      publishedAt?: string;
    }>>(`*[_type == "newsPost"] | order(publishedAt desc) {
      _id,
      title,
      content,
      date,
      category,
      publishedAt
    }`);

    return NextResponse.json({ success: true, news: sanityNews || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, news: [], error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, date, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and Content are required." }, { status: 400 });
    }

    const slugStr = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `news-${Date.now()}`;

    const displayDate = date?.trim() || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const newPostDoc = {
      _type: "newsPost",
      title: title.trim(),
      slug: { _type: "slug", current: slugStr },
      content: content.trim(),
      date: displayDate,
      category: category || "update",
      publishedAt: new Date().toISOString(),
    };

    let docId = "";
    if (process.env.SANITY_API_TOKEN) {
      const created = await sanityWriteClient.create(newPostDoc);
      docId = created._id;
    } else {
      docId = `local-news-${Date.now()}`;
    }

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      article: {
        _id: docId,
        id: docId,
        title: newPostDoc.title,
        content: newPostDoc.content,
        date: newPostDoc.date,
        category: newPostDoc.category,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save news post to Sanity." }, { status: 500 });
  }
}
