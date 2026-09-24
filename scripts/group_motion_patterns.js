const fs = require("fs");
const data = JSON.parse(fs.readFileSync("scripts/motion_audit.json"));

const categories = {
  "Buttons & Interactive Controls (.btn-interactive, .icon-btn, .pill-btn)": [],
  "Links & Nav Items (.nav-link, .text-link)": [],
  "Cards & Panels (.card-hover, .glass-card-hover)": [],
  "Accordion & Collapsibles (.accordion-chevron, .faq-item)": [],
  "Inputs & Form Focus (.focus-ring, .input-focus)": [],
  "Modals & Drawers (.backdrop-fade, .drawer-slide)": [],
  "Other / Unique Transitions": []
};

data.occurrences.forEach(item => {
  const s = item.snippet.toLowerCase();
  if (s.includes("button") || s.includes("btn") || s.includes("cursor-pointer") && (s.includes("hover:") || s.includes("active:"))) {
    categories["Buttons & Interactive Controls (.btn-interactive, .icon-btn, .pill-btn)"].push(item);
  } else if (s.includes("link") || s.includes("<a ") || s.includes("<nav") || s.includes("href")) {
    categories["Links & Nav Items (.nav-link, .text-link)"].push(item);
  } else if (s.includes("card") || s.includes("panel") || s.includes("tile") || s.includes("rounded-xl") && s.includes("hover:")) {
    categories["Cards & Panels (.card-hover, .glass-card-hover)"].push(item);
  } else if (s.includes("accordion") || s.includes("chevron") || s.includes("faq") || s.includes("rotate-90")) {
    categories["Accordion & Collapsibles (.accordion-chevron, .faq-item)"].push(item);
  } else if (s.includes("input") || s.includes("focus:") || s.includes("focus-visible:")) {
    categories["Inputs & Form Focus (.focus-ring, .input-focus)"].push(item);
  } else if (s.includes("modal") || s.includes("drawer") || s.includes("backdrop") || s.includes("dialog")) {
    categories["Modals & Drawers (.backdrop-fade, .drawer-slide)"].push(item);
  } else {
    categories["Other / Unique Transitions"].push(item);
  }
});

for (const [catName, list] of Object.entries(categories)) {
  console.log(`${catName}: ${list.length} occurrences`);
}
