import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listAssignedTrips } from "@/lib/queries/trips";
import { dateTh, thb } from "@/lib/format";
import { CatIcon } from "@/components/design/CatIcon";

export default async function TripsListPage() {
  const user = await requireRole("photographer");
  const trips = await listAssignedTrips(user.id);

  return (
    <div className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <h1 className="text-xl font-bold text-ink">ทริปของฉัน</h1>
      <p className="mt-1 text-sm text-ink-3">{trips.length} ทริปทั้งหมด</p>

      <div className="mt-5 flex flex-col gap-2.5">
        {trips.length === 0 && (
          <div className="rounded-2xl border border-line bg-white px-4 py-10 text-center text-sm text-ink-3">
            ยังไม่มีทริปที่ได้รับมอบหมาย
          </div>
        )}
        {trips.map((t) => (
          <Link
            key={t.id}
            href={`/trips/${t.id}`}
            className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 hover:border-navy-100"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-navy-50 text-navy">
              <CatIcon cat="hotel" size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">{t.title}</div>
              <div className="mt-0.5 text-[11px] text-ink-3">
                {dateTh(t.start_date)} → {dateTh(t.end_date)}
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-ink-2">
                <span>{t.expense_count} รายการ</span>
                <span className="text-ink-4">·</span>
                <span className="font-mono">฿{thb(t.total_amount)}</span>
              </div>
            </div>
            <ChevronRight className="size-4 text-ink-3" />
          </Link>
        ))}
      </div>
    </div>
  );
}
