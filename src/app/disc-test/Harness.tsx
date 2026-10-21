"use client";

import { useState } from "react";
import DiscTestClient from "./DiscTestClient";
import { ITEMS } from "./data";
import { TRANSITIONS, TRANSITION_NAMES, type TransitionName } from "./transitions";

export default function Harness() {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState<TransitionName>("scatter");

  return (
    <main className="disc-harness mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-24 pt-28 md:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase text-[var(--color-text-muted)]">Test page</p>
        <h1 className="uppercase text-white">CD vault transitions</h1>
        <p className="max-w-[65ch] text-[var(--color-text-secondary)]">
          Pick a style, open the vault, then close it with the Close button, Escape, or by clicking
          any empty space. Each style has its own way in and out.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {TRANSITION_NAMES.map((name) => {
          const t = TRANSITIONS[name];
          const on = pick === name;
          return (
            <li key={name}>
              <button
                onClick={() => setPick(name)}
                className={`flex min-h-[56px] w-full items-center justify-between gap-4 rounded-[var(--radius-box)] border px-4 text-left transition-colors ${
                  on
                    ? "border-[var(--color-action)] bg-[var(--color-action-soft)]"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                }`}
              >
                <span>
                  <span className={`block text-sm uppercase ${on ? "text-white" : "text-[var(--color-text-secondary)]"}`}>
                    {t.label.split(" — ")[0]}
                  </span>
                  <span className="block text-xs text-[var(--color-text-muted)]">
                    {t.label.split(" — ")[1]}
                  </span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-[var(--color-text-muted)]">
                  in {t.inMs}ms · out {t.outMs}ms
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[52px] items-center justify-center gap-2 self-start rounded-full bg-[var(--color-action)] px-7 text-sm font-semibold text-black shadow-[0_0_24px_var(--color-action-ring)] transition-transform duration-150 hover:scale-105 active:scale-95"
      >
        Open the vault
      </button>

      {open && (
        <DiscTestClient items={ITEMS} transition={pick} onClose={() => setOpen(false)} />
      )}

      <style>{`
        body:has(.disc-harness) .preloader-overlay { display: none !important; }
      `}</style>
    </main>
  );
}
