import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import CruiseVerifyClient from "./CruiseVerifyClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Verify Cruise Access — 7th Heaven",
  description: "Enter your verification code to access your 7th Heaven Cruise Dashboard.",
};

export default async function CruiseVerifyPage() {
  const sanityContent = await fetchPageContent("cruise-verify");
  return <CruiseVerifyClient sanityContent={sanityContent} />;
}
