import type { TeamCfg } from "./team";

const BOOKING_CENTER = ["lenny", "jeff", "dickie", "alan", "mary"];

export const TEAM_VERSIONS: TeamCfg[] = [
  { title: "Original", idea: "The layout you picked: fan group shot left, numbered list right.", heading: "Contact the team", sub: "Five people, one crew. Find yours on the right.", group: "fan", placement: "left", list: "numbered" },
  { title: "Mirrored", idea: "Same idea flipped: list reads first, group shot on the right.", heading: "Contact the team", sub: "Find your person on the left — the whole crew is on the right.", group: "fan", placement: "right", list: "numbered" },
  { title: "Spotlight", idea: "Hover a name and that person steps forward; the others fade.", heading: "Who do you need?", sub: "Hover a name to spotlight them in the crew.", group: "fan", placement: "left", list: "need", spotlight: true },
  { title: "Lineup + columns", idea: "Wide straight lineup with names under faces; details in matching columns.", heading: "The crew", sub: "Everyone you might need, left to right.", group: "row", placement: "top", list: "columns", captions: true, spotlight: true },
  { title: "V formation", idea: "Booking-center V, giant names in the list.", heading: "One crew", sub: "Five people behind every 7th Heaven show.", group: "vee", placement: "left", list: "giant", order: BOOKING_CENTER },
  { title: "Two rows", idea: "Class-photo style: three back, two front; compact one-line list.", heading: "Contact the team", sub: "Everything on one line per person.", group: "twoRow", placement: "left", list: "compact" },
  { title: "Close-up banner", idea: "Huge cropped faces across the top, two-column list below.", heading: "Get in touch", sub: "Booking, press, production and travel.", group: "closeup", placement: "top", list: "grid2", spotlight: true },
  { title: "Staircase", idea: "Heights step up left to right; need-led list on the left.", heading: "What do you need?", sub: "Start with your reason, then your person.", group: "stairs", placement: "right", list: "need", spotlight: true },
  { title: "Arc + numbered", idea: "Middle three set back in a gentle arc; numbered list in two columns.", heading: "Meet the crew", sub: "Five people, numbered so it's easy to say who you talked to.", group: "arc", placement: "top", list: "grid2", captions: true },
  { title: "Finale", idea: "List first, the whole crew lands at the bottom as a closing shot.", heading: "Contact", sub: "Find your person below.", group: "fan", placement: "bottom", list: "compact" },
  { title: "Booking front & center", idea: "Rich stands in the middle of the group; numbered list beside.", heading: "Book 7th Heaven", sub: "Booking up front, and the rest of the crew around it.", group: "fan", placement: "left", list: "numbered", order: BOOKING_CENTER, spotlight: true },
  { title: "Small lineup, big words", idea: "Modest straight lineup; each entry leads with what they handle.", heading: "Contact the team", sub: "Read what they handle, then reach out.", group: "row", placement: "left", list: "blurb", spotlight: true },
  { title: "V + captions", idea: "Wide V with names under every face; columns aligned underneath.", heading: "One crew", sub: "Hover a column to light up the face.", group: "vee", placement: "top", list: "columns", captions: true, spotlight: true, order: BOOKING_CENTER },
  { title: "Two rows, giant names", idea: "Class photo on the right, huge names on the left with spotlight.", heading: "The team", sub: "Hover a name.", group: "twoRow", placement: "right", list: "giant", spotlight: true },
  { title: "Close-up spotlight", idea: "Tight crop of faces left; need-led list lights them up.", heading: "Who do you need?", sub: "Hover a reason to see who handles it.", group: "closeup", placement: "left", list: "need", spotlight: true },
  { title: "Black & white focus", idea: "Spotlight turns everyone else greyscale for maximum focus.", heading: "Contact the team", sub: "Hover a name — everyone else steps back.", group: "fan", placement: "left", list: "compact", spotlight: true, gray: true },
  { title: "Staircase banner", idea: "Wide ascending lineup across the top, two-column list below.", heading: "Get in touch", sub: "From booking to the boat.", group: "stairs", placement: "top", list: "grid2", captions: true },
  { title: "Arc + stories", idea: "Arc group shot left; each entry leads with what they do.", heading: "Meet the crew", sub: "What each of us handles.", group: "arc", placement: "left", list: "blurb", spotlight: true, gray: true },
  { title: "Mirrored giant", idea: "Huge names on the left, fan group shot on the right.", heading: "Contact", sub: "Five names. Pick yours.", group: "fan", placement: "right", list: "giant", spotlight: true },
  { title: "Lineup finale", idea: "Compact list up top, labelled lineup closes the page.", heading: "Contact the team", sub: "Quick list first — faces below.", group: "row", placement: "bottom", list: "compact", captions: true, spotlight: true },
];
