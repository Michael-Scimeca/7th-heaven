import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Try fetching by Sanity _id first, then fall back to slug field
    const [byId, bySlug] = await Promise.all([
      sanityClient.fetch<{
        _id: string;
        title: string;
        content: string;
        date?: string;
        category?: string;
        publishedAt?: string;
      } | null>(
        `*[_type == "newsPost" && _id == $id][0] { _id, title, content, date, category, publishedAt }`,
        { id: slug }
      ),
      sanityClient.fetch<{
        _id: string;
        title: string;
        content: string;
        date?: string;
        category?: string;
        publishedAt?: string;
      } | null>(
        `*[_type == "newsPost" && slug.current == $slug][0] { _id, title, content, date, category, publishedAt }`,
        { slug }
      ),
    ]);

    const article = byId ?? bySlug;

    if (!article) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, article });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
