"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { CatIcon } from "@/components/design/CatIcon";
import { StatusPill } from "@/components/design/StatusPill";
import { dateTh } from "@/lib/format";
import { formatAmount } from "@/lib/currencies";
import { deleteExpenseAction } from "./actions";
import type { Expense } from "@/types/database";

type Props = {
  expense: Expense;
  tripTitle: string | null;
};

export function HistoryRow({ expense: e, tripTitle }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const editable = e.status === "draft" || e.status === "pending";
  const deletable = e.status !== "approved" && e.status !== "rejected";

  function onDelete() {
    if (!confirm("ลบรายการนี้ทิ้ง? ลบแล้วเอากลับไม่ได้")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteExpenseAction(e.id);
      if (result?.error) setError(result.error);
    });
  }

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink">
            {e.store_name?.trim() || (e.status === "draft" ? "ร่าง (ยังไม่กรอกร้าน)" : "—")}
          </div>
          <div className="text-[11px] text-ink-3">
            {tripTitle ?? ""} · {dateTh(e.expense_date)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-semibold text-ink">
            {formatAmount(Number(e.amount), e.currency)}
          </div>
          <StatusPill status={e.status} size="sm" className="mt-1" />
        </div>
      </div>
      {e.admin_note && (
        <div className="mt-2 rounded-lg bg-status-rejected-bg px-2.5 py-1.5 text-[11px] text-status-rejected-fg">
          เหตุผล: {e.admin_note}
        </div>
      )}
      {editable && (
        <div className="mt-1 text-[11px] font-semibold text-navy">
          {e.status === "draft" ? "แตะเพื่อกรอกข้อมูล →" : "แตะเพื่อแก้ไข →"}
        </div>
      )}
    </>
  );

  return (
    <div
      className={`relative flex items-start gap-3 rounded-2xl border border-line bg-white p-3 ${
        pending ? "opacity-50" : ""
      } ${editable ? "transition-colors hover:border-navy-100" : ""}`}
    >
      <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy">
        <CatIcon cat={e.category} size={22} />
        {e.status === "draft" && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-navy text-white">
            <Pencil className="size-2.5" />
          </span>
        )}
      </div>

      {editable ? (
        <Link href={`/expenses/${e.id}/edit`} className="min-w-0 flex-1">
          {body}
        </Link>
      ) : (
        <div className="min-w-0 flex-1">{body}</div>
      )}

      {deletable && (
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          aria-label="ลบรายการ"
          title="ลบรายการ"
          className="shrink-0 rounded-lg border border-line bg-white p-1.5 text-ink-3 transition-colors hover:border-status-rejected-fg/40 hover:text-status-rejected-fg disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}

      {error && (
        <div className="absolute -bottom-1 left-3 right-3 translate-y-full rounded-lg bg-status-rejected-bg px-2.5 py-1 text-[11px] text-status-rejected-fg">
          {error}
        </div>
      )}
    </div>
  );
}
