import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import LiveHubClient from "./LiveHubClient";

export const metadata: Metadata = {
  title: "Live Stream Hub — 7th Heaven",
  description: "Watch 7th Heaven live streams, soundchecks, backstage streams, and concert broadcasts.",
};

export const revalidate = 60;

export default async function LiveHubPage() {
  const sanityContent = await fetchPageContent("live");

  return <LiveHubClient sanityContent={sanityContent} />;
}
