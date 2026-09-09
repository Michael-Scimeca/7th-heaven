import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import PlannerVerifyClient from "./PlannerVerifyClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Verify Event Planner Access — 7th Heaven",
  description: "Verify your 6-digit access code to manage your event booking request with 7th Heaven.",
};

export default async function PlannerVerifyPage() {
  const sanityContent = await fetchPageContent("planner-verify");
  return <PlannerVerifyClient sanityContent={sanityContent} />;
}
