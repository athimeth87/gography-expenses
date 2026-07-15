"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Folder,
  Inbox,
  Receipt,
  BarChart3,
  Users,
  Banknote,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/design/Logo";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type NavItem = {
  key: string;
  label: string;
  th: string;
  href: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number;
};

type Props = {
  profile?: { name: string; role: string } | null;
  pendingCount?: number;
};

export function AdminSidebar({ profile, pendingCount = 0 }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const manage: NavItem[] = [
    { key: "dashboard", label: "Dashboard", th: "ภาพรวม", href: "/admin/dashboard", Icon: LayoutGrid },
    { key: "trips", label: "Trip Management", th: "ทริปทั้งหมด", href: "/admin/trips", Icon: Folder },
    {
      key: "approval",
      label: "Approval Queue",
      th: "อนุมัติเบิก",
      href: "/admin/approvals",
      Icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { key: "expenses", label: "All Expenses", th: "รายการทั้งหมด", href: "/admin/expenses", Icon: Receipt },
    { key: "reports", label: "Reports", th: "รายงาน", href: "/admin/reports", Icon: BarChart3 },
    { key: "team", label: "Members", th: "สมาชิก & สิทธิ์", href: "/admin/team", Icon: Users },
  ];

  const backOffice: NavItem[] = [
    { key: "payouts", label: "Payouts", th: "การจ่ายเงิน", href: "/admin/payouts", Icon: Banknote },
    { key: "settings", label: "Settings", th: "ตั้งค่าระบบ", href: "/admin/settings", Icon: Settings },
  ];

  const renderItem = (item: NavItem) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.key}
        href={item.href}
        className={cn(
          "relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-colors",
          isActive ? "bg-white/14 font-semibold text-white" : "text-white/70 hover:bg-white/8"
        )}
      >
        {isActive && (
          <span className="absolute -left-3.5 bottom-2 top-2 w-[3px] rounded-sm bg-white" />
        )}
        <item.Icon className="size-[18px] shrink-0" strokeWidth={isActive ? 2 : 1.6} />
        <div className="min-w-0 flex-1">
          <div>{item.label}</div>
          <div className="mt-px text-[10px] font-medium text-white/50">{item.th}</div>
        </div>
        {item.badge !== undefined && (
          <span className="rounded-full bg-white px-1.5 py-px text-[10px] font-bold text-navy">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const initials = (profile?.name ?? "Admin").slice(0, 2);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-[250px] shrink-0 flex-col gap-1 bg-navy px-3.5 py-5 text-white">
      <div className="flex items-center gap-2.5 px-2.5 pb-4 pt-1">
        <Logo size={32} white />
        <div>
          <div className="text-[15px] font-bold tracking-tight">GoGraphy</div>
          <div className="text-[11px] text-white/55">Admin Workspace</div>
        </div>
      </div>

      <div className="mx-1 mb-3.5 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
        <div className="flex size-6 items-center justify-center rounded-lg bg-white text-[12px] font-bold text-navy">
          GG
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold">{profile?.name ?? "Workspace"}</div>
          <div className="text-[10px] text-white/55">Workspace · Pro</div>
        </div>
        <ChevronRight className="size-3.5 text-white/55" />
      </div>

      <div className="px-3.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">
        Manage
      </div>
      {manage.map(renderItem)}

      <div className="mt-2 px-3.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">
        หลังบ้าน
      </div>
      {backOffice.map(renderItem)}

      <div className="mt-auto">
        <div className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-[10px] bg-white text-xs font-bold text-navy">
            {initials.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">{profile?.name ?? "Admin"}</div>
            <div className="text-[10px] text-white/55">Owner · Admin</div>
          </div>
          <button
            type="button"
            onClick={signOut}
            aria-label="ออกจากระบบ"
            title="ออกจากระบบ"
            className="text-white/60 hover:text-white"
          >
            <LogOut className="size-4" />
          </button>
          <Settings className="size-4 text-white/40" />
        </div>
      </div>
    </aside>
  );
}
