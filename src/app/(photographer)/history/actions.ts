"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type DeleteState = { error?: string; ok?: true } | undefined;

export async function deleteExpenseAction(id: string): Promise<DeleteState> {
  const user = await requireRole("photographer");
  const supabase = await createClient();

  const { data: existing, error: readErr } = await supabase
    .from("expenses")
    .select("user_id, status, receipt_path, trip_id")
    .eq("id", id)
    .single();

  if (readErr || !existing) return { error: "ไม่พบรายการ" };
  if (existing.user_id !== user.id) return { error: "สิทธิ์ไม่พอ" };
  if (existing.status === "approved" || existing.status === "rejected") {
    return { error: "รายการที่อนุมัติหรือปฏิเสธแล้วลบไม่ได้" };
  }

  const { error: delErr } = await supabase.from("expenses").delete().eq("id", id);
  if (delErr) return { error: delErr.message };

  if (existing.receipt_path) {
    await supabase.storage.from("receipts").remove([existing.receipt_path]);
  }

  revalidatePath("/history");
  revalidatePath("/dashboard");
  revalidatePath(`/trips/${existing.trip_id}`);
  return { ok: true };
}
