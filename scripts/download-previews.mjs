#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const ROOT_DIR = process.cwd();
const VIDEOS_JSON_PATH = path.join(ROOT_DIR, "public", "data", "videos.json");
const PREVIEWS_DIR = path.join(ROOT_DIR, "public", "movie", "previews");
const MANIFEST_PATH = path.join(ROOT_DIR, "public", "data", "available-previews.json");

if (!fs.existsSync(PREVIEWS_DIR)) {
  fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
}

// Parse CLI flags: --limit <number> or --all, and --concurrency <number>
const args = process.argv.slice(2);
let limit = Infinity;
if (!args.includes("--all")) {
  const limitIdx = args.indexOf("--limit");
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    limit = parseInt(args[limitIdx + 1], 10);
  }
}

let concurrency = 4;
const concIdx = args.indexOf("--concurrency");
if (concIdx !== -1 && args[concIdx + 1]) {
  concurrency = parseInt(args[concIdx + 1], 10);
}

const rawVideos = JSON.parse(fs.readFileSync(VIDEOS_JSON_PATH, "utf8"));
const uniqueVideos = [];
const seen = new Set();

for (const cat of rawVideos) {
  for (const v of cat.videos || []) {
    if (v.id && !seen.has(v.id)) {
      seen.add(v.id);
      uniqueVideos.push(v);
    }
  }
}

const targetVideos = uniqueVideos.slice(0, limit);
console.log(`Found ${uniqueVideos.length} total videos in catalog.`);
console.log(`Processing ${targetVideos.length} videos with ${concurrency} parallel workers...\n`);

function updateManifest() {
  try {
    const files = fs
      .readdirSync(PREVIEWS_DIR)
      .filter((f) => f.endsWith(".mp4") && fs.statSync(path.join(PREVIEWS_DIR, f)).size > 10000)
      .map((f) => f.replace(".mp4", ""));
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(files, null, 2));
  } catch {}
}

async function processVideo(video, index, total) {
  const outPath = path.join(PREVIEWS_DIR, `${video.id}.mp4`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
    console.log(`[${index + 1}/${total}] ⏩ Already exists: "${video.title}" (${video.id}.mp4)`);
    return;
  }

  console.log(`[${index + 1}/${total}] ⬇️  Downloading 5s clip: "${video.title}" (${video.id})...`);
  const tempPattern = path.join(ROOT_DIR, `temp_preview_${video.id}`);

  try {
    // 1. Download 5-second section (20s to 25s)
    await execAsync(
      `yt-dlp --no-warnings --download-sections "*20-25" -f "bestvideo[height<=480]+bestaudio/best[height<=480]/best" --force-keyframes-at-cuts -o "${tempPattern}.%(ext)s" "https://www.youtube.com/watch?v=${video.id}"`,
      { timeout: 50000 }
    );

    const files = fs.readdirSync(ROOT_DIR).filter((f) => f.startsWith(`temp_preview_${video.id}`));
    if (files.length === 0) {
      console.warn(`[${index + 1}/${total}] ⚠️ No temp file found for ${video.id}`);
      return;
    }

    const tempFile = path.join(ROOT_DIR, files[0]);

    // 2. Transcode to web-optimized H.264 MP4 without audio
    await execAsync(
      `ffmpeg -y -i "${tempFile}" -an -vf "scale=640:-2" -c:v libx264 -preset fast -crf 26 -movflags +faststart "${outPath}"`,
      { timeout: 30000 }
    );

    // Clean up temp
    for (const f of files) {
      try {
        fs.unlinkSync(path.join(ROOT_DIR, f));
      } catch {}
    }

    if (fs.existsSync(outPath)) {
      const sizeKb = Math.round(fs.statSync(outPath).size / 1024);
      console.log(`[${index + 1}/${total}] ✅ Saved: "${video.title}" (${sizeKb} KB)`);
      updateManifest();
    }
  } catch (err) {
    console.warn(`[${index + 1}/${total}] ⚠️ Failed ${video.id}: ${err.message?.slice(0, 100)}`);
    try {
      const leftover = fs.readdirSync(ROOT_DIR).filter((f) => f.startsWith(`temp_preview_${video.id}`));
      for (const f of leftover) fs.unlinkSync(path.join(ROOT_DIR, f));
    } catch {}
  }
}

// Concurrent worker pool
async function runPool() {
  let currentIndex = 0;
  const total = targetVideos.length;

  async function worker() {
    while (currentIndex < total) {
      const index = currentIndex++;
      await processVideo(targetVideos[index], index, total);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  updateManifest();
  const finalFiles = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  console.log(`\n🎉 Complete! ${finalFiles.length} preview clips are now ready in public/movie/previews/`);
  console.log(`Manifest updated at ${path.relative(ROOT_DIR, MANIFEST_PATH)}.`);
}

runPool();
