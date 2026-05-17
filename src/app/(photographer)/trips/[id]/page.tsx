import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CatIcon } from "@/components/design/CatIcon";
import { StatusPill } from "@/components/design/StatusPill";
import { thb, dateTh } from "@/lib/format";
import type { Expense, ExpenseStatus } from "@/types/database";

const FILTERS: { key: ExpenseStatus | "all"; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รออนุมัติ" },
  { key: "approved", label: "อนุมัติ" },
  { key: "rejected", label: "ปฏิเสธ" },
];

export default async function PhotographerTripDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireRole("photographer");
  const { id } = await params;
  const { filter = "all" } = await searchParams;

  const supabase = await createClient();
  const { data: trip } = await supabase.from("trips").select("*").eq("id", id).single();
  if (!trip) notFound();

  const { data: rows } = await supabase
    .from("expenses")
    .select("*")
    .eq("trip_id", id)
    .eq("user_id", user.id)
    .order("expense_date", { ascending: false });

  const expenses = (rows ?? []) as Expense[];
  const filtered =
    filter === "all" ? expenses : expenses.filter((e) => e.status === filter);

  const totals = {
    all: expenses.reduce((s, e) => s + Number(e.amount), 0),
    approved: expenses
      .filter((e) => e.status === "approved" || e.status === "paid")
      .reduce((s, e) => s + Number(e.amount), 0),
    pending: expenses
      .filter((e) => e.status === "pending")
      .reduce((s, e) => s + Number(e.amount), 0),
  };

  const grouped = filtered.reduce<Record<string, Expense[]>>((acc, e) => {
    (acc[e.expense_date] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 pb-3 pt-5">
        <Link href="/trips" className="text-ink-2">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="text-xs font-semibold text-ink-3">TRIP DETAIL</div>
        <div className="size-5" />
      </header>

      <div className="px-6">
        <h1 className="text-xl font-bold text-ink">{trip.title}</h1>
        <div className="mt-2 flex items-center gap-2 text-xs text-ink-2">
          <MapPin className="size-3.5 text-ink-3" />
          {dateTh(trip.start_date)} → {dateTh(trip.end_date)}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-navy p-4 text-white shadow-card">
          <Stat label="ยอดรวม" value={`฿${thb(totals.all)}`} />
          <Stat label="อนุมัติ" value={`฿${thb(totals.approved)}`} />
          <Stat label="รออนุมัติ" value={`฿${thb(totals.pending)}`} />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            return (
              <Link
                key={f.key}
                href={`/trips/${id}${f.key === "all" ? "" : `?filter=${f.key}`}`}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  isActive
                    ? "bg-navy text-white"
                    : "border border-line bg-white text-ink-2"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {Object.entries(grouped).length === 0 && (
            <div className="rounded-2xl border border-line bg-white px-4 py-8 text-center text-sm text-ink-3">
              ยังไม่มีรายการในทริปนี้
            </div>
          )}
          {Object.entries(grouped).map(([date, items]) => (
            <section key={date}>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                {dateTh(date)}
              </div>
              <div className="flex flex-col gap-2">
                {items.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3"
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-navy-50 text-navy">
                      <CatIcon cat={e.category} size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink">
                        {e.store_name ?? "—"}
                      </div>
                      {e.note && (
                        <div className="truncate text-[11px] text-ink-3">{e.note}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold text-ink">
                        ฿{thb(Number(e.amount))}
                      </div>
                      <StatusPill status={e.status} size="sm" className="mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <Link
        href={`/expenses/new?trip=${id}`}
        className="fixed bottom-24 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white shadow-fab"
      >
        <Plus className="size-4" strokeWidth={2.4} /> เพิ่มค่าใช้จ่าย
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/55">{label}</div>
      <div className="mt-0.5 text-sm font-bold">{value}</div>
    </div>
  );
}
