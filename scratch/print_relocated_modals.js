const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const startIdx = content.indexOf("        {/* Relocated Modals from FeaturedTrack */}");
const endIdx = content.indexOf("      </section>", startIdx);

console.log("Inserted block:\n", content.substring(startIdx, endIdx + 16));
