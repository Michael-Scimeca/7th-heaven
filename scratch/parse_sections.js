const ts = require('typescript');
const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const renderFuncs = [
  { name: 'renderShopify', start: "const renderShopify =" },
  { name: 'renderTourSync', start: "const renderTourSync =" },
  { name: 'renderBookings', start: "const renderBookings =" },
  { name: 'renderPlanners', start: "const renderPlanners =" },
  { name: 'renderPhotoMod', start: "const renderPhotoMod =" },
  { name: 'renderMemoryMod', start: "const renderMemoryMod =" },
  { name: 'renderFeaturedTrack', start: "const renderFeaturedTrack =" },
  { name: 'renderReferral', start: "const renderReferral =" },
  { name: 'renderLiveAlerts', start: "const renderLiveAlerts =" },
  { name: 'renderSmsBlast', start: "const renderSmsBlast =" },
  { name: 'renderCrewSms', start: "const renderCrewSms =" },
  { name: 'renderNewsletter', start: "const renderNewsletter =" },
  { name: 'renderRegistry', start: "const renderRegistry =" },
  { name: 'renderCrewCreation', start: "const renderCrewCreation =" },
  { name: 'renderAdminCreation', start: "const renderAdminCreation =" },
  { name: 'renderInviteChallenge', start: "const renderInviteChallenge =" },
  { name: 'renderBulkInvites', start: "const renderBulkInvites =" },
  { name: 'renderCrewSchedule', start: "const renderCrewSchedule =" },
  { name: 'renderAwardPicks', start: "const renderAwardPicks =" }
];

for (let i = 0; i < renderFuncs.length; i++) {
  const f = renderFuncs[i];
  const startIdx = content.indexOf(f.start);
  if (startIdx === -1) {
    console.log(`Could not find start for ${f.name}`);
    continue;
  }
  
  let endIdx = content.length;
  if (i < renderFuncs.length - 1) {
    const nextStartIdx = content.indexOf(renderFuncs[i + 1].start);
    if (nextStartIdx !== -1) {
      endIdx = nextStartIdx;
    }
  } else {
    const returnIdx = content.indexOf("return (", startIdx);
    if (returnIdx !== -1) {
      endIdx = returnIdx;
    }
  }
  
  const body = content.substring(startIdx, endIdx);
  
  // Wrap in a mock react component to parse cleanly
  const mockCode = `
import React from 'react';
export function MockComponent() {
  const isSectionOpen = (s) => true;
  const toggleSection = (s) => {};
  const newCrewPhone = "";
  const setNewCrewPhone = (s) => {};
  const newCrewName = "";
  const setNewCrewName = (s) => {};
  const newCrewUsername = "";
  const setNewCrewUsername = (s) => {};
  const newCrewEmail = "";
  const setNewCrewEmail = (s) => {};
  const newCrewPassword = "";
  const setNewCrewPassword = (s) => {};
  const createdCrew = null;
  const setCreatedCrew = (s) => {};
  const crewError = "";
  const setCrewError = (s) => {};
  const scrollToRegistry = () => {};
  const crewAlertMsg = "";
  const setCrewAlertMsg = (s) => {};
  const crewAlertSending = false;
  const setCrewAlertSending = (s) => {};
  const crewAlertResult = null;
  const setCrewAlertResult = (s) => {};
  const crewAlertStats = null;
  const smsShows = [];
  const activeDropDay = null;
  const draggedCrewMemberId = null;
  const calendarView = "timeline";
  const getDayShow = (d) => null;
  const schedules = [];
  const selectedShowCrewDate = null;
  
  ${body}
  
  return null;
}
`;

  const sourceFile = ts.createSourceFile(
    `mock_${f.name}.tsx`,
    mockCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  
  const diagnostics = sourceFile.parseDiagnostics || [];
  if (diagnostics.length > 0) {
    console.log(`[${f.name}] FAILED parser check! Found ${diagnostics.length} diagnostics:`);
    for (const diag of diagnostics) {
      const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
      console.log(`  -> ${message}`);
    }
  } else {
    console.log(`[${f.name}] PASSED parser check!`);
  }
}
