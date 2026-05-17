"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { updateAssignmentsAction } from "../actions";
import type { Profile } from "@/types/database";

type Props = {
  tripId: string;
  photographers: Profile[];
  initialMemberIds: string[];
};

export function AssignmentEditor({ tripId, photographers, initialMemberIds }: Props) {
  const [selected, setSelected] = useState(new Set(initialMemberIds));
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function save() {
    startTransition(async () => {
      await updateAssignmentsAction(tripId, [...selected]);
      setSavedAt(Date.now());
    });
  }

  return (
    <div>
      {photographers.length === 0 && (
        <div className="rounded-lg bg-surface px-3 py-4 text-center text-xs text-ink-3">
          ยังไม่มีช่างภาพในระบบ — เพิ่มได้ที่หน้า Team
        </div>
      )}
      <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
        {photographers.map((p) => {
          const isSelected = selected.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={`flex items-center justify-between rounded-[10px] border px-3 py-2.5 text-left transition-colors ${
                isSelected
                  ? "border-navy bg-navy-50"
                  : "border-line bg-white hover:bg-surface"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-full bg-navy-100 text-[11px] font-bold text-navy">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">{p.name}</div>
                  <div className="text-[11px] text-ink-3">{p.email}</div>
                </div>
              </div>
              {isSelected && <Check className="size-4 text-navy" />}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="mt-3 w-full rounded-[10px] bg-navy py-2.5 text-sm font-semibold text-white shadow-nav hover:opacity-95 disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก…" : savedAt ? "บันทึกแล้ว ✓" : "บันทึกการมอบหมาย"}
      </button>
    </div>
  );
}
