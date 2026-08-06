import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function POST(request: Request) {
  try {
    const {
      user_email,
      type,
      title,
      body,
      pin,
      prize
    } = await request.json();
    if (!user_email) {
      return NextResponse.json({
        error: "Missing user_email"
      }, {
        status: 400
      });
    }
    const {
      error
    } = await supabase.from("notifications").insert({
      user_email,
      type: type || "general",
      title: title || "Notification",
      body: body || "",
      pin,
      prize
    });
    if (error) {
      return NextResponse.json({
        error: error.message
      }, {
        status: 500
      });
    }
    return NextResponse.json({
      success: true
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message || "Failed to create notification"
    }, {
      status: 500
    });
  }
}