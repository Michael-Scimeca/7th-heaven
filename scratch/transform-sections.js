const fs = require('fs');
const path = require('path');

const keys = [
  'shopify',
  'livealerts',
  'bookings',
  'planners',
  'photomod',
  'smsblast',
  'crewsms',
  'newsletter',
  'registry',
  'crewcreation'
];

function findClosingDiv(str, startIdx) {
  let depth = 0;
  let pos = startIdx;
  
  while (pos < str.length) {
    const nextOpen = str.indexOf('<div', pos);
    const nextClose = str.indexOf('</div>', pos);
    
    if (nextClose === -1) return -1;
    
    if (nextOpen !== -1 && nextOpen < nextClose) {
      // Find where this tag ends
      const tagEnd = str.indexOf('>', nextOpen);
      if (tagEnd === -1) return -1;
      const isSelfClosing = str.substring(nextOpen, tagEnd).trim().endsWith('/');
      if (isSelfClosing) {
        pos = tagEnd + 1;
      } else {
        depth++;
        pos = nextOpen + 4;
      }
    } else {
      depth--;
      if (depth === 0) {
        return nextClose + 6; // Include '</div>'
      }
      pos = nextClose + 6;
    }
  }
  return -1;
}

for (const key of keys) {
  const filePath = path.resolve(__dirname, `section-${key}.txt`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    continue;
  }
  let str = fs.readFileSync(filePath, 'utf8');

  // Clean up potential mt-8 from section tag to avoid duplicate spacing inside drag wrapper
  str = str.replace('<section className="', '<section className="');
  str = str.replace('mt-8 bg-[#0f0f13]', 'bg-[#0f0f13]');
  str = str.replace('mt-8 bg-gradient-to-br', 'bg-gradient-to-br');

  // Identify header div boundaries
  const headerDivStart = str.indexOf('<div className="p-6 border-b');
  if (headerDivStart === -1) {
    console.error(`Could not find header div start for ${key}`);
    continue;
  }
  
  // Find matching closing div of header
  const headerDivClose = findClosingDiv(str, headerDivStart);
  if (headerDivClose === -1) {
    console.error(`Could not balance header div for ${key}`);
    continue;
  }

  // Find h3 boundaries
  const h3Start = str.indexOf('<h3', headerDivStart);
  if (h3Start === -1 || h3Start > headerDivClose) {
    console.error(`Could not find h3 in header for ${key}`);
    continue;
  }
  const h3Close = str.indexOf('</h3>', h3Start) + 5;
  const h3Content = str.substring(h3Start, h3Close);

  // Find the controls/right-side items div (if any) in the header
  let controlsStart = str.indexOf('<div className="flex items-center gap-3"', h3Close);
  if (controlsStart === -1 || controlsStart > headerDivClose) {
    controlsStart = str.indexOf('<div className="flex items-center gap-4"', h3Close);
  }
  if (controlsStart === -1 || controlsStart > headerDivClose) {
    controlsStart = str.indexOf('<div className="flex bg-black rounded p-1 border', h3Close);
  }
  if (controlsStart === -1 || controlsStart > headerDivClose) {
    controlsStart = str.indexOf('<span className="px-3 py-1 bg-white/5', h3Close);
  }
  
  let headerControls = '';

  if (controlsStart !== -1 && controlsStart < headerDivClose) {
    let controlsEnd = -1;
    if (str.substring(controlsStart, controlsStart + 4) === '<div') {
      controlsEnd = findClosingDiv(str, controlsStart);
    } else {
      // It is a span/button, find closing tag
      const tagName = str.substring(controlsStart + 1, str.indexOf(' ', controlsStart));
      controlsEnd = str.indexOf(`</${tagName}>`, controlsStart) + `</${tagName}>`.length;
    }
    
    if (controlsEnd !== -1 && controlsEnd <= headerDivClose) {
      headerControls = str.substring(controlsStart, controlsEnd);
    }
  }

  // Clean and format the new h3 safely
  let h3ContentWithClick = h3Content;
  if (h3ContentWithClick.includes('className="')) {
    h3ContentWithClick = h3ContentWithClick.replace('className="', `className="cursor-pointer `);
  } else {
    h3ContentWithClick = h3ContentWithClick.replace('<h3', `<h3 className="cursor-pointer"`);
  }
  h3ContentWithClick = h3ContentWithClick.replace('<h3', `<h3 onClick={() => toggleSection('${key}')}`);

  let newHeader = `
              <div onClick={() => toggleSection('${key}')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  ${h3ContentWithClick}
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  ${headerControls}
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('${key}') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
  `.trim();

  // Wrap the body content
  let bodyContent = str.substring(headerDivClose, str.lastIndexOf('</section>')).trim();
  
  // Inject data-lenis-prevent where appropriate
  if (key === 'shopify') {
    bodyContent = bodyContent.replace('max-h-[400px] overflow-y-auto custom-scrollbar', 'max-h-[400px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true');
    bodyContent = bodyContent.replace('max-h-[350px] overflow-y-auto custom-scrollbar', 'max-h-[350px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true');
  } else if (key === 'registry') {
    bodyContent = bodyContent.replace('max-h-[400px] overflow-y-auto custom-scrollbar', 'max-h-[400px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true');
  } else if (key === 'bookings') {
    bodyContent = bodyContent.replace('overflow-x-auto', 'overflow-x-auto" data-lenis-prevent="true');
  } else if (key === 'planners') {
    bodyContent = bodyContent.replace('p-0', 'p-0" data-lenis-prevent="true');
  }

  let finalSect = `
            {/* ── ${key.toUpperCase()} ── */}
            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              ${newHeader}
              <div style={{ display: isSectionOpen('${key}') ? undefined : 'none' }}>
                ${bodyContent}
              </div>
            </section>
  `.trim();

  fs.writeFileSync(filePath, finalSect, 'utf8');
  console.log(`Transformed section-${key}.txt successfully!`);
}
