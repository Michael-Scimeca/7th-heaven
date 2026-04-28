import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Stream Hub — 7th Heaven",
  description: "Watch 7th Heaven crew members broadcast live from backstage, rehearsals, and shows. Real-time video feeds powered by LiveKit.",
  openGraph: {
    title: "Live Stream Hub — 7th Heaven",
    description: "Watch live backstage broadcasts from 7th Heaven crew members.",
    type: "website",
    url: "https://7thheavenband.com/live",
  },
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
