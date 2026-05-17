"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const baseSchema = z.object({
  id: z.string().uuid(),
  category: z.enum(["fuel", "hotel", "food", "trans", "park", "equip", "other"]),
  amount: z.number().nonnegative(),
  currency: z.string().min(3).max(8),
  expense_date: z.string().min(1),
  store_name: z.string(),
  note: z.string().optional(),
});

const submitSchema = baseSchema.extend({
  amount: z.number().positive("จำนวนเงินต้องมากกว่า 0"),
  store_name: z.string().min(1, "กรอกร้านค้า/สถานที่"),
});

export type EditState = { error?: string } | undefined;

export async function updateExpenseAction(
  payload: z.infer<typeof baseSchema> & { mode: "submit" | "draft" }
): Promise<EditState> {
  const user = await requireRole("photographer");
  const schema = payload.mode === "submit" ? submitSchema : baseSchema;
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("expenses")
    .select("user_id, status, trip_id")
    .eq("id", parsed.data.id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return { error: "ไม่พบรายการ" };
  }
  if (existing.status !== "draft" && existing.status !== "pending") {
    return { error: "รายการนี้แก้ไขไม่ได้แล้ว" };
  }

  const status = payload.mode === "submit" ? "pending" : existing.status;
  const { error } = await supabase
    .from("expenses")
    .update({
      category: parsed.data.category,
      amount: parsed.data.amount,
      currency: parsed.data.currency.toUpperCase(),
      expense_date: parsed.data.expense_date,
      store_name: parsed.data.store_name || null,
      note: parsed.data.note || null,
      status,
    })
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };

  revalidatePath("/history");
  revalidatePath("/dashboard");
  revalidatePath(`/trips/${existing.trip_id}`);
  return undefined;
}

export async function deleteDraftAction(id: string) {
  const user = await requireRole("photographer");
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("expenses")
    .select("user_id, status, trip_id")
    .eq("id", id)
    .single();
  if (!existing || existing.user_id !== user.id || existing.status !== "draft") {
    redirect("/history");
  }
  await supabase.from("expenses").delete().eq("id", id);
  revalidatePath("/history");
  revalidatePath("/dashboard");
  if (existing) revalidatePath(`/trips/${existing.trip_id}`);
  redirect("/history?filter=draft");
}

export async function navAfterEdit(filter?: "draft") {
  redirect(filter ? `/history?filter=${filter}` : "/history");
}
