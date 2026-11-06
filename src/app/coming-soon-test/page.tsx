import type { Metadata } from "next";
import ComingSoonClient from "./ComingSoonClient";

export const metadata: Metadata = {
  title: "Coming Soon Test | 7th Heaven",
  description: "Internal test of an animated liquid stopwatch coming-soon page.",
  robots: { index: false, follow: false },
};

export default function ComingSoonTestPage() {
  return <ComingSoonClient />;
}
