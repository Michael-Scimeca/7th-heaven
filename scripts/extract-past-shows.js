const fs = require('fs');
const path = require('path');

const transcriptPath = '/Users/michaelscimeca/.gemini/antigravity-ide/brain/0eac6c43-9fa0-4ae5-bee0-1de19555fef5/.system_generated/logs/transcript_full.jsonl';
const line = fs.readFileSync(transcriptPath, 'utf8').split('\n')[0];
const obj = JSON.parse(line);
const text = obj.content;

// Find starting line "Here is a list of Past Shows"
const lines = text.split('\n');
const showsStartIdx = lines.findIndex(l => l.includes('Here is a list of Past Shows') || l.includes('Past Shows 7th heaven has played since 1985'));

const pastShowLines = showsStartIdx !== -1 ? lines.slice(showsStartIdx + 1) : lines;

const showsByYear = [];
let currentYear = null;
let currentYearShows = [];

for (let rawLine of pastShowLines) {
  let lineStr = rawLine.trim();
  if (!lineStr) continue;

  // Clean trailing artifacts if any
  lineStr = lineStr.replace(/<\/USER_REQUEST>.*$/, '').trim();
  if (!lineStr) continue;

  // Check if line is a year like "2025" or "2024" or "1985"
  if (/^\d{4}$/.test(lineStr)) {
    if (currentYear) {
      showsByYear.push({
        year: currentYear,
        shows: currentYearShows
      });
    }
    currentYear = lineStr;
    currentYearShows = [];
    continue;
  }

  // Check if line is a show entry
  if (currentYear) {
    const dashIdx = lineStr.indexOf(' - ');
    if (dashIdx !== -1) {
      const datePart = lineStr.substring(0, dashIdx).trim();
      const venuePart = lineStr.substring(dashIdx + 3).trim();
      currentYearShows.push({
        raw: lineStr,
        date: datePart,
        venue: venuePart
      });
    } else {
      currentYearShows.push({
        raw: lineStr,
        date: "",
        venue: lineStr
      });
    }
  }
}

if (currentYear) {
  showsByYear.push({
    year: currentYear,
    shows: currentYearShows
  });
}

const totalShows = showsByYear.reduce((acc, y) => acc + y.shows.length, 0);

console.log(`Parsed ${showsByYear.length} years and ${totalShows} total past shows.`);
if (showsByYear.length > 0) {
  console.log(`Years range: ${showsByYear[0].year} down to ${showsByYear[showsByYear.length - 1].year}`);
}

const outputPath = path.join(__dirname, '../src/data/past-shows.json');
fs.writeFileSync(outputPath, JSON.stringify({ years: showsByYear, totalShows }, null, 2));
console.log(`Saved to ${outputPath}`);
