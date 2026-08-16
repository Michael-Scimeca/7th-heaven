import React from "react";
import type { Metadata } from "next";
import VisualSitemapClient from "../VisualSitemapClient";

export const metadata: Metadata = {
  title: "User Flow Map & Journey Diagrams — 7th Heaven",
  description:
    "Interactive user journey and system flow map for 7th Heaven web app. Diagramming Cruise Signups, PIN verification, Magic Link auth, passwordless login, and email triggers.",
};

export default function UserFlowsPage() {
  return <VisualSitemapClient initialTab="flows" />;
}
