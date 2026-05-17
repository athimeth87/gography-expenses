"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  role: z.enum(["photographer", "admin"]).default("photographer"),
});

export type ActionState = { error?: string; ok?: true } | undefined;

export async function addMemberAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("admin");
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    role: formData.get("role") || "photographer",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { name: parsed.data.name },
    app_metadata: { role: parsed.data.role },
  });

  if (error || !data.user) return { error: error?.message ?? "สร้างผู้ใช้ไม่สำเร็จ" };

  // Ensure profile.name/role match (the trigger inserts with defaults).
  await admin
    .from("profiles")
    .update({ name: parsed.data.name, role: parsed.data.role })
    .eq("id", data.user.id);

  revalidatePath("/admin/team");
  return { ok: true };
}
