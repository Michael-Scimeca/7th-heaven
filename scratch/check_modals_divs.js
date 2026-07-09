const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx.orig";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const startKey = "            {selectedShowCrewDate && (() => {";
const startIdx = content.indexOf(startKey);
const referralKey = "  const renderReferral = () => (";
const referralIdx = content.indexOf(referralKey);
const endIdx = content.lastIndexOf("</section>", referralIdx);

const body = content.substring(startIdx, endIdx);

let opens = 0;
let closes = 0;

let pos = 0;
while (true) {
  const idxOpen = body.indexOf("<div", pos);
  const idxClose = body.indexOf("</div>", pos);
  
  if (idxOpen === -1 && idxClose === -1) break;
  
  if (idxOpen !== -1 && (idxClose === -1 || idxOpen < idxClose)) {
    const tagEnd = body.indexOf(">", idxOpen);
    const tagStr = body.substring(idxOpen, tagEnd + 1);
    if (!tagStr.endsWith("/>")) {
      opens++;
    }
    pos = idxOpen + 4;
  } else {
    closes++;
    pos = idxClose + 6;
  }
}

console.log(`Modals block: opens=${opens}, closes=${closes}`);
