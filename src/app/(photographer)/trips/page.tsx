import Link from "next/link";
import { ChevronRight, Image as ImageIcon } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listAssignedTrips } from "@/lib/queries/trips";
import { dateTh, thb } from "@/lib/format";
import { tripCoverUrl } from "@/lib/storage";

export default async function TripsListPage() {
  const user = await requireRole("photographer");
  const trips = await listAssignedTrips(user.id);

  return (
    <div className="flex flex-1 flex-col px-6 pb-6 pt-8 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-8 lg:py-10">
      <div>
        <div className="hidden text-[11px] font-semibold uppercase tracking-wider text-ink-3 lg:block">
          TRIPS
        </div>
        <h1 className="text-xl font-bold text-ink lg:mt-1 lg:text-2xl">ทริปของฉัน</h1>
        <p className="mt-1 text-sm text-ink-3">{trips.length} ทริปทั้งหมด</p>
      </div>

      <div className="mt-5 flex flex-col gap-2.5 lg:mt-6 lg:grid lg:grid-cols-2 lg:gap-4 xl:grid-cols-3">
        {trips.length === 0 && (
          <div className="rounded-2xl border border-line bg-white px-4 py-10 text-center text-sm text-ink-3">
            ยังไม่มีทริปที่ได้รับมอบหมาย
          </div>
        )}
        {trips.map((t) => {
          const cover = tripCoverUrl(t.cover_image_path);
          return (
            <Link
              key={t.id}
              href={`/trips/${t.id}`}
              className="overflow-hidden rounded-2xl border border-line bg-white transition-colors hover:border-navy-100"
            >
              {cover ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={cover}
                  alt={t.title}
                  className="aspect-[21/9] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[21/9] w-full items-center justify-center bg-navy-50 text-navy-300">
                  <ImageIcon className="size-6" />
                </div>
              )}
              <div className="flex items-center gap-3 p-4">
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
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
