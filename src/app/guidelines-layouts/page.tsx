import type { Metadata } from "next";
import GuidelinesLayouts from "./GuidelinesLayouts";

export const metadata: Metadata = {
  title: "Guidelines Layout Options | 7th Heaven",
  robots: { index: false, follow: false },
};

export default function GuidelinesLayoutsPage() {
  return <GuidelinesLayouts />;
}
