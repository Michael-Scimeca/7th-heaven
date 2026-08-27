"use client";

import React, { useEffect, useRef } from "react";

export interface NeatButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  colors?: Array<{ color: string; enabled: boolean }>;
  speed?: number;
  hoverSpeed?: number;
  horizontalPressure?: number;
  verticalPressure?: number;
  waveFrequencyX?: number;
  waveFrequencyY?: number;
  waveAmplitude?: number;
  colorBrightness?: number;
  colorSaturation?: number;
  wireframe?: boolean;
  colorBlending?: number;
  borderRadius?: string | number;
}

const DEFAULT_COLORS = [
  { color: "#6917BF", enabled: true },
  { color: "#8c0eaf", enabled: true },
  { color: "#6F008E", enabled: true },
  { color: "#230434", enabled: true },
  { color: "#7616B7", enabled: true },
  { color: "#480505", enabled: true },
];

export function NeatButton({
  children = "ENTER THE EXPERIENCE",
  colors = DEFAULT_COLORS,
  speed = 10,
  hoverSpeed = 12,
  horizontalPressure = 5,
  verticalPressure = 4,
  waveFrequencyX = 2,
  waveFrequencyY = 3,
  waveAmplitude = 12,
  colorBrightness = 1.1,
  colorSaturation = 5,
  wireframe = false,
  colorBlending = 10,
  borderRadius = "8px",
  style,
  className = "",
  onPointerEnter,
  onPointerLeave,
  ...props
}: NeatButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!canvasRef.current) return;
      try {
        const { NeatGradient } = await import("@firecms/neat");
        if (cancelled || !canvasRef.current) return;

        gradientRef.current = new NeatGradient({
          ref: canvasRef.current,
          colors,
          speed,
          horizontalPressure,
          verticalPressure,
          waveFrequencyX,
          waveFrequencyY,
          waveAmplitude,
          colorBrightness,
          colorSaturation,
          wireframe,
          colorBlending,
        });
      } catch (err) {
        console.error("Failed to initialize NeatGradient:", err);
      }
    })();

    return () => {
      cancelled = true;
      if (gradientRef.current) {
        gradientRef.current.destroy?.();
        gradientRef.current = null;
      }
    };
  }, [
    colors,
    speed,
    horizontalPressure,
    verticalPressure,
    waveFrequencyX,
    waveFrequencyY,
    waveAmplitude,
    colorBrightness,
    colorSaturation,
    wireframe,
    colorBlending,
  ]);

  const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (gradientRef.current) {
      gradientRef.current.speed = hoverSpeed;
    }
    onPointerEnter?.(e);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (gradientRef.current) {
      gradientRef.current.speed = speed;
    }
    onPointerLeave?.(e);
  };

  const computedRadius = typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;

  return (
    <button
      type="button"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{ borderRadius: computedRadius, ...style }}
      className={`group relative isolation-isolate inline-flex w-fit items-center justify-center border-none overflow-hidden cursor-pointer bg-[#0d0a12] px-6 py-4 text-center transition-[transform,box-shadow] duration-300 shadow-2xl active:scale-[0.98] ${className}`}
      {...props}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />
      <span className="relative z-10 text-base font-bold tracking-wider text-white/85 group-hover:text-white group-hover:drop-shadow-[0_0_16px_rgba(255,255,255,1)] group-hover:scale-105 transition-[color,filter,transform] duration-300">
        {children}
      </span>
    </button>
  );
}

export default NeatButton;
