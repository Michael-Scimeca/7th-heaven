const fs = require("fs");
const path = require("path");

const historyDir = "/Users/michaelscimeca/Library/Application Support/Antigravity/User/History";

if (!fs.existsSync(historyDir)) {
  console.log("History directory does not exist.");
  process.exit(1);
}

const findHistory = (dirPath) => {
  const dirs = fs.readdirSync(dirPath);
  let found = [];

  dirs.forEach(dir => {
    const fullDir = path.join(dirPath, dir);
    if (fs.statSync(fullDir).isDirectory()) {
      const entriesPath = path.join(fullDir, "entries.json");
      if (fs.existsSync(entriesPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(entriesPath, "utf8"));
          if (data.resource && data.resource.includes("src/app/admin/page.tsx")) {
            console.log(`Found entries for page.tsx in folder: ${dir}`);
            if (data.entries && Array.isArray(data.entries)) {
              data.entries.forEach(entry => {
                found.push({
                  dir: fullDir,
                  id: entry.id,
                  timestamp: entry.timestamp,
                  fileName: path.join(fullDir, entry.id)
                });
              });
            }
          }
        } catch (err) {}
      }
    }
  });

  return found;
};

const entries = findHistory(historyDir);
console.log(`Found ${entries.length} history entries for src/app/admin/page.tsx.`);

// Sort by timestamp descending
entries.sort((a, b) => b.timestamp - a.timestamp);

if (entries.length > 0) {
  const latest = entries[0];
  console.log(`Latest entry timestamp: ${new Date(latest.timestamp).toISOString()}`);
  console.log(`File: ${latest.fileName}`);
  
  // Print size and first lines
  const content = fs.readFileSync(latest.fileName, "utf8");
  console.log(`Line count: ${content.split("\n").length}`);
  
  // Copy to destination
  const dest = path.join(__dirname, "../src/app/admin/page.tsx");
  fs.writeFileSync(dest, content, "utf8");
  console.log(`Successfully restored page.tsx to: ${dest}`);
} else {
  console.log("No page.tsx history entries found.");
}
