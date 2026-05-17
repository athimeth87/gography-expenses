import Link from "next/link";
import { Logo } from "@/components/design/Logo";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <Logo size={48} />
      <div>
        <h1 className="text-2xl font-bold text-ink">GoGraphy Expenses</h1>
        <p className="mt-2 text-sm text-ink-3">
          ระบบบันทึกค่าใช้จ่ายสำหรับทีมช่างภาพและทีมออกกอง
        </p>
      </div>
      <div className="text-xs text-ink-4">Phase 0 — Foundation</div>
      <Link
        href="/sandbox"
        className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-navy-700"
      >
        View Design Sandbox →
      </Link>
    </div>
  );
}
