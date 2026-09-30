import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications & Alerts — 7th Heaven",
  description:
    "Subscribe to instant push notifications and alerts for upcoming tour dates, special announcements, crew call times, and fan perks.",
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
