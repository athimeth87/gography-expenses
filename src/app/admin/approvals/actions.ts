"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const rejectSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, "กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร"),
});

export type ApprovalState = { error?: string } | undefined;

export async function approveExpenseAction(id: string): Promise<ApprovalState> {
  const user = await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      admin_note: null,
    })
    .eq("id", id)
    .eq("status", "pending");
  if (error) return { error: error.message };
  revalidatePath("/admin/approvals");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin");
  return undefined;
}

export async function rejectExpenseAction(
  _prev: ApprovalState,
  formData: FormData
): Promise<ApprovalState> {
  await requireRole("admin");
  const parsed = rejectSchema.safeParse({
    id: formData.get("id"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({
      status: "rejected",
      admin_note: parsed.data.reason,
    })
    .eq("id", parsed.data.id)
    .eq("status", "pending");
  if (error) return { error: error.message };
  revalidatePath("/admin/approvals");
  revalidatePath("/admin/dashboard");
  return undefined;
}

export async function markPaidAction(id: string): Promise<ApprovalState> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({ status: "paid" })
    .eq("id", id)
    .eq("status", "approved");
  if (error) return { error: error.message };
  revalidatePath("/admin/approvals");
  return undefined;
}
