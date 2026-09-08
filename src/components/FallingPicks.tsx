"use client";
/* oxlint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/click-events-have-key-events */

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

const BASE_W = 60; // original reference size

const DEFAULTS = {
  sizePx: 150,
  gravity: 2.6,
  gravityX: 0,
  spawnMs: 380,
  maxPicks: 45,
  frictionAir: 0.006,
  restitution: 0.35,
  friction: 0.4,
  frictionStatic: 0.5,
  density: 0.001,
  timeScale: 1,
  spin: 0.2,
  dragStiffness: 0.2,
};

// pick color variety — each spawn picks one of these at random (all dark
// purple family, varying hue/depth)
const PALETTES = [
  { main: "#4c1d95", mid: "#6d28d9", light: "#8b5cf6" }, // deep violet
  { main: "#3b0764", mid: "#581c87", light: "#7e22ce" }, // dark plum
  { main: "#312e81", mid: "#4338ca", light: "#6366f1" }, // indigo-purple
  { main: "#5b21b6", mid: "#7c3aed", light: "#a78bfa" }, // violet
  { main: "#701a75", mid: "#a21caf", light: "#c026d3" }, // dark magenta-purple
  { main: "#1e1b4b", mid: "#312e81", light: "#4338ca" }, // very dark indigo
  { main: "#6b21a8", mid: "#9333ea", light: "#c084fc" }, // rich purple
];

// two layered SVGs: the pick shape (colored) + the white wordmark centered on
// top, same composition used for the spinning badge.
function pickHtml(p: { main: string; mid: string; light: string }) {
  return `
<div class="relative h-full w-full">
  <svg viewBox="0 0 429.5 524.5" class="absolute inset-0 h-full w-full">
    <path style="fill:${p.main} !important" stroke="#000000" stroke-width="1" vector-effect="non-scaling-stroke" d="M429.25,127.62v32.75c-.23,8.75-1.34,17.65-3.33,26.71-12.53,57.62-35.58,117.02-65.06,171.63-30.48,56.44-66.66,105.93-111.47,152.1-7.02,7.23-17.41,13.22-27.71,13.44h-12.48c-10.93-.15-21.58-6.85-28.93-14.52-41.8-43.56-75.77-88.89-105.21-141.46-27.72-49.51-51.05-104.64-65.1-159.01C4.93,189.76.89,169.49.25,150.36l.2-13.65c.14-24.3,8.39-48.59,22.37-69.16,15.8-23.25,37.71-38.42,64.15-48.09C121.18,6.95,160.19.47,196.45.72c2.13-.35,4.38-.51,6.74-.46h24.97c2.47.19,4.94.33,7.38.43,34.79-.1,72.54,6.19,105.72,17.89,28.05,9.89,50.74,25.14,67.27,49.87,11.7,17.51,20.03,38.5,20.72,59.17Z" />
    <path style="fill:${p.light} !important" d="M402.55,68.81v.44s-6.5.05-6.5.05c-.5,0-.85-.2-.9-.49h7.4Z" />
    <polygon style="fill:${p.mid} !important" points="370.19 68.81 363.45 69.28 363.26 68.81 370.19 68.81" />
  </svg>
  <svg viewBox="0 0 514.28 93.04" class="absolute left-1/2 top-1/2 h-auto w-[calc(85%-10px)] -translate-x-1/2 -translate-y-[calc(50%+15px)]">
    <g fill="white">
      <path d="M70.08,76.44l6.84,1.82-2.64,11.35-19.89-.44c-2.17-.05-5.75-2.24-6.9-3.82-1.44-1.98-1.8-5.99-1.15-8.82l10.62-46.18-3.66-.85c-.84-.19-.55-2.35-.93-4.62l-28.77,64.28c-7.7.2-14.88.2-23.61-.08L33.4,16.59l-22.88-.4L14.19,0l44.79.42-3.49,16.49c-.26,1.21,4.2,1.39,4.48.32l2.61-10.38,23.51-.04-2.29,11.06,6.1.72-2.64,11.19-6.46.48-10.71,46.19Z" />
      <path d="M211.97,90.15l-23.78.14,13-56.43c.38-1.64-.2-4.2-1.31-4.65-1.27-.51-4.61,1.36-4.97,2.9l-13.64,58.06-23.68-.2L178.25,1.16l23.63-.12-4.16,19.36c6.68-3.78,13.58-5.8,20.82-3.46,6.21,2.01,8.26,7.67,7.08,13.89l-13.66,59.31Z" />
      <path d="M131.49,89.64l-23.87.21,13.23-57.04c.38-1.62-1.18-4.46-2.39-4.24s-3.76,1.83-4.09,3.25l-13.62,57.95-23.62-.31L97.73.69l23.61-.1-4.13,19.27c6.65-3.63,13.65-5.7,20.83-3.37,6.12,1.99,8.22,7.5,7.13,13.66l-13.68,59.49Z" />
      <path d="M483.49,33.37l-13.76,58.42-23.67-.04,16.9-72.83,23.8-.16-.41,4.94c6.51-5.62,15.52-8.52,23.57-3.94,4.22,2.4,5.01,8.27,3.91,13.09l-13.58,59.13-23.76-.2,13.23-57.06c.28-1.21-.39-3.65-1.32-4.01-1.12-.42-4.56,1.21-4.9,2.65Z" />
      <path d="M283.27,63.35c3.42-11.52,21.85-12.25,31.96-18.25,2.95-2.44,5.94-18.25.12-15.34-.86.43-2.55,1.93-2.84,3.07l-3.47,13.57-21.72-.47c2.08-14.12,6.61-23.59,20.83-27.74,7.88-2.3,16.42-2.14,24.09-.08,8.43,2.26,11.6,9.76,9.76,17.92l-12.4,54.93-21.94.15-1.32-4.33c-5.95,5.6-14.36,7.03-22.03,3.47-8.49-3.94-3.54-18.47-1.04-26.89ZM302.95,77.69c.13,1.1,4.08,1.52,4.66.72.46-.63,1.53-2.06,1.71-2.87l4.23-18.27c-7.62,1.53-11.41,13.32-10.6,20.42Z" />
      <path d="M256.25,60.13l22.29-.05c-1.02,5.25-1.92,10.09-3.96,14.74-7.3,16.63-28.04,20.43-42.8,14.79-7.04-2.69-10.87-9.87-9.49-17.5,2.18-12.04,4.89-23.82,8.2-35.6,5.23-18.65,26.55-23.57,42.13-18.49,17.03,5.56,9.95,24.98,7.14,37.49l-30.31.11-4.59,20.52c-.27,1.22,2.34,2.89,3.36,2.58s3.64-1.76,3.96-2.98l4.06-15.62ZM259.05,43.11c.75-3.72,1.71-9.11,2.04-12.06.09-.82-3.04-1.93-3.68-1.43s-2.08,1.76-2.32,2.69l-2.73,10.9c2.35.09,4.47.08,6.69-.1Z" />
      <path d="M424.48,61.18l22.37-.12c-.98,5.17-1.91,10.14-4.01,14.84-8.69,19.48-35.49,20.42-46.75,12.39-4.63-3.3-6.56-9.77-5.46-15.59,2.27-11.93,4.88-23.42,8.11-35,5.33-19.14,27.22-23.89,42.54-18.59,16.52,5.72,9.62,24.61,6.84,37.41l-30.16.04-4.51,18.37c-.31,1.28.49,4.35,1.64,4.62,6.89,1.67,7.37-12.07,9.39-18.38ZM427.43,44.42l2.09-12.19c.13-.78-2.5-2.21-3.23-1.84s-2.53,1.61-2.76,2.51l-2.82,11.06,6.72.46Z" />
      <polygon points="380.45 18.24 401.5 18.44 373.72 91.36 343.04 90.94 348.22 18.07 369.18 18.08 363.95 69.01 380.45 18.24" />
    </g>
  </svg>
</div>`;
}

type PickInstance = {
  body: Matter.Body;
  el: HTMLDivElement;
};

type Config = typeof DEFAULTS;

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="flex flex-col gap-1 text-white/80">
      <span className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-white/50">{format ? format(value) : value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/15 accent-purple-500"
      />
    </label>
  );
}

export default function FallingPicks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<Config>(DEFAULTS);
  const [paused, setPaused] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [clearSignal, setClearSignal] = useState(0);

  const configRef = useRef(config);
  const pausedRef = useRef(paused);
  useEffect(() => {
    configRef.current = config;
  }, [config]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const engineRef = useRef<Matter.Engine | null>(null);
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);
  const picksRef = useRef<PickInstance[]>([]);

  // live-apply gravity (vertical + horizontal wind) to the running engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.gravity.y = config.gravity;
      engineRef.current.gravity.x = config.gravityX;
    }
  }, [config.gravity, config.gravityX]);

  // live-apply time scale (slow-mo / fast-forward the whole simulation)
  useEffect(() => {
    if (engineRef.current) engineRef.current.timing.timeScale = config.timeScale;
  }, [config.timeScale]);

  // live-apply drag stiffness (how "springy" grabbing a pick feels)
  useEffect(() => {
    if (mouseConstraintRef.current) {
      mouseConstraintRef.current.constraint.stiffness = config.dragStiffness;
    }
  }, [config.dragStiffness]);

  // live-apply per-body physics to picks already on screen
  useEffect(() => {
    for (const p of picksRef.current) {
      p.body.frictionAir = config.frictionAir;
      p.body.restitution = config.restitution;
      p.body.friction = config.friction;
      p.body.frictionStatic = config.frictionStatic;
      Matter.Body.setDensity(p.body, config.density);
    }
  }, [
    config.frictionAir,
    config.restitution,
    config.friction,
    config.frictionStatic,
    config.density,
  ]);

  // clear all picks on demand
  useEffect(() => {
    if (clearSignal === 0) return;
    const engine = engineRef.current;
    if (!engine) return;
    for (const p of picksRef.current) {
      Matter.Composite.remove(engine.world, p.body);
      p.el.remove();
    }
    picksRef.current = [];
  }, [clearSignal]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Body } =
      Matter;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const engine = Engine.create();
    engine.gravity.y = configRef.current.gravity;
    engine.gravity.x = configRef.current.gravityX;
    engine.timing.timeScale = configRef.current.timeScale;
    engineRef.current = engine;

    const ground = Bodies.rectangle(width / 2, height + 25, width * 2, 50, {
      isStatic: true,
    });
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height * 2, {
      isStatic: true,
    });
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height * 2, {
      isStatic: true,
    });

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    // let the user grab and toss picks around
    const mouse = Mouse.create(container);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: configRef.current.dragStiffness,
        render: { visible: false },
      },
    });
    Composite.add(engine.world, mouseConstraint);
    mouseConstraintRef.current = mouseConstraint;

    const runner = Runner.create({
      delta: 1000 / 60,
    });
    Runner.run(runner, engine);

    function spawnPick() {
      if (!container || pausedRef.current) return;
      const cfg = configRef.current;
      const pickW = Math.random() < 0.5 ? 120 : 150;
      const pickH = (pickW * 524.5) / 429.5;
      const x = 40 + Math.random() * (Math.max(width - 80, 40));
      const body = Bodies.polygon(x, -60, 6, pickH * 0.46, {
        friction: cfg.friction,
        frictionStatic: cfg.frictionStatic,
        frictionAir: cfg.frictionAir,
        restitution: cfg.restitution,
        density: cfg.density,
        angle: Math.random() * Math.PI * 2,
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * cfg.spin);

      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.left = "0";
      el.style.top = "0";
      el.style.width = `${pickW}px`;
      el.style.height = `${pickH}px`;
      el.style.willChange = "transform";
      const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
      const parsed = new DOMParser().parseFromString(pickHtml(palette), "image/svg+xml");
      if (parsed.documentElement && !parsed.querySelector("parsererror")) {
        el.appendChild(document.adoptNode(parsed.documentElement));
      }
      container.appendChild(el);

      Composite.add(engine.world, body);
      picksRef.current.push({ body, el });

      while (picksRef.current.length > cfg.maxPicks) {
        const old = picksRef.current.shift();
        if (old) {
          Composite.remove(engine.world, old.body);
          old.el.remove();
        }
      }
    }

    let spawnTimer: ReturnType<typeof setTimeout>;
    function scheduleSpawn() {
      spawnTimer = setTimeout(() => {
        spawnPick();
        scheduleSpawn();
      }, configRef.current.spawnMs);
    }
    scheduleSpawn();

    let frameId: number;
    function loop() {
      const pickW = configRef.current.sizePx;
      const pickH = (pickW * 524.5) / 429.5;
      for (const p of picksRef.current) {
        const { x, y } = p.body.position;
        p.el.style.transform = `translate(${x - pickW / 2}px, ${y - pickH / 2
          }px) rotate(${p.body.angle}rad)`;
      }
      frameId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      clearTimeout(spawnTimer);
      cancelAnimationFrame(frameId);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      picksRef.current.forEach((p) => p.el.remove());
      picksRef.current = [];
      engineRef.current = null;
      mouseConstraintRef.current = null;
    };
  }, []);

  const update = (key: keyof Config) => (v: number) =>
    setConfig((c) => ({ ...c, [key]: v }));

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden bg-black"
    >
      <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
        <svg viewBox="0 0 514.28 93.04" className="h-auto w-[400px]">
          <g fill="white">
            <path d="M70.08,76.44l6.84,1.82-2.64,11.35-19.89-.44c-2.17-.05-5.75-2.24-6.9-3.82-1.44-1.98-1.8-5.99-1.15-8.82l10.62-46.18-3.66-.85c-.84-.19-.55-2.35-.93-4.62l-28.77,64.28c-7.7.2-14.88.2-23.61-.08L33.4,16.59l-22.88-.4L14.19,0l44.79.42-3.49,16.49c-.26,1.21,4.2,1.39,4.48.32l2.61-10.38,23.51-.04-2.29,11.06,6.1.72-2.64,11.19-6.46.48-10.71,46.19Z" />
            <path d="M211.97,90.15l-23.78.14,13-56.43c.38-1.64-.2-4.2-1.31-4.65-1.27-.51-4.61,1.36-4.97,2.9l-13.64,58.06-23.68-.2L178.25,1.16l23.63-.12-4.16,19.36c6.68-3.78,13.58-5.8,20.82-3.46,6.21,2.01,8.26,7.67,7.08,13.89l-13.66,59.31Z" />
            <path d="M131.49,89.64l-23.87.21,13.23-57.04c.38-1.62-1.18-4.46-2.39-4.24s-3.76,1.83-4.09,3.25l-13.62,57.95-23.62-.31L97.73.69l23.61-.1-4.13,19.27c6.65-3.63,13.65-5.7,20.83-3.37,6.12,1.99,8.22,7.5,7.13,13.66l-13.68,59.49Z" />
            <path d="M483.49,33.37l-13.76,58.42-23.67-.04,16.9-72.83,23.8-.16-.41,4.94c6.51-5.62,15.52-8.52,23.57-3.94,4.22,2.4,5.01,8.27,3.91,13.09l-13.58,59.13-23.76-.2,13.23-57.06c.28-1.21-.39-3.65-1.32-4.01-1.12-.42-4.56,1.21-4.9,2.65Z" />
            <path d="M283.27,63.35c3.42-11.52,21.85-12.25,31.96-18.25,2.95-2.44,5.94-18.25.12-15.34-.86.43-2.55,1.93-2.84,3.07l-3.47,13.57-21.72-.47c2.08-14.12,6.61-23.59,20.83-27.74,7.88-2.3,16.42-2.14,24.09-.08,8.43,2.26,11.6,9.76,9.76,17.92l-12.4,54.93-21.94.15-1.32-4.33c-5.95,5.6-14.36,7.03-22.03,3.47-8.49-3.94-3.54-18.47-1.04-26.89ZM302.95,77.69c.13,1.1,4.08,1.52,4.66.72.46-.63,1.53-2.06,1.71-2.87l4.23-18.27c-7.62,1.53-11.41,13.32-10.6,20.42Z" />
            <path d="M256.25,60.13l22.29-.05c-1.02,5.25-1.92,10.09-3.96,14.74-7.3,16.63-28.04,20.43-42.8,14.79-7.04-2.69-10.87-9.87-9.49-17.5,2.18-12.04,4.89-23.82,8.2-35.6,5.23-18.65,26.55-23.57,42.13-18.49,17.03,5.56,9.95,24.98,7.14,37.49l-30.31.11-4.59,20.52c-.27,1.22,2.34,2.89,3.36,2.58s3.64-1.76,3.96-2.98l4.06-15.62ZM259.05,43.11c.75-3.72,1.71-9.11,2.04-12.06.09-.82-3.04-1.93-3.68-1.43s-2.08,1.76-2.32,2.69l-2.73,10.9c2.35.09,4.47.08,6.69-.1Z" />
            <path d="M424.48,61.18l22.37-.12c-.98,5.17-1.91,10.14-4.01,14.84-8.69,19.48-35.49,20.42-46.75,12.39-4.63-3.3-6.56-9.77-5.46-15.59,2.27-11.93,4.88-23.42,8.11-35,5.33-19.14,27.22-23.89,42.54-18.59,16.52,5.72,9.62,24.61,6.84,37.41l-30.16.04-4.51,18.37c-.31,1.28.49,4.35,1.64,4.62,6.89,1.67,7.37-12.07,9.39-18.38ZM427.43,44.42l2.09-12.19c.13-.78-2.5-2.21-3.23-1.84s-2.53,1.61-2.76,2.51l-2.82,11.06,6.72.46Z" />
            <polygon points="380.45 18.24 401.5 18.44 373.72 91.36 343.04 90.94 348.22 18.07 369.18 18.08 363.95 69.01 380.45 18.24" />
          </g>
        </svg>
      </div>
      <div className="pointer-events-auto absolute right-4 top-4 z-50 w-64 select-none">
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="mb-2 rounded-lg bg-purple-600/90 px-3 py-1.5 font-semibold text-white shadow-lg backdrop-blur transition hover:bg-purple-500"
        >
          {panelOpen ? "Hide controls" : "Show controls"}
        </button>

        {panelOpen && (
          <div className="flex max-h-[85vh] flex-col gap-3 overflow-y-auto rounded-lg border border-white/10 bg-black/70 p-4 pr-3 backdrop-blur [scrollbar-color:theme(colors.purple.500)_rgba(255,255,255,0.08)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]: rounded-lg [&::-webkit-scrollbar-thumb]:bg-purple-500/80 [&::-webkit-scrollbar-track]: bg-[#00000029]">
            <p className="font-semibold uppercase tracking-wide">
              Spawning
            </p>
            <p className="">
              Size now alternates randomly between 120px and 150px per pick.
            </p>
            <Slider
              label="Spawn rate"
              value={config.spawnMs}
              min={50}
              max={1500}
              step={10}
              onChange={update("spawnMs")}
              format={(v) => `${v}ms`}
            />
            <Slider
              label="Max on screen"
              value={config.maxPicks}
              min={5}
              max={150}
              step={1}
              onChange={update("maxPicks")}
            />
            <Slider
              label="Spin on spawn"
              value={config.spin}
              min={0}
              max={2}
              step={0.05}
              onChange={update("spin")}
              format={(v) => v.toFixed(2)}
            />

            <p className="mt-1 font-semibold uppercase tracking-wide">
              Forces
            </p>
            <Slider
              label="Fall speed (gravity Y)"
              value={config.gravity}
              min={-2}
              max={6}
              step={0.1}
              onChange={update("gravity")}
            />
            <Slider
              label="Wind (gravity X)"
              value={config.gravityX}
              min={-3}
              max={3}
              step={0.1}
              onChange={update("gravityX")}
            />
            <Slider
              label="Time scale"
              value={config.timeScale}
              min={0.1}
              max={2.5}
              step={0.05}
              onChange={update("timeScale")}
              format={(v) => `${v.toFixed(2)}x`}
            />

            <p className="mt-1 font-semibold uppercase tracking-wide">
              Material
            </p>
            <Slider
              label="Air friction (drag)"
              value={config.frictionAir}
              min={0}
              max={0.05}
              step={0.001}
              onChange={update("frictionAir")}
              format={(v) => v.toFixed(3)}
            />
            <Slider
              label="Surface friction"
              value={config.friction}
              min={0}
              max={1}
              step={0.02}
              onChange={update("friction")}
              format={(v) => v.toFixed(2)}
            />
            <Slider
              label="Static friction"
              value={config.frictionStatic}
              min={0}
              max={2}
              step={0.05}
              onChange={update("frictionStatic")}
              format={(v) => v.toFixed(2)}
            />
            <Slider
              label="Bounciness"
              value={config.restitution}
              min={0}
              max={1}
              step={0.05}
              onChange={update("restitution")}
              format={(v) => v.toFixed(2)}
            />
            <Slider
              label="Density (weight)"
              value={config.density}
              min={0.0002}
              max={0.01}
              step={0.0002}
              onChange={update("density")}
              format={(v) => v.toFixed(4)}
            />

            <p className="mt-1 font-semibold uppercase tracking-wide">
              Interaction
            </p>
            <Slider
              label="Drag stiffness"
              value={config.dragStiffness}
              min={0.02}
              max={1}
              step={0.02}
              onChange={update("dragStiffness")}
              format={(v) => v.toFixed(2)}
            />

            <div className="mt-1 flex gap-2">
              <button
                onClick={() => setPaused((p) => !p)}
                className="flex-1 rounded-lg bg-white/10 px-2 py-1.5 font-medium text-white hover:bg-white/20"
              >
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={() => setClearSignal((n) => n + 1)}
                className="flex-1 rounded-lg bg-white/10 px-2 py-1.5 font-medium text-white hover:bg-white/20"
              >
                Clear
              </button>
              <button
                onClick={() => setConfig(DEFAULTS)}
                className="flex-1 rounded-lg bg-white/10 px-2 py-1.5 font-medium text-white hover:bg-white/20"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
