"use client";

/** The liquid metal buttons with a live panel for every setting. */

import { useEffect, useState } from "react";
import LiquidMetalButton, { METAL_DEFAULTS, type MetalSettings } from "./LiquidMetalButton";

type NumKey = { [K in keyof MetalSettings]: MetalSettings[K] extends number ? K : never }[keyof MetalSettings];
type ColorKey = { [K in keyof MetalSettings]: MetalSettings[K] extends string ? K : never }[keyof MetalSettings];
type Control =
  | { type: "range"; key: NumKey; label: string; min: number; max: number; step: number }
  | { type: "color"; key: ColorKey; label: string };

const GROUPS: { title: string; controls: Control[] }[] = [
  {
    title: "Border",
    controls: [
      { type: "range", key: "borderWidth", label: "Thickness", min: 0, max: 12, step: 0.25 },
      { type: "range", key: "hoverWidth", label: "Extra on hover", min: 0, max: 12, step: 0.25 },
    ],
  },
  {
    title: "Motion",
    controls: [
      { type: "range", key: "speed", label: "Speed", min: 0, max: 5, step: 0.05 },
      { type: "range", key: "hoverSpeed", label: "Extra speed on hover", min: 0, max: 8, step: 0.05 },
      { type: "range", key: "hoverScale", label: "Hover scale", min: 0.9, max: 1.3, step: 0.01 },
    ],
  },
  {
    title: "Metal",
    controls: [
      { type: "range", key: "bands", label: "Light bands", min: 1, max: 16, step: 1 },
      { type: "range", key: "sharpness", label: "Band sharpness", min: 0.5, max: 16, step: 0.25 },
      { type: "range", key: "shine", label: "Extra shine", min: 0, max: 2, step: 0.01 },
      { type: "range", key: "warp", label: "Liquid warp", min: 0, max: 8, step: 0.05 },
      { type: "range", key: "warpSize", label: "Warp detail", min: 0.1, max: 6, step: 0.05 },
      { type: "range", key: "warpSpeed", label: "Warp speed", min: 0, max: 6, step: 0.05 },
    ],
  },
  {
    title: "Colors",
    controls: [
      { type: "color", key: "brightColor", label: "Highlight" },
      { type: "color", key: "darkColor", label: "Shadow" },
      { type: "color", key: "tintColor", label: "Tint" },
      { type: "range", key: "tintAmount", label: "Tint amount", min: 0, max: 2, step: 0.01 },
    ],
  },
  {
    title: "Glow",
    controls: [
      { type: "range", key: "glow", label: "Resting glow", min: 0, max: 1.5, step: 0.01 },
      { type: "range", key: "hoverGlow", label: "Extra on hover", min: 0, max: 1.5, step: 0.01 },
      { type: "range", key: "glowSpread", label: "Spread", min: 0.5, max: 30, step: 0.25 },
    ],
  },
  {
    title: "Click ripple",
    controls: [
      { type: "range", key: "ripple", label: "Strength", min: 0, max: 1, step: 0.01 },
      { type: "range", key: "rippleSize", label: "Distance", min: 0, max: 44, step: 1 },
    ],
  },
  {
    title: "Button",
    controls: [
      { type: "range", key: "height", label: "Height", min: 32, max: 110, step: 1 },
      { type: "range", key: "sidePadding", label: "Side padding", min: 8, max: 90, step: 1 },
      { type: "range", key: "roundness", label: "Roundness (%)", min: 0, max: 100, step: 1 },
      { type: "color", key: "fillColor", label: "Fill" },
      { type: "color", key: "textColor", label: "Text" },
      { type: "range", key: "fontSize", label: "Text size", min: 10, max: 32, step: 1 },
      { type: "range", key: "fontWeight", label: "Text weight", min: 100, max: 900, step: 100 },
    ],
  },
];

const STORE = "liquid-metal-settings";

export default function LiquidMetalLab() {
  const [settings, setSettings] = useState<MetalSettings>(METAL_DEFAULTS);
  const [copied, setCopied] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) setSettings({ ...METAL_DEFAULTS, ...JSON.parse(raw) });
    } catch {
      // storage unavailable: use the defaults
    }
  }, []);

  const change = (next: Partial<MetalSettings>) => {
    const merged = { ...settings, ...next };
    setSettings(merged);
    try {
      localStorage.setItem(STORE, JSON.stringify(merged));
    } catch {
      // storage unavailable: settings last for this visit
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <div className="itest-row">
        <LiquidMetalButton label="Get Tickets" settings={settings} />
        <LiquidMetalButton label="See Tour Dates" settings={settings} />
        <LiquidMetalButton label="Get Tickets" iconOnly settings={settings} />
      </div>

      <aside className="metal-panel" aria-label="Liquid metal controls" data-lenis-prevent="true">
        <button type="button" className="metal-panel-toggle" aria-expanded={panelOpen} onClick={() => setPanelOpen((o) => !o)}>
          Liquid metal controls <span aria-hidden="true">{panelOpen ? "−" : "+"}</span>
        </button>
        {panelOpen && (
          <div className="metal-panel-body">
            <label className="metal-check">
              <input
                type="checkbox"
                checked={settings.alwaysHover}
                onChange={(e) => change({ alwaysHover: e.target.checked })}
              />
              Preview hover look
            </label>
            {GROUPS.map((group) => (
              <fieldset key={group.title}>
                <legend>{group.title}</legend>
                {group.controls.map((control) =>
                  control.type === "range" ? (
                    <label key={control.key} className="metal-slider">
                      <span>
                        {control.label}
                        <span>{settings[control.key]}</span>
                      </span>
                      <input
                        type="range"
                        min={control.min}
                        max={control.max}
                        step={control.step}
                        value={settings[control.key]}
                        onChange={(e) => change({ [control.key]: Number(e.target.value) })}
                      />
                    </label>
                  ) : (
                    <label key={control.key} className="metal-color">
                      {control.label}
                      <input
                        type="color"
                        value={settings[control.key]}
                        onChange={(e) => change({ [control.key]: e.target.value })}
                      />
                    </label>
                  ),
                )}
              </fieldset>
            ))}
            <div className="metal-actions">
              <button type="button" onClick={() => change({ ...METAL_DEFAULTS })}>
                Reset
              </button>
              <button type="button" onClick={copy}>
                {copied ? "Copied" : "Copy values"}
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
