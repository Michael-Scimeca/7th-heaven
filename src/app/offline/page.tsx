"use client";

import React from "react";
import { WifiOff, RefreshCw, Music } from "lucide-react";
import { PageSection } from "@/components/PageSection";
import { SectionHeader } from "@/components/SectionHeader";
import SeventhButton from "@/components/SeventhButton";

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center">
      <PageSection id="offline-section" size="lg">
        <div className="mx-auto max-w-md w-full flex flex-col items-center text-center p-8 rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] backdrop-blur-md">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
            <WifiOff className="h-8 w-8" />
          </div>

          <SectionHeader
            id="offline-heading"
            as="h1"
            title="You're Offline"
            subtitle="It looks like you've lost your internet connection. Don't worry — once you're back online, 7th Heaven live feeds, tour dates, and alerts will reconnect automatically."
            align="center"
            className="mb-8 w-full"
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <SeventhButton
              onClick={handleReload}
              icon={<RefreshCw className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Try Again
            </SeventhButton>

            <SeventhButton
              href="/#tour"
              icon={<Music className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Tour Dates
            </SeventhButton>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
