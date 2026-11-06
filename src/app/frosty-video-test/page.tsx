import type { Metadata } from "next";
import FrostyVideoClient from "./FrostyVideoClient";

export const metadata: Metadata = {
  title: "Frosty Video Test | 7th Heaven",
  description: "Internal test of a frosted, grainy blurred video background.",
  robots: { index: false, follow: false },
};

export default function FrostyVideoTestPage() {
  return <FrostyVideoClient />;
}
