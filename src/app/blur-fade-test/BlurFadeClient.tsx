"use client";

import { useState } from "react";
import BlurFadeHeadline from "@/components/BlurFadeHeadline";
import styles from "./BlurFade.module.css";

export default function BlurFadeClient() {
  // Bumping the key remounts the hero, which restarts every CSS animation.
  const [run, setRun] = useState(0);

  return (
    <main className={styles.page}>
      <section key={run} className={styles.hero}>
        <BlurFadeHeadline as="h1" interactive />

        <p className={styles.fadeIn} style={{ animationDelay: "500ms" }}>
          Three #1 Billboard hits. 1,200+ shows. One night you won&apos;t forget.
        </p>

        <div className={`${styles.actions} ${styles.fadeIn}`} style={{ animationDelay: "640ms" }}>
          <a href="/#tour" className={styles.primary}>
            See tour dates
          </a>
          <button type="button" className={styles.secondary} onClick={() => setRun((r) => r + 1)}>
            Replay animation
          </button>
        </div>
      </section>
    </main>
  );
}
