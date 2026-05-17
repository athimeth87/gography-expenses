import { cn } from "@/lib/utils";
import { STATUS, type ExpenseStatus } from "@/lib/design-tokens";

type Props = {
  status: ExpenseStatus;
  size?: "sm" | "md";
  className?: string;
};

export function StatusPill({ status, size = "md", className }: Props) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold leading-none tracking-wide",
        s.twBg,
        s.twFg,
        size === "sm" ? "px-2 py-[3px] text-[11px]" : "px-2.5 py-[5px] text-xs",
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.twFg, "bg-current")} />
      {s.th}
    </span>
  );
}
