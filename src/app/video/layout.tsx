import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Gallery — 7th Heaven",
  description: "Watch 7th Heaven music videos, live concert footage, behind-the-scenes clips, and exclusive backstage content from 40 years of rocking.",
  openGraph: {
    title: "Video Gallery — 7th Heaven",
    description: "Watch 7th Heaven music videos, live concert footage, and behind-the-scenes content.",
    type: "website",
    url: "https://7thheavenband.com/video",
  },
};

export default function VideoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
