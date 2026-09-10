import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("book");
  const title = content?.seo?.metaTitle || (content?.title ? `${content.title} — 7th Heaven` : "Book 7th Heaven — Chicago's Premier Live Band");
  const description = content?.seo?.metaDescription || content?.heroSubheading || "Book 7th Heaven for your next corporate event, wedding, festival, or private party. Premier live rock band serving Chicago, Illinois, and the Midwest. Fast quotes and seamless event planning.";

  return {
    title,
    description,
    keywords: [
      "book 7th heaven",
      "chicago live band",
      "chicago wedding band",
      "corporate event band illinois",
      "festival headliner",
      "book live music chicago",
      "private party band",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://7thheavenband.com/book",
    },
  };
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* We can inject structured data for local business/booking here if needed */}
      {children}
    </>
  );
}
