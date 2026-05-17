"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { createTripAction, type ActionState } from "./actions";

export function NewTripDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createTripAction,
    undefined
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-[10px] bg-navy px-3.5 py-2 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-95"
      >
        <Plus className="size-4" strokeWidth={2.4} />
        สร้างทริปใหม่
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/30 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">สร้างทริปใหม่</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-ink-3 hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </div>
            <form action={formAction} className="flex flex-col gap-3">
              <Field name="title" label="ชื่อทริป" placeholder="เช่น ถ่ายงานเชียงใหม่" required />
              <Field name="description" label="รายละเอียด (ไม่บังคับ)" />
              <div className="grid grid-cols-2 gap-3">
                <Field name="start_date" label="วันเริ่ม" type="date" required />
                <Field name="end_date" label="วันสิ้นสุด" type="date" required />
              </div>

              {state?.error && (
                <div className="rounded-lg bg-status-rejected-bg px-3 py-2 text-sm text-status-rejected-fg">
                  {state.error}
                </div>
              )}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-[10px] border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-2 hover:bg-surface"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-[10px] bg-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                >
                  {pending ? "กำลังบันทึก…" : "สร้างทริป"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold text-ink-2">{label}</div>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy"
      />
    </label>
  );
}
