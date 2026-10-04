export const metadata = {
  title: "Fan Club & VIP Dashboard | 7th Heaven Band",
  description:
    "Join the official 7th Heaven Fan Club: unlock custom fan rewards, show attendance tracking, raffle entries, and concert proximity alerts.",
  alternates: {
    canonical: "https://7thheavenband.com/fans",
  },
  openGraph: {
    title: "7th Heaven Fan Club & VIP Dashboard",
    description:
      "Unlock custom fan rewards, show attendance tracking, raffle entries, and concert proximity alerts.",
    url: "https://7thheavenband.com/fans",
    siteName: "7th Heaven",
    type: "website",
    images: [
      {
        url: "https://7thheavenband.com/images/logos/7thheavenlogo.jpg",
        width: 1200,
        height: 630,
        alt: "7th Heaven Fan Club",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@7thheavenband",
    title: "7th Heaven Fan Club & VIP Dashboard",
    description:
      "Unlock custom fan rewards, show attendance tracking, raffle entries, and concert proximity alerts.",
    images: ["https://7thheavenband.com/images/logos/7thheavenlogo.jpg"],
  },
};

export default function FansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
