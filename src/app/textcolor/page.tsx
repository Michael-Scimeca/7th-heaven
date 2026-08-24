"use client";

import { useState } from "react";
import { AuroraText } from "@/components/AuroraText/AuroraText";

const PRESETS: { name: string; colors: string[]; speed: number }[] = [
  {
    name: "Ship Beautiful (purple → blue)",
    colors: ["#7C3AED", "#4F46E5", "#2563EB", "#38BDF8"],
    speed: 1,
  },
  {
    name: "MagicUI default",
    colors: ["#FF0080", "#7928CA", "#0070F3", "#38BDF8"],
    speed: 1,
  },
  {
    name: "Sunset",
    colors: ["#F97316", "#EF4444", "#EC4899"],
    speed: 0.8,
  },
  {
    name: "Emerald",
    colors: ["#10B981", "#14B8A6", "#06B6D4"],
    speed: 1.4,
  },
];

export default function TextColorTestPage() {
  const [text, setText] = useState("beautiful");
  const [speed, setSpeed] = useState(1);
  const [colors, setColors] = useState<string[]>(PRESETS[0].colors);

  const updateColor = (index: number, value: string) => {
    setColors((prev) => prev.map((c, i) => (i === index ? value : c)));
  };

  // Extra bottom padding keeps this page's last section clear of the
  // scroll-triggered footer reveal (see Footer.tsx / #footer CSS): the
  // fixed footer starts fading in and becomes clickable once the page's
  // content-area bottom edge nears the viewport bottom. Without this
  // buffer, scrolling the Playground card into view also reveals the
  // footer on top of it, intercepting clicks on the inputs below.
  return (
    <div className="min-h-screen w-full bg-black px-6 pt-16 pb-[65vh] text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-16">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            /textcolor test page
          </p>
          <h1 className="text-2xl font-semibold text-white/80">
            Aurora Text playground
          </h1>
          <p className="max-w-xl text-sm text-white/50">
            Testing MagicUI&apos;s{" "}
            <a
              className="underline decoration-white/30 underline-offset-4 hover:decoration-white/60"
              href="https://magicui.design/docs/components/aurora-text"
              target="_blank"
              rel="noreferrer"
            >
              Aurora Text
            </a>{" "}
            component for a &ldquo;Ship beautiful&rdquo;-style animated
            gradient headline.
          </p>
        </header>

        {/* Hero replica */}
        <section className="flex flex-col items-start gap-4">
          <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Ship <AuroraText colors={PRESETS[0].colors}>beautiful</AuroraText>
          </h2>
          <h2 className="text-2xl font-bold tracking-tight text-white/90 sm:text-3xl">
            Ship <AuroraText colors={PRESETS[0].colors}>beautiful</AuroraText>
          </h2>
        </section>

        {/* Presets */}
        <section className="flex flex-col gap-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/40">
            Presets
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PRESETS.map((preset) => (
              <div
                key={preset.name}
                className="flex flex-col gap-2 rounded-lg border border-white/10 p-6"
              >
                <p className="text-3xl font-extrabold">
                  <AuroraText colors={preset.colors} speed={preset.speed}>
                    {text}
                  </AuroraText>
                </p>
                <p className="text-xs text-white/40">{preset.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Playground */}
        <section className="flex flex-col gap-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/40">
            Playground
          </h3>

          <div className="flex flex-col gap-6 rounded-lg border border-white/10 p-6">
            <p className="text-4xl font-bold sm:text-5xl">
              <AuroraText colors={colors} speed={speed}>
                {text || " "}
              </AuroraText>
            </p>

            <label className="flex flex-col gap-2 text-sm  text-white ">
              Text
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="rounded border border-white/15 bg-[#e1e6ff29]   px-3 py-2 text-white outline-none focus:border-white/40"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm  text-white ">
              Speed ({speed.toFixed(1)}x)
              <input
                type="range"
                min={0.2}
                max={3}
                step={0.1}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
            </label>

            <div className="flex flex-col gap-2 text-sm  text-white ">
              Gradient stops
              <div className="flex flex-wrap gap-3">
                {colors.map((c, i) => (
                  <label key={c} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={c}
                      onChange={(e) => updateColor(i, e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border border-white/15 bg-transparent"
                    />
                    <span className="font-mono text-xs text-white/50">
                      {c}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
