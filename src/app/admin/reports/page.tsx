import { Download } from "lucide-react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, type ExpenseCategory } from "@/lib/design-tokens";
import { StackedTripChart } from "@/components/admin/StackedTripChart";
import { thb } from "@/lib/format";

export default async function ReportsPage() {
  const supabase = await createClient();
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();

  const [{ data: rows }, { data: tripRows }, { data: photographerRows }] = await Promise.all([
    supabase
      .from("expenses")
      .select("amount_thb, status, category")
      .gte("created_at", yearStart)
      .neq("status", "draft"),
    supabase
      .from("trips")
      .select("id, title, expenses(amount_thb, category, status)")
      .limit(10),
    supabase
      .from("profiles")
      .select("id, name, expenses(amount_thb, status)")
      .eq("role", "photographer"),
  ]);

  const all = rows ?? [];
  const totalExpense = all.reduce((s, r) => s + Number(r.amount_thb), 0);
  const approved = all.filter((r) => r.status === "approved" || r.status === "paid");
  const approvedAmt = approved.reduce((s, r) => s + Number(r.amount_thb), 0);
  const paid = all.filter((r) => r.status === "paid");
  const paidAmt = paid.reduce((s, r) => s + Number(r.amount_thb), 0);
  const submittedCount = all.length;
  const approvedPct = submittedCount ? Math.round((approved.length / submittedCount) * 100) : 0;
  const paidPct = approved.length ? Math.round((paid.length / approved.length) * 100) : 0;
  const avgClaim = submittedCount ? Math.round(totalExpense / submittedCount) : 0;

  type TripRow = {
    id: string;
    title: string;
    expenses: { amount_thb: number; category: string; status: string }[] | null;
  };
  const stackedTripData = ((tripRows ?? []) as TripRow[])
    .map((t) => {
      const base: { title: string } & Record<ExpenseCategory, number> = {
        title: t.title,
        fuel: 0,
        hotel: 0,
        food: 0,
        trans: 0,
        park: 0,
        equip: 0,
        other: 0,
      };
      for (const e of t.expenses ?? []) {
        if (e.status === "draft") continue;
        base[e.category as ExpenseCategory] =
          (base[e.category as ExpenseCategory] ?? 0) + Number(e.amount_thb);
      }
      return base;
    })
    .filter((t) => CATEGORIES.some((c) => t[c.key] > 0))
    .slice(0, 6);

  type PhotographerRow = {
    id: string;
    name: string;
    expenses: { amount_thb: number; status: string }[] | null;
  };
  const leaderboard = ((photographerRows ?? []) as PhotographerRow[])
    .map((p) => {
      const exps = (p.expenses ?? []).filter((e) => e.status !== "draft");
      const total = exps.reduce((s, e) => s + Number(e.amount_thb), 0);
      const apr = exps.filter((e) => e.status === "approved" || e.status === "paid").length;
      const rej = exps.filter((e) => e.status === "rejected").length;
      const claims = exps.length;
      return {
        id: p.id,
        name: p.name,
        claims,
        approved: apr,
        rejectedPct: claims ? Math.round((rej / claims) * 100) : 0,
        total,
        avg: claims ? Math.round(total / claims) : 0,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const leaderMax = Math.max(1, ...leaderboard.map((l) => l.total));

  return (
    <>
      <AdminTopBar
        sub="REPORTS"
        title="รายงาน"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-navy px-3.5 py-2 text-sm font-semibold text-white"
          >
            <Download className="size-4" /> Export
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <Tile label="Total expense" value={`฿${thb(totalExpense)}`} sub={`${submittedCount} records`} />
          <Tile
            label="Approved"
            value={`฿${thb(approvedAmt)}`}
            sub={`${approved.length} · ${approvedPct}%`}
            tone="approved"
          />
          <Tile
            label="Paid"
            value={`฿${thb(paidAmt)}`}
            sub={`${paid.length} · ${paidPct}%`}
            tone="paid"
          />
          <Tile label="Avg / claim" value={`฿${thb(avgClaim)}`} sub={`${submittedCount} claims`} />
          <Tile label="Categories" value={String(CATEGORIES.length)} sub="enum-driven" />
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            Spend by Trip · Stacked by Category
          </div>
          {stackedTripData.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-ink-3">
              ยังไม่มีข้อมูล
            </div>
          ) : (
            <StackedTripChart data={stackedTripData} />
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            Photographer Leaderboard
          </div>
          <table className="w-full text-sm">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="py-2 text-left">Photographer</th>
                <th className="py-2 text-right">Claims</th>
                <th className="py-2 text-right">Approved</th>
                <th className="py-2 text-left">Spend</th>
                <th className="py-2 text-right">Avg</th>
                <th className="py-2 text-right">Reject %</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-ink-3">
                    ยังไม่มีข้อมูล
                  </td>
                </tr>
              )}
              {leaderboard.map((l) => {
                const rejectTone =
                  l.rejectedPct < 5
                    ? "text-status-approved-fg"
                    : l.rejectedPct < 10
                    ? "text-status-pending-fg"
                    : "text-status-rejected-fg";
                return (
                  <tr key={l.id} className="border-t border-line">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-full bg-navy-100 text-[10px] font-bold text-navy">
                          {l.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-ink">{l.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-xs text-ink-2">{l.claims}</td>
                    <td className="py-3 text-right text-xs text-ink-2">{l.approved}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-line-soft">
                          <div
                            className="h-full bg-navy"
                            style={{ width: `${(l.total / leaderMax) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold text-ink">
                          ฿{thb(l.total)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-ink-2">
                      ฿{thb(l.avg)}
                    </td>
                    <td className={`py-3 text-right text-xs font-semibold ${rejectTone}`}>
                      {l.rejectedPct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Tile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "approved" | "paid";
}) {
  const valueCls =
    tone === "approved"
      ? "text-status-approved-fg"
      : tone === "paid"
      ? "text-status-paid-fg"
      : "text-ink";
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </div>
      <div className={`mt-1.5 text-lg font-bold ${valueCls}`}>{value}</div>
      {sub && <div className="mt-0.5 font-mono text-[11px] text-ink-3">{sub}</div>}
    </div>
  );
}
