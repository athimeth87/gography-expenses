"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const approveSchema = z.object({
  id: z.string().uuid(),
  exchange_rate: z.number().positive("เรทต้องมากกว่า 0"),
});

const rejectSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, "กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร"),
});

export type ApprovalState = { error?: string } | undefined;

export async function approveExpenseAction(
  id: string,
  exchangeRate: number
): Promise<ApprovalState> {
  const user = await requireRole("admin");
  const parsed = approveSchema.safeParse({ id, exchange_rate: exchangeRate });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({
      status: "approved",
      exchange_rate: parsed.data.exchange_rate,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      admin_note: null,
    })
    .eq("id", parsed.data.id)
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

const bulkApproveSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        exchange_rate: z.number().positive(),
      })
    )
    .min(1, "กรุณาเลือกอย่างน้อย 1 รายการ"),
});

const bulkRejectSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "กรุณาเลือกอย่างน้อย 1 รายการ"),
  reason: z.string().min(3, "กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร"),
});

export type BulkResult =
  | { ok: true; count: number; failed: number }
  | { ok: false; error: string };

export async function bulkApproveAction(
  items: { id: string; exchange_rate: number }[]
): Promise<BulkResult> {
  const user = await requireRole("admin");
  const parsed = bulkApproveSchema.safeParse({ items });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const supabase = await createClient();
  const approvedAt = new Date().toISOString();

  let approved = 0;
  let failed = 0;
  // Update one row at a time so each gets its own exchange_rate.
  for (const item of parsed.data.items) {
    const { error, count } = await supabase
      .from("expenses")
      .update(
        {
          status: "approved",
          exchange_rate: item.exchange_rate,
          approved_by: user.id,
          approved_at: approvedAt,
          admin_note: null,
        },
        { count: "exact" }
      )
      .eq("id", item.id)
      .eq("status", "pending");
    if (error || count === 0) failed += 1;
    else approved += count ?? 0;
  }

  revalidatePath("/admin/approvals");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin");
  return { ok: true, count: approved, failed };
}

export async function bulkRejectAction(
  ids: string[],
  reason: string
): Promise<BulkResult> {
  await requireRole("admin");
  const parsed = bulkRejectSchema.safeParse({ ids, reason });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("expenses")
    .update(
      {
        status: "rejected",
        admin_note: parsed.data.reason,
      },
      { count: "exact" }
    )
    .in("id", parsed.data.ids)
    .eq("status", "pending");

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/approvals");
  revalidatePath("/admin/dashboard");
  return {
    ok: true,
    count: count ?? 0,
    failed: parsed.data.ids.length - (count ?? 0),
  };
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
