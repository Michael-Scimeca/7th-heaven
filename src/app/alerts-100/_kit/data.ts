export const RADII = [
  { id: "all", label: "All Shows", short: "All", miles: 0 },
  { id: "15", label: "15 Miles", short: "15", miles: 15 },
  { id: "30", label: "30 Miles", short: "30", miles: 30 },
  { id: "50", label: "50 Miles", short: "50", miles: 50 },
  { id: "100", label: "100 Miles", short: "100", miles: 100 },
] as const;

export const TYPES = [
  { id: "full", label: "Full Band", desc: "Electric 5-piece rock sets", group: "Format", dot: "#a855f7" },
  { id: "unplugged", label: "Unplugged", desc: "Acoustic & vocal sets", group: "Format", dot: "#d8b4fe" },
  { id: "special", label: "Special Feature", desc: "Guest stars & anniversaries", group: "Feature", dot: "#f472b6" },
  { id: "outdoor", label: "Outdoor Fest", desc: "Festivals & parks", group: "Venue", dot: "#34d399" },
  { id: "casino", label: "Casino & Resort", desc: "Lounges & showrooms", group: "Venue", dot: "#fbbf24" },
  { id: "tv", label: "TV Broadcast", desc: "Televised live sets", group: "Venue", dot: "#60a5fa" },
  { id: "fundraiser", label: "Fundraiser", desc: "Charity & benefits", group: "Venue", dot: "#f43f5e" },
] as const;

export type RadiusId = (typeof RADII)[number]["id"];
export type TypeId = (typeof TYPES)[number]["id"];

export const STRUCTURES = [
  { id: "stacked", name: "Stacked", idea: "Every group on its own row, top to bottom." },
  { id: "split", name: "Split", idea: "Who you are on the left, what you want on the right." },
  { id: "wizard", name: "Wizard", idea: "Three short steps: you, distance, shows." },
  { id: "sentence", name: "Sentence", idea: "Fill in a sentence instead of a form." },
  { id: "accordion", name: "Accordion", idea: "Three folding sections with a live summary on each." },
  { id: "tabs", name: "Tabs", idea: "Who / Where / What tabs with one save button." },
  { id: "bar", name: "Compact bar", idea: "One row with a filter drawer that slides open." },
  { id: "sidebar", name: "Summary sidebar", idea: "Form on the left, a live alert preview on the right." },
  { id: "reveal", name: "Email first", idea: "Start with just your email; the rest unfolds." },
  { id: "bento", name: "Bento grid", idea: "Each group in its own tile of a grid." },
] as const;

export const STYLES = [
  { id: "pills", name: "Pills & cards", idea: "Pill radius, described cards for show types." },
  { id: "underline", name: "Underline & checklist", idea: "Underlined tabs and a checklist with hairlines." },
  { id: "slider", name: "Slider & switches", idea: "A distance slider and on/off switches." },
  { id: "segmented", name: "Segmented", idea: "Joined segmented controls for everything." },
  { id: "tiles", name: "Big tiles", idea: "Large tap tiles set in the display face." },
  { id: "rings", name: "Rings & badges", idea: "Concentric radius rings and round badges." },
  { id: "dropdown", name: "Dropdowns", idea: "Compact selects and a checkbox list." },
  { id: "stickers", name: "Stickers", idea: "Tilted stickers in the accent face." },
  { id: "text", name: "Bare text", idea: "No boxes: words light up when picked." },
  { id: "ticket", name: "Ticket stubs", idea: "Perforated ticket stubs you punch." },
] as const;

export type StructureId = (typeof STRUCTURES)[number]["id"];
export type StyleId = (typeof STYLES)[number]["id"];

/** 100 versions: structure-major, so 1–10 are Stacked with each style, 11–20 Split, … */
export const VERSIONS = STRUCTURES.flatMap((st) =>
  STYLES.map((sy) => ({
    structure: st.id as StructureId,
    style: sy.id as StyleId,
    title: `${st.name} · ${sy.name}`,
    idea: `${st.idea} ${sy.idea}`,
  })),
);
