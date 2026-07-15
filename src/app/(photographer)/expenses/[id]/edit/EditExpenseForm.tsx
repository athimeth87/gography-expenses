"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, ArrowLeftRight, Trash2 } from "lucide-react";
import { CategoryPicker } from "@/components/forms/CategoryPicker";
import { StatusPill } from "@/components/design/StatusPill";
import { CURRENCIES } from "@/lib/currencies";
import {
  updateExpenseAction,
  deleteDraftAction,
  navAfterEdit,
  type EditState,
} from "./actions";
import type { Expense, ExpenseCategory } from "@/types/database";

type Props = {
  expense: Expense;
  tripTitle: string;
  receiptUrl: string | null;
};

export function EditExpenseForm({ expense, tripTitle, receiptUrl }: Props) {
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [amount, setAmount] = useState<string>(
    expense.amount > 0 ? String(expense.amount) : ""
  );
  const [currency, setCurrency] = useState<string>(expense.currency ?? "THB");
  const [currencyTo, setCurrencyTo] = useState<string>("THB"); // To — สรุปเข้าบัญชี (ปกติ THB)
  const [expenseDate, setExpenseDate] = useState<string>(expense.expense_date);
  const [storeName, setStoreName] = useState<string>(expense.store_name ?? "");
  const [note, setNote] = useState<string>(expense.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(mode: "submit" | "draft") {
    setError(null);
    startTransition(async () => {
      const result: EditState = await updateExpenseAction({
        id: expense.id,
        category,
        amount: Number(amount) || 0,
        currency,
        expense_date: expenseDate,
        store_name: storeName.trim(),
        note: note.trim() || undefined,
        mode,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      await navAfterEdit(mode === "draft" ? "draft" : undefined);
    });
  }

  function onDelete() {
    if (!confirm("ลบ draft นี้ทิ้ง?")) return;
    startTransition(async () => {
      await deleteDraftAction(expense.id);
    });
  }

  const isDraft = expense.status === "draft";

  return (
    <div className="flex flex-1 flex-col pb-32">
      <header className="flex items-center justify-between px-5 pb-3 pt-5">
        <Link href="/history" className="text-ink-2">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="text-xs font-semibold text-ink-3">
          {isDraft ? "EDIT DRAFT" : "EDIT EXPENSE"}
        </div>
        <div className="size-5" />
      </header>

      <div className="flex flex-col gap-4 px-6">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            ทริป
          </div>
          <StatusPill status={expense.status} size="sm" />
        </div>
        <div className="rounded-[10px] border border-line bg-surface px-3 py-2.5 text-sm text-ink">
          {tripTitle}
        </div>

        {receiptUrl && (
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={receiptUrl} alt="receipt" className="max-h-72 w-full object-contain" />
          </div>
        )}

        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            หมวด
          </div>
          <CategoryPicker value={category} onChange={setCategory} />
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-2.5">
          <Field label="จำนวนที่จ่าย">
            <div className="flex items-stretch rounded-[10px] border-[1.4px] border-line bg-white focus-within:border-navy">
              <span className="flex items-center rounded-l-[8px] border-0 border-r border-line bg-surface px-3 text-xs font-bold text-ink">
                {currency}
              </span>
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                className="w-full border-0 bg-transparent px-3 py-2 text-base font-semibold text-ink outline-none"
              />
            </div>
          </Field>
          <Field label="วันที่">
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full rounded-[10px] border-[1.4px] border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy"
            />
          </Field>
        </div>

        <Field label="สกุลเงินที่แลก (จ่าย → สรุป)">
          <div className="flex items-center gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
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
              onClick={() => {
                const from = currency;
                setCurrency(currencyTo);
                setCurrencyTo(from);
              }}
              className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border-[1.4px] border-line bg-surface text-navy"
              aria-label="สลับสกุลเงิน"
            >
              <ArrowLeftRight className="size-4" />
            </button>
            <select
              value={currencyTo}
              onChange={(e) => setCurrencyTo(e.target.value)}
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
            {currency !== currencyTo
              ? `จ่ายจริงเป็น ${currency} · สรุปเข้าบัญชีเป็น ${currencyTo} — ทีมงานใส่เรตแปลงตอนอนุมัติ`
              : `จ่ายและสรุปเป็นสกุลเดียวกัน (${currency}) — ไม่ต้องแปลง`}
          </p>
        </Field>

        <Field label="ร้านค้า / สถานที่">
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="เช่น Khum Phaya Resort"
            className="w-full rounded-[10px] border-[1.4px] border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy"
          />
        </Field>

        <Field label="หมายเหตุ (ไม่บังคับ)">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-[10px] border-[1.4px] border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy"
          />
        </Field>

        {isDraft && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-line bg-white px-3 py-2 text-xs font-semibold text-status-rejected-fg hover:bg-status-rejected-bg disabled:opacity-50"
          >
            <Trash2 className="size-3.5" /> ลบ draft นี้
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
          {isDraft && (
            <button
              type="button"
              onClick={() => run("draft")}
              disabled={pending}
              className="flex h-12 flex-1 items-center justify-center rounded-[12px] border-[1.5px] border-line bg-white text-sm font-semibold text-ink-2 hover:bg-surface disabled:opacity-50"
            >
              {pending ? "กำลังบันทึก…" : "บันทึก draft"}
            </button>
          )}
          <button
            type="button"
            onClick={() => run("submit")}
            disabled={pending}
            className="flex h-12 flex-[1.4] items-center justify-center rounded-[12px] bg-navy text-sm font-semibold text-white shadow-nav transition-opacity disabled:opacity-50"
          >
            {pending ? "กำลังส่ง…" : isDraft ? "ส่งเบิก" : "บันทึกการแก้ไข"}
          </button>
        </div>
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
