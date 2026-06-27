import { redirect } from "next/navigation";

// The /members route redirects to the full band member bios on /bio.
// This keeps any old links working without showing a 404.
export default function MembersPage() {
  redirect("/bio");
}
