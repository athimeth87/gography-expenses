"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Folder, Plus, Receipt, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = {
  key: string;
  label: string;
  href: string;
  Icon: typeof Home;
  center?: boolean;
};

const TABS: Tab[] = [
  { key: "home", label: "หน้าหลัก", href: "/dashboard", Icon: Home },
  { key: "trips", label: "ทริป", href: "/trips", Icon: Folder },
  { key: "add", label: "เพิ่ม", href: "/expenses/new", Icon: Plus, center: true },
  { key: "history", label: "ประวัติ", href: "/history", Icon: Receipt },
  { key: "me", label: "ฉัน", href: "/me", Icon: User },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-30 flex shrink-0 justify-around gap-1 border-t border-line bg-white px-2.5 pb-6 pt-2 lg:hidden">
      {TABS.map(({ key, label, href, Icon, center }) => {
        const isActive =
          pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        if (center) {
          return (
            <Link
              key={key}
              href={href}
              className="flex flex-1 flex-col items-center gap-1"
              aria-label={label}
            >
              <div className="flex size-11 items-center justify-center rounded-[14px] bg-navy text-white shadow-nav">
                <Icon className="size-[22px]" strokeWidth={2.2} />
              </div>
            </Link>
          );
        }
        return (
          <Link
            key={key}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 transition-colors",
              isActive ? "text-navy" : "text-ink-4"
            )}
          >
            <Icon className="size-[22px]" strokeWidth={isActive ? 2 : 1.6} />
            <span className={cn("text-[10.5px]", isActive ? "font-semibold" : "font-medium")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
