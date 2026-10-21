import type { Metadata } from "next";
import Harness from "./Harness";

export const metadata: Metadata = {
  title: "Disc Library Test | 7th Heaven",
  robots: { index: false, follow: false },
};

export default function DiscTestPage() {
  return <Harness />;
}
