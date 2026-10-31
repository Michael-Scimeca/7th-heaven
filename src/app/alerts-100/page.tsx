import type { Metadata } from "next";
import Alerts100Client from "./Alerts100Client";

export const metadata: Metadata = {
  title: "Show Alerts — 100 Layouts | 7th Heaven",
  robots: { index: false, follow: false },
};

export default function Alerts100Page() {
  return <Alerts100Client />;
}
