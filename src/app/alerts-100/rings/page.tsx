import type { Metadata } from "next";
import RingsClient from "./RingsClient";

export const metadata: Metadata = {
  title: "Travel Radius — 20 Ring Pickers | 7th Heaven",
  robots: { index: false, follow: false },
};

export default function RingsPage() {
  return <RingsClient />;
}
