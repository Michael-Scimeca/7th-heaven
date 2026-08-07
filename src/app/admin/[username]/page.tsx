import { AdminDashboardMain } from "./components/AdminDashboardMain";

export default function AdminPage({ params }: { params: Promise<{ username: string }> }) {
  return <AdminDashboardMain params={params} />;
}