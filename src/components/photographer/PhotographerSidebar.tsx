"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Folder, Plus, Receipt, User, LogOut } from "lucide-react";
import { Logo } from "@/components/design/Logo";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type NavItem = {
  key: string;
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const ITEMS: NavItem[] = [
  { key: "home", label: "หน้าหลัก", href: "/dashboard", Icon: Home },
  { key: "trips", label: "ทริปของฉัน", href: "/trips", Icon: Folder },
  { key: "history", label: "ประวัติ", href: "/history", Icon: Receipt },
  { key: "me", label: "บัญชี", href: "/me", Icon: User },
];

type Props = {
  profile?: { name: string; role: string } | null;
};

export function PhotographerSidebar({ profile }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = (profile?.name ?? "Me").slice(0, 2).toUpperCase();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col gap-1 border-r border-line bg-white px-4 py-5 lg:flex">
      <div className="flex items-center gap-2.5 px-2 pb-4">
        <Logo size={36} />
        <div>
          <div className="text-[15px] font-bold tracking-tight text-ink">GoGraphy</div>
          <div className="text-[11px] text-ink-3">Photographer Crew</div>
        </div>
      </div>

      <Link
        href="/expenses/new"
        className="mb-3 inline-flex items-center justify-center gap-1.5 rounded-[12px] bg-navy px-3 py-2.5 text-sm font-semibold text-white shadow-nav"
      >
        <Plus className="size-4" strokeWidth={2.4} /> เพิ่มค่าใช้จ่าย
      </Link>

      <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-4">
        เมนู
      </div>

      {ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors",
              isActive
                ? "bg-navy-50 font-semibold text-navy"
                : "text-ink-2 hover:bg-surface"
            )}
          >
            <item.Icon
              className="size-[18px] shrink-0"
              strokeWidth={isActive ? 2 : 1.6}
            />
            {item.label}
          </Link>
        );
      })}

      <div className="mt-auto flex items-center gap-2.5 rounded-[10px] border border-line bg-surface px-3 py-2.5">
        <div className="flex size-8 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-ink">
            {profile?.name ?? "Photographer"}
          </div>
          <div className="text-[10px] text-ink-3">Crew member</div>
        </div>
        <button
          type="button"
          onClick={signOut}
          aria-label="ออกจากระบบ"
          title="ออกจากระบบ"
          className="text-ink-3 hover:text-ink"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
}
