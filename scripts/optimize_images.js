const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGES_DIR = path.resolve(__dirname, "../public/images");

async function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      await getAllFiles(res, fileList);
    } else {
      if (/\.(png|jpg|jpeg)$/i.test(file.name)) {
        fileList.push(res);
      }
    }
  }
  return fileList;
}

async function optimizeImages() {
  const files = await getAllFiles(IMAGES_DIR);
  console.log(`Found ${files.length} images to optimize in ${IMAGES_DIR}...`);

  let initialTotalSize = 0;
  let finalTotalSize = 0;
  let count = 0;

  for (const file of files) {
    const stat = await fs.promises.stat(file);
    initialTotalSize += stat.size;

    // Skip small files (< 50KB)
    if (stat.size < 50 * 1024) {
      finalTotalSize += stat.size;
      continue;
    }

    const tempFile = file + ".tmp";
    const ext = path.extname(file).toLowerCase();

    try {
      if (ext === ".png") {
        await sharp(file)
          .png({ quality: 80, compressionLevel: 9, palette: true })
          .toFile(tempFile);
      } else if (ext === ".jpg" || ext === ".jpeg") {
        await sharp(file)
          .jpeg({ quality: 80, mozjpeg: true })
          .toFile(tempFile);
      }

      const tempStat = await fs.promises.stat(tempFile);
      if (tempStat.size < stat.size) {
        await fs.promises.rename(tempFile, file);
        finalTotalSize += tempStat.size;
        count++;
        console.log(`Optimized ${path.basename(file)}: ${(stat.size / 1024 / 1024).toFixed(2)}MB -> ${(tempStat.size / 1024 / 1024).toFixed(2)}MB (-${(((stat.size - tempStat.size) / stat.size) * 100).toFixed(1)}%)`);
      } else {
        if (fs.existsSync(tempFile)) await fs.promises.unlink(tempFile);
        finalTotalSize += stat.size;
      }
    } catch (err) {
      console.error(`Failed to optimize ${path.basename(file)}:`, err.message);
      if (fs.existsSync(tempFile)) await fs.promises.unlink(tempFile);
      finalTotalSize += stat.size;
    }
  }

  console.log("\n==========================================");
  console.log(`Initial size: ${(initialTotalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Final size:   ${(finalTotalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved:        ${((initialTotalSize - finalTotalSize) / 1024 / 1024).toFixed(2)} MB (-${(((initialTotalSize - finalTotalSize) / initialTotalSize) * 100).toFixed(1)}%)`);
  console.log(`Files compressed: ${count}`);
  console.log("==========================================");
}

optimizeImages();
