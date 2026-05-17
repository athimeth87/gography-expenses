import Link from "next/link";
import { Bell, ChevronRight, Clock, CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/design/Logo";
import { StatusPill } from "@/components/design/StatusPill";
import { CatIcon } from "@/components/design/CatIcon";
import { listAssignedTrips } from "@/lib/queries/trips";
import { thb, dateTh } from "@/lib/format";
import { formatAmount } from "@/lib/currencies";
import { tripCoverUrl } from "@/lib/storage";
import type { Expense, ExpenseStatus } from "@/types/database";

export default async function PhotographerDashboard() {
  const user = await requireRole("photographer");
  const supabase = await createClient();

  const [{ data: profile }, trips, { data: myExpenses }] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", user.id).single(),
    listAssignedTrips(user.id),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const expenses = (myExpenses ?? []) as Expense[];
  const count = (s: ExpenseStatus) => expenses.filter((e) => e.status === s).length;
  const sum = (s: ExpenseStatus) =>
    expenses.filter((e) => e.status === s).reduce((acc, e) => acc + Number(e.amount_thb), 0);

  return (
    <div className="flex flex-1 flex-col px-6 pb-6 pt-8 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-8 lg:py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 lg:hidden">
          <Logo size={32} />
          <div>
            <div className="text-sm text-ink-3">สวัสดี</div>
            <div className="text-base font-semibold text-ink">{profile?.name ?? user.email}</div>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            DASHBOARD
          </div>
          <h1 className="mt-1 text-2xl font-bold text-ink">
            สวัสดี {profile?.name ?? user.email}
          </h1>
        </div>
        <Link
          href="/me"
          className="relative flex size-10 items-center justify-center rounded-full bg-surface text-ink-2 lg:bg-white lg:border lg:border-line"
        >
          <Bell className="size-4" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-status-rejected-fg" />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-3 lg:gap-5">
        <div className="rounded-2xl bg-navy p-5 text-white shadow-card lg:col-span-1 lg:p-6">
          <div className="text-xs text-white/65">ยอดรวมที่เบิก (เดือนนี้)</div>
          <div className="mt-1 text-3xl font-bold lg:text-4xl">
            ฿{thb(sum("approved") + sum("paid") + sum("pending"))}
          </div>
          <div className="mt-1 text-xs text-white/55">
            {expenses.length} รายการล่าสุด
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 lg:col-span-2 lg:gap-3">
          <Stat label="รออนุมัติ" count={count("pending")} value={`฿${thb(sum("pending"))}`} tone="pending" Icon={Clock} />
          <Stat label="อนุมัติ" count={count("approved")} value={`฿${thb(sum("approved"))}`} tone="approved" Icon={CheckCircle2} />
          <Stat label="ถูกปฏิเสธ" count={count("rejected")} value={`฿${thb(sum("rejected"))}`} tone="rejected" Icon={XCircle} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-2 lg:gap-6">
        <section>
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              ทริปของฉัน
            </div>
            <Link href="/trips" className="text-xs font-semibold text-navy">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {trips.length === 0 && (
              <div className="rounded-2xl border border-line bg-white px-4 py-8 text-center text-sm text-ink-3">
                ยังไม่มีทริปที่ได้รับมอบหมาย
              </div>
            )}
            {trips.slice(0, 3).map((t) => {
              const cover = tripCoverUrl(t.cover_image_path);
              return (
                <Link
                  key={t.id}
                  href={`/trips/${t.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 transition-colors hover:border-navy-100"
                >
                  {cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={cover}
                      alt={t.title}
                      className="size-14 shrink-0 rounded-xl border border-line object-cover lg:size-16"
                    />
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-300 lg:size-16">
                      <ImageIcon className="size-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{t.title}</div>
                    <div className="mt-0.5 text-[11px] text-ink-3">
                      {dateTh(t.start_date)} → {dateTh(t.end_date)}
                    </div>
                    <div className="mt-1 text-[11px] text-ink-2">
                      {t.expense_count} รายการ · ฿{thb(t.total_amount)}
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-ink-3" />
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            รายการล่าสุด
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {expenses.length === 0 && (
              <div className="rounded-2xl border border-line bg-white px-4 py-6 text-center text-sm text-ink-3">
                ยังไม่มีรายการ — ลองเพิ่มจากปุ่ม + ด้านล่าง
              </div>
            )}
            {expenses.map((e) => (
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
                  <div className="text-[11px] text-ink-3">{e.expense_date}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold text-ink">
                    {formatAmount(Number(e.amount), e.currency)}
                  </div>
                  <StatusPill status={e.status} size="sm" className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  count,
  value,
  tone,
  Icon,
}: {
  label: string;
  count: number;
  value: string;
  tone: "pending" | "approved" | "rejected";
  Icon: React.ComponentType<{ className?: string }>;
}) {
  const toneCls = {
    pending: "bg-status-pending-bg text-status-pending-fg",
    approved: "bg-status-approved-bg text-status-approved-fg",
    rejected: "bg-status-rejected-bg text-status-rejected-fg",
  }[tone];
  return (
    <div className="rounded-2xl border border-line bg-white p-3">
      <div className={`mb-1.5 flex size-7 items-center justify-center rounded-lg ${toneCls}`}>
        <Icon className="size-3.5" />
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">{label}</div>
      <div className="text-base font-bold text-ink">{count}</div>
      <div className="font-mono text-[10px] text-ink-3">{value}</div>
    </div>
  );
}
