const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

// Normalize newlines to LF
content = content.replace(/\r\n/g, "\n");

console.log("Original content size:", content.length);

const startKey = "{/* Audio Compression & Mastering Options */}";
const endKey = "{/* Visibility Gate */}";

const firstIdx = content.indexOf(startKey);
const secondIdx = content.indexOf(startKey, firstIdx + startKey.length);

if (secondIdx === -1) {
  console.log("Error: Second Audio Compression options block not found!");
  process.exit(1);
}

const endIdx = content.indexOf(endKey, secondIdx);
if (endIdx === -1) {
  console.log("Error: Visibility Gate block not found!");
  process.exit(1);
}

console.log(`Found target block at indices: ${secondIdx} to ${endIdx}`);

// Extract calendar controls precisely up to the end of the Crew Member Filter div
const controlsStartKey = "{/* 🎸 Tour Dates Quick-Jump */}";
const controlsStartIdx = content.indexOf(controlsStartKey, secondIdx);

if (controlsStartIdx === -1 || controlsStartIdx > endIdx) {
  console.log("Error: Calendar controls not found inside the block!");
  process.exit(1);
}

const filterEndKey = '<polyline points="6 9 12 15 18 9" /></svg>\n                  </div>\n                </div>';
const filterEndIdx = content.indexOf(filterEndKey, controlsStartIdx);

if (filterEndIdx === -1 || filterEndIdx > endIdx) {
  console.log("Error: Could not locate end of Crew Member Filter!");
  process.exit(1);
}

const calendarControls = content.substring(controlsStartIdx, filterEndIdx + filterEndKey.length).trim();
console.log("Successfully extracted calendar controls. Size:", calendarControls.length);

// Delete the duplicate block and calendar controls from renderFeaturedTrack
content = content.substring(0, secondIdx) + content.substring(endIdx);

// Now, insert calendar controls into renderCrewSchedule
const timelineHeaderOld = `              {/* Right Column: Weekly Timeline Grid */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[0.65rem] uppercase tracking-[0.15em] text-white/40 font-black">Weekly Planner Timeline</h4>
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 backdrop-blur-md">`;

const timelineHeaderNew = `              {/* Right Column: Weekly Timeline Grid */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
                  <h4 className="text-[0.65rem] uppercase tracking-[0.15em] text-white/40 font-black">Weekly Planner Timeline</h4>
                  
                  {/* Calendar Filters & Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    ${calendarControls.split('\n').map(line => '                    ' + line).join('\n').trim()}
                  </div>

                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 backdrop-blur-md">`;

if (content.includes(timelineHeaderOld)) {
  console.log("Inserting calendar controls into renderCrewSchedule...");
  content = content.replace(timelineHeaderOld, timelineHeaderNew);
} else {
  console.log("Error: Timeline header target not found inside renderCrewSchedule!");
  process.exit(1);
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Re-organization of scheduler layout complete!");
