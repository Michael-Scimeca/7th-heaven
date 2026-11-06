import type { Metadata } from "next";
import TimelineClient from "./TimelineClient";

export const metadata: Metadata = {
  title: "Timeline Test | 7th Heaven",
  description: "Internal test of a scroll-scrubbed vertical timeline based on heynesh.com.",
  robots: { index: false, follow: false },
};

export default function TimelineTestPage() {
  return <TimelineClient />;
}
