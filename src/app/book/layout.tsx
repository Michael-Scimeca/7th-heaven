import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book 7th Heaven — Chicago's Premier Live Band",
  description: "Book 7th Heaven for your next corporate event, wedding, festival, or private party. Premier live rock band serving Chicago, Illinois, and the Midwest. Fast quotes and seamless event planning.",
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
    title: "Book 7th Heaven — Chicago's Premier Live Band",
    description: "Book 7th Heaven for your next corporate event, wedding, festival, or private party.",
    type: "website",
    url: "https://7thheavenband.com/book",
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* We can inject structured data for local business/booking here if needed */}
      {children}
    </>
  );
}
