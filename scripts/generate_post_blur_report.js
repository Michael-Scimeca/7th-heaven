const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync("scripts/clean_blur_data.json"));

const masterList = [];

data.sortedBackdrop.forEach(item => {
  masterList.push({
    classValue: item.token,
    actualPx: item.px,
    type: "Backdrop Blur",
    timesUsed: item.count,
    occurrences: item.occurrences
  });
});

data.sortedElement.forEach(item => {
  masterList.push({
    classValue: item.token,
    actualPx: item.px,
    type: "Element Blur",
    timesUsed: item.count,
    occurrences: item.occurrences
  });
});

masterList.sort((a, b) => b.timesUsed - a.timesUsed);

console.log("Total distinct blur entries:", masterList.length);

fs.writeFileSync("scripts/post_blur_report.json", JSON.stringify({
  uniqueBackdropCount: data.backdropCount,
  uniqueElementCount: data.elementCount,
  masterList
}, null, 2));
