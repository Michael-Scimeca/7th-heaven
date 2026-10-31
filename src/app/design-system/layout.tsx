import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "7th Heaven Design System | Tokens, Typography, Colors & Primitives",
  description:
    "Interactive living design system for 7th Heaven: Violet Nocturne tokens, Anton display typography, Utopia fluid spacing, and canonical UI primitives.",
};

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
