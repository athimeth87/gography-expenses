"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { addMemberAction, type ActionState } from "./actions";

export function AddPhotographerDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addMemberAction,
    undefined
  );

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-[10px] bg-navy px-3.5 py-2 text-sm font-semibold text-white hover:opacity-95"
      >
        <Plus className="size-4" strokeWidth={2.4} />
        เพิ่มสมาชิก
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
              <h2 className="text-lg font-semibold text-ink">เพิ่มสมาชิกใหม่</h2>
              <button onClick={() => setOpen(false)} className="text-ink-3 hover:text-ink">
                <X className="size-5" />
              </button>
            </div>
            <form action={formAction} className="flex flex-col gap-3">
              <Field name="name" label="ชื่อ" placeholder="เช่น เอก สมชาย" required />
              <Field name="email" label="อีเมล" type="email" required />
              <Field
                name="password"
                label="รหัสผ่านเริ่มต้น"
                type="password"
                required
                hint="อย่างน้อย 8 ตัวอักษร — ผู้ใช้สามารถเปลี่ยนได้ภายหลัง"
              />
              <label className="block">
                <div className="mb-1 text-xs font-semibold text-ink-2">บทบาท</div>
                <select
                  name="role"
                  defaultValue="photographer"
                  className="w-full rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy"
                >
                  <option value="photographer">ช่างภาพ (Photographer)</option>
                  <option value="admin">แอดมิน (Admin)</option>
                </select>
              </label>

              {state?.error && (
                <div className="rounded-lg bg-status-rejected-bg px-3 py-2 text-sm text-status-rejected-fg">
                  {state.error}
                </div>
              )}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-[10px] border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-2"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-[10px] bg-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                >
                  {pending ? "กำลังบันทึก…" : "เพิ่มสมาชิก"}
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
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
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
      {hint && <div className="mt-1 text-[11px] text-ink-3">{hint}</div>}
    </label>
  );
}
