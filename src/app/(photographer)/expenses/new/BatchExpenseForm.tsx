"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { ArrowLeft, Camera, Upload, Plus, Trash2, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { CategoryPicker } from "@/components/forms/CategoryPicker";
import { createClient } from "@/lib/supabase/client";
import { submitBatchExpensesAction, redirectToHistory } from "./actions";
import type { ExpenseCategory } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  file: File;
  previewUrl: string;
  receiptPath: string | null;
  uploading: boolean;
  uploadError?: string;
  category: ExpenseCategory;
  amount: string;
  expenseDate: string;
  storeName: string;
  note: string;
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
      });
    } catch {
      // fallback to original
    }
    const supabase = createClient();
    const ext = processed.type.split("/")[1] ?? "jpg";
    const uuid = crypto.randomUUID();
    const path = `${userId}/${uuid}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("receipts")
      .upload(path, processed, {
        contentType: processed.type,
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

  function validate(): { ok: true } | { ok: false; index: number; message: string } {
    if (!tripId) return { ok: false, index: -1, message: "เลือกทริปก่อน" };
    if (items.length === 0)
      return { ok: false, index: -1, message: "เพิ่มใบเสร็จอย่างน้อย 1 ใบ" };
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.uploading) return { ok: false, index: i, message: "รออัปโหลดให้เสร็จก่อน" };
      if (!it.receiptPath) return { ok: false, index: i, message: "อัปโหลดใบเสร็จไม่สำเร็จ" };
      if (!it.amount || Number(it.amount) <= 0)
        return { ok: false, index: i, message: "กรอกจำนวนเงินที่ถูกต้อง" };
      if (!it.expenseDate) return { ok: false, index: i, message: "กรอกวันที่" };
      if (!it.storeName.trim()) return { ok: false, index: i, message: "กรอกร้านค้า/สถานที่" };
    }
    return { ok: true };
  }

  function onSubmit() {
    const v = validate();
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
        items: items.map((it) => ({
          category: it.category,
          amount: Number(it.amount),
          expense_date: it.expenseDate,
          store_name: it.storeName.trim(),
          note: it.note.trim() || undefined,
          receipt_path: it.receiptPath!,
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
      await redirectToHistory();
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
        <button
          type="button"
          onClick={onSubmit}
          disabled={pending || items.length === 0}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-navy text-sm font-semibold text-white shadow-nav transition-opacity disabled:opacity-50"
        >
          {pending
            ? "กำลังส่ง…"
            : items.length > 0
            ? `ส่งเบิก ${items.length} รายการ`
            : "ส่งเบิกค่าใช้จ่าย"}
        </button>
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

      <div className="mt-3 grid grid-cols-[1.4fr_1fr] gap-2.5">
        <Field label="จำนวนเงิน">
          <div className="flex items-center gap-1 rounded-[10px] border-[1.4px] border-line bg-white px-3 py-2 focus-within:border-navy">
            <span className="text-sm text-ink-3">฿</span>
            <input
              inputMode="decimal"
              value={item.amount}
              onChange={(e) =>
                onPatch({ amount: e.target.value.replace(/[^0-9.]/g, "") })
              }
              placeholder="0.00"
              className="w-full border-0 bg-transparent text-base font-semibold text-ink outline-none"
            />
          </div>
        </Field>
        <Field label="วันที่">
          <input
            type="date"
            value={item.expenseDate}
            onChange={(e) => onPatch({ expenseDate: e.target.value })}
            className="w-full rounded-[10px] border-[1.4px] border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy"
          />
        </Field>
      </div>

      <div className="mt-2.5">
        <Field label="ร้านค้า / สถานที่">
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </div>
      {children}
    </label>
  );
}
