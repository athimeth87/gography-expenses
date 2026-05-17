import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { createClient } from "@/lib/supabase/server";
import { ApprovalDetail } from "./ApprovalDetail";
import { ApprovalListClient, type ListRow } from "./ApprovalListClient";
import type { Expense, Profile, Trip } from "@/types/database";

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
    .select("*, profiles!user_id(name, email), trips(title)")
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

  const listRows: ListRow[] = rows.map((r) => ({
    id: r.id,
    category: r.category,
    amount: Number(r.amount),
    currency: r.currency,
    receipt_path: r.receipt_path,
    store_name: r.store_name,
    user_name: r.profiles?.name ?? null,
    trip_title: r.trips?.title ?? null,
  }));

  return (
    <>
      <AdminTopBar sub={`PENDING · ${rows.length}`} title="อนุมัติเบิก" />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[380px] shrink-0 flex-col border-r border-line bg-white">
          <ApprovalListClient rows={listRows} selectedId={selected?.id ?? null} />
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
