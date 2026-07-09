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
    // For renderAwardPicks, scan up to export default or end
    const exportIdx = content.indexOf("export default", startIdx);
    if (exportIdx !== -1) {
      endIdx = exportIdx;
    }
  }
  
  const body = content.substring(startIdx, endIdx);
  
  // Count divs
  const divOpens = (body.match(/<div[ >]/g) || []).length;
  const divCloses = (body.match(/<\/div>/g) || []).length;
  
  // Count sections
  const secOpens = (body.match(/<section[ >]/g) || []).length;
  const secCloses = (body.match(/<\/section>/g) || []).length;
  
  // Count tables, trs, tds
  const tableOpens = (body.match(/<table[ >]/g) || []).length;
  const tableCloses = (body.match(/<\/table>/g) || []).length;
  const trOpens = (body.match(/<tr[ >]/g) || []).length;
  const trCloses = (body.match(/<\/tr>/g) || []).length;
  const tdOpens = (body.match(/<td[ >]/g) || []).length;
  const tdCloses = (body.match(/<\/td>/g) || []).length;
  
  // Count braces
  const openBraces = (body.match(/\{/g) || []).length;
  const closeBraces = (body.match(/\}/g) || []).length;
  
  console.log(`[${f.name}]`);
  console.log(`  divs:     opens=${divOpens}, closes=${divCloses} (${divOpens === divCloses ? 'OK' : 'MISMATCH ⚠️'})`);
  console.log(`  sections: opens=${secOpens}, closes=${secCloses} (${secOpens === secCloses ? 'OK' : 'MISMATCH ⚠️'})`);
  console.log(`  tables:   opens=${tableOpens}, closes=${tableCloses} (${tableOpens === tableCloses ? 'OK' : 'MISMATCH ⚠️'})`);
  console.log(`  trs:      opens=${trOpens}, closes=${trCloses} (${trOpens === trCloses ? 'OK' : 'MISMATCH ⚠️'})`);
  console.log(`  tds:      opens=${tdOpens}, closes=${tdCloses} (${tdOpens === tdCloses ? 'OK' : 'MISMATCH ⚠️'})`);
  console.log(`  braces:   opens=${openBraces}, closes=${closeBraces} (${openBraces === closeBraces ? 'OK' : 'MISMATCH ⚠️'})`);
}
