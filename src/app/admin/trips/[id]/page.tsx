import { notFound } from "next/navigation";
import { Calendar, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { getTripWithMembers, listPhotographers } from "@/lib/queries/trips";
import { createClient } from "@/lib/supabase/server";
import { thb, dateTh } from "@/lib/format";
import { AssignmentEditor } from "./AssignmentEditor";
import { CoverEditor } from "./CoverEditor";
import { tripCoverUrl } from "@/lib/storage";

export default async function AdminTripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getTripWithMembers(id);
  if (!result) notFound();
  const { trip, members } = result;
  const photographers = await listPhotographers();

  const supabase = await createClient();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, amount_thb, status")
    .eq("trip_id", id)
    .neq("status", "draft");
  const total = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount_thb), 0);

  return (
    <>
      <AdminTopBar
        sub="TRIP DETAIL"
        title={trip.title}
        actions={
          <Link
            href="/admin/trips"
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink-2 hover:bg-surface"
          >
            <ChevronLeft className="size-4" />
            กลับ
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          <section className="md:col-span-2 space-y-4">
            <div className="overflow-hidden rounded-2xl bg-white shadow-card">
              {tripCoverUrl(trip.cover_image_path) && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={tripCoverUrl(trip.cover_image_path)!}
                  alt={trip.title}
                  className="aspect-[21/9] w-full object-cover"
                />
              )}
              <div className="p-6">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                  Trip
                </div>
                <h2 className="mt-1 text-xl font-bold text-ink">{trip.title}</h2>
              {trip.description && (
                <p className="mt-2 text-sm text-ink-2">{trip.description}</p>
              )}
              <div className="mt-4 flex items-center gap-2 text-sm text-ink-2">
                <Calendar className="size-4 text-ink-3" />
                {dateTh(trip.start_date)} → {dateTh(trip.end_date)}
              </div>
              <div className="mt-3 flex gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    trip.status === "active"
                      ? "bg-status-approved-bg text-status-approved-fg"
                      : "bg-status-draft-bg text-status-draft-fg"
                  }`}
                >
                  {trip.status === "active" ? "Active" : "Closed"}
                </span>
              </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Stat label="ยอดเบิกรวม" value={`฿${thb(total)}`} />
              <Stat label="จำนวนรายการ" value={(expenses ?? []).length.toString()} />
              <Stat
                label="ช่างภาพในทริป"
                value={members.length.toString()}
              />
            </div>
          </section>

          <section className="md:col-span-1 space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Cover Image
              </div>
              <CoverEditor tripId={trip.id} initialPath={trip.cover_image_path} />
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Photographers
              </div>
              <AssignmentEditor
                tripId={trip.id}
                photographers={photographers}
                initialMemberIds={members.map((m) => m.id)}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold text-ink">{value}</div>
    </div>
  );
}
