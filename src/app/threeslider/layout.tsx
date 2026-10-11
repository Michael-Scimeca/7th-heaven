import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ThreeSlider Demo — 7th Heaven",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThreeSliderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
