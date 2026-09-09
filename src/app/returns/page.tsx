import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import ReturnsClient from "./ReturnsClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Return & Refund Policy — 7th Heaven",
  description: "Official policies governing merchandise returns, refunds, table pickups, and ticket sales for 7th Heaven.",
};

export default async function ReturnsPage() {
  const sanityContent = await fetchPageContent("returns");
  return <ReturnsClient sanityContent={sanityContent} />;
}

