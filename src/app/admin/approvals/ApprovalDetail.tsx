"use client";

import { useActionState, useState, useTransition } from "react";
import { Check, X, Eye, Download, AlertCircle, RefreshCw } from "lucide-react";
import { StatusPill } from "@/components/design/StatusPill";
import { CATEGORY_TH } from "@/lib/design-tokens";
import { thb, dateTh } from "@/lib/format";
import { formatAmount } from "@/lib/currencies";
import {
  approveExpenseAction,
  rejectExpenseAction,
  type ApprovalState,
} from "./actions";
import type { Expense } from "@/types/database";

type Props = {
  expense: Expense;
  receiptUrl: string | null;
  storeName: string | null;
  tripTitle: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
};

export function ApprovalDetail({
  expense,
  receiptUrl,
  storeName,
  tripTitle,
  submitterName,
  submitterEmail,
}: Props) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approvePending, startApprove] = useTransition();
  const [approveErr, setApproveErr] = useState<string | null>(null);
  const isThb = expense.currency === "THB";
  const [rateInput, setRateInput] = useState<string>(
    isThb ? "1" : String(expense.exchange_rate ?? 1)
  );
  const [rejectState, rejectAction, rejectPending] = useActionState<ApprovalState, FormData>(
    rejectExpenseAction,
    undefined
  );

  const rate = Number(rateInput) || 0;
  const computedThb = Number(expense.amount) * rate;

  function handleApprove() {
    setApproveErr(null);
    if (!rate || rate <= 0) {
      setApproveErr("กรุณากรอกเรทแลกเปลี่ยนที่ถูกต้อง");
      return;
    }
    startApprove(async () => {
      const result = await approveExpenseAction(expense.id, rate);
      if (result?.error) setApproveErr(result.error);
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-7 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-mono text-[11px] text-ink-3">
              {expense.id.slice(0, 8)} · {expense.trip_id.slice(0, 8)}
            </div>
            <h1 className="mt-1 truncate text-xl font-bold text-ink">
              {storeName ?? "(ไม่ระบุร้านค้า)"}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-2">
              <span>ส่งโดย {submitterName ?? submitterEmail ?? "—"}</span>
              <span className="text-ink-4">·</span>
              <span>{dateTh(expense.expense_date)}</span>
              <span className="text-ink-4">·</span>
              <span>{tripTitle ?? "—"}</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-mono text-2xl font-bold text-ink">
              {formatAmount(Number(expense.amount), expense.currency)}
            </div>
            {!isThb && (
              <div className="mt-0.5 font-mono text-xs text-ink-3">
                ≈ ฿{thb(computedThb)} <span className="text-ink-4">@ {rate || "?"}</span>
              </div>
            )}
            <StatusPill status={expense.status} className="mt-1" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              Receipt Image
            </div>
            {receiptUrl ? (
              <div className="overflow-hidden rounded-xl border border-line bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={receiptUrl} alt="receipt" className="w-full" />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-line bg-white px-4 py-12 text-center text-xs text-ink-3">
                ไม่มีรูปใบเสร็จ
              </div>
            )}
            {receiptUrl && (
              <div className="mt-2 flex gap-2">
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-2"
                >
                  <Eye className="size-3.5" /> Open
                </a>
                <a
                  href={receiptUrl}
                  download
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-2"
                >
                  <Download className="size-3.5" /> Download
                </a>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <Section title="EXPENSE DETAILS">
              <Field label="หมวด" value={CATEGORY_TH[expense.category]} />
              <Field
                label="จำนวนเงิน"
                value={formatAmount(Number(expense.amount), expense.currency)}
                mono
              />
              <Field label="วันที่" value={dateTh(expense.expense_date)} />
              <Field label="ร้านค้า" value={storeName ?? "—"} />
              <Field label="ทริป" value={tripTitle ?? "—"} />
              <Field label="ส่งโดย" value={`${submitterName ?? "—"} (${submitterEmail ?? "—"})`} />
              <Field label="หมายเหตุ" value={expense.note ?? "—"} />
            </Section>

            <Section title="EXCHANGE RATE → THB" icon={<RefreshCw className="size-3.5" />}>
              <div className="space-y-2.5 px-4 py-3">
                {isThb ? (
                  <div className="rounded-lg bg-status-approved-bg px-3 py-2 text-xs text-status-approved-fg">
                    เป็นเงินบาท (THB) — ไม่ต้องตั้งเรท
                  </div>
                ) : (
                  <>
                    <div className="text-xs text-ink-3">
                      กรอกเรท <strong>THB ต่อ 1 {expense.currency}</strong>{" "}
                      เพื่อคำนวณยอดสุทธิเป็นบาทก่อนอนุมัติ
                    </div>
                    <div className="flex items-stretch rounded-[10px] border-[1.4px] border-line bg-white focus-within:border-navy">
                      <span className="rounded-l-[8px] border-r border-line bg-surface px-3 py-2 text-xs font-bold text-ink-2">
                        1 {expense.currency} =
                      </span>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={rateInput}
                        onChange={(e) => setRateInput(e.target.value)}
                        className="w-full border-0 bg-transparent px-3 py-2 text-base font-semibold text-ink outline-none"
                      />
                      <span className="rounded-r-[8px] border-l border-line bg-surface px-3 py-2 text-xs font-bold text-ink-2">
                        THB
                      </span>
                    </div>
                    <div className="font-mono text-xs text-ink-2">
                      {formatAmount(Number(expense.amount), expense.currency)} × {rate || "?"} ={" "}
                      <span className="font-bold text-ink">฿{thb(computedThb)}</span>
                    </div>
                  </>
                )}
              </div>
            </Section>
          </div>
        </div>
      </div>

      <footer className="border-t border-line bg-white px-7 py-4">
        {approveErr && (
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-status-rejected-bg px-3 py-1.5 text-xs text-status-rejected-fg">
            <AlertCircle className="size-3.5" /> {approveErr}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-ink-3">
            ตรวจสอบเรียบร้อยแล้ว ใช้ปุ่มด้านขวาเพื่ออนุมัติหรือปฏิเสธ
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-status-rejected-fg/40 bg-white px-4 py-2 text-sm font-semibold text-status-rejected-fg hover:bg-status-rejected-bg"
            >
              <X className="size-4" /> ปฏิเสธ
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={approvePending}
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-navy px-4 py-2 text-sm font-semibold text-white shadow-card hover:opacity-95 disabled:opacity-50"
            >
              <Check className="size-4" /> {approvePending ? "กำลังอนุมัติ…" : "อนุมัติ"}
            </button>
          </div>
        </div>
      </footer>

      {rejectOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/30 p-4"
          onClick={() => setRejectOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-ink">ปฏิเสธรายการนี้?</h2>
            <p className="mt-1 text-sm text-ink-2">
              กรุณาระบุเหตุผลเพื่อแจ้งให้ช่างภาพทราบ
            </p>
            <form action={rejectAction} className="mt-4 flex flex-col gap-3">
              <input type="hidden" name="id" value={expense.id} />
              <textarea
                name="reason"
                rows={3}
                required
                placeholder="เช่น ใบเสร็จไม่ชัดเจน"
                className="w-full resize-none rounded-[10px] border-[1.4px] border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy"
              />
              {rejectState?.error && (
                <div className="rounded-lg bg-status-rejected-bg px-3 py-2 text-sm text-status-rejected-fg">
                  {rejectState.error}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectOpen(false)}
                  className="rounded-[10px] border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-2"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={rejectPending}
                  className="rounded-[10px] bg-status-rejected-fg px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                >
                  {rejectPending ? "กำลังบันทึก…" : "ยืนยันปฏิเสธ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
        {icon}
        {title}
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-white">{children}</div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b border-line-soft px-4 py-2.5 last:border-0">
      <div className="w-28 shrink-0 text-xs text-ink-3">{label}</div>
      <div className={`min-w-0 flex-1 text-sm text-ink ${mono ? "font-mono font-bold" : ""}`}>
        {value}
      </div>
    </div>
  );
}

