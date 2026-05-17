import Link from "next/link";
import { Clock, CheckCircle2, XCircle, Wallet, ChevronRight } from "lucide-react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { createClient } from "@/lib/supabase/server";
import { thb } from "@/lib/format";
import { CATEGORIES, type ExpenseCategory } from "@/lib/design-tokens";
import { MonthlyBarChart, CategoryDonut } from "@/components/admin/DashboardCharts";
import { CatIcon } from "@/components/design/CatIcon";
import { StatusPill } from "@/components/design/StatusPill";
import type { Expense, Profile, Trip } from "@/types/database";

type RowJoined = Expense & {
  profiles: Pick<Profile, "name"> | null;
  trips: Pick<Trip, "title"> | null;
};

export default async function AdminDashboard() {
  const supabase = await createClient();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const [{ data: mtdRows }, { data: histRows }, { data: pendingRows }, { data: topTrips }] =
    await Promise.all([
      supabase
        .from("expenses")
        .select("amount, status, category, created_at")
        .gte("created_at", monthStart),
      supabase
        .from("expenses")
        .select("amount, expense_date")
        .gte("expense_date", sixMonthsAgo.toISOString().slice(0, 10))
        .in("status", ["approved", "paid", "pending"]),
      supabase
        .from("expenses")
        .select("*, profiles(name), trips(title)")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("trips")
        .select("id, title, expenses(amount, status)")
        .limit(20),
    ]);

  const mtd = mtdRows ?? [];
  const sum = (s: string) =>
    mtd.filter((r) => r.status === s).reduce((acc, r) => acc + Number(r.amount), 0);
  const count = (s: string) => mtd.filter((r) => r.status === s).length;
  const totalSpend = mtd
    .filter((r) => r.status === "approved" || r.status === "paid")
    .reduce((acc, r) => acc + Number(r.amount), 0);

  const months: { month: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    d.setDate(1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleString("en-US", { month: "short" });
    months.push({ month: label, total: 0 });
    const total = (histRows ?? [])
      .filter((r) => r.expense_date.startsWith(key))
      .reduce((acc, r) => acc + Number(r.amount), 0);
    months[months.length - 1].total = total;
  }

  const catTotals = new Map<ExpenseCategory, number>();
  for (const r of mtd) {
    catTotals.set(
      r.category as ExpenseCategory,
      (catTotals.get(r.category as ExpenseCategory) ?? 0) + Number(r.amount)
    );
  }
  const pieData = CATEGORIES.filter((c) => (catTotals.get(c.key) ?? 0) > 0).map((c) => ({
    key: c.key,
    name: c.th,
    value: catTotals.get(c.key) ?? 0,
  }));

  type TripRow = { id: string; title: string; expenses: { amount: number; status: string }[] | null };
  const topList = ((topTrips ?? []) as TripRow[])
    .map((t) => {
      const exps = t.expenses ?? [];
      return {
        id: t.id,
        title: t.title,
        total: exps.reduce((s, e) => s + Number(e.amount), 0),
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);
  const topMax = Math.max(1, ...topList.map((t) => t.total));

  const month = new Date()
    .toLocaleString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();

  return (
    <>
      <AdminTopBar sub={`DASHBOARD · ${month}`} title="ภาพรวมระบบ" />
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Total Spend · MTD" value={`฿${thb(totalSpend)}`} Icon={Wallet} tone="navy" />
          <Kpi
            label="Pending Claims"
            value={`${count("pending")}`}
            sub={`฿${thb(sum("pending"))}`}
            Icon={Clock}
            tone="pending"
          />
          <Kpi
            label="Approved · MTD"
            value={`${count("approved")}`}
            sub={`฿${thb(sum("approved"))}`}
            Icon={CheckCircle2}
            tone="approved"
          />
          <Kpi
            label="Rejected · MTD"
            value={`${count("rejected")}`}
            sub={`฿${thb(sum("rejected"))}`}
            Icon={XCircle}
            tone="rejected"
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Expenses · 6 months
              </div>
            </div>
            <MonthlyBarChart data={months} />
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              By Category · MTD
            </div>
            {pieData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-ink-3">
                ยังไม่มีรายการในเดือนนี้
              </div>
            ) : (
              <CategoryDonut data={pieData} />
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Pending Approvals
              </div>
              <Link href="/admin/approvals" className="text-xs font-semibold text-navy">
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="flex flex-col">
              {(pendingRows as RowJoined[] | null)?.length ? (
                ((pendingRows as RowJoined[]) ?? []).map((r) => (
                  <Link
                    key={r.id}
                    href={`/admin/approvals?id=${r.id}`}
                    className="flex items-center gap-3 border-b border-line-soft py-2.5 last:border-0"
                  >
                    <div className="flex size-9 items-center justify-center rounded-[10px] bg-navy-50 text-navy">
                      <CatIcon cat={r.category} size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink">
                        {r.store_name ?? "—"}
                      </div>
                      <div className="text-[11px] text-ink-3">
                        {r.profiles?.name ?? "—"} · {r.trips?.title ?? ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold text-ink">
                        ฿{thb(Number(r.amount))}
                      </div>
                      <StatusPill status="pending" size="sm" className="mt-1" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-ink-3">
                  ไม่มีรายการรออนุมัติ
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              Top Trips · By Spend
            </div>
            {topList.length === 0 ? (
              <div className="py-8 text-center text-sm text-ink-3">ยังไม่มีทริป</div>
            ) : (
              <div className="flex flex-col gap-3">
                {topList.map((t) => (
                  <Link
                    key={t.id}
                    href={`/admin/trips/${t.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate text-ink">{t.title}</span>
                      <span className="font-mono font-semibold text-ink">
                        ฿{thb(t.total)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line-soft">
                      <div
                        className="h-full bg-navy"
                        style={{ width: `${(t.total / topMax) * 100}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Kpi({
  label,
  value,
  sub,
  Icon,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: "navy" | "pending" | "approved" | "rejected";
}) {
  const toneCls = {
    navy: "bg-navy-50 text-navy",
    pending: "bg-status-pending-bg text-status-pending-fg",
    approved: "bg-status-approved-bg text-status-approved-fg",
    rejected: "bg-status-rejected-bg text-status-rejected-fg",
  }[tone];
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
          {label}
        </div>
        <div className={`flex size-9 items-center justify-center rounded-[10px] ${toneCls}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-bold text-ink">{value}</div>
      {sub && <div className="mt-1 font-mono text-sm text-ink-3">{sub}</div>}
    </div>
  );
}
