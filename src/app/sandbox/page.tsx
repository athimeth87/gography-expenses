import { StatusPill } from "@/components/design/StatusPill";
import { CatIcon } from "@/components/design/CatIcon";
import { Logo } from "@/components/design/Logo";
import { FauxReceipt } from "@/components/design/FauxReceipt";
import { STATUS, CATEGORIES, type ExpenseStatus } from "@/lib/design-tokens";
import { thb, dateTh } from "@/lib/format";

const STATUSES: ExpenseStatus[] = ["draft", "pending", "approved", "rejected", "paid"];

export default function SandboxPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10 flex items-center gap-3">
        <Logo size={36} />
        <div>
          <h1 className="text-2xl font-bold text-ink">GoGraphy Expenses · Design Sandbox</h1>
          <p className="text-sm text-ink-3">Phase 0 — design tokens and primitives</p>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">
          Status Pills
        </h2>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-5 shadow-card">
          {STATUSES.map((s) => (
            <div key={s} className="flex items-center gap-3">
              <StatusPill status={s} />
              <StatusPill status={s} size="sm" />
              <span className="text-xs text-ink-4">{STATUS[s].label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">
          Category Icons
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES.map((c) => (
            <div
              key={c.key}
              className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-card"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-navy-50 text-navy">
                <CatIcon cat={c.key} size={24} />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-ink">{c.th}</div>
                <div className="text-xs text-ink-4">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">
            Logo
          </h2>
          <div className="flex items-center gap-6 rounded-2xl bg-white p-5 shadow-card">
            <Logo size={28} />
            <Logo size={44} />
            <div className="rounded-xl bg-navy p-4">
              <Logo size={44} white />
            </div>
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">
            Formatters
          </h2>
          <div className="rounded-2xl bg-white p-5 shadow-card font-mono text-sm">
            <div>thb(48230) = ฿{thb(48230)}</div>
            <div>thb(1820) = ฿{thb(1820)}</div>
            <div>dateTh(today) = {dateTh(new Date("2025-11-12"))}</div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">
          Faux Receipt (OCR Preview)
        </h2>
        <div className="flex flex-wrap gap-8 rounded-2xl bg-white p-6 shadow-card">
          <div>
            <div className="mb-2 text-xs text-ink-4">no highlight</div>
            <FauxReceipt />
          </div>
          <div>
            <div className="mb-2 text-xs text-ink-4">highlight=date</div>
            <FauxReceipt ocrHighlight="date" />
          </div>
          <div>
            <div className="mb-2 text-xs text-ink-4">highlight=amount</div>
            <FauxReceipt ocrHighlight="amount" />
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">
          Palette
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-9">
          {[
            { name: "navy-900", cls: "bg-navy-900" },
            { name: "navy-700", cls: "bg-navy-700" },
            { name: "navy", cls: "bg-navy" },
            { name: "navy-500", cls: "bg-navy-500" },
            { name: "navy-300", cls: "bg-navy-300" },
            { name: "navy-100", cls: "bg-navy-100" },
            { name: "navy-50", cls: "bg-navy-50" },
            { name: "surface", cls: "bg-surface" },
            { name: "white", cls: "bg-white" },
          ].map((c) => (
            <div key={c.name} className="rounded-xl border border-line p-2 text-center">
              <div className={`${c.cls} mb-2 h-12 rounded-lg border border-line-soft`} />
              <div className="text-[10px] text-ink-3">{c.name}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
