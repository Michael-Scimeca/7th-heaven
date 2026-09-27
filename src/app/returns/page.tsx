import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import ReturnsClient from "./ReturnsClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("returns");
  const title =
    content?.seo?.metaTitle ||
    (content?.title
      ? `${content.title} — 7th Heaven`
      : "Return & Refund Policy — 7th Heaven");
  const description =
    content?.seo?.metaDescription ||
    content?.heroSubheading ||
    "Official policies governing merchandise returns, refunds, table pickups, and ticket sales for 7th Heaven.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://7thheavenband.com/returns",
    },
    openGraph: {
      title,
      description,
      url: "https://7thheavenband.com/returns",
      siteName: "7th Heaven",
      type: "website",
    },
  };
}

export default async function ReturnsPage() {
  const sanityContent = await fetchPageContent("returns");
  return <ReturnsClient sanityContent={sanityContent} />;
}
