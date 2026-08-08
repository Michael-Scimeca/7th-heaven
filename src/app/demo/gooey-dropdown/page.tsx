"use client";

import Link from "next/link";
import GooeyDropdown from "@/components/GooeyDropdown";
import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";

export default function GooeyDropdownDemoPage() {
  return (
    <div className="min-h-screen text-white relative font-sans pt-24 pb-20">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-white/10 mb-16">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#9333ea]/20 border border-[#9333ea]/40 text-[#c084fc] inline-block mb-2">
              gooey dropdown
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tight">
              Gooey Dropdown
            </h1>
            <p className="text-white/50 text-sm max-w-xl mt-2">
              A React/Next.js recreation of the{" "}
              <a
                href="https://framer.university/resources/gooey-dropdown-in-framer"
                target="_blank"
                rel="noreferrer"
                className="text-[#c084fc] underline"
              >
                Framer University gooey dropdown
              </a>
              . An SVG blur + contrast filter (the classic &quot;goo&quot;
              trick) sits behind the label, so the pill visually melts into
              the menu panel as it opens instead of snapping to size.
            </p>
          </div>
          <Link
            href="/style-guide#chat"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap"
          >
            ← Style Guide
          </Link>
        </div>

        {/* Exact-match recreation of goo-drop.learnframer.site */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black uppercase italic">Exact Reference Match</h2>
          <a
            href="https://goo-drop.learnframer.site/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#c084fc] underline"
          >
            goo-drop.learnframer.site ↗
          </a>
        </div>
        <p className="text-white/50 text-sm max-w-2xl mb-6">
          Pixel-measured against the live reference: 52px circular trigger,
          306×290px panel, #1a1a1a background, Inter type scale, identical SVG
          goo filter constants (blur stdDeviation 8, matrix 19/-8), and the
          same avatar gradients.
        </p>
        <div className="flex items-start justify-center mb-20 bg-white border border-white/10 rounded-3xl p-10 min-h-[220px]">
          <GooeyMessagesDropdown />
        </div>

        {/* Live examples */}
        <h2 className="text-2xl font-black uppercase italic mb-6">
          Adapted variants (for site navigation)
        </h2>
        <div className="flex flex-wrap items-start gap-10 mb-20 bg-[#0b0b14] border border-white/10 rounded-3xl p-10 min-h-[260px]">
          <GooeyDropdown
            label="Menu"
            items={[
              { label: "Shows", href: "/shows" },
              { label: "Merch", href: "/merch" },
              { label: "Contact", href: "/contact" },
            ]}
          />

          <GooeyDropdown
            label="Account"
            accentColor="#ffffff"
            textColor="#000000"
            items={[
              { label: "Profile", onClick: () => console.log("Profile") },
              { label: "Settings", onClick: () => console.log("Settings") },
              { label: "Notifications", onClick: () => console.log("Notifications") },
              { label: "Sign out", onClick: () => console.log("Sign out") },
            ]}
          />

          <GooeyDropdown
            label="More"
            accentColor="#22c55e"
            items={[
              { label: "Tour Dates", href: "/shows" },
              { label: "Live Rooms", href: "/live" },
            ]}
          />
        </div>

        {/* How to use */}
        <div className="bg-[#0b0b14] border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-black uppercase italic mb-4">
            How to use it anywhere else
          </h3>
          <pre className="text-white/70 text-xs font-mono bg-black/60 p-4 border border-white/10 rounded-lg overflow-x-auto">
            {`import GooeyDropdown from "@/components/GooeyDropdown";

<GooeyDropdown
  label="Menu"
  accentColor="#9333ea"
  textColor="#ffffff"
  items={[
    { label: "Shows", href: "/shows" },
    { label: "Merch", href: "/merch" },
    { label: "Contact", onClick: () => console.log("clicked") },
  ]}
/>`}
          </pre>
          <p className="text-xs text-white/50 mt-4">
            No extra dependencies — the morph is a self-contained SVG{" "}
            <code className="text-white/70">&lt;filter&gt;</code> (
            <code className="text-white/70">feGaussianBlur</code> +{" "}
            <code className="text-white/70">feColorMatrix</code>) applied only
            to the colored shape layer, plus CSS transitions on width/height.
            The label and menu text sit in a separate, unfiltered layer so
            they stay crisp. Tune the goo intensity by adjusting{" "}
            <code className="text-white/70">stdDeviation</code> and the last
            two values of the color matrix inside{" "}
            <code className="text-white/70">GooeyDropdown.tsx</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
