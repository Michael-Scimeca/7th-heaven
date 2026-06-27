import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const getFilePath = () => {
  const filePath = path.join(process.cwd(), "data", "new_date_notifies.json");
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return filePath;
};

const readNotifies = (filePath: string): any[] => {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse new_date_notifies.json:", err);
    return [];
  }
};

const writeNotifies = (filePath: string, notifies: any[]) => {
  fs.writeFileSync(filePath, JSON.stringify(notifies, null, 2));
};

// ── GET: Fetch subscriptions for a user email ───────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    const filePath = getFilePath();
    const notifies = readNotifies(filePath);
    const userNotifies = notifies.filter(
      (n: any) => n.email.toLowerCase() === email.trim().toLowerCase()
    );

    return NextResponse.json({ success: true, subscriptions: userNotifies });
  } catch (error) {
    console.error("GET show notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST: Add show notification subscription ─────────────────────
export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { showId, email, venueName, showDate, city, state } = body;

    if (!showId || !email || !venueName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const filePath = getFilePath();
    const notifies = readNotifies(filePath);

    // Avoid duplicate subscriptions for the same show/email combination
    const isDuplicate = notifies.some(
      (n: any) => n.showId === showId && n.email.toLowerCase() === email.toLowerCase()
    );

    if (!isDuplicate) {
      notifies.push({
        id: `ndn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        showId,
        venueName,
        showDate: showDate || "",
        city: city || "",
        state: state || "",
        email: email.trim().toLowerCase(),
        subscribedAt: new Date().toISOString()
      });
      writeNotifies(filePath, notifies);
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("POST show notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── DELETE: Cancel show notification subscription ─────────────────
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const showId = searchParams.get("showId");

    if (!email || !showId) {
      return NextResponse.json({ error: "Missing required parameters (email, showId)" }, { status: 400 });
    }

    const filePath = getFilePath();
    let notifies = readNotifies(filePath);

    const initialLength = notifies.length;
    notifies = notifies.filter(
      (n: any) => !(n.showId === showId && n.email.toLowerCase() === email.trim().toLowerCase())
    );

    if (notifies.length < initialLength) {
      writeNotifies(filePath, notifies);
      return NextResponse.json({ success: true, message: "Unsubscribed successfully!" });
    } else {
      return NextResponse.json({ success: true, message: "No subscription found to delete." });
    }
  } catch (error) {
    console.error("DELETE show notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
