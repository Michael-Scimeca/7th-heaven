import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Stream Room | 7th Heaven",
  description: "Live stage broadcast stream.",
  robots: { index: false, follow: false },
};

export default function LiveRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
