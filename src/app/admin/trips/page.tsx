import Link from "next/link";
import { MoreHorizontal, Image as ImageIcon } from "lucide-react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { listTripsForAdmin } from "@/lib/queries/trips";
import { thb } from "@/lib/format";
import { tripCoverUrl } from "@/lib/storage";
import { NewTripDialog } from "./NewTripDialog";

export default async function AdminTripsPage() {
  const trips = await listTripsForAdmin();
  const active = trips.filter((t) => t.status === "active").length;
  const closed = trips.filter((t) => t.status === "closed").length;

  return (
    <>
      <AdminTopBar
        sub="TRIP MANAGEMENT"
        title="ทริปทั้งหมด"
        actions={<NewTripDialog />}
      />
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="mb-4 flex items-center gap-2 text-sm">
          <Pill label={`All trips · ${trips.length}`} active />
          <Pill label={`Active · ${active}`} />
          <Pill label={`Closed · ${closed}`} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="w-8 px-4 py-3 text-left">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-3 text-left">Trip</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Photographers</th>
                <th className="px-4 py-3 text-left">Claims</th>
                <th className="px-4 py-3 text-right">Total spend</th>
                <th className="w-8 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-sm text-ink-3">
                    ยังไม่มีทริป — กดปุ่ม &ldquo;สร้างทริปใหม่&rdquo; ด้านบนเพื่อเริ่มต้น
                  </td>
                </tr>
              )}
              {trips.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-line transition-colors hover:bg-surface"
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Thumb path={t.cover_image_path} alt={t.title} />
                      <div className="min-w-0">
                        <Link
                          href={`/admin/trips/${t.id}`}
                          className="block truncate font-semibold text-ink hover:text-navy-700"
                        >
                          {t.title}
                        </Link>
                        {t.description && (
                          <div className="truncate text-xs text-ink-3">{t.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-2">
                    {t.start_date}
                    <br />
                    <span className="text-ink-4">→ {t.end_date}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {t.members.slice(0, 3).map((m, i) => (
                        <div
                          key={m.user_id}
                          title={m.name}
                          className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-navy-100 text-[10px] font-bold text-navy"
                          style={{ marginLeft: i === 0 ? 0 : -10 }}
                        >
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                      ))}
                      {t.members.length > 3 && (
                        <span className="ml-1 text-xs text-ink-3">
                          +{t.members.length - 3}
                        </span>
                      )}
                      {t.members.length === 0 && (
                        <span className="text-xs text-ink-4">ยังไม่มีช่างภาพ</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-2">
                    {t.expense_count} รายการ
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-ink">
                    ฿{thb(t.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <MoreHorizontal className="size-4 text-ink-3" />
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

function Thumb({ path, alt }: { path: string | null; alt: string }) {
  const url = tripCoverUrl(path);
  if (!url) {
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-300">
        <ImageIcon className="size-4" />
      </div>
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={url}
      alt={alt}
      className="size-10 shrink-0 rounded-lg border border-line object-cover"
    />
  );
}

function Pill({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        active ? "bg-navy text-white" : "border border-line bg-white text-ink-2"
      }`}
    >
      {label}
    </span>
  );
}
