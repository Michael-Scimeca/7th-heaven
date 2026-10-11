import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "7th Heaven — Studio",
  description: "Content management studio for 7th Heaven",
  robots: { index: false, follow: false },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[9999] h-screen w-screen">
      {children}
    </div>
  );
}
