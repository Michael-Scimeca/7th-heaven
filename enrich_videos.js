/**
 * Fetches YouTube metadata (duration, description, viewCount, publishedAt)
 * for every video in videos.json and writes enriched data back.
 */
const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyA7GhQ-rfoHABp68RtJzW-iVa5bOVmSEIU";
const DATA_PATH = path.join(__dirname, "public/data/videos.json");

function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "0:00";
  const h = parseInt(m[1] || "0");
  const min = parseInt(m[2] || "0");
  const sec = parseInt(m[3] || "0");
  if (h > 0) return `${h}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function formatViews(n) {
  const num = parseInt(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(num);
}

async function main() {
  const categories = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

  // Collect all unique video IDs
  const allIds = [];
  const idSet = new Set();
  for (const cat of categories) {
    for (const v of cat.videos) {
      if (!idSet.has(v.id)) {
        idSet.add(v.id);
        allIds.push(v.id);
      }
    }
  }

  console.log(`Fetching metadata for ${allIds.length} unique videos...`);

  // YouTube API allows up to 50 IDs per request
  const metaMap = {};
  for (let i = 0; i < allIds.length; i += 50) {
    const batch = allIds.slice(i, i + 50);
    const ids = batch.join(",");
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,statistics&id=${ids}&key=${API_KEY}`;

    const res = await fetch(url, {
      headers: { "Referer": "http://localhost:3000/" }
    });
    if (!res.ok) {
      console.error(`API error: ${res.status} ${await res.text()}`);
      process.exit(1);
    }
    const data = await res.json();

    for (const item of data.items) {
      metaMap[item.id] = {
        duration: parseDuration(item.contentDetails.duration),
        description: (item.snippet.description || "").split("\n")[0].slice(0, 120),
        viewCount: formatViews(item.statistics.viewCount || "0"),
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
      };
    }

    console.log(`  Batch ${Math.floor(i / 50) + 1}: fetched ${data.items.length} videos`);
  }

  // Enrich the categories
  for (const cat of categories) {
    for (const v of cat.videos) {
      const meta = metaMap[v.id];
      if (meta) {
        v.duration = meta.duration;
        v.description = meta.description;
        v.viewCount = meta.viewCount;
      }
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(categories, null, 2));
  console.log(`\nDone! Enriched ${Object.keys(metaMap).length} videos and saved to videos.json`);
}

main().catch(console.error);
