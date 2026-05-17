import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin");
  const supabase = await createClient();
  const [profile, pendingResp] = await Promise.all([
    getProfile(user.id),
    supabase.from("expenses").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return (
    <div className="flex flex-1 bg-surface">
      <AdminSidebar profile={profile} pendingCount={pendingResp.count ?? 0} />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
