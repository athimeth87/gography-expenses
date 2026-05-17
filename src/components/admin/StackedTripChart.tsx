"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { CATEGORIES, type ExpenseCategory } from "@/lib/design-tokens";

const COLORS: Record<ExpenseCategory, string> = {
  fuel: "#0A2540",
  hotel: "#2A4A75",
  food: "#7A8FB0",
  trans: "#F6D274",
  park: "#0F9D58",
  equip: "#B7791F",
  other: "#94A2BB",
};

type Row = { title: string } & Record<ExpenseCategory, number>;

const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);

export function StackedTripChart({ data }: { data: Row[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-72 animate-pulse rounded-lg bg-line-soft" />;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 12, left: 12, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="title"
            tick={{ fontSize: 11, fill: "#3E5172" }}
            axisLine={false}
            tickLine={false}
            width={140}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #E5EAF2",
              borderRadius: 10,
              fontSize: 12,
            }}
            formatter={(v, name) => [`฿${Number(v).toLocaleString()}`, String(name)]}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 11, color: "#3E5172" }}
          />
          {CATEGORIES.map((c) => (
            <Bar key={c.key} dataKey={c.key} stackId="a" fill={COLORS[c.key]} name={c.th} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
