import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import PrivacyClient from "./PrivacyClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("privacy");
  const title =
    content?.seo?.metaTitle ||
    (content?.title
      ? `${content.title} — 7th Heaven`
      : "Privacy Policy — 7th Heaven");
  const description =
    content?.seo?.metaDescription ||
    content?.heroSubheading ||
    "How 7th Heaven collects, uses, and protects your personal information and fan club account data.";
  const canonicalUrl = "https://7thheavenband.com/privacy";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "7th Heaven",
      type: "website",
    },
  };
}

export default async function PrivacyPage() {
  const sanityContent = await fetchPageContent("privacy");
  return <PrivacyClient sanityContent={sanityContent} />;
}
