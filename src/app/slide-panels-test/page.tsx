import type { Metadata } from "next";
import SlidePanels, { type SlidePanel } from "@/components/SlidePanels";

export const metadata: Metadata = {
  title: "Slide Panels Test | 7th Heaven",
  description: "Internal test of the tilted slide-in scrolling panels.",
  robots: { index: false, follow: false },
};

// Placeholder copy for testing the effect.
const panels: SlidePanel[] = [
  {
    eyebrow: "Playing",
    title: "Live shows",
    tags: ["Tour dates", "Tickets", "Venues"],
    copy: "See where the band is playing next and grab tickets before they go.",
    cta: "See tour dates",
    href: "/#tour",
    bg: "#fffbb5",
    fg: "#1a0a2e",
  },
  {
    eyebrow: "Sailing",
    title: "The cruise",
    tags: ["Cabins", "Itinerary", "Pricing"],
    copy: "Take the party out on the water. Check cabins, the itinerary and pricing.",
    cta: "Explore the cruise",
    href: "/cruise",
    bg: "#f5b942",
    fg: "#1a0a2e",
  },
  {
    eyebrow: "Teaching",
    title: "Rock 'n' Roll Kids",
    tags: ["Projects", "Community"],
    copy: "See how the band helps the next generation of musicians find their sound.",
    cta: "Meet the kids",
    href: "/rock-and-roll-kids",
    bg: "#1a0a2e",
    fg: "#ffffff",
  },
  {
    eyebrow: "Booking",
    title: "Book the band",
    tags: ["Festivals", "Private events"],
    copy: "Bringing live music to your stage? Tell us about your event.",
    cta: "Book us",
    href: "/book",
    bg: "#6d28d9",
    fg: "#ffffff",
  },
];

export default function SlidePanelsTestPage() {
  return (
    <main>
      <div className="flex min-h-screen items-center justify-center px-4">
        <h1 className="text-center text-white">Scroll down</h1>
      </div>
      <SlidePanels panels={panels} />
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <h2 className="text-center text-white">End of test</h2>
      </div>
    </main>
  );
}
