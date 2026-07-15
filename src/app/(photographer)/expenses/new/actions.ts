"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractReceipt, type ReceiptFields, type MediaType } from "@/lib/ocr";

const baseItem = z.object({
  category: z.enum(["fuel", "hotel", "food", "trans", "park", "equip", "other"]),
  amount: z.number().nonnegative(),
  currency: z.string().min(3).max(8),
  expense_date: z.string().min(1),
  store_name: z.string(),
  note: z.string().optional(),
  receipt_path: z.string().min(1, "ต้องอัปโหลดใบเสร็จ"),
  ocr_confidence: z
    .object({ amount: z.number(), date: z.number(), store: z.number() })
    .nullable()
    .optional(),
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
    ocr_confidence: item.ocr_confidence ?? null,
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

export type OcrActionResult =
  | { ok: true; fields: ReceiptFields }
  | { ok: false; error: string };

const OCR_MEDIA: readonly MediaType[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Reads an already-uploaded receipt from storage and extracts amount/date/store
// via Claude Haiku 4.5. Fails soft — the caller falls back to manual entry.
export async function ocrReceiptAction(receiptPath: string): Promise<OcrActionResult> {
  const user = await requireRole("photographer");

  // Owner check: the storage path is `${user.id}/<uuid>.<ext>`.
  if (!receiptPath || !receiptPath.startsWith(`${user.id}/`)) {
    return { ok: false, error: "ไม่พบไฟล์ใบเสร็จ" };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "ยังไม่ได้ตั้งค่า AI (ANTHROPIC_API_KEY)" };
  }

  try {
    const admin = createAdminClient();
    const { data: blob, error } = await admin.storage.from("receipts").download(receiptPath);
    if (error || !blob) return { ok: false, error: "โหลดรูปใบเสร็จไม่สำเร็จ" };

    const buffer = Buffer.from(await blob.arrayBuffer());
    const media: MediaType = OCR_MEDIA.includes(blob.type as MediaType)
      ? (blob.type as MediaType)
      : "image/jpeg";

    const fields = await extractReceipt(buffer.toString("base64"), media);
    return { ok: true, fields };
  } catch (e) {
    console.error("ocrReceiptAction error:", e);
    return { ok: false, error: "AI อ่านใบเสร็จไม่สำเร็จ" };
  }
}
