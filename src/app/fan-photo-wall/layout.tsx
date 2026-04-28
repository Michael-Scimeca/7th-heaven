import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fan Photo Wall — 7th Heaven",
  description: "Browse fan-submitted photos from 7th Heaven concerts, meet-and-greets, and live events. Share your own concert moments!",
  openGraph: {
    title: "Fan Photo Wall — 7th Heaven",
    description: "Fan-submitted photos from 7th Heaven live shows and events.",
    type: "website",
    url: "https://7thheavenband.com/fan-photo-wall",
  },
};

export default function FanPhotoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
