import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "schedules.json");

async function readSchedules() {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeSchedules(schedules: any[]) {
  await fs.writeFile(FILE_PATH, JSON.stringify(schedules, null, 2), "utf-8");
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
