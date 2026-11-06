import type { Metadata } from "next";
import HamburgerMorphTestClient from "./HamburgerMorphTestClient";

export const metadata: Metadata = {
  title: "Hamburger Morph Test | 7th Heaven",
  description: "Internal test of the hamburger → chevron → X menu toggle.",
  robots: { index: false, follow: false },
};

export default function HamburgerMorphTestPage() {
  return <HamburgerMorphTestClient />;
}
