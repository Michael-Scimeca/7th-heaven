import type { Metadata } from "next";
import SentenceClient from "./SentenceClient";

export const metadata: Metadata = {
  title: "Sentence Form — 20 Conversational Layouts | 7th Heaven",
  robots: { index: false, follow: false },
};

export default function SentencePage() {
  return <SentenceClient />;
}
