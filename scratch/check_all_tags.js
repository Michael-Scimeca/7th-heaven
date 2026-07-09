const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const startIdx = content.indexOf("const renderRegistry =");
const endIdx = content.indexOf("const renderCrewCreation =");

const body = content.substring(startIdx, endIdx);

// Match all tags (both opening and closing, e.g. <div, </div, <input)
const tagRegex = /<\/?[a-zA-Z0-9:-]+/g;
const matches = body.match(tagRegex) || [];

const counts = {};
for (const match of matches) {
  const isClose = match.startsWith("</");
  const tagName = isClose ? match.substring(2) : match.substring(1);
  
  if (!counts[tagName]) {
    counts[tagName] = { opens: 0, closes: 0 };
  }
  
  if (isClose) {
    counts[tagName].closes++;
  } else {
    // Check if it's self-closing in JSX
    const idx = body.indexOf(match);
    const tagEnd = body.indexOf(">", idx);
    const tagStr = body.substring(idx, tagEnd + 1);
    if (tagStr.endsWith("/>")) {
      counts[tagName].opens++;
      counts[tagName].closes++;
    } else {
      counts[tagName].opens++;
    }
  }
}

console.log("Tag counts inside renderRegistry:");
for (const [tag, count] of Object.entries(counts)) {
  console.log(`  <${tag}>: opens=${count.opens}, closes=${count.closes} (${count.opens === count.closes ? 'OK' : 'MISMATCH ⚠️'})`);
}
