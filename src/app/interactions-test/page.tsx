import type { Metadata } from "next";
import GooeyWaitlist from "./GooeyWaitlist";
import LiquidMetalLab from "./LiquidMetalLab";
import "./interactions.css";

export const metadata: Metadata = {
  title: "Interactions Test — 7th Heaven",
  robots: { index: false, follow: false },
};

export default function InteractionsTestPage() {
  return (
    <main className="itest" data-no-text-anim>
      <h1>Interactions test</h1>
      <section aria-labelledby="itest-gooey">
        <h2 id="itest-gooey">Gooey waitlist</h2>
        <p>Click it, type an email, then submit. Try a bad address to see the shake. Nothing is saved on this test.</p>
        <GooeyWaitlist />
      </section>
      <section aria-labelledby="itest-metal">
        <h2 id="itest-metal">Liquid metal button</h2>
        <p>Hover and click them, and use the panel on the right to change any part.</p>
        <LiquidMetalLab />
      </section>
    </main>
  );
}
