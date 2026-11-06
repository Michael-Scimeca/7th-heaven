import type { Metadata } from "next";
import { Button } from "@/components/Button";
import BeamButton from "@/components/ui/BeamButton";

export const metadata: Metadata = {
  title: "Button Test | 7th Heaven",
  description: "Internal test of the animated border beam button.",
  robots: { index: false, follow: false },
};

export default function ButtonTestPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 px-4 py-32">
      <h1 className="text-center text-white">Beam button</h1>

      <div className="flex flex-wrap items-center justify-center gap-6">
        <BeamButton size="sm">Test knowledge</BeamButton>
        <BeamButton size="md">See tour dates</BeamButton>
        <BeamButton size="lg" href="/#tour">
          Get tickets
        </BeamButton>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6">
        <Button variant="primary">Current primary</Button>
        <Button variant="secondary">Current secondary</Button>
      </div>
    </main>
  );
}
