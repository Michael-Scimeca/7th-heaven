import type { Metadata } from "next";
import TbwaVideoLensClient from "./TbwaVideoLensClient";

export const metadata: Metadata = {
  title: "TBWA\\HAKUHODO Sliced Video Lens Effect | 7th Heaven Lab",
  description:
    "Interactive WebGL Three.js reconstruction of the TBWA\\HAKUHODO sliced video lens effect with chromatic aberration and prism dispersion.",
  robots: { index: false, follow: false },
};

export default function TbwaEffectPage() {
  return <TbwaVideoLensClient />;
}
