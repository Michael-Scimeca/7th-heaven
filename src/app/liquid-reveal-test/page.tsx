import type { Metadata } from "next";
import BandMembersHero from "@/components/BandMembersHero";

export const metadata: Metadata = {
  title: "Band Members Test — 7th Heaven",
  robots: { index: false, follow: false },
};

export default function LiquidRevealTestPage() {
  return <BandMembersHero showControls />;
}
