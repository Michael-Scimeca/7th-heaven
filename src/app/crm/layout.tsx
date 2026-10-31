import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Booking CRM & Pipeline | 7th Heaven",
  description:
    "Lead lifecycle tracking, proposal stages, contracts, confirmed bookings, and event planners directory.",
};

export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
