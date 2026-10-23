import type { ComponentType } from "react";
import V01 from "./V01";
import V02 from "./V02";
import V03 from "./V03";
import V04 from "./V04";
import V05 from "./V05";
import V06 from "./V06";
import V07 from "./V07";
import V08 from "./V08";
import V09 from "./V09";
import V10 from "./V10";
import V11 from "./V11";
import V12 from "./V12";
import V13 from "./V13";
import V14 from "./V14";
import V15 from "./V15";
import V16 from "./V16";
import V17 from "./V17";
import V18 from "./V18";
import V19 from "./V19";
import V20 from "./V20";

export interface ContactVersion {
  title: string;
  idea: string;
  Component: ComponentType;
}

export const VERSIONS: ContactVersion[] = [
  { title: "Need-first rows", idea: "Reason → person → photo. Visitors pick what they need, not a name.", Component: V01 },
  { title: "Grouped by moment", idea: "Before the show / show day / on the road — three columns.", Component: V02 },
  { title: "Aligned directory", idea: "Borderless table; every column lines up for fast scanning.", Component: V03 },
  { title: "Booking spotlight", idea: "Booking gets the hero with big links; everyone else below.", Component: V04 },
  { title: "Hover stage, refined", idea: "Today's layout cleaned up: list left, portrait follows hover.", Component: V05 },
  { title: "Zigzag", idea: "Full-width rows, portrait alternates left and right.", Component: V06 },
  { title: "Giant name index", idea: "Huge names are the menu; the chosen one opens beside them.", Component: V07 },
  { title: "Band lineup", idea: "All five cutouts stand in one row like a group shot.", Component: V08 },
  { title: "Department tabs", idea: "Text-only tabs, one person and big links at a time.", Component: V09 },
  { title: "Sticky reason menu", idea: "Jump links on the left; sections scroll on the right.", Component: V10 },
  { title: "Poster", idea: "Giant ghost word behind a calm two-column roster.", Component: V11 },
  { title: "Group shot + list", idea: "Overlapping cutouts form a team photo; numbered list beside.", Component: V12 },
  { title: "Phone-first", idea: "Single narrow column; tap targets say “Email Rich →”.", Component: V13 },
  { title: "Horizontal rail", idea: "Swipe sideways through the team, snap scrolling.", Component: V14 },
  { title: "Accordion by need", idea: "Open only the topic you need; nothing else competes.", Component: V15 },
  { title: "Credits roll", idea: "Centred like film credits — role above a big name.", Component: V16 },
  { title: "Editorial", idea: "Magazine headline, portrait strip, two-column entries.", Component: V17 },
  { title: "“I am a…” chooser", idea: "Visitor picks who they are; we show their one contact.", Component: V18 },
  { title: "Mosaic", idea: "Asymmetric grid — booking large, others around it.", Component: V19 },
  { title: "Contact sheet", idea: "Row of faces, then everything on one compact sheet.", Component: V20 },
];
