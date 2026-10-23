import type { ComponentType } from "react";
import A01 from "./A01"; import A02 from "./A02"; import A03 from "./A03"; import A04 from "./A04"; import A05 from "./A05";
import A06 from "./A06"; import A07 from "./A07"; import A08 from "./A08"; import A09 from "./A09"; import A10 from "./A10";
import A11 from "./A11"; import A12 from "./A12"; import A13 from "./A13"; import A14 from "./A14"; import A15 from "./A15";
import A16 from "./A16"; import A17 from "./A17"; import A18 from "./A18"; import A19 from "./A19"; import A20 from "./A20";

export const ALERT_VERSIONS: { title: string; idea: string; Component: ComponentType }[] = [
  { title: "Clean stack", idea: "Radius → shows → details, with chips instead of boxed cards.", Component: A01 },
  { title: "Sentence builder", idea: "The whole form reads as one sentence you fill in.", Component: A02 },
  { title: "3-step wizard", idea: "Where → What → You. One decision per screen.", Component: A03 },
  { title: "Compact filter bar", idea: "Two lines total — built to sit in the footer.", Component: A04 },
  { title: "Slider + switches", idea: "Radius slider; each show type is a labelled switch.", Component: A05 },
  { title: "Radar rings", idea: "Tap concentric rings around “You” to set your radius.", Component: A06 },
  { title: "Settings list", idea: "iOS-style grouped rows — instantly familiar.", Component: A07 },
  { title: "Underline + checklist", idea: "No boxes at all: underline fields and plain checkboxes.", Component: A08 },
  { title: "Presets first", idea: "One tap for most fans; “Let me choose” for the rest.", Component: A09 },
  { title: "Accordion summary", idea: "Each section collapses to a one-line summary.", Component: A10 },
  { title: "Live notification preview", idea: "A sample push alert updates as you choose.", Component: A11 },
  { title: "Phone + form, cleaned", idea: "Your current phone-video idea with lighter controls.", Component: A12 },
  { title: "Icon tiles", idea: "Big tappable icons for each show type.", Component: A13 },
  { title: "Email first", idea: "One field + button; filters hide behind “Customize”.", Component: A14 },
  { title: "Where · What · Who", idea: "Three numbered columns side by side.", Component: A15 },
  { title: "Mobile sheet", idea: "Narrow bottom-sheet card with a sticky save bar.", Component: A16 },
  { title: "Conversation", idea: "Friendly chat — one question at a time.", Component: A17 },
  { title: "Ticket stub", idea: "Styled like a concert ticket: “Activate pass”.", Component: A18 },
  { title: "Checklist matrix", idea: "Band × venue checklists with Select all / Clear.", Component: A19 },
  { title: "Sticky summary", idea: "Choices left; live plain-English recap + save on the right.", Component: A20 },
];
