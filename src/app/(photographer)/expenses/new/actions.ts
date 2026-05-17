"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const baseItem = z.object({
  category: z.enum(["fuel", "hotel", "food", "trans", "park", "equip", "other"]),
  amount: z.number().nonnegative(),
  currency: z.string().min(3).max(8),
  expense_date: z.string().min(1),
  store_name: z.string(),
  note: z.string().optional(),
  receipt_path: z.string().min(1, "ต้องอัปโหลดใบเสร็จ"),
});

// Strict validation for "submit": all fields filled, amount > 0, store/date present.
const submitItem = baseItem.extend({
  amount: z.number().positive("จำนวนเงินต้องมากกว่า 0"),
  expense_date: z.string().min(1, "เลือกวันที่"),
  store_name: z.string().min(1, "กรอกร้านค้า/สถานที่"),
});

const batchSchema = z.object({
  trip_id: z.string().uuid("เลือกทริปก่อน"),
  mode: z.enum(["submit", "draft"]).default("submit"),
  items: z.array(baseItem).min(1, "ต้องมีอย่างน้อย 1 รายการ"),
});

export type BatchPayload = z.infer<typeof batchSchema>;
export type BatchActionResult =
  | { ok: true; count: number; mode: "submit" | "draft" }
  | { ok: false; error: string; itemIndex?: number };

export async function submitBatchExpensesAction(
  payload: BatchPayload
): Promise<BatchActionResult> {
  const user = await requireRole("photographer");
  const parsed = batchSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const itemIndex =
      typeof issue?.path[1] === "number" ? (issue.path[1] as number) : undefined;
    return {
      ok: false,
      error: issue?.message ?? "ข้อมูลไม่ถูกต้อง",
      itemIndex,
    };
  }

  if (parsed.data.mode === "submit") {
    for (let i = 0; i < parsed.data.items.length; i++) {
      const r = submitItem.safeParse(parsed.data.items[i]);
      if (!r.success) {
        return {
          ok: false,
          error: r.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง",
          itemIndex: i,
        };
      }
    }
  }

  const status = parsed.data.mode === "submit" ? "pending" : "draft";
  const supabase = await createClient();
  const rows = parsed.data.items.map((item) => ({
    category: item.category,
    amount: item.amount,
    currency: item.currency.toUpperCase(),
    exchange_rate: 1, // admin sets the real rate at approval for non-THB
    expense_date: item.expense_date || new Date().toISOString().slice(0, 10),
    store_name: item.store_name || null,
    note: item.note || null,
    receipt_path: item.receipt_path,
    trip_id: parsed.data.trip_id,
    user_id: user.id,
    status,
  }));

  const { error } = await supabase.from("expenses").insert(rows);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath(`/trips/${parsed.data.trip_id}`);
  return { ok: true, count: rows.length, mode: parsed.data.mode };
}

export async function redirectToHistory(filter?: "draft") {
  redirect(filter ? `/history?filter=${filter}` : "/history");
}
