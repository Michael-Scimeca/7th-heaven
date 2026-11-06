import type { Metadata } from "next";
import ScrollRowsClient from "./ScrollRowsClient";

export const metadata: Metadata = {
  title: "Scroll Rows Test — 7th Heaven",
  robots: { index: false, follow: false },
};

export default function ScrollRowsTestPage() {
  return <ScrollRowsClient />;
}
