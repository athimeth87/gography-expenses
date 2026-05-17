import { Search, Bell } from "lucide-react";

type Props = {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
};

export function AdminTopBar({ title, sub, actions }: Props) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line bg-white px-7 pb-4 pt-5">
      <div>
        {sub && (
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            {sub}
          </div>
        )}
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-ink">{title}</h1>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex h-[38px] w-[280px] items-center gap-2 rounded-[10px] border border-line bg-surface px-3">
          <Search className="size-4 text-ink-3" />
          <span className="text-[13px] text-ink-4">ค้นหา trip, expense, ช่างภาพ…</span>
          <span className="ml-auto rounded border border-line bg-white px-1.5 py-px font-mono text-[10px] text-ink-3">
            ⌘K
          </span>
        </div>
        <div className="relative flex size-[38px] items-center justify-center rounded-[10px] border border-line bg-surface">
          <Bell className="size-4 text-ink-2" />
          <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-status-rejected-fg" />
        </div>
        {actions}
      </div>
    </header>
  );
}
