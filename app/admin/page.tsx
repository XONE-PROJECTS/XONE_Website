import { getAdminSession } from "@/features/admin/lib/auth";
import { AdminDashboard } from "@/features/admin/components/AdminDashboard";
import { AdminLogin } from "@/features/admin/components/AdminLogin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (session) return <AdminDashboard email={session.email} />;
  return <AdminLogin />;
}
