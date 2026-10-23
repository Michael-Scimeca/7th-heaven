import type { Metadata } from "next";
import BlurFadeClient from "./BlurFadeClient";

export const metadata: Metadata = {
  title: "Blur Fade Hero Test | 7th Heaven",
  description: "Internal test of a staggered blur fade-in hero with cycling inline images.",
  robots: { index: false, follow: false },
};

export default function BlurFadeTestPage() {
  return <BlurFadeClient />;
}
