"use client";

import React, { useState, useCallback, useSyncExternalStore } from "react";
import { Copy, Check, RotateCcw, Sliders, X, Eye, EyeOff } from "lucide-react";
import {
  type ShadowConfig,
  DEFAULT_SHADOW_CONFIG,
} from "./discScene";

const STORAGE_KEY = "disc_shadow_config_v2";

const emptySubscribe = () => () => {};

export interface DiscShadowTunerProps {
  config: ShadowConfig;
  onChange: (cfg: ShadowConfig) => void;
  onReset: () => void;
}

interface Preset {
  label: string;
  config: Partial<ShadowConfig>;
}

const PRESETS: Preset[] = [
  {
    label: "Default",
    config: {
      offsetX: 0.08,
      offsetY: -0.20,
      offsetZ: -0.18,
      scale: 1.15,
      opacity: 0.50,
      softness: 1.0,
      rotationZ: 0,
      visible: true,
    },
  },
  {
    label: "Floor Drop",
    config: {
      offsetX: 0.18,
      offsetY: -0.65,
      offsetZ: -0.40,
      scale: 1.75,
      opacity: 0.98,
      softness: 1.3,
      rotationZ: 0,
      visible: true,
    },
  },
  {
    label: "Tight Back",
    config: {
      offsetX: 0.05,
      offsetY: -0.15,
      offsetZ: -0.12,
      scale: 1.15,
      opacity: 0.85,
      softness: 0.6,
      rotationZ: 0,
      visible: true,
    },
  },
  {
    label: "Soft Ambient",
    config: {
      offsetX: 0.0,
      offsetY: -0.45,
      offsetZ: -0.35,
      scale: 2.2,
      opacity: 0.60,
      softness: 2.0,
      rotationZ: 0,
      visible: true,
    },
  },
];

export default function DiscShadowTuner({
  config,
  onChange,
  onReset,
}: DiscShadowTunerProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = React.useRef(false);
  const dragStartRef = React.useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  // Load or calculate initial position (top-right by default to avoid overlapping other panels)
  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem("disc_shadow_tuner_pos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          setPos(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    const defaultX = Math.max(20, window.innerWidth - 350);
    setPos({ x: defaultX, y: 84 });
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, input, label, a")) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: pos?.x ?? 20,
      posY: pos?.y ?? 84,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    const nextX = Math.max(10, Math.min(window.innerWidth - 80, dragStartRef.current.posX + dx));
    const nextY = Math.max(10, Math.min(window.innerHeight - 60, dragStartRef.current.posY + dy));
    const nextPos = { x: nextX, y: nextY };
    setPos(nextPos);
    try {
      window.localStorage.setItem("disc_shadow_tuner_pos", JSON.stringify(nextPos));
    } catch {}
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const update = useCallback(
    <K extends keyof ShadowConfig>(key: K, value: ShadowConfig[K]) => {
      const next = { ...config, [key]: value };
      onChange(next);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore quota error
        }
      }
    },
    [config, onChange],
  );

  const applyPreset = useCallback(
    (preset: Preset) => {
      const next = { ...config, ...preset.config };
      onChange(next);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
      }
    },
    [config, onChange],
  );

  const copyConfig = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }, [config]);

  if (!isClient || !pos) return null;

  return (
    <aside
      aria-label="3D Disc Shadow Tuner"
      style={
        {
          "--tuner-x": `${pos.x}px`,
          "--tuner-y": `${pos.y}px`,
        } as React.CSSProperties
      }
      className="fixed left-[var(--tuner-x)] top-[var(--tuner-y)] z-[2147483015] pointer-events-auto select-none"
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-purple-500/40 bg-black/70 px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-[transform,background-color,border-color] duration-150 hover:scale-105 hover:border-purple-400 hover:bg-black/90 active:scale-95 cursor-pointer"
          title="Open Shadow Tuner"
        >
          <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          <Sliders className="h-3.5 w-3.5 text-purple-300" aria-hidden="true" />
          <span>Shadow Tuner</span>
          <span className="rounded bg-white/10 px-1 py-0.2 text-[10px] text-white/70">
            {config.visible ? `${Math.round(config.opacity * 100)}%` : "Off"}
          </span>
        </button>
      ) : (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex w-[320px] flex-col gap-3 rounded-2xl border border-purple-500/40 bg-black/90 p-4 text-xs text-white shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
        >
          {/* Header (Drag Handle) */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-purple-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-200">
                3D Shadow Tuner
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onReset}
                title="Reset to defaults"
                className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-white/60 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded text-white/60 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                title="Minimize Tuner"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Visibility & Presets */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/70">Enable Shadow</span>
              <button
                onClick={() => update("visible", !config.visible)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                  config.visible
                    ? "bg-purple-600/40 text-purple-200 border border-purple-500/50"
                    : "bg-white/5 text-white/40 border border-white/10"
                }`}
              >
                {config.visible ? (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" />
                    <span>Hidden</span>
                  </>
                )}
              </button>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-1 pt-1">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="rounded border border-white/10 bg-white/5 px-1.5 py-1 text-[10px] font-medium text-white/80 transition-colors hover:bg-white/15 hover:text-white cursor-pointer text-center truncate"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-2.5 border-t border-white/10 pt-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {/* Offset X */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <label htmlFor="shadow-offset-x" className="text-white/70">Offset X</label>
                <span className="font-mono text-purple-300">{config.offsetX.toFixed(2)}</span>
              </div>
              <input
                id="shadow-offset-x"
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={config.offsetX}
                onChange={(e) => update("offsetX", parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-purple-400"
              />
            </div>

            {/* Offset Y */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <label htmlFor="shadow-offset-y" className="text-white/70">Offset Y (Height)</label>
                <span className="font-mono text-purple-300">{config.offsetY.toFixed(2)}</span>
              </div>
              <input
                id="shadow-offset-y"
                type="range"
                min="-1.5"
                max="0.8"
                step="0.01"
                value={config.offsetY}
                onChange={(e) => update("offsetY", parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-purple-400"
              />
            </div>

            {/* Offset Z */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <label htmlFor="shadow-offset-z" className="text-white/70">Depth Z</label>
                <span className="font-mono text-purple-300">{config.offsetZ.toFixed(2)}</span>
              </div>
              <input
                id="shadow-offset-z"
                type="range"
                min="-1.2"
                max="0"
                step="0.01"
                value={config.offsetZ}
                onChange={(e) => update("offsetZ", parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-purple-400"
              />
            </div>

            {/* Scale */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <label htmlFor="shadow-scale" className="text-white/70">Scale / Spread</label>
                <span className="font-mono text-purple-300">{config.scale.toFixed(2)}x</span>
              </div>
              <input
                id="shadow-scale"
                type="range"
                min="0.5"
                max="3"
                step="0.02"
                value={config.scale}
                onChange={(e) => update("scale", parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-purple-400"
              />
            </div>

            {/* Opacity */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <label htmlFor="shadow-opacity" className="text-white/70">Opacity</label>
                <span className="font-mono text-purple-300">
                  {Math.round(config.opacity * 100)}%
                </span>
              </div>
              <input
                id="shadow-opacity"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.opacity}
                onChange={(e) => update("opacity", parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-purple-400"
              />
            </div>

            {/* Softness / Blur */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <label htmlFor="shadow-softness" className="text-white/70">Softness / Blur</label>
                <span className="font-mono text-purple-300">{config.softness.toFixed(2)}x</span>
              </div>
              <input
                id="shadow-softness"
                type="range"
                min="0.2"
                max="2.5"
                step="0.05"
                value={config.softness}
                onChange={(e) => update("softness", parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-purple-400"
              />
            </div>

            {/* Rotation Z */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <label htmlFor="shadow-rotation-z" className="text-white/70">Angle / Tilt</label>
                <span className="font-mono text-purple-300">{config.rotationZ}°</span>
              </div>
              <input
                id="shadow-rotation-z"
                type="range"
                min="-45"
                max="45"
                step="1"
                value={config.rotationZ}
                onChange={(e) => update("rotationZ", parseInt(e.target.value, 10))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-purple-400"
              />
            </div>
          </div>

          {/* Footer Copy */}
          <div className="border-t border-white/10 pt-2 flex items-center justify-between">
            <button
              onClick={copyConfig}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 py-1.5 font-medium text-purple-200 transition-colors hover:bg-purple-900/50 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied JSON!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
