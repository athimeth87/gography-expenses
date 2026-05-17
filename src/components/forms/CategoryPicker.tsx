"use client";

import { CATEGORIES, type ExpenseCategory } from "@/lib/design-tokens";
import { CatIcon } from "@/components/design/CatIcon";
import { cn } from "@/lib/utils";

type Props = {
  value: ExpenseCategory;
  onChange: (cat: ExpenseCategory) => void;
};

export function CategoryPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {CATEGORIES.map((c) => {
        const isActive = value === c.key;
        return (
          <button
            type="button"
            key={c.key}
            onClick={() => onChange(c.key)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
              isActive
                ? "border-navy bg-navy text-white"
                : "border-line bg-white text-ink-2"
            )}
          >
            <CatIcon cat={c.key} size={16} color={isActive ? "#fff" : "#0A2540"} />
            {c.th}
          </button>
        );
      })}
    </div>
  );
}
