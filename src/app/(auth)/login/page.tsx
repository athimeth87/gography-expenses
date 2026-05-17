"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/design/Logo";
import { loginAction, type LoginState } from "./actions";
import { cn } from "@/lib/utils";

const REMEMBER_KEY = "gography:remembered-email";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, undefined);
  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Don't preventDefault — let the server action run.
    if (remember && email.trim()) {
      localStorage.setItem(REMEMBER_KEY, email.trim());
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-7 py-10">
      <div className="flex items-center gap-3">
        <Logo size={40} />
        <div>
          <div className="text-[22px] font-bold tracking-tight text-navy">GoGraphy Expenses</div>
          <div className="mt-0.5 text-xs text-ink-3">Crew expense claims · v1.0</div>
        </div>
      </div>

      <div className="mt-16">
        <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-navy">
          ยินดีต้อนรับ
          <br />
          <span className="font-semibold text-ink-3">กลับมา</span>
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-2">
          ลงชื่อเข้าใช้เพื่อดูทริปและส่งเบิกค่าใช้จ่าย
        </p>
      </div>

      <form action={formAction} onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3.5">
        <Field
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
          value={email}
          onChange={setEmail}
        />
        <Field
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between">
          <RememberCheckbox checked={remember} onChange={setRemember} />
          <button
            type="button"
            className="text-[13px] font-semibold text-navy hover:underline"
            onClick={() => alert("ติดต่อแอดมินเพื่อรีเซ็ตรหัสผ่าน")}
          >
            ลืมรหัสผ่าน?
          </button>
        </div>

        {state?.error && (
          <div className="rounded-lg bg-status-rejected-bg px-3 py-2 text-sm text-status-rejected-fg">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-3 flex h-[54px] items-center justify-center gap-2 rounded-[14px] bg-navy text-base font-semibold tracking-wide text-white shadow-nav transition-opacity hover:opacity-95 disabled:opacity-60"
        >
          {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
          {!pending && <ArrowRight className="size-4" strokeWidth={2.2} />}
        </button>
      </form>

      <div className="mt-auto pt-6 text-center text-sm text-ink-3">
        ยังไม่มีบัญชี? <span className="font-semibold text-navy">ติดต่อแอดมิน</span>
      </div>
    </div>
  );
}

function RememberCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-2 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "flex size-[18px] items-center justify-center rounded-md border-[1.4px] transition-colors",
          checked ? "border-navy bg-navy" : "border-line bg-white"
        )}
      >
        {checked && <Check className="size-3 text-white" strokeWidth={3} />}
      </span>
      จดจำการเข้าสู่ระบบ
    </label>
  );
}

function Field({
  name,
  label,
  type,
  autoComplete,
  required,
  value,
  onChange,
}: {
  name: string;
  label: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  value?: string;
  onChange?: (v: string) => void;
}) {
  const controlled = value !== undefined && onChange !== undefined;
  return (
    <label className="block rounded-xl border-[1.4px] border-line bg-white px-3.5 py-2.5 transition-colors focus-within:border-navy">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">{label}</div>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        {...(controlled
          ? { value, onChange: (e) => onChange!(e.target.value) }
          : {})}
        className="w-full border-0 bg-transparent py-1 text-base text-ink outline-none"
      />
    </label>
  );
}
