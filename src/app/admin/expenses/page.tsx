import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { createClient } from "@/lib/supabase/server";
import { thb } from "@/lib/format";
import { StatusPill } from "@/components/design/StatusPill";
import { CatIcon } from "@/components/design/CatIcon";
import type { Expense, Profile, Trip } from "@/types/database";

type Row = Expense & { profiles: Pick<Profile, "name"> | null; trips: Pick<Trip, "title"> | null };

export default async function AllExpensesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("*, profiles(name), trips(title)")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as Row[];

  return (
    <>
      <AdminTopBar sub="ALL EXPENSES" title="รายการทั้งหมด" />
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-left">Trip</th>
                <th className="px-4 py-3 text-left">By</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-sm text-ink-3">
                    ยังไม่มีรายการ
                  </td>
                </tr>
              )}
              {rows.map((e) => (
                <tr key={e.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 items-center justify-center rounded-[10px] bg-navy-50 text-navy">
                        <CatIcon cat={e.category} size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ink">
                          {e.store_name ?? "(ไม่ระบุร้านค้า)"}
                        </div>
                        <div className="text-[11px] text-ink-3">{e.expense_date}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-2">{e.trips?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-ink-2">{e.profiles?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={e.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-ink">
                    ฿{thb(Number(e.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
