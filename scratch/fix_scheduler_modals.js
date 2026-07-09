const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

// Normalize newlines to LF
content = content.replace(/\r\n/g, "\n");

console.log("Original content size:", content.length);

const startKey = "            {selectedShowCrewDate && (() => {";
const startIdx = content.indexOf(startKey);

if (startIdx === -1) {
  console.log("Error: Start key for schedule modals not found!");
  process.exit(1);
}

const referralKey = "  const renderReferral = () => (";
const referralIdx = content.indexOf(referralKey);
if (referralIdx === -1) {
  console.log("Error: renderReferral declaration not found!");
  process.exit(1);
}

// Find the last </section> before referral
const endIdx = content.lastIndexOf("</section>", referralIdx);
if (endIdx === -1 || endIdx < startIdx) {
  console.log("Error: Ending section for featured track not found!");
  process.exit(1);
}

const rawExtracted = content.substring(startIdx, endIdx);

// Clean up the modals block to only include the modals (up to the last )})
const lastBraceIdx = rawExtracted.lastIndexOf(")}");
if (lastBraceIdx === -1) {
  console.log("Error: Could not find ending of modals conditional!");
  process.exit(1);
}

const cleanModals = rawExtracted.substring(0, lastBraceIdx + 2).trim();
console.log("Successfully extracted schedule modals. Size:", cleanModals.length);

// Delete the modals block from renderFeaturedTrack and restore the correct closing tags:
// 1. </div> closes Right Side container
// 2. </div> closes Grid container
// 3. </div> closes the display container
// 4. </div> closes the extra container tag that was part of the duplicate block
content = content.substring(0, startIdx) + "\n            </div>\n          </div>\n        </div>\n      </div>\n" + content.substring(endIdx);

// Find renderAwardPicks to locate the end of renderCrewSchedule
const awardPicksKey = "  const renderAwardPicks = () => (";
const awardPicksIdx = content.indexOf(awardPicksKey);
if (awardPicksIdx === -1) {
  console.log("Error: renderAwardPicks declaration not found!");
  process.exit(1);
}

const scheduleSectionEndIdx = content.lastIndexOf("</section>", awardPicksIdx);
if (scheduleSectionEndIdx === -1) {
  console.log("Error: Ending section for schedule calendar not found!");
  process.exit(1);
}

// Get the block before the closing section of renderCrewSchedule
let before = content.substring(0, scheduleSectionEndIdx);
const after = content.substring(scheduleSectionEndIdx);

// Slice before up to the end of the activeDropDay modal closing, discarding the duplicate closes
const lastBraceIdxInBefore = before.lastIndexOf(")}");
if (lastBraceIdxInBefore === -1) {
  console.log("Error: Could not find closing brace of activeDropDay modal!");
  process.exit(1);
}
// Append 2 closing divs to close the remaining layout containers (display container and wiw-scheduler-container)
before = before.substring(0, lastBraceIdxInBefore + 2) + "\n      </div>\n      </div>";

// Insert clean modals right before the closing section of renderCrewSchedule
content = before + "\n\n        {/* Relocated Modals from FeaturedTrack */}\n        " + cleanModals + "\n      " + after;

fs.writeFileSync(filePath, content, "utf8");
console.log("Scheduler modals successfully relocated and FeaturedTrack divs restored!");
