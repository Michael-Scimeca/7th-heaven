import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBSCRIBERS_PATH = path.join(process.cwd(), "data", "sms-subscribers.json");

interface Subscriber {
  id: string;
  phone: string;
  name: string;
  zipCode: string;
  optedIn: boolean;
  createdAt: string;
}

function getSubscribers(): Subscriber[] {
  try {
    if (!fs.existsSync(SUBSCRIBERS_PATH)) return [];
    return JSON.parse(fs.readFileSync(SUBSCRIBERS_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function saveSubscribers(subs: Subscriber[]) {
  fs.writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(subs, null, 2));
}

// POST: Send SMS to subscribers near a zip code
// Body: { zipCode, message, radiusMiles? }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { zipCode, message } = body;

    if (!zipCode || !message) {
      return NextResponse.json(
        { error: "zipCode and message are required" },
        { status: 400 }
      );
    }

    const subscribers = getSubscribers();
    const targets = subscribers.filter(
      (s) => s.optedIn && s.zipCode === zipCode
    );

    // ─── Twilio Batch Send (uncomment when keys are added) ───
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // const results = [];
    // for (const sub of targets) {
    //   try {
    //     const msg = await client.messages.create({
    //       body: `🎸 7th Heaven: ${message}\n\nReply STOP to unsubscribe.`,
    //       from: process.env.TWILIO_PHONE_NUMBER,
    //       to: `+1${sub.phone}`,
    //     });
    //     results.push({ phone: sub.phone, status: 'sent', sid: msg.sid });
    //   } catch (err) {
    //     results.push({ phone: sub.phone, status: 'failed', error: err.message });
    //   }
    // }

    return NextResponse.json({
      success: true,
      message: `Would send to ${targets.length} subscribers in ${zipCode}`,
      targets: targets.length,
      note: "Twilio integration pending — add API keys to .env.local",
    });
  } catch (error) {
    console.error("SMS send error:", error);
    return NextResponse.json(
      { error: "Failed to send messages" },
      { status: 500 }
    );
  }
}

// DELETE: Opt-out a subscriber by phone
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.replace(/\D/g, "");

    if (!phone) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const subscribers = getSubscribers();
    const updated = subscribers.map((s) =>
      s.phone === phone ? { ...s, optedIn: false } : s
    );
    saveSubscribers(updated);

    return NextResponse.json({ success: true, message: "Unsubscribed" });
  } catch (error) {
    console.error("SMS unsubscribe error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
