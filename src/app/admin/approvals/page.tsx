import Link from "next/link";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_TH } from "@/lib/design-tokens";
import { thb, dateTh } from "@/lib/format";
import { StatusPill } from "@/components/design/StatusPill";
import { CatIcon } from "@/components/design/CatIcon";
import { ApprovalDetail } from "./ApprovalDetail";
import type { Expense, Profile, Trip } from "@/types/database";
import { cn } from "@/lib/utils";

type Row = Expense & {
  profiles: Pick<Profile, "name" | "email"> | null;
  trips: Pick<Trip, "title"> | null;
};

export default async function AdminApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id: selectedId } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("*, profiles(name, email), trips(title)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Row[];
  const selected = selectedId
    ? rows.find((r) => r.id === selectedId) ?? rows[0]
    : rows[0];

  let signedUrl: string | null = null;
  if (selected?.receipt_path) {
    const { data: signed } = await supabase.storage
      .from("receipts")
      .createSignedUrl(selected.receipt_path, 3600);
    signedUrl = signed?.signedUrl ?? null;
  }

  return (
    <>
      <AdminTopBar sub={`PENDING · ${rows.length}`} title="อนุมัติเบิก" />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[380px] shrink-0 flex-col border-r border-line bg-white">
          <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5 text-xs font-semibold text-ink-2">
            <span className="rounded-full bg-navy px-2.5 py-0.5 text-white">
              Pending · {rows.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {rows.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-ink-3">
                ไม่มีรายการรออนุมัติ
              </div>
            )}
            {rows.map((r) => {
              const isSelected = selected?.id === r.id;
              return (
                <Link
                  key={r.id}
                  href={`/admin/approvals?id=${r.id}`}
                  className={cn(
                    "relative block border-b border-line-soft px-4 py-3 transition-colors",
                    isSelected ? "bg-navy-50" : "hover:bg-surface"
                  )}
                >
                  {isSelected && (
                    <span className="absolute inset-y-2 left-0 w-1 rounded-r-sm bg-navy" />
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-navy">
                        <CatIcon cat={r.category} size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-ink">
                          {r.store_name ?? "(ไม่ระบุร้านค้า)"}
                        </div>
                        <div className="text-[11px] text-ink-3">
                          {CATEGORY_TH[r.category]} · {r.profiles?.name ?? "—"}
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-ink-2">
                          {r.trips?.title ?? ""}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-sm font-semibold text-ink">
                        ฿{thb(Number(r.amount))}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-ink-3">
                        {r.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0 flex-1 overflow-y-auto bg-surface">
          {selected ? (
            <ApprovalDetail
              expense={selected}
              receiptUrl={signedUrl}
              storeName={selected.store_name}
              tripTitle={selected.trips?.title ?? null}
              submitterName={selected.profiles?.name ?? null}
              submitterEmail={selected.profiles?.email ?? null}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink-3">
              ไม่มีรายการให้แสดง
            </div>
          )}
        </section>
      </div>
    </>
  );
}
