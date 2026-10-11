import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dropdown Preview | 7th Heaven",
  description: "Internal preview of UI dropdown components.",
  robots: { index: false, follow: false },
};

export default function DropdownPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
