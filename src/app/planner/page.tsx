import { redirect } from "next/navigation";

export default function PlannerPage() {
  redirect("/book?tab=planner");
}
