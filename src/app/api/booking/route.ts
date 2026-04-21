import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.eventDate || !data.eventType || !data.venueCity || !data.venueState) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Add timestamp
    const booking = {
      ...data,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    // Save to JSON file
    const filePath = path.join(process.cwd(), "data", "bookings.json");
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let bookings = [];
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      bookings = JSON.parse(raw);
    }
    bookings.push(booking);
    fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2));

    return NextResponse.json({ success: true, message: "Booking request received" });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
