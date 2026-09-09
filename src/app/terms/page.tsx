import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import TermsClient from "./TermsClient";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Terms of Service — 7th Heaven",
    description: "Terms and conditions for using the 7th Heaven website and SMS alert service.",
};

export default async function TermsPage() {
    const sanityContent = await fetchPageContent("terms");
    return <TermsClient sanityContent={sanityContent} />;
}

