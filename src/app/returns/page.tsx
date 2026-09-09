import type { Metadata } from "next";
import ReturnsClient from "./ReturnsClient";

export const metadata: Metadata = {
  title: "Return & Refund Policy — 7th Heaven",
  description: "Official policies governing merchandise returns, refunds, table pickups, and ticket sales for 7th Heaven.",
};

export default function ReturnsPage() {
  return <ReturnsClient />;
}

