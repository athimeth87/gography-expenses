import type { ExpenseCategory } from "@/lib/design-tokens";

type Props = {
  cat: ExpenseCategory;
  size?: number;
  color?: string;
  className?: string;
};

export function CatIcon({ cat, size = 20, color = "currentColor", className }: Props) {
  const sw = 1.6;
  const p = {
    stroke: color,
    strokeWidth: sw,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const map: Record<ExpenseCategory, React.ReactNode> = {
    fuel: (
      <>
        <rect x="4" y="4" width="9" height="16" rx="1.5" {...p} />
        <path d="M4 9h9" {...p} />
        <path d="M13 8l3 2v7a2 2 0 0 0 2 2v-9l-3-3" {...p} />
      </>
    ),
    hotel: (
      <>
        <path d="M3 19V8l9-4 9 4v11" {...p} />
        <path d="M3 19h18" {...p} />
        <rect x="8" y="12" width="3" height="3" {...p} />
        <rect x="13" y="12" width="3" height="3" {...p} />
      </>
    ),
    food: (
      <>
        <path d="M6 4v6c0 1.5 1 2 2 2v8" {...p} />
        <path d="M10 4v6c0 1.5-1 2-2 2" {...p} />
        <path d="M17 4c-2 0-3 2-3 5s1 4 3 4v7" {...p} />
      </>
    ),
    trans: (
      <>
        <rect x="4" y="6" width="16" height="11" rx="2" {...p} />
        <path d="M4 13h16" {...p} />
        <circle cx="8" cy="17.5" r="1.4" {...p} />
        <circle cx="16" cy="17.5" r="1.4" {...p} />
      </>
    ),
    park: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="3" {...p} />
        <path d="M9 17V8h4a3 3 0 0 1 0 6h-4" {...p} />
      </>
    ),
    equip: (
      <>
        <rect x="3" y="7" width="18" height="12" rx="2" {...p} />
        <path d="M8 7l1.5-2h5L16 7" {...p} />
        <circle cx="12" cy="13" r="3.2" {...p} />
      </>
    ),
    other: (
      <>
        <circle cx="12" cy="12" r="8" {...p} />
        <circle cx="8.5" cy="11" r="0.6" fill={color} stroke="none" />
        <circle cx="15.5" cy="11" r="0.6" fill={color} stroke="none" />
        <circle cx="12" cy="11" r="0.6" fill={color} stroke="none" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ flexShrink: 0 }}
    >
      {map[cat]}
    </svg>
  );
}
