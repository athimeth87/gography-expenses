"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  Camera,
  Upload,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { CategoryPicker } from "@/components/forms/CategoryPicker";
import { CURRENCIES } from "@/lib/currencies";
import { createClient } from "@/lib/supabase/client";
import { submitBatchExpensesAction, ocrReceiptAction, redirectToHistory } from "./actions";
import type { ExpenseCategory } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type OcrConfidence = { amount: number; date: number; store: number };

type Item = {
  id: string;
  file: File;
  previewUrl: string;
  receiptPath: string | null;
  uploading: boolean;
  uploadError?: string;
  category: ExpenseCategory;
  amount: string;
  currency: string;      // From — สกุลที่จ่ายจริง
  currencyTo: string;    // To — สกุลที่สรุปเข้าบัญชี (ปกติ THB)
  expenseDate: string;
  storeName: string;
  note: string;
  ocrStatus?: "scanning" | "done" | "error";
  ocrConfidence?: OcrConfidence | null;
  aiFilled?: { amount?: boolean; date?: boolean; store?: boolean };
};

type Props = {
  userId: string;
  trips: { id: string; title: string }[];
  initialTripId: string;
};

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const today = () => new Date().toISOString().slice(0, 10);

export function BatchExpenseForm({ userId, trips, initialTripId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [tripId, setTripId] = useState(initialTripId);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

  async function uploadOne(itemId: string, file: File) {
    let processed: File = file;
    try {
      processed = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.85,
      });
    } catch {
      // fallback to original if compression fails
    }
    const supabase = createClient();
    const contentType = processed.type || "image/webp";
    const ext = contentType === "image/webp" ? "webp" : contentType.split("/")[1] ?? "jpg";
    const uuid = crypto.randomUUID();
    const path = `${userId}/${uuid}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("receipts")
      .upload(path, processed, {
        contentType,
        upsert: false,
      });
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              uploading: false,
              receiptPath: upErr ? null : path,
              uploadError: upErr?.message,
            }
          : it
      )
    );
    if (!upErr) runOcr(itemId, path);
  }

  // Read the uploaded receipt with AI and prefill ONLY the fields the user
  // hasn't filled yet. Fails soft — on error the user just types manually.
  async function runOcr(itemId: string, path: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, ocrStatus: "scanning" } : it))
    );
    let res: Awaited<ReturnType<typeof ocrReceiptAction>>;
    try {
      res = await ocrReceiptAction(path);
    } catch {
      res = { ok: false, error: "AI อ่านใบเสร็จไม่สำเร็จ" };
    }
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        if (!res.ok) return { ...it, ocrStatus: "error" };
        const f = res.fields;
        const aiFilled = { ...(it.aiFilled ?? {}) };
        const patch: Partial<Item> = { ocrStatus: "done", ocrConfidence: f.confidence };
        if (!it.amount && f.amount != null) {
          patch.amount = String(f.amount);
          aiFilled.amount = true;
        }
        if (it.currency === "THB" && f.currency && f.currency !== "THB") {
          patch.currency = f.currency;
        }
        if (!it.storeName && f.store) {
          patch.storeName = f.store;
          aiFilled.store = true;
        }
        if ((!it.expenseDate || it.expenseDate === today()) && f.date) {
          patch.expenseDate = f.date;
          aiFilled.date = true;
        }
        patch.aiFilled = aiFilled;
        return { ...it, ...patch };
      })
    );
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const newItems: Item[] = [];
    for (const file of Array.from(fileList)) {
      if (!ALLOWED.includes(file.type)) continue;
      if (file.size > MAX_BYTES) continue;
      const id = crypto.randomUUID();
      newItems.push({
        id,
        file,
        previewUrl: URL.createObjectURL(file),
        receiptPath: null,
        uploading: true,
        category: "other",
        amount: "",
        currency: "THB",
        currencyTo: "THB",
        expenseDate: today(),
        storeName: "",
        note: "",
      });
    }
    if (newItems.length === 0) {
      setError("ไม่มีไฟล์ที่รองรับ (รองรับ JPG · PNG · WEBP ขนาดไม่เกิน 10MB)");
      return;
    }
    setItems((prev) => [...prev, ...newItems]);
    for (const it of newItems) {
      uploadOne(it.id, it.file);
    }
  }

  function patchItem(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((it) => it.id !== id);
    });
  }

  function validate(mode: "submit" | "draft"): { ok: true } | { ok: false; index: number; message: string } {
    if (!tripId) return { ok: false, index: -1, message: "เลือกทริปก่อน" };
    if (items.length === 0)
      return { ok: false, index: -1, message: "เพิ่มใบเสร็จอย่างน้อย 1 ใบ" };
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.uploading) return { ok: false, index: i, message: "รออัปโหลดให้เสร็จก่อน" };
      if (!it.receiptPath) return { ok: false, index: i, message: "อัปโหลดใบเสร็จไม่สำเร็จ" };
      if (mode === "submit") {
        if (!it.amount || Number(it.amount) <= 0)
          return { ok: false, index: i, message: "กรอกจำนวนเงินที่ถูกต้อง" };
        if (!it.expenseDate) return { ok: false, index: i, message: "กรอกวันที่" };
        if (!it.storeName.trim()) return { ok: false, index: i, message: "กรอกร้านค้า/สถานที่" };
      }
    }
    return { ok: true };
  }

  function run(mode: "submit" | "draft") {
    const v = validate(mode);
    if (!v.ok) {
      setError(v.message);
      if (v.index >= 0) {
        setHighlightIndex(v.index);
        setTimeout(() => setHighlightIndex(null), 1500);
      }
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitBatchExpensesAction({
        trip_id: tripId,
        mode,
        items: items.map((it) => ({
          category: it.category,
          amount: Number(it.amount) || 0,
          currency: it.currency,
          expense_date: it.expenseDate,
          store_name: it.storeName.trim(),
          note: it.note.trim() || undefined,
          receipt_path: it.receiptPath!,
          ocr_confidence: it.ocrConfidence ?? undefined,
        })),
      });
      if (!result.ok) {
        setError(result.error);
        if (result.itemIndex !== undefined) {
          setHighlightIndex(result.itemIndex);
          setTimeout(() => setHighlightIndex(null), 1500);
        }
        return;
      }
      items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
      await redirectToHistory(mode === "draft" ? "draft" : undefined);
    });
  }

  return (
    <div className="flex flex-1 flex-col pb-32">
      <header className="flex items-center justify-between px-5 pb-3 pt-5">
        <Link href="/dashboard" className="text-ink-2">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="text-xs font-semibold text-ink-3">ADD EXPENSES</div>
        <div className="size-5" />
      </header>

      <div className="flex flex-col gap-4 px-6">
        <label className="block">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            ทริป
          </div>
          <select
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            className="w-full rounded-[10px] border-[1.4px] border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-navy"
          >
            <option value="">-- เลือกทริป --</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink-2"
          >
            <Camera className="size-4" /> ถ่ายรูป
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-navy px-3 py-2.5 text-sm font-semibold text-white shadow-card"
          >
            <Upload className="size-4" /> อัปโหลด (เลือกหลายไฟล์ได้)
          </button>
        </div>
        <p className="text-[11px] text-ink-3">
          รองรับ JPG · PNG · WEBP — แต่ละไฟล์ไม่เกิน 10MB
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {items.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-line bg-surface px-5 py-10 text-center">
            <div className="text-sm font-semibold text-ink">ยังไม่มีใบเสร็จ</div>
            <div className="mt-1 text-[11px] text-ink-3">
              กดปุ่ม &ldquo;อัปโหลด&rdquo; ด้านบนเพื่อเลือกได้หลายไฟล์ในครั้งเดียว
            </div>
          </div>
        )}

        {items.map((it, idx) => (
          <ItemCard
            key={it.id}
            item={it}
            index={idx}
            highlight={highlightIndex === idx}
            onPatch={(patch) => patchItem(it.id, patch)}
            onRemove={() => removeItem(it.id)}
          />
        ))}

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-navy-100 bg-white px-3 py-3 text-sm font-semibold text-navy"
          >
            <Plus className="size-4" /> เพิ่มใบเสร็จอีก
          </button>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-[68px] z-30 mx-auto max-w-md border-t border-line bg-white/95 px-6 py-3 backdrop-blur">
        {error && (
          <div className="mb-2 rounded-lg bg-status-rejected-bg px-3 py-2 text-xs text-status-rejected-fg">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => run("draft")}
            disabled={pending || items.length === 0}
            className="flex h-12 flex-1 items-center justify-center rounded-[12px] border-[1.5px] border-line bg-white text-sm font-semibold text-ink-2 transition-colors hover:bg-surface disabled:opacity-50"
          >
            {pending ? "กำลังบันทึก…" : "บันทึก"}
          </button>
          <button
            type="button"
            onClick={() => run("submit")}
            disabled={pending || items.length === 0}
            className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-[12px] bg-navy text-sm font-semibold text-white shadow-nav transition-opacity disabled:opacity-50"
          >
            {pending
              ? "กำลังส่ง…"
              : items.length > 0
              ? `ส่งเบิก ${items.length} รายการ`
              : "ส่งเบิกค่าใช้จ่าย"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemCard({
  item,
  index,
  highlight,
  onPatch,
  onRemove,
}: {
  item: Item;
  index: number;
  highlight: boolean;
  onPatch: (patch: Partial<Item>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-white p-3 transition-colors",
        highlight && "border-status-rejected-fg ring-2 ring-status-rejected-fg/30"
      )}
    >
      <div className="flex gap-3">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.previewUrl}
            alt={`ใบเสร็จ ${index + 1}`}
            className="size-full object-cover"
          />
          {item.uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}
          {item.uploadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-status-rejected-fg/80 px-2 text-center text-[10px] text-white">
              อัปโหลดไม่สำเร็จ
            </div>
          )}
          {item.ocrStatus === "scanning" && !item.uploading && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden bg-navy/10">
              <div
                className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent via-navy/50 to-transparent"
                style={{ animation: "pe-scanline 1.4s ease-in-out infinite" }}
              />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              ใบเสร็จ #{index + 1}
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="text-ink-4 hover:text-status-rejected-fg"
              aria-label="ลบ"
              title="ลบ"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="mt-2">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-3">
              หมวด
            </div>
            <CategoryPicker
              value={item.category}
              onChange={(category) => onPatch({ category })}
            />
          </div>
        </div>
      </div>

      {item.ocrStatus === "scanning" && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-navy-50 px-3 py-2 text-[11px] font-medium text-navy">
          <Loader2 className="size-3.5 animate-spin" /> AI กำลังอ่านใบเสร็จ…
        </div>
      )}
      {item.ocrStatus === "done" &&
        (item.aiFilled?.amount || item.aiFilled?.date || item.aiFilled?.store) && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-status-approved-bg px-3 py-2 text-[11px] font-medium text-status-approved-fg">
            <Sparkles className="size-3.5" /> AI เติมให้แล้ว — ตรวจสอบก่อนส่ง
          </div>
        )}
      {item.ocrStatus === "error" && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-[11px] text-ink-3">
          <AlertCircle className="size-3.5" /> AI อ่านใบเสร็จไม่สำเร็จ — กรอกเอง
        </div>
      )}

      <div className="mt-3 grid grid-cols-[1.4fr_1fr] gap-2.5">
        <Field
          label="จำนวนที่จ่าย"
          badge={item.aiFilled?.amount ? <AiTag conf={item.ocrConfidence?.amount} /> : null}
        >
          <div className="flex items-stretch rounded-[10px] border-[1.4px] border-line bg-white focus-within:border-navy">
            <span className="flex items-center rounded-l-[8px] border-0 border-r border-line bg-surface px-3 text-xs font-bold text-ink">
              {item.currency}
            </span>
            <input
              inputMode="decimal"
              value={item.amount}
              onChange={(e) =>
                onPatch({ amount: e.target.value.replace(/[^0-9.]/g, "") })
              }
              placeholder="0.00"
              className="w-full border-0 bg-transparent px-3 py-2 text-base font-semibold text-ink outline-none"
            />
          </div>
        </Field>
        <Field
          label="วันที่"
          badge={item.aiFilled?.date ? <AiTag conf={item.ocrConfidence?.date} /> : null}
        >
          <input
            type="date"
            value={item.expenseDate}
            onChange={(e) => onPatch({ expenseDate: e.target.value })}
            className="w-full rounded-[10px] border-[1.4px] border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy"
          />
        </Field>
      </div>

      <div className="mt-2.5">
        <Field label="สกุลเงินที่แลก (จ่าย → สรุป)">
          <div className="flex items-center gap-2">
            <select
              value={item.currency}
              onChange={(e) => onPatch({ currency: e.target.value })}
              className="w-full cursor-pointer rounded-[10px] border-[1.4px] border-line bg-white px-2.5 py-2 text-sm font-semibold text-ink outline-none focus:border-navy"
              aria-label="สกุลที่จ่าย (From)"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.th}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                onPatch({ currency: item.currencyTo, currencyTo: item.currency })
              }
              className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border-[1.4px] border-line bg-surface text-navy"
              aria-label="สลับสกุลเงิน"
            >
              <ArrowLeftRight className="size-4" />
            </button>
            <select
              value={item.currencyTo}
              onChange={(e) => onPatch({ currencyTo: e.target.value })}
              className="w-full cursor-pointer rounded-[10px] border-[1.4px] border-line bg-white px-2.5 py-2 text-sm font-semibold text-ink outline-none focus:border-navy"
              aria-label="สกุลที่สรุป (To)"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.th}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-[10px] text-ink-3">
            {item.currency !== item.currencyTo
              ? `จ่ายจริงเป็น ${item.currency} · สรุปเข้าบัญชีเป็น ${item.currencyTo} — ทีมงานใส่เรตแปลงตอนอนุมัติ`
              : `จ่ายและสรุปเป็นสกุลเดียวกัน (${item.currency}) — ไม่ต้องแปลง`}
          </p>
        </Field>
      </div>

      <div className="mt-2.5">
        <Field
          label="ร้านค้า / สถานที่"
          badge={item.aiFilled?.store ? <AiTag conf={item.ocrConfidence?.store} /> : null}
        >
          <input
            value={item.storeName}
            onChange={(e) => onPatch({ storeName: e.target.value })}
            placeholder="เช่น Khum Phaya Resort"
            className="w-full rounded-[10px] border-[1.4px] border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy"
          />
        </Field>
      </div>

      <div className="mt-2.5">
        <Field label="หมายเหตุ (ไม่บังคับ)">
          <input
            value={item.note}
            onChange={(e) => onPatch({ note: e.target.value })}
            placeholder="เช่น ค่าอาหารทีม"
            className="w-full rounded-[10px] border-[1.4px] border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  badge,
  children,
}: {
  label: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
        {badge}
      </div>
      {children}
    </label>
  );
}

function confColor(c?: number): string {
  if (c == null) return "bg-ink-4";
  if (c >= 0.8) return "bg-status-approved-fg";
  if (c >= 0.5) return "bg-status-pending-fg";
  return "bg-status-rejected-fg";
}

function AiTag({ conf }: { conf?: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-1.5 py-0.5 text-[9px] font-bold normal-case tracking-normal text-navy"
      title={conf != null ? `AI · ความมั่นใจ ${Math.round(conf * 100)}%` : "AI"}
    >
      <Sparkles className="size-2.5" /> AI
      {conf != null && <span className={cn("size-1.5 rounded-full", confColor(conf))} />}
    </span>
  );
}
