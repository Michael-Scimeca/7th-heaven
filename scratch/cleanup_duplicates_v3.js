const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

// Normalize to LF
content = content.replace(/\r\n/g, "\n");

console.log("Original file size:", content.length);

// 1. Remove duplicate state/handlers (collapsedSections, toggleSection, isSectionOpen, handleSyncTourDates)
const collapsedKey = "  // ── Collapsible Sections (persisted via localStorage & Supabase) ──";
const firstCollapsedIdx = content.indexOf(collapsedKey);
const secondCollapsedIdx = content.indexOf(collapsedKey, firstCollapsedIdx + 1);

if (secondCollapsedIdx !== -1) {
  const banKey = "  const handleBanCruiseUser = async (senderName: string) => {";
  const firstBanIdx = content.indexOf(banKey, secondCollapsedIdx);
  if (firstBanIdx !== -1) {
    console.log("Removing duplicate collapsedSections block...");
    content = content.substring(0, secondCollapsedIdx) + content.substring(firstBanIdx);
  } else {
    console.log("Error: handleBanCruiseUser not found after second collapsedSections!");
  }
} else {
  console.log("Warning: second collapsedSections key not found!");
}

// 2. Remove second duplicate handleBanCruiseUser definition
const banKey = "  const handleBanCruiseUser = async (senderName: string) => {";
const firstBanIdx = content.indexOf(banKey);
const secondBanIdx = content.indexOf(banKey, firstBanIdx + 1);

if (secondBanIdx !== -1) {
  const adminLoginKey = "  const handleAdminLogin = async (e: React.FormEvent) => {";
  const adminLoginIdx = content.indexOf(adminLoginKey, secondBanIdx);
  if (adminLoginIdx !== -1) {
    console.log("Removing duplicate handleBanCruiseUser definition...");
    content = content.substring(0, secondBanIdx) + content.substring(adminLoginIdx);
  } else {
    console.log("Error: handleAdminLogin not found after second handleBanCruiseUser!");
  }
} else {
  console.log("Warning: second handleBanCruiseUser not found!");
}

// 3. Remove first duplicate state declarations for draggedShiftId, draggedCrewMemberId, activeDropDay
const dupStatesOld = `  const [draggedShiftId, setDraggedShiftId] = useState<string | null>(null);
  const [draggedCrewMemberId, setDraggedCrewMemberId] = useState<string | null>(null);
  const [activeDropDay, setActiveDropDay] = useState<string | null>(null);`;

if (content.includes(dupStatesOld)) {
  console.log("Removing first duplicate state declarations...");
  content = content.replace(dupStatesOld, "");
} else {
  console.log("Warning: dupStatesOld block not found!");
}

// 4. Remove first duplicate Featured Track state declarations
const dupFeaturedState = `  // Featured Track State
  const [activeFeaturedTrack, setActiveFeaturedTrack] = useState<any>(null);
  const [trackTitle, setTrackTitle] = useState(''); // Serves as Drop / Album Name
  const [dropSongs, setDropSongs] = useState<{ title: string; file: File | null }[]>([{ title: '', file: null }]);`;

const normalizedFeaturedState = dupFeaturedState.replace(/\r\n/g, "\n");

if (content.includes(normalizedFeaturedState)) {
  console.log("Removing first duplicate Featured Track state...");
  content = content.replace(normalizedFeaturedState, "");
} else {
  console.log("Warning: normalizedFeaturedState block not found!");
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Duplicates cleanup v3 complete!");
