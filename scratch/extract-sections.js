const fs = require("fs");
const path = require("path");

const pagePath = path.resolve(__dirname, "../src/app/admin/page.tsx");
const content = fs.readFileSync(pagePath, "utf8");

// We want to extract the exact text of the sections in the left column.
// Since the sections are delimited by comments and start with "<section" and end with "</section>",
// let\x27s write a parser to find them.

const sections = [
  { key: "shopify", startMarker: "Shopify Sales", endMarker: "Active Live Streams" },
  { key: "livealerts", startMarker: "Active Live Streams", endMarker: "Booking Requests" },
  { key: "bookings", startMarker: "Booking Requests Section", endMarker: "Event Planners Directory" },
  { key: "planners", startMarker: "Event Planners Directory", endMarker: "Fan Photo Moderation Queue" },
  { key: "photomod", startMarker: "Fan Photo Moderation Queue", endMarker: "Invite Challenge" },
  { key: "smsblast", startMarker: "SMS Proximity Blast", endMarker: "Crew SMS Alert" },
  { key: "crewsms", startMarker: "Crew SMS Alert", endMarker: "Newsletter Blast" },
  { key: "newsletter", startMarker: "Newsletter Blast", endMarker: "Community Registry" },
  { key: "registry", startMarker: "Community Registry", endMarker: "Crew Account Creation" },
  { key: "crewcreation", startMarker: "Crew Account Creation", endMarker: "Audit Log" }
];

const results = {};

for (const sec of sections) {
  const startIdx = content.indexOf(sec.startMarker);
  const endIdx = content.indexOf(sec.endMarker, startIdx);
  if (startIdx === -1 || endIdx === -1) {
    console.error(`Could not find markers for ${sec.key}`);
    continue;
  }
  
  // Find the first "<section" after startIdx
  const sectStart = content.indexOf("<section", startIdx);
  // Find the closing "</section>" before endIdx
  const sectEnd = content.lastIndexOf("</section>", endIdx) + "</section>".length;
  
  if (sectStart === -1 || sectEnd === -1 || sectStart > sectEnd) {
    console.error(`Invalid section bounds for ${sec.key}`);
    continue;
  }
  
  results[sec.key] = content.substring(sectStart, sectEnd).trim();
  fs.writeFileSync(path.resolve(__dirname, `section-${sec.key}.txt`), results[sec.key]);
  console.log(`Extracted section ${sec.key} (${results[sec.key].length} chars)`);
}

console.log("All extractions complete!");
