import type { Metadata } from "next";
import NavLayoutsClient from "./NavLayoutsClient";

export const metadata: Metadata = {
  title: "20 Navigation Layouts | 7th Heaven",
  description: "Interactive gallery and live switcher of 20 navigation bar layouts for 7th Heaven.",
  robots: { index: false, follow: false },
};

export default function NavLayoutsPage() {
  return <NavLayoutsClient />;
}
