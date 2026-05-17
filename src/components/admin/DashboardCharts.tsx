"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { CATEGORIES, type ExpenseCategory } from "@/lib/design-tokens";

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  fuel: "#0A2540",
  hotel: "#2A4A75",
  food: "#7A8FB0",
  trans: "#F6D274",
  park: "#0F9D58",
  equip: "#B7791F",
  other: "#94A2BB",
};

type BarPoint = { month: string; total: number };
type PiePoint = { name: string; key: ExpenseCategory; value: number };

const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function MonthlyBarChart({ data }: { data: BarPoint[] }) {
  const mounted = useMounted();
  if (!mounted) return <ChartSkeleton />;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#6E7E9A" }}
            axisLine={{ stroke: "#E5EAF2" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6E7E9A" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
          />
          <Tooltip
            cursor={{ fill: "#F3F6FB" }}
            contentStyle={{
              border: "1px solid #E5EAF2",
              borderRadius: 10,
              fontSize: 12,
              boxShadow: "0 10px 24px rgba(10,37,64,.08)",
            }}
            formatter={(v) => [`฿${Number(v).toLocaleString()}`, "Total"]}
          />
          <Bar dataKey="total" fill="#0A2540" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDonut({ data }: { data: PiePoint[] }) {
  const mounted = useMounted();
  if (!mounted) return <ChartSkeleton />;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={56}
            outerRadius={90}
            dataKey="value"
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((d) => (
              <Cell key={d.key} fill={CATEGORY_COLORS[d.key]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              border: "1px solid #E5EAF2",
              borderRadius: 10,
              fontSize: 12,
            }}
            formatter={(v) => [`฿${Number(v).toLocaleString()}`, ""]}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 11, color: "#3E5172" }}
            formatter={(_, entry) => {
              const item = entry?.payload as unknown as PiePoint | undefined;
              return item ? CATEGORIES.find((c) => c.key === item.key)?.th ?? item.name : "";
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-64 animate-pulse rounded-lg bg-line-soft" />;
}
