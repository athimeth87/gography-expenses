"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const itemSchema = z.object({
  category: z.enum(["fuel", "hotel", "food", "trans", "park", "equip", "other"]),
  amount: z.number().positive("จำนวนเงินต้องมากกว่า 0"),
  expense_date: z.string().min(1, "เลือกวันที่"),
  store_name: z.string().min(1, "กรอกร้านค้า/สถานที่"),
  note: z.string().optional(),
  receipt_path: z.string().min(1, "ต้องอัปโหลดใบเสร็จ"),
});

const batchSchema = z.object({
  trip_id: z.string().uuid("เลือกทริปก่อน"),
  items: z.array(itemSchema).min(1, "ต้องมีอย่างน้อย 1 รายการ"),
});

export type BatchPayload = z.infer<typeof batchSchema>;
export type BatchActionResult =
  | { ok: true; count: number }
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

  const supabase = await createClient();
  const rows = parsed.data.items.map((item) => ({
    ...item,
    trip_id: parsed.data.trip_id,
    user_id: user.id,
    status: "pending" as const,
  }));

  const { error } = await supabase.from("expenses").insert(rows);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath(`/trips/${parsed.data.trip_id}`);
  return { ok: true, count: rows.length };
}

export async function redirectToHistory() {
  redirect("/history");
}
