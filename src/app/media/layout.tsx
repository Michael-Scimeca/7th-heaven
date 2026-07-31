import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Gallery — 7th Heaven",
  description: "Watch 7th Heaven music videos, live concert footage, behind-the-scenes clips, and exclusive backstage content from 40 years of rocking.",
  openGraph: {
    title: "Media Gallery — 7th Heaven",
    description: "Watch 7th Heaven music videos, live concert footage, and behind-the-scenes content.",
    type: "website",
    url: "https://7thheavenband.com/media",
  },
};

export default function MediaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
