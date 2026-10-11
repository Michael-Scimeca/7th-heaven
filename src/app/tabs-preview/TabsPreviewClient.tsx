"use client";

import React, { useState } from "react";
import SegmentedTabs, {
  SEGMENTED_TABS_VARIANTS,
  type SegmentedTabsVariant,
} from "@/components/SegmentedTabs";
import { SectionHeader } from "@/components/SectionHeader";

const MEDIA_TABS = [
  "ALL",
  "OFFICIAL MUSIC VIDEOS",
  "TV APPEARANCES",
  "FULL CONCERTS",
  "COVER SONGS",
  "SONGS IN MOVIES & TV",
  "CRUISE VIDEOS",
  "COLLEGE SHOWS",
].map((label) => ({ id: label, label }));

const YEAR_TABS = [
  { id: "2027", label: "2027 Star of the Seas" },
  { id: "2028", label: "2028 Legend of the Seas" },
];

type VariantInfo = { desc: string; theory?: string; why?: string };

const VARIANT_INFO: Record<SegmentedTabsVariant, VariantInfo> = {
  glass: { desc: "Current look — subtle dark well, purple gradient pill." },
  outline: { desc: "Hairline border container, outlined purple pill." },
  light: { desc: "Frosted container with a solid white pill and black text." },
  neon: { desc: "Glowing fuchsia outline pill on a dark tube." },
  underline: { desc: "No container — a glowing gradient bar slides under the text." },
  frosted: { desc: "Apple-style glass: translucent container and glass pill." },
  sunset: { desc: "Same well as glass, warm pink → orange pill." },
  minimal: { desc: "Flat zinc container, flat grey pill. Quiet and neutral." },

  isolation: {
    desc: "Lime pill on the purple site — the only element that breaks the palette.",
    theory: "Von Restorff (Isolation) Effect",
    why: "The item that differs from its surroundings is noticed first and remembered best. Users instantly see which filter is on.",
  },
  tactile: {
    desc: "Recessed well + raised, top-lit key.",
    theory: "Affordance & Skeuomorphism (Don Norman)",
    why: "Physical depth cues signal “this can be pressed” without any labels. Lowers hesitation on first use.",
  },
  focus: {
    desc: "Inactive tabs heavily muted; only the current choice is bright.",
    theory: "Cognitive Load / Hick's Law",
    why: "Fewer things competing for attention = faster decisions with 11 categories. Trade-off: idle labels are lower contrast.",
  },
  spotlight: {
    desc: "Pill lit like a stage light from above.",
    theory: "Metaphor & Mental Models",
    why: "Borrowing a familiar concept (a spotlight on stage) makes the UI feel on-brand for a live rock band and self-explanatory.",
  },
  elevated: {
    desc: "Dark pill that floats above the bar with a long soft shadow.",
    theory: "Gestalt Figure–Ground",
    why: "The brain separates foreground from background using depth. Selection reads through elevation, not just color (helps color-blind users).",
  },
  contrast: {
    desc: "Pure black / white, full-strength labels, underline on hover.",
    theory: "WCAG AAA Contrast (7:1+)",
    why: "Maximum legibility for older fans, outdoor phone use and low vision. Most accessible option.",
  },
  calm: {
    desc: "Sky → cyan pill with dark text.",
    theory: "Color Psychology — Blue = Trust",
    why: "Cool blues lower arousal and signal reliability. Good for admin, booking and payment areas where users want confidence.",
  },
  aurora: {
    desc: "Pill gradient slowly drifts purple → pink → indigo (stops if reduced-motion is on).",
    theory: "Aesthetic–Usability Effect",
    why: "People perceive beautiful interfaces as easier to use and forgive small friction. Subtle motion adds delight without distraction.",
  },
};

function VariantDemo({
  variant,
  index,
}: {
  variant: SegmentedTabsVariant;
  index: number;
}) {
  const [media, setMedia] = useState("OFFICIAL MUSIC VIDEOS");
  const [year, setYear] = useState("2027");
  const headingId = `variant-${variant}-heading`;
  const info = VARIANT_INFO[variant];

  return (
    <section
      id={`variant-${variant}`}
      aria-labelledby={headingId}
      className="section-sm"
    >
      <div className="flex flex-col gap-4 rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6">
        <div className="flex flex-col gap-1">
          <h2 id={headingId} className="text-white">
            {index + 1}. <code className="text-purple-300">variant=&quot;{variant}&quot;</code>
          </h2>
          <p className="text-sm text-white/60">{info.desc}</p>
          {info.theory && (
            <p className="text-sm text-white/80">
              <span className="font-semibold text-purple-300">🧠 {info.theory}:</span>{" "}
              {info.why}
            </p>
          )}
        </div>
        <div className="hide-scrollbar max-w-full overflow-x-auto">
          <SegmentedTabs
            variant={variant}
            layout="flex"
            size="sm"
            ariaLabel={`${variant} media demo`}
            className="inline-flex w-max shrink-0 flex-nowrap"
            tabs={MEDIA_TABS}
            activeTab={media}
            onChange={setMedia}
          />
        </div>
        <div className="hide-scrollbar max-w-full overflow-x-auto">
          <SegmentedTabs
            variant={variant}
            layout="flex"
            size="md"
            ariaLabel={`${variant} year demo`}
            className="inline-flex w-max shrink-0 flex-nowrap"
            tabs={YEAR_TABS}
            activeTab={year}
            onChange={setYear}
          />
        </div>
      </div>
    </section>
  );
}

import ToggleLayoutShowcase from "@/components/ToggleLayoutShowcase";

export default function TabsPreviewClient() {
  const variants = Object.keys(SEGMENTED_TABS_VARIANTS) as SegmentedTabsVariant[];
  return (
    <main className="site-container flex flex-col pt-32 pb-24 gap-12">
      {/* ── 10 Custom Toggle Layouts for Bars & Entertainment ── */}
      <section id="custom-toggle-layouts" aria-labelledby="custom-toggle-layouts-heading">
        <header className="flex flex-col gap-2 mb-6">
          <SectionHeader
            id="custom-toggle-layouts-heading"
            as="h1"
            title="10 Layouts for Bars &amp; Entertainment Toggle"
            subtitle="Explore 10 curated layout architectures and badge positioning styles for the 2-choice toggle. Click any option to test its interactive state."
            divider={false}
          />
        </header>
        <ToggleLayoutShowcase />
      </section>

      {/* ── General SegmentedTabs Variants ── */}
      <div className="flex flex-col gap-8 border-t border-white/10 pt-12">
        <header className="flex flex-col gap-2">
          <SectionHeader
            id="tabs-preview-heading"
            as="h2"
            title="General SegmentedTabs Variants"
            subtitle="Click around — every row is the real SegmentedTabs component across all multi-tab use cases."
            divider={false}
          />
        </header>
        {variants.map((variant, i) => (
          <VariantDemo key={variant} variant={variant} index={i} />
        ))}
      </div>
    </main>
  );
}
