const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync("scripts/clean_blur_data.json"));

console.log("Building report markdown sections...");

let reportText = "";

// Combine backdrop and element items into a single sorted master table list
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

fs.writeFileSync("scripts/master_blur_report.json", JSON.stringify(masterList, null, 2));
console.log(`Master list contains ${masterList.length} total distinct blur entries.`);
