const fs = require("fs");
const path = require("path");

const historyDirs = [
  "/Users/michaelscimeca/Library/Application Support/Antigravity IDE/User/History",
  "/Users/michaelscimeca/Library/Application Support/Antigravity/User/History"
];

const found = [];

historyDirs.forEach(historyDir => {
  if (!fs.existsSync(historyDir)) return;
  console.log(`Scanning history dir: ${historyDir}`);
  const dirs = fs.readdirSync(historyDir);

  dirs.forEach(dir => {
    const fullDir = path.join(historyDir, dir);
    if (fs.statSync(fullDir).isDirectory()) {
      const entriesPath = path.join(fullDir, "entries.json");
      if (fs.existsSync(entriesPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(entriesPath, "utf8"));
          if (data.resource && data.resource.includes("admin/page.tsx")) {
            console.log(`Found matching resource in ${dir}: ${data.resource}`);
            if (data.entries && Array.isArray(data.entries)) {
              data.entries.forEach(entry => {
                found.push({
                  dir: fullDir,
                  id: entry.id,
                  timestamp: entry.timestamp,
                  fileName: path.join(fullDir, entry.id),
                  resource: data.resource
                });
              });
            }
          }
        } catch (err) {}
      }
    }
  });
});

console.log(`Total history entries found: ${found.length}`);

// Sort by timestamp descending
found.sort((a, b) => b.timestamp - a.timestamp);

if (found.length > 0) {
  const latest = found[0];
  console.log(`Latest entry timestamp: ${new Date(latest.timestamp).toISOString()}`);
  console.log(`File: ${latest.fileName}`);
  console.log(`Resource URI: ${latest.resource}`);
  
  const content = fs.readFileSync(latest.fileName, "utf8");
  console.log(`Line count: ${content.split("\n").length}`);
  
  const dest = path.join(__dirname, "../src/app/admin/page.tsx");
  fs.writeFileSync(dest, content, "utf8");
  console.log(`Successfully restored page.tsx to: ${dest}`);
} else {
  console.log("No matching history entries found.");
}
