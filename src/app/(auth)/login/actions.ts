"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  // Sync role from profiles → app_metadata so middleware can trust it.
  const role = (data.user.app_metadata?.role as "admin" | "photographer" | undefined) ?? undefined;

  if (!role) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role) {
      await admin.auth.admin.updateUserById(data.user.id, {
        app_metadata: { ...data.user.app_metadata, role: profile.role },
      });
      // Force a session refresh so the new JWT carries the role claim.
      await supabase.auth.refreshSession();
    }
  }

  const finalRole =
    role ??
    ((await createAdminClient().from("profiles").select("role").eq("id", data.user.id).single())
      .data?.role as "admin" | "photographer" | undefined) ??
    "photographer";

  redirect(finalRole === "admin" ? "/admin/dashboard" : "/dashboard");
}
