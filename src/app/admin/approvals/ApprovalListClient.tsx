"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Check, X, AlertCircle, CheckSquare, Square } from "lucide-react";
import { CatIcon } from "@/components/design/CatIcon";
import { CATEGORY_TH } from "@/lib/design-tokens";
import { formatAmount } from "@/lib/currencies";
import { thb } from "@/lib/format";
import { cn } from "@/lib/utils";
import { bulkApproveAction, bulkRejectAction, type BulkResult } from "./actions";

export type ListRow = {
  id: string;
  category: string;
  amount: number;
  currency: string;
  receipt_path: string | null;
  store_name: string | null;
  user_name: string | null;
  trip_title: string | null;
};

type Props = {
  rows: ListRow[];
  selectedId: string | null;
};

export function ApprovalListClient({ rows, selectedId }: Props) {
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const selectedRows = useMemo(
    () => rows.filter((r) => selection.has(r.id)),
    [rows, selection]
  );
  const allSelected = selectedRows.length === rows.length && rows.length > 0;

  function toggle(id: string) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelection(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  }

  function clear() {
    setSelection(new Set());
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2 text-xs font-semibold text-ink-2">
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-1.5 text-ink-2 hover:text-navy"
          aria-label={allSelected ? "ยกเลิกการเลือกทั้งหมด" : "เลือกทั้งหมด"}
        >
          {allSelected ? (
            <CheckSquare className="size-4 text-navy" />
          ) : (
            <Square className="size-4" />
          )}
        </button>
        <div className="flex flex-1 items-center gap-2">
          <span className="rounded-full bg-navy px-2.5 py-0.5 text-white">
            Pending · {rows.length}
          </span>
          {selection.size > 0 && (
            <span className="rounded-full bg-navy-50 px-2 py-0.5 text-navy">
              เลือก {selection.size}
            </span>
          )}
        </div>
        {selection.size > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-[11px] font-semibold text-ink-3 hover:text-ink"
          >
            ล้าง
          </button>
        )}
      </div>

      {selection.size > 0 && (
        <div className="flex gap-2 border-b border-line bg-navy-50 px-3 py-2">
          <button
            type="button"
            onClick={() => setRejectOpen(true)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-status-rejected-fg/40 bg-white px-3 py-1.5 text-xs font-semibold text-status-rejected-fg hover:bg-status-rejected-bg"
          >
            <X className="size-3.5" /> ปฏิเสธ {selection.size}
          </button>
          <button
            type="button"
            onClick={() => setApproveOpen(true)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-navy px-3 py-1.5 text-xs font-semibold text-white shadow-card"
          >
            <Check className="size-3.5" /> อนุมัติ {selection.size}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {rows.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-ink-3">
            ไม่มีรายการรออนุมัติ
          </div>
        )}
        {rows.map((r) => {
          const isSelected = selectedId === r.id;
          const isChecked = selection.has(r.id);
          return (
            <div
              key={r.id}
              className={cn(
                "relative border-b border-line-soft transition-colors",
                isSelected ? "bg-navy-50" : "hover:bg-surface",
                isChecked && !isSelected && "bg-navy-50/60"
              )}
            >
              {isSelected && (
                <span className="absolute inset-y-2 left-0 w-1 rounded-r-sm bg-navy" />
              )}
              <div className="flex items-start gap-2 px-3 py-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggle(r.id);
                  }}
                  className="mt-0.5 shrink-0"
                  aria-label="เลือกรายการนี้"
                >
                  {isChecked ? (
                    <CheckSquare className="size-4 text-navy" />
                  ) : (
                    <Square className="size-4 text-ink-3" />
                  )}
                </button>
                <Link href={`/admin/approvals?id=${r.id}`} className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-navy">
                        <CatIcon cat={r.category as never} size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-ink">
                          {r.store_name ?? "(ไม่ระบุร้านค้า)"}
                        </div>
                        <div className="text-[11px] text-ink-3">
                          {CATEGORY_TH[r.category as keyof typeof CATEGORY_TH]} ·{" "}
                          {r.user_name ?? "—"}
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-ink-2">
                          {r.trip_title ?? ""}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-sm font-semibold text-ink">
                        {formatAmount(Number(r.amount), r.currency)}
                      </div>
                      {r.currency !== "THB" && (
                        <div className="font-mono text-[10px] text-status-pending-fg">
                          ต้องตั้งเรท
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {approveOpen && (
        <BulkApproveDialog
          rows={selectedRows}
          onClose={() => setApproveOpen(false)}
          onDone={() => {
            setApproveOpen(false);
            clear();
          }}
        />
      )}
      {rejectOpen && (
        <BulkRejectDialog
          rows={selectedRows}
          onClose={() => setRejectOpen(false)}
          onDone={() => {
            setRejectOpen(false);
            clear();
          }}
        />
      )}
    </>
  );
}

function BulkApproveDialog({
  rows,
  onClose,
  onDone,
}: {
  rows: ListRow[];
  onClose: () => void;
  onDone: () => void;
}) {
  const currencies = useMemo(() => {
    const map = new Map<string, { count: number; totalOriginal: number }>();
    for (const r of rows) {
      const cur = map.get(r.currency) ?? { count: 0, totalOriginal: 0 };
      cur.count += 1;
      cur.totalOriginal += Number(r.amount);
      map.set(r.currency, cur);
    }
    return [...map.entries()].map(([code, info]) => ({ code, ...info }));
  }, [rows]);

  // Rate map keyed by currency code. THB always = 1.
  const initialRates: Record<string, string> = {};
  for (const c of currencies) initialRates[c.code] = c.code === "THB" ? "1" : "";
  const [rates, setRates] = useState<Record<string, string>>(initialRates);

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    for (const c of currencies) {
      const r = Number(rates[c.code]);
      if (!r || r <= 0) {
        setError(`กรอกเรทสำหรับ ${c.code}`);
        return;
      }
    }
    const items = rows.map((r) => ({
      id: r.id,
      exchange_rate: Number(rates[r.currency]) || 1,
    }));
    startTransition(async () => {
      const result: BulkResult = await bulkApproveAction(items);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">อนุมัติ {rows.length} รายการ</h2>
          <button onClick={onClose} className="text-ink-3 hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        <p className="mb-4 text-xs text-ink-3">
          ตั้งเรทแลกเปลี่ยนสำหรับสกุลเงินที่ไม่ใช่ THB ก่อนอนุมัติ
        </p>

        <div className="space-y-3">
          {currencies.map((c) => {
            const rate = Number(rates[c.code]) || 0;
            const totalThb = c.totalOriginal * rate;
            const isThb = c.code === "THB";
            return (
              <div
                key={c.code}
                className="rounded-xl border border-line bg-surface px-3 py-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-ink">{c.code}</span>
                  <span className="text-ink-3">
                    {c.count} รายการ · {formatAmount(c.totalOriginal, c.code)}
                  </span>
                </div>
                {isThb ? (
                  <div className="mt-1 text-[11px] text-status-approved-fg">
                    ไม่ต้องตั้งเรท
                  </div>
                ) : (
                  <>
                    <div className="mt-2 flex items-stretch rounded-[10px] border-[1.4px] border-line bg-white focus-within:border-navy">
                      <span className="rounded-l-[8px] border-r border-line bg-surface px-2.5 py-1.5 text-[11px] font-bold text-ink-2">
                        1 {c.code} =
                      </span>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={rates[c.code]}
                        onChange={(e) =>
                          setRates((prev) => ({ ...prev, [c.code]: e.target.value }))
                        }
                        placeholder="0.00"
                        className="w-full border-0 bg-transparent px-2.5 py-1.5 text-sm font-semibold text-ink outline-none"
                      />
                      <span className="rounded-r-[8px] border-l border-line bg-surface px-2.5 py-1.5 text-[11px] font-bold text-ink-2">
                        THB
                      </span>
                    </div>
                    <div className="mt-1.5 font-mono text-[11px] text-ink-2">
                      รวม {formatAmount(c.totalOriginal, c.code)} ={" "}
                      <span className="font-bold text-ink">฿{thb(totalThb)}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-status-rejected-bg px-3 py-1.5 text-xs text-status-rejected-fg">
            <AlertCircle className="size-3.5" /> {error}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-2"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
          >
            <Check className="size-4" />
            {pending ? "กำลังอนุมัติ…" : `ยืนยันอนุมัติ ${rows.length} รายการ`}
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkRejectDialog({
  rows,
  onClose,
  onDone,
}: {
  rows: ListRow[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    if (reason.trim().length < 3) {
      setError("กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร");
      return;
    }
    startTransition(async () => {
      const result: BulkResult = await bulkRejectAction(
        rows.map((r) => r.id),
        reason.trim()
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-ink">ปฏิเสธ {rows.length} รายการ</h2>
        <p className="mt-1 text-sm text-ink-2">
          กรุณาระบุเหตุผล — จะถูกส่งให้ทุกรายการที่เลือก
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="เช่น ใบเสร็จไม่ชัดเจน"
          className="mt-4 w-full resize-none rounded-[10px] border-[1.4px] border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy"
        />
        {error && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-status-rejected-bg px-3 py-1.5 text-xs text-status-rejected-fg">
            <AlertCircle className="size-3.5" /> {error}
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-2"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={pending}
            className="rounded-[10px] bg-status-rejected-fg px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
          >
            {pending ? "กำลังบันทึก…" : `ยืนยันปฏิเสธ ${rows.length} รายการ`}
          </button>
        </div>
      </div>
    </div>
  );
}
