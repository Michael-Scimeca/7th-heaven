/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import LanterneDofHeadline from "@/components/LanterneDofHeadline";
import { PageSection } from "@/components/PageSection";
import { SectionHeader } from "@/components/SectionHeader";
import { Stack } from "@/components/Stack";
import { Toggle } from "@/components/Toggle";

type PresetId = "lanterne-original" | "seventh-history" | "seventh-hero-left";

interface StagePreset {
  readonly id: PresetId;
  readonly label: string;
  readonly subtitle: string;
  readonly line1: string;
  readonly line2: string;
  readonly color: string;
  readonly align: "center" | "left";
  readonly showCardDefault: boolean;
  readonly cardImageSrc: string;
  readonly bokehStrength: number;
  readonly focusWidth: number;
  readonly grainIntensity: number;
  readonly maxTiltYDeg: number;
  readonly maxTiltXDeg: number;
}

const PRESETS: readonly StagePreset[] = [
  {
    id: "lanterne-original",
    label: "01 · Lanterne Original",
    subtitle:
      "Transparent premultiplied-alpha WebGL2 stage with vermilion risograph pigment grain, shallow z = 0 focal plane, and cursor-reactive portrait card shadow.",
    line1: "LANTERNE",
    line2: "ARCHITECTES",
    color: "#E83D18",
    align: "center",
    showCardDefault: true,
    cardImageSrc: "/images/album/colot-in-motion.png",
    bokehStrength: 18,
    focusWidth: 0.07,
    grainIntensity: 0.48,
    maxTiltYDeg: 22,
    maxTiltXDeg: 13,
  },
  {
    id: "seventh-history",
    label: "02 · 7th Heaven Archive",
    subtitle:
      "Transparent centered multi-line band milestone stack with silver-halide grain and shallow bokeh falloff.",
    line1: "SINCE 1985,",
    line2: "MUSIC THAT AWAKENS STORIES",
    color: "#FFFFFF",
    align: "center",
    showCardDefault: true,
    cardImageSrc: "/images/album/luminous.png",
    bokehStrength: 18,
    focusWidth: 0.07,
    grainIntensity: 0.4,
    maxTiltYDeg: 22,
    maxTiltXDeg: 13,
  },
  {
    id: "seventh-hero-left",
    label: "03 · Left Hero Stack",
    subtitle:
      "Left-aligned transparent WebGL2 display typography floating directly over the live page backdrop.",
    line1: "BETTER THIS",
    line2: "WAY",
    color: "#FFFFFF",
    align: "left",
    showCardDefault: false,
    cardImageSrc: "/images/album/colot-in-motion.png",
    bokehStrength: 18,
    focusWidth: 0.07,
    grainIntensity: 0.38,
    maxTiltYDeg: 20,
    maxTiltXDeg: 12,
  },
];

export default function LanternePreviewClient() {
  const initial = PRESETS[0];
  const [presetId, setPresetId] = useState<PresetId>(initial.id);
  const [line1, setLine1] = useState(initial.line1);
  const [line2, setLine2] = useState(initial.line2);
  const [color, setColor] = useState(initial.color);
  const [align, setAlign] = useState<"center" | "left">(initial.align);
  const [bokehStrength, setBokehStrength] = useState(initial.bokehStrength);
  const [focusWidth, setFocusWidth] = useState(initial.focusWidth);
  const [grainIntensity, setGrainIntensity] = useState(initial.grainIntensity);
  const [maxTiltYDeg, setMaxTiltYDeg] = useState(initial.maxTiltYDeg);
  const [maxTiltXDeg, setMaxTiltXDeg] = useState(initial.maxTiltXDeg);
  const [damping, setDamping] = useState(0.08);
  const [showFocalCard, setShowFocalCard] = useState(initial.showCardDefault);
  const [resetOnLeave, setResetOnLeave] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const activePreset =
    PRESETS.find((item) => item.id === presetId) ?? PRESETS[0];

  const applyPreset = (preset: StagePreset) => {
    setPresetId(preset.id);
    setLine1(preset.line1);
    setLine2(preset.line2);
    setColor(preset.color);
    setAlign(preset.align);
    setBokehStrength(preset.bokehStrength);
    setFocusWidth(preset.focusWidth);
    setGrainIntensity(preset.grainIntensity);
    setMaxTiltYDeg(preset.maxTiltYDeg);
    setMaxTiltXDeg(preset.maxTiltXDeg);
    setShowFocalCard(preset.showCardDefault);
  };

  // Authentic Lanterne Architectes cursor-reactive directional card shadow (deltaX / 25, deltaY / 25)
  useEffect(() => {
    if (!showFocalCard) return;

    const handlePointerMove = (e: PointerEvent) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const shadowX = (deltaX / 25).toFixed(2);
      const shadowY = (deltaY / 25).toFixed(2);
      const blurPx = Math.max(
        20,
        (Math.abs(deltaX) + Math.abs(deltaY)) / 12
      ).toFixed(2);

      el.style.setProperty("--lanterne-shadow-x", `${shadowX}px`);
      el.style.setProperty("--lanterne-shadow-y", `${shadowY}px`);
      el.style.setProperty("--lanterne-shadow-blur", `${blurPx}px`);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [showFocalCard]);

  const activeLines = [line1, line2].filter((line) => line.trim().length > 0);

  return (
    <main className="flex flex-col">
      <header className="site-container flex flex-col gap-4 pt-32">
        <h1>Lanterne 3D Depth-of-Field Typography</h1>
        <p className="text-[var(--color-text-secondary)]">
          Move your pointer anywhere across the stage to tilt the 3D display plane. Letters crossing the z = 0 focal
          axis stay razor-sharp while near and far tilted edges dissolve into a 56-tap stochastic Vogel bokeh disc with
          risograph surface pigment grain.
        </p>

        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Typography stage presets"
        >
          {PRESETS.map((preset) => {
            const isSelected = preset.id === presetId;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => applyPreset(preset)}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-ring)] ${
                  isSelected
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/75 hover:bg-white/20 hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </header>

      <PageSection
        id="lanterne-stage"
        size="sm"
        aria-labelledby="lanterne-stage-heading"
      >
        <Stack gap="md">
          <SectionHeader
            id="lanterne-stage-heading"
            title={activePreset.label}
            subtitle={activePreset.subtitle}
            divider={false}
          />

          <div className="relative flex h-[64dvh] min-h-96 w-full items-center justify-center bg-transparent">
            <LanterneDofHeadline
              lines={activeLines.length > 0 ? activeLines : ["LANTERNE"]}
              as="div"
              align={align}
              color={color}
              bokehStrength={bokehStrength}
              focusWidth={focusWidth}
              grainIntensity={grainIntensity}
              maxTiltYDeg={maxTiltYDeg}
              maxTiltXDeg={maxTiltXDeg}
              damping={damping}
              resetOnLeave={resetOnLeave}
              forceMotion
              className="relative z-10 size-full"
            />

            {showFocalCard && (
              <div
                ref={cardRef}
                className="lanterne-reactive-card-shadow pointer-events-none absolute bottom-12 left-1/2 z-20 size-36 -translate-x-1/2 overflow-hidden sm:size-44"
              >
                <img
                  src={activePreset.cardImageSrc}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
            )}
          </div>
        </Stack>
      </PageSection>

      <PageSection
        id="lanterne-controls"
        size="sm"
        aria-labelledby="lanterne-controls-heading"
      >
        <Stack gap="md">
          <SectionHeader
            id="lanterne-controls-heading"
            title="Optics & Shader Parameters"
            subtitle="Tune the WebGL2 3D LookAt rotation, focal plane width, Vogel bokeh radius, and pigment grain in real time."
            divider={false}
          />

          <div className="grid grid-cols-1 gap-6 rounded-[var(--radius-box)] border border-white/10 bg-black/35 p-6 lg:grid-cols-3">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="lanterne-line-1"
                  className="text-sm font-semibold text-white"
                >
                  Headline Line 1
                </label>
                <input
                  id="lanterne-line-1"
                  name="lanterneLine1"
                  type="text"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="rounded-[var(--radius-box)] border border-white/15 bg-white/5 px-4 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-ring)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="lanterne-line-2"
                  className="text-sm font-semibold text-white"
                >
                  Headline Line 2
                </label>
                <input
                  id="lanterne-line-2"
                  name="lanterneLine2"
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="rounded-[var(--radius-box)] border border-white/15 bg-white/5 px-4 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-ring)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="lanterne-color"
                    className="text-sm font-semibold text-white"
                  >
                    Ink Color
                  </label>
                  <input
                    id="lanterne-color"
                    name="lanterneColor"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="size-8 cursor-pointer rounded-md border border-white/20 bg-transparent p-0"
                  />
                </div>

                <div
                  className="flex items-center gap-2"
                  role="group"
                  aria-label="Text alignment"
                >
                  {(["center", "left"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={align === mode}
                      onClick={() => setAlign(mode)}
                      className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold uppercase transition-colors ${
                        align === mode
                          ? "bg-white text-black"
                          : "bg-white/10 text-white/75 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <label
                    htmlFor="lanterne-bokeh"
                    className="font-semibold text-white"
                  >
                    Bokeh Blur Radius
                  </label>
                  <span className="tabular-nums text-[var(--color-text-secondary)]">
                    {bokehStrength}px
                  </span>
                </div>
                <input
                  id="lanterne-bokeh"
                  name="lanterneBokeh"
                  type="range"
                  min={0}
                  max={44}
                  step={1}
                  value={bokehStrength}
                  onChange={(e) => setBokehStrength(Number(e.target.value))}
                  className="w-full cursor-pointer accent-purple-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <label
                    htmlFor="lanterne-grain"
                    className="font-semibold text-white"
                  >
                    Risograph & Bokeh Grain
                  </label>
                  <span className="tabular-nums text-[var(--color-text-secondary)]">
                    {Math.round(grainIntensity * 100)}%
                  </span>
                </div>
                <input
                  id="lanterne-grain"
                  name="lanterneGrain"
                  type="range"
                  min={0}
                  max={0.85}
                  step={0.02}
                  value={grainIntensity}
                  onChange={(e) => setGrainIntensity(Number(e.target.value))}
                  className="w-full cursor-pointer accent-purple-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <label
                    htmlFor="lanterne-focus"
                    className="font-semibold text-white"
                  >
                    Sharp Focal Band (z = 0)
                  </label>
                  <span className="tabular-nums text-[var(--color-text-secondary)]">
                    {focusWidth.toFixed(2)}
                  </span>
                </div>
                <input
                  id="lanterne-focus"
                  name="lanterneFocus"
                  type="range"
                  min={0}
                  max={0.28}
                  step={0.01}
                  value={focusWidth}
                  onChange={(e) => setFocusWidth(Number(e.target.value))}
                  className="w-full cursor-pointer accent-purple-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <label
                    htmlFor="lanterne-yaw"
                    className="font-semibold text-white"
                  >
                    3D Horizontal Yaw
                  </label>
                  <span className="tabular-nums text-[var(--color-text-secondary)]">
                    {maxTiltYDeg}°
                  </span>
                </div>
                <input
                  id="lanterne-yaw"
                  name="lanterneYaw"
                  type="range"
                  min={0}
                  max={48}
                  step={1}
                  value={maxTiltYDeg}
                  onChange={(e) => setMaxTiltYDeg(Number(e.target.value))}
                  className="w-full cursor-pointer accent-purple-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <label
                    htmlFor="lanterne-pitch"
                    className="font-semibold text-white"
                  >
                    3D Vertical Pitch
                  </label>
                  <span className="tabular-nums text-[var(--color-text-secondary)]">
                    {maxTiltXDeg}°
                  </span>
                </div>
                <input
                  id="lanterne-pitch"
                  name="lanternePitch"
                  type="range"
                  min={0}
                  max={32}
                  step={1}
                  value={maxTiltXDeg}
                  onChange={(e) => setMaxTiltXDeg(Number(e.target.value))}
                  className="w-full cursor-pointer accent-purple-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <label
                    htmlFor="lanterne-damping"
                    className="font-semibold text-white"
                  >
                    Spring Inertia Damping
                  </label>
                  <span className="tabular-nums text-[var(--color-text-secondary)]">
                    {damping.toFixed(2)}
                  </span>
                </div>
                <input
                  id="lanterne-damping"
                  name="lanterneDamping"
                  type="range"
                  min={0.02}
                  max={0.25}
                  step={0.01}
                  value={damping}
                  onChange={(e) => setDamping(Number(e.target.value))}
                  className="w-full cursor-pointer accent-purple-500"
                />
              </div>

              <div className="flex flex-col gap-4">
                <Toggle
                  size="sm"
                  checked={showFocalCard}
                  onChange={setShowFocalCard}
                  label="Show center focal card with reactive shadow"
                />
                <Toggle
                  size="sm"
                  checked={resetOnLeave}
                  onChange={setResetOnLeave}
                  label="Reset 3D tilt when pointer leaves window"
                />
              </div>
            </div>
          </div>
        </Stack>
      </PageSection>
    </main>
  );
}
