import React from "react";
import type { Metadata } from "next";
import UserFlowMap from "@/components/UserFlowMap";

export const metadata: Metadata = {
  title: "User Flow Map & Journey Diagrams — 7th Heaven",
  description:
    "Interactive user journey and system flow map for 7th Heaven web app. Diagramming Cruise Signups, PIN verification, Magic Link auth, passwordless login, and email triggers.",
};

export default function UserFlowsPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-[1700px] mx-auto">
      <UserFlowMap />
    </div>
  );
}
