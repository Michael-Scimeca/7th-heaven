import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import TermsClient from "./TermsClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("terms");
  const title =
    content?.seo?.metaTitle ||
    (content?.title
      ? `${content.title} — 7th Heaven`
      : "Terms of Service — 7th Heaven");
  const description =
    content?.seo?.metaDescription ||
    content?.heroSubheading ||
    "Terms and conditions for using the 7th Heaven website, fan accounts, ticket purchases, and SMS alerts.";
  const canonicalUrl = "https://7thheavenband.com/terms";

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

export default async function TermsPage() {
  const sanityContent = await fetchPageContent("terms");
  return <TermsClient sanityContent={sanityContent} />;
}
