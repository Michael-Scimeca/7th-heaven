import BandVideoLoop from "@/components/BandVideoLoop";

export const metadata = { title: "Band Loop Preview", robots: { index: false } };

export default function BandPreviewPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-32">
      <BandVideoLoop className="max-w-5xl" />
    </main>
  );
}
