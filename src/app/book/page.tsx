import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import BookClient from "./BookClient";

export const metadata: Metadata = {
  title: "Book Us — 7th Heaven",
  description: "Book 7th Heaven for festivals, private events, weddings, corporate shows, and unplugged acoustic sets.",
};

export const revalidate = 60;

export default async function BookPage() {
  const sanityContent = await fetchPageContent("book");

  return <BookClient sanityContent={sanityContent} />;
}
