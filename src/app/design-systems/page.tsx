import type { Metadata } from "next";
import DesignSystemsLabClient from "./DesignSystemsLabClient";

export const metadata: Metadata = {
  title: "Design Systems Comparison Lab | 7th Heaven",
  description:
    "Explore, compare, and test 3 distinct design systems tailored for 7th Heaven: Violet Nocturne, Obsidian Laser, and Heritage Vinyl & Brass.",
};

export default function DesignSystemsPage() {
  return <DesignSystemsLabClient />;
}
