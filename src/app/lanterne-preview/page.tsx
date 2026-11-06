import type { Metadata } from "next";
import LanternePreviewClient from "./LanternePreviewClient";

export const metadata: Metadata = {
  title: "Lanterne 3D Depth-of-Field Typography Preview | 7th Heaven",
  description:
    "Interactive WebGL2 3D cursor-tracking display typography with shallow depth-of-field Vogel bokeh and risograph pigment grain.",
  robots: { index: false, follow: false },
};

export default function LanternePreviewPage() {
  return <LanternePreviewClient />;
}

