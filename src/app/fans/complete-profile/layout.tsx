import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Your Profile | 7th Heaven",
  description: "Complete your 7th Heaven fan club profile.",
  robots: { index: false, follow: false },
};

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
