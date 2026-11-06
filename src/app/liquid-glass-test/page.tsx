import type { Metadata } from "next";
import LiquidGlassTestClient from "./LiquidGlassTestClient";

export const metadata: Metadata = {
  title: "Liquid Glass Test | 7th Heaven",
  description: "Internal test of the SVG displacement liquid-glass backdrop filter.",
  robots: { index: false, follow: false },
};

export default function LiquidGlassTestPage() {
  return <LiquidGlassTestClient />;
}
