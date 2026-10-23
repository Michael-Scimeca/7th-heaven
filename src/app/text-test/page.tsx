import type { Metadata } from "next";
import TextTestClient from "./TextTestClient";

export const metadata: Metadata = {
  title: "Text Transition Test | 7th Heaven",
  robots: { index: false, follow: false },
};

export default function TextTestPage() {
  return <TextTestClient />;
}
