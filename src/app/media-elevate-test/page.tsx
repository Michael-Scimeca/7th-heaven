import type { Metadata } from "next";
import ScrollRowsClient from "../scroll-rows-test/ScrollRowsClient";

export const metadata: Metadata = {
  title: "Media Elevate Test — 7th Heaven",
  robots: { index: false, follow: false },
};

export default function MediaElevateTestPage() {
  return <ScrollRowsClient variant="elevate" />;
}
