import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import PrivacyClient from "./PrivacyClient";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Privacy Policy — 7th Heaven",
    description: "How 7th Heaven collects, uses, and protects your personal information.",
};

export default async function PrivacyPage() {
    const sanityContent = await fetchPageContent("privacy");
    return <PrivacyClient sanityContent={sanityContent} />;
}

