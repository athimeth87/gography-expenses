"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

const tripSchema = z
  .object({
    title: z.string().min(2, "ชื่อทริปต้องมีอย่างน้อย 2 ตัวอักษร"),
    description: z.string().max(500).optional(),
    start_date: z.string().min(1),
    end_date: z.string().min(1),
  })
  .refine((d) => d.end_date >= d.start_date, {
    message: "วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่ม",
    path: ["end_date"],
  });

export type ActionState = { error?: string } | undefined;

export async function createTripAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("admin");
  const parsed = tripSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { data: trip, error } = await supabase
    .from("trips")
    .insert({ ...parsed.data, created_by: user.id })
    .select("id")
    .single();

  if (error || !trip) return { error: error?.message ?? "ไม่สามารถสร้างทริปได้" };

  revalidatePath("/admin/trips");
  redirect(`/admin/trips/${trip.id}`);
}

export async function updateAssignmentsAction(tripId: string, photographerIds: string[]) {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("trip_members")
    .select("user_id")
    .eq("trip_id", tripId);
  const existingIds = new Set((existing ?? []).map((m) => m.user_id));
  const newIds = new Set(photographerIds);

  const toAdd = [...newIds].filter((id) => !existingIds.has(id));
  const toRemove = [...existingIds].filter((id) => !newIds.has(id));

  if (toAdd.length > 0) {
    await supabase
      .from("trip_members")
      .insert(toAdd.map((user_id) => ({ trip_id: tripId, user_id })));
  }
  if (toRemove.length > 0) {
    await supabase
      .from("trip_members")
      .delete()
      .eq("trip_id", tripId)
      .in("user_id", toRemove);
  }

  revalidatePath(`/admin/trips/${tripId}`);
  revalidatePath("/admin/trips");
}

export async function closeTripAction(tripId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("trips").update({ status: "closed" }).eq("id", tripId);
  revalidatePath(`/admin/trips/${tripId}`);
  revalidatePath("/admin/trips");
}
