const fs = require('fs');
const path = require('path');

const pagePath = path.resolve(__dirname, '../src/app/admin/page.tsx');
const content = fs.readFileSync(pagePath, 'utf8');

const targets = [
  { key: 'shopify', match: 'stroke="#96bf48"' },
  { key: 'livealerts', match: 'Active Live Streams' },
  { key: 'bookings', match: 'id="booking-requests-section"' },
  { key: 'planners', match: 'bookings.filter(b => b.email)' },
  { key: 'photomod', match: 'Fan Photo Moderation Queue' },
  { key: 'invitechallenge', match: '<InviteChallengePanel' },
  { key: 'smsblast', match: 'Auto-text fans near an upcoming show' },
  { key: 'crewsms', match: '🛡️ Crew SMS Alert' },
  { key: 'newsletter', match: 'polyline points="22,6 12,13 2,6"' },
  { key: 'registry', match: 'ref={registryRef}' },
  { key: 'crewcreation', match: 'Create Crew Account' }
];

const startOffset = content.indexOf("adminTab === 'band'");
console.log(`Starting search from offset: ${startOffset}`);

for (const t of targets) {
  const matchIdx = content.indexOf(t.match, startOffset);
  if (matchIdx === -1) {
    console.error(`Could not find match for ${t.key}: "${t.match}"`);
    continue;
  }
  
  // Find the <section tag before matchIdx
  const startIdx = content.lastIndexOf('<section', matchIdx);
  if (startIdx === -1) {
    console.error(`Could not find start section for ${t.key}`);
    continue;
  }
  
  // Find the closing </section> after matchIdx
  const endIdx = content.indexOf('</section>', matchIdx) + '</section>'.length;
  if (endIdx === -1) {
    console.error(`Could not find end section for ${t.key}`);
    continue;
  }
  
  const text = content.substring(startIdx, endIdx).trim();
  fs.writeFileSync(path.resolve(__dirname, `section-${t.key}.txt`), text);
  console.log(`Extracted ${t.key} to section-${t.key}.txt (${text.length} chars)`);
}
