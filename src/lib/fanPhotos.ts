import fs from "fs";
import path from "path";

export interface FanPhoto {
  id: string;
  src: string;
  name: string;
  venue?: string;
  city?: string;
  date?: string;
  caption?: string;
  instagram?: string;
  type?: "image" | "video";
  youtubeId?: string;
  approved: boolean;
  filename?: string;
  submittedAt?: string;
  flagged?: boolean;
  rejected?: boolean;
  rejection_reason?: string;
  safety_flag?: string;
}

const META_PATH = path.join(process.cwd(), "data", "fan-photos.json");

export async function getFanPhotos(): Promise<FanPhoto[]> {
  try {
    if (!fs.existsSync(META_PATH)) return [];
    const content = await fs.promises.readFile(META_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function getApprovedFanPhotos(): Promise<FanPhoto[]> {
  const photos = await getFanPhotos();
  return photos.filter((p) => p.approved);
}
