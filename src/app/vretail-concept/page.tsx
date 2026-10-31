import type { Metadata } from "next";
import VretailHomeClient from "@/components/vretail/VretailHomeClient";

export const metadata: Metadata = {
  title: "7th Heaven | Vretail Concept Experience",
  description:
    "Chicago's premier rock band with #1 Billboard hits and 30 Songs in 30 Minutes medley, reimagined in the vretail.space aesthetic.",
};

export default function VretailConceptPage() {
  return (
    <main id="vretail-concept-page" className="w-full min-h-screen">
      <VretailHomeClient />
    </main>
  );
}
