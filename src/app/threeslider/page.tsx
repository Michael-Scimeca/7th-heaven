import type { Metadata } from "next";
import ThreeSlider, { type ThreeSliderItem } from "@/components/ThreeSlider";

export const metadata: Metadata = {
  title: "Three Slider",
  robots: { index: false, follow: false },
};

const ITEMS: ThreeSliderItem[] = [
  {
    image: "/images/hero/band-performance.webp",
    category: "Live",
    title: "On Stage",
    description: "Two-plus hours of rock hits, played loud and live every night of the tour.",
    href: "/shows",
  },
  {
    image: "/images/album/luminous.png",
    category: "Album",
    title: "Luminous",
    description: "Original music from the band, streaming now.",
    href: "/media",
  },
  {
    image: "/images/cruise/at-sea.png",
    category: "The Cruise",
    title: "At Sea",
    description: "Days on deck and nights in the theater with the band on board.",
    href: "/cruise",
  },
  {
    image: "/images/members/desktop-richy.webp",
    category: "Members",
    title: "Richy",
    description: "Meet the players behind the show.",
  },
  {
    image: "/images/album/colot-in-motion.png",
    category: "Album",
    title: "Color in Motion",
    description: "Original music from the band, streaming now.",
    href: "/media",
  },
  {
    image: "/images/cruise/cococay-beach-party.png",
    category: "The Cruise",
    title: "CocoCay",
    description: "A private-island beach party stop on the cruise itinerary.",
    href: "/cruise",
  },
  {
    image: "/images/members/desktop-nick.webp",
    category: "Members",
    title: "Nick",
    description: "Meet the players behind the show.",
  },
  {
    image: "/images/tour/fan-concert-photo.jpg",
    category: "Fans",
    title: "Front Row",
    description: "Photos shared by fans from shows across the country.",
    href: "/fans",
  },
  {
    image: "/images/album/be-here.png",
    category: "Album",
    title: "Be Here",
    description: "Original music from the band, streaming now.",
    href: "/media",
  },
  {
    image: "/images/members/desktop-tony.webp",
    category: "Members",
    title: "Tony",
    description: "Meet the players behind the show.",
  },
];

export default function ThreeSliderPage() {
  return <ThreeSlider items={ITEMS} />;
}
