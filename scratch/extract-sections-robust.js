const fs = require("fs");
const path = require("path");

const pagePath = path.resolve(__dirname, "../src/app/admin/page.tsx");
const content = fs.readFileSync(pagePath, "utf8");

// Robust markers using exact comment structures
const markers = [
  { key: "shopify", start: "{/* ── Shopify Sales Dashboard ── */}", end: "{/* Active Live Streams" },
  { key: "livealerts", start: "Active Live Streams", end: "{/* Booking Requests Section */}" },
  { key: "bookings", start: "{/* Booking Requests Section */}", end: "{/* ── Event Planners Directory ── */}" },
  { key: "planners", start: "{/* ── Event Planners Directory ── */}", end: "{/* ── Fan Photo Moderation Queue ── */}" },
  { key: "photomod", start: "{/* ── Fan Photo Moderation Queue ── */}", end: "{/* ── Invite Challenge ── */}" },
  { key: "invitechallenge", start: "{/* ── Invite Challenge ── */}", end: "{/* ── SMS Proximity Blast" },
  { key: "smsblast", start: "{/* ── SMS Proximity Blast — Fan Show Alerts ── */}", end: "{/* ── Crew SMS Alert ── */}" },
  { key: "crewsms", start: "{/* ── Crew SMS Alert ── */}", end: "{/* ── Newsletter Blast ── */}" },
  { key: "newsletter", start: "{/* ── Newsletter Blast ── */}", end: "{/* ── Community Registry ── */}" },
  { key: "registry", start: "{/* ── Community Registry ── */}", end: "{/* ── Crew Account Creation ── */}" },
  { key: "crewcreation", start: "{/* ── Crew Account Creation ── */}", end: "</div>\n\n          <div className=\"xl:col-span-1" }
];

// Start searching after the band tab check to avoid matching early references
const searchOffset = content.indexOf("adminTab === 'band'");

for (const m of markers) {
  const startIdx = content.indexOf(m.start, searchOffset);
  const endIdx = content.indexOf(m.end, startIdx === -1 ? searchOffset : startIdx);
  
  if (startIdx === -1 || endIdx === -1) {
    console.error(`Could not find indexes for ${m.key}. Start: ${startIdx}, End: ${endIdx}`);
    continue;
  }
  
  const sectStart = content.indexOf("<section", startIdx);
  const sectEnd = content.lastIndexOf("</section>", endIdx) + "</section>".length;
  
  if (sectStart === -1 || sectEnd === -1 || sectStart > sectEnd || sectStart > endIdx) {
    // If no section found between start and end, check if it is just a plain component wrapper like InviteChallenge
    if (m.key === "invitechallenge") {
      resultsText = content.substring(startIdx, endIdx).trim();
      fs.writeFileSync(path.resolve(__dirname, `section-${m.key}.txt`), resultsText);
      console.log(`Extracted wrapper section ${m.key} (${resultsText.length} chars)`);
      continue;
    }
    console.error(`Invalid section bounds for ${m.key}. sectStart: ${sectStart}, sectEnd: ${sectEnd}`);
    continue;
  }
  
  const resultsText = content.substring(sectStart, sectEnd).trim();
  fs.writeFileSync(path.resolve(__dirname, `section-${m.key}.txt`), resultsText);
  console.log(`Extracted section ${m.key} (${resultsText.length} chars)`);
}

console.log("Done!");
