import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/design/Logo";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function MePage() {
  const user = await requireRole("photographer");
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email, role, created_at")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <h1 className="text-xl font-bold text-ink">บัญชีของฉัน</h1>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
        <Logo size={36} />
        <div>
          <div className="text-base font-semibold text-ink">{profile?.name ?? user.email}</div>
          <div className="text-xs text-ink-3">{profile?.email ?? user.email}</div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-line bg-white p-4">
        <Field label="บทบาท" value={profile?.role ?? "—"} />
        <Field
          label="เป็นสมาชิกตั้งแต่"
          value={
            profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("th-TH")
              : "—"
          }
        />
      </div>

      <div className="mt-auto pt-6">
        <SignOutButton />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line-soft py-2.5 last:border-0">
      <span className="text-xs text-ink-3">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}
