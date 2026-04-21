import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/feed — Create a new feed post
export async function POST(request: NextRequest) {
 try {
  const body = await request.json();

  const { member_name, member_role, member_avatar, content, post_type, image_url, video_url, show_id } = body;

  if (!member_name || !content) {
   return NextResponse.json({ error: "member_name and content are required" }, { status: 400 });
  }

  const postData = {
   member_name,
   member_role: member_role || "Crew",
   member_avatar: member_avatar || member_name.split(" ").map((w: string) => w[0]).join(""),
   content,
   post_type: post_type || "text",
   image_url: image_url || null,
   video_url: video_url || null,
   show_id: show_id || null,
   reactions: {},
   is_live: true,
  };

  const { data, error } = await supabase.from("feed_posts").insert([postData]).select().single();

  if (error) {
   console.error("Supabase insert error:", error);
   // Dev mode fallback
   console.log("📡 [DEV MODE] Feed post logged:", postData);
   return NextResponse.json({ success: true, dev_mode: true, post: postData }, { status: 201 });
  }

  return NextResponse.json({ success: true, post: data }, { status: 201 });
 } catch (err) {
  console.error("Feed post error:", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
 }
}

// GET /api/feed — Get recent feed posts
export async function GET() {
 try {
  const { data, error } = await supabase
   .from("feed_posts")
   .select("*")
   .order("created_at", { ascending: false })
   .limit(50);

  if (error) {
   console.warn("Supabase fetch error, returning empty:", error);
   return NextResponse.json({ posts: [], dev_mode: true });
  }

  return NextResponse.json({ posts: data });
 } catch {
  return NextResponse.json({ posts: [], dev_mode: true });
 }
}
