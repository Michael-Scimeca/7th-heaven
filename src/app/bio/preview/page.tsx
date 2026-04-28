import { redirect } from "next/navigation";

// /bio/preview redirects to the live bio page
export default function BioPreviewPage() {
  redirect("/bio");
}
