import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { createClient } from "@/lib/supabase/server";
import { AddPhotographerDialog } from "./AddPhotographerDialog";
import type { Profile } from "@/types/database";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at");
  const list = (profiles ?? []) as Profile[];

  return (
    <>
      <AdminTopBar
        sub="TEAM"
        title="ทีมงาน"
        actions={<AddPhotographerDialog />}
      />
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center text-sm text-ink-3">
                    ยังไม่มีสมาชิก
                  </td>
                </tr>
              )}
              {list.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-full bg-navy-100 text-[11px] font-bold text-navy">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="text-sm font-semibold text-ink">{p.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-2">{p.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.role === "admin"
                          ? "bg-navy text-white"
                          : "bg-navy-50 text-navy"
                      }`}
                    >
                      {p.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-3">
                    {new Date(p.created_at).toLocaleDateString("th-TH")}
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
