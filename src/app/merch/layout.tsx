import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchPageContent("merch");
  const title = content?.seo?.metaTitle || (content?.title ? `${content.title} — 7th Heaven` : "Merch — 7th Heaven Official Store");
  const description = content?.seo?.metaDescription || content?.heroSubheading || "Shop official 7th Heaven band merchandise — tees, hoodies, vinyl, and more. Ships worldwide.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://7thheavenband.com/merch",
      siteName: "7th Heaven",
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
