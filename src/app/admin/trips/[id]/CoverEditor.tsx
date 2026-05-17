"use client";

import { useState, useTransition } from "react";
import { CoverImagePicker } from "@/components/admin/CoverImagePicker";
import { updateCoverAction } from "../actions";

type Props = {
  tripId: string;
  initialPath: string | null;
};

export function CoverEditor({ tripId, initialPath }: Props) {
  const [path, setPath] = useState<string | null>(initialPath);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save(next: string | null) {
    setPath(next);
    setError(null);
    startTransition(async () => {
      const result = await updateCoverAction(tripId, next);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSavedAt(Date.now());
    });
  }

  return (
    <div>
      <CoverImagePicker value={path} onChange={save} />
      <div className="mt-2 text-[11px] text-ink-3">
        {pending && "กำลังบันทึก…"}
        {!pending && savedAt && "บันทึกแล้ว ✓"}
        {error && <span className="text-status-rejected-fg">{error}</span>}
      </div>
    </div>
  );
}
