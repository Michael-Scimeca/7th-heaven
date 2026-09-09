import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import CrewVerifyClient from "./CrewVerifyClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Verify Winner PIN — Crew Portal | 7th Heaven",
  description: "Verify winner PIN codes for 7th Heaven concert prize claims.",
};

export default async function CrewVerifyPage() {
  const sanityContent = await fetchPageContent("crew-verify");
  return <CrewVerifyClient sanityContent={sanityContent} />;
}
