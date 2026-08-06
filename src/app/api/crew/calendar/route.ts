import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "schedules.json");

// Module-level cache — avoids re-reading the file on every GET request.
// Invalidated whenever a POST write occurs.
let cachedSchedules: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30_000; // 30-second TTL as a safety net

async function readSchedules() {
  try {
    const now = Date.now();
    if (cachedSchedules !== null && now - cacheTimestamp < CACHE_TTL_MS) {
      return cachedSchedules;
    }
    const data = await fs.readFile(FILE_PATH, "utf-8");
    cachedSchedules = JSON.parse(data);
    cacheTimestamp = now;
    return cachedSchedules;
  } catch {
    return [];
  }
}

async function writeSchedules(schedules: any[]) {
  await fs.writeFile(FILE_PATH, JSON.stringify(schedules, null, 2), "utf-8");
  // Invalidate cache after a write so the next GET reflects the new data
  cachedSchedules = schedules;
  cacheTimestamp = Date.now();
}

export async function GET() {
  try {
    const schedules = await readSchedules();
    return NextResponse.json(schedules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to read schedules" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid body. Must be an array of schedules" }, { status: 400 });
    }
    await writeSchedules(body);
    return NextResponse.json({ success: true, count: body.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save schedules" }, { status: 500 });
  }
}
