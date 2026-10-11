import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | 7th Heaven",
  description: "Internal administration and management tools.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
