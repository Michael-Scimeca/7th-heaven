import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Push Notifications & Email Show Updates | 7th Heaven",
  description:
    "Explore how 7th Heaven delivers instant concert alerts, weather updates, and VIP ticket presales to fans across mobile lock-screens, desktop browsers, and email inboxes.",
  robots: { index: false, follow: false },
};

export default function PushUpdatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
