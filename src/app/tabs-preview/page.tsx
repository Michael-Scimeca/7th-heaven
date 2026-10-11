import type { Metadata } from "next";
import TabsPreviewClient from "./TabsPreviewClient";

export const metadata: Metadata = {
  title: "Tab Bar Styles Preview | 7th Heaven",
  description: "Internal preview of SegmentedTabs style variants.",
  robots: { index: false, follow: false },
};

export default function TabsPreviewPage() {
  return <TabsPreviewClient />;
}
