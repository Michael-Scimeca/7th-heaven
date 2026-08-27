const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const MOVIE_DIR = path.resolve(__dirname, "../public/movie");

async function compressVideos() {
  if (!fs.existsSync(MOVIE_DIR)) return;
  const files = fs.readdirSync(MOVIE_DIR).filter(f => f.endsWith(".mp4") && !f.includes("-temp"));

  console.log(`Found ${files.length} MP4 videos in ${MOVIE_DIR}...`);

  let totalSavedBytes = 0;
  let initialTotalBytes = 0;
  let count = 0;

  for (const file of files) {
    const filePath = path.join(MOVIE_DIR, file);
    const tempPath = path.join(MOVIE_DIR, `${path.basename(file, ".mp4")}-temp.mp4`);
    const stat = fs.statSync(filePath);
    initialTotalBytes += stat.size;

    // Skip small clips (< 300KB)
    if (stat.size < 300 * 1024) continue;

    console.log(`Compressing ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)...`);

    try {
      // Use H.264 with CRF 30, preset slow, faststart for web streaming, remove unneeded audio track for silent loops
      execSync(
        `ffmpeg -y -i "${filePath}" -vf "scale=1280:-2" -c:v libx264 -crf 30 -preset slow -an -movflags +faststart "${tempPath}"`,
        { stdio: "ignore" }
      );

      if (fs.existsSync(tempPath)) {
        const tempStat = fs.statSync(tempPath);
        if (tempStat.size < stat.size) {
          const saved = stat.size - tempStat.size;
          totalSavedBytes += saved;
          fs.renameSync(tempPath, filePath);
          count++;
          console.log(`  ✓ ${file}: ${(stat.size / 1024 / 1024).toFixed(2)}MB -> ${(tempStat.size / 1024 / 1024).toFixed(2)}MB (-${((saved / stat.size) * 100).toFixed(1)}%)`);
        } else {
          fs.unlinkSync(tempPath);
          console.log(`  - ${file}: Keeping original (compressed was larger)`);
        }
      }
    } catch (err) {
      console.error(`  ✕ Error compressing ${file}:`, err.message);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }

  console.log("\n==========================================");
  console.log(`Initial total size: ${(initialTotalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved:              ${(totalSavedBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Videos compressed:  ${count}`);
  console.log("==========================================");
}

compressVideos();
