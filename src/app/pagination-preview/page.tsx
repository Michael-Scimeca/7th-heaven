import type { Metadata } from "next";
import PaginationPreviewClient from "./PaginationPreviewClient";

export const metadata: Metadata = {
  title: "Pagination Styles Preview | 7th Heaven",
  description: "Internal preview of 20 pagination layouts for the media video archive.",
  robots: { index: false, follow: false },
};

export default function PaginationPreviewPage() {
  return <PaginationPreviewClient />;
}
