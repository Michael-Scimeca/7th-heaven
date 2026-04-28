import type { Metadata } from "next";
import PlannerClient from "./PlannerClient";

export const metadata: Metadata = {
 title: "Planner Dashboard — 7th Heaven",
 description: "Manage your booked events, contracts, and logistics.",
};

export default function PlannerPage() {
 return <PlannerClient />;
}
