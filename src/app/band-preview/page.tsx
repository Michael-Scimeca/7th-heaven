import type { Metadata } from "next";
import BandVideoLoop from "@/components/BandVideoLoop";

export const metadata: Metadata = {
  title: "Band Loop Preview",
  robots: { index: false, follow: false },
};

export default function BandPreviewPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-32">
      <BandVideoLoop className="max-w-5xl" />
    </main>
  );
}
