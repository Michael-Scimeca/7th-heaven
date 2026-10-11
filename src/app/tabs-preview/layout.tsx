import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tabs Preview — 7th Heaven",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TabsPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
