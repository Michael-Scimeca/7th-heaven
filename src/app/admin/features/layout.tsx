import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Features | 7th Heaven",
  description: "Website features overview and management dashboard.",
  robots: "noindex, nofollow",
};

export default function AdminFeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
