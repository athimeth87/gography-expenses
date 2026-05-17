import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatusPill } from "@/components/design/StatusPill";
import { CatIcon } from "@/components/design/CatIcon";
import { thb, dateTh } from "@/lib/format";
import type { Expense, ExpenseStatus, Trip } from "@/types/database";

type Row = Expense & { trips: Pick<Trip, "title"> | null };

const FILTERS: { key: ExpenseStatus | "all"; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รออนุมัติ" },
  { key: "approved", label: "อนุมัติ" },
  { key: "rejected", label: "ปฏิเสธ" },
  { key: "paid", label: "จ่ายแล้ว" },
];

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireRole("photographer");
  const { filter = "all" } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("*, trips(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Row[];
  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  const total = rows.reduce((s, r) => s + Number(r.amount), 0);
  const paid = rows
    .filter((r) => r.status === "paid" || r.status === "approved")
    .reduce((s, r) => s + Number(r.amount), 0);
  const pending = rows
    .filter((r) => r.status === "pending")
    .reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <h1 className="text-xl font-bold text-ink">ประวัติการเบิก</h1>
      <p className="mt-1 text-sm text-ink-3">รายการทั้งหมดของฉัน</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="รวมทั้งหมด" value={`฿${thb(total)}`} />
        <Stat label="ได้เงิน" value={`฿${thb(paid)}`} tone="approved" />
        <Stat label="รอเงิน" value={`฿${thb(pending)}`} tone="pending" />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <Link
              key={f.key}
              href={`/history${f.key === "all" ? "" : `?filter=${f.key}`}`}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                isActive ? "bg-navy text-white" : "border border-line bg-white text-ink-2"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-line bg-white px-4 py-10 text-center text-sm text-ink-3">
            ยังไม่มีรายการ
          </div>
        )}
        {filtered.map((e) => (
          <div
            key={e.id}
            className="flex items-start gap-3 rounded-2xl border border-line bg-white p-3"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-navy-50 text-navy">
              <CatIcon cat={e.category} size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ink">
                    {e.store_name ?? "—"}
                  </div>
                  <div className="text-[11px] text-ink-3">
                    {e.trips?.title ?? ""} · {dateTh(e.expense_date)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold text-ink">
                    ฿{thb(Number(e.amount))}
                  </div>
                  <StatusPill status={e.status} size="sm" className="mt-1" />
                </div>
              </div>
              {e.admin_note && (
                <div className="mt-2 rounded-lg bg-status-rejected-bg px-2.5 py-1.5 text-[11px] text-status-rejected-fg">
                  เหตุผล: {e.admin_note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "approved" | "pending";
}) {
  const toneCls =
    tone === "approved"
      ? "text-status-approved-fg"
      : tone === "pending"
      ? "text-status-pending-fg"
      : "text-ink";
  return (
    <div className="rounded-2xl border border-line bg-white p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">{label}</div>
      <div className={`mt-1 font-mono text-base font-bold ${toneCls}`}>{value}</div>
    </div>
  );
}
