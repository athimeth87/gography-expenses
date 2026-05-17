import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_TH } from "@/lib/design-tokens";

export const runtime = "nodejs";

type Row = {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  amount_thb: number;
  status: string;
  store_name: string | null;
  note: string | null;
  admin_note: string | null;
  created_at: string;
  approved_at: string | null;
  user_id: string;
  trip_id: string;
  profiles: { name: string | null; email: string | null } | null;
  trips: { title: string | null } | null;
  approver: { name: string | null } | null;
};

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: Request) {
  try {
    await requireRole("admin");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const supabase = await createClient();
  let query = supabase
    .from("expenses")
    .select(
      "id, expense_date, category, amount, currency, exchange_rate, amount_thb, status, store_name, note, admin_note, created_at, approved_at, user_id, trip_id, profiles!user_id(name, email), trips(title), approver:profiles!approved_by(name)"
    )
    .neq("status", "draft")
    .order("expense_date", { ascending: false });

  if (from) query = query.gte("expense_date", from);
  if (to) query = query.lte("expense_date", to);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = ((data ?? []) as unknown) as Row[];

  const headers = [
    "Expense ID",
    "Date",
    "Trip",
    "Photographer",
    "Email",
    "Category",
    "Store",
    "Note",
    "Amount",
    "Currency",
    "Exchange Rate",
    "Amount (THB)",
    "Status",
    "Admin Note",
    "Submitted At",
    "Approved By",
    "Approved At",
  ];

  const lines: string[] = [];
  lines.push(headers.map(csvEscape).join(","));

  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.expense_date,
        r.trips?.title ?? "",
        r.profiles?.name ?? "",
        r.profiles?.email ?? "",
        CATEGORY_TH[r.category as keyof typeof CATEGORY_TH] ?? r.category,
        r.store_name ?? "",
        r.note ?? "",
        Number(r.amount).toFixed(2),
        r.currency,
        Number(r.exchange_rate).toFixed(6),
        Number(r.amount_thb).toFixed(2),
        r.status,
        r.admin_note ?? "",
        r.created_at,
        r.approver?.name ?? "",
        r.approved_at ?? "",
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  // Prepend UTF-8 BOM so Excel renders Thai correctly.
  const body = "﻿" + lines.join("\n") + "\n";

  const today = new Date().toISOString().slice(0, 10);
  const filename = from && to
    ? `gography-expenses-${from}-to-${to}.csv`
    : `gography-expenses-${today}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
