import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EditExpenseForm } from "./EditExpenseForm";
import type { Expense, Trip } from "@/types/database";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("photographer");
  const { id } = await params;
  const supabase = await createClient();
  const { data: expense } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .single();
  if (!expense || (expense as Expense).user_id !== user.id) notFound();

  const e = expense as Expense;
  if (e.status !== "draft" && e.status !== "pending") notFound();

  const { data: trip } = await supabase
    .from("trips")
    .select("id, title")
    .eq("id", e.trip_id)
    .single();

  let signedUrl: string | null = null;
  if (e.receipt_path) {
    const { data: signed } = await supabase.storage
      .from("receipts")
      .createSignedUrl(e.receipt_path, 3600);
    signedUrl = signed?.signedUrl ?? null;
  }

  return (
    <EditExpenseForm
      expense={e}
      tripTitle={(trip as Pick<Trip, "id" | "title"> | null)?.title ?? "—"}
      receiptUrl={signedUrl}
    />
  );
}
