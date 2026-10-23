import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Filter Preview | 7th Heaven",
  description: "Internal preview of the media page filter drawer.",
  robots: { index: false, follow: false },
};

export default function MediaFilterPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
