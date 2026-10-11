import { redirect } from "next/navigation";

export default function TransitionTestRootPage() {
  redirect("/transition-test/page-a");
}
