import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "photographer";

export const getServerUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function requireUser() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  const userRole = (user.app_metadata?.role as Role | undefined) ?? "photographer";
  if (userRole !== role) {
    redirect(userRole === "admin" ? "/admin/dashboard" : "/dashboard");
  }
  return user;
}
