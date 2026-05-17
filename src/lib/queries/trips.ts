import { createClient } from "@/lib/supabase/server";
import type { Trip, Profile } from "@/types/database";

export type TripWithCounts = Trip & {
  members: { user_id: string; name: string }[];
  expense_count: number;
  total_amount: number;
};

export async function listTripsForAdmin(): Promise<TripWithCounts[]> {
  const supabase = await createClient();
  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: false });

  if (!trips) return [];

  const tripIds = trips.map((t) => t.id);
  if (tripIds.length === 0) return [];

  const [{ data: members }, { data: expenses }] = await Promise.all([
    supabase
      .from("trip_members")
      .select("trip_id, user_id, profiles(name)")
      .in("trip_id", tripIds),
    supabase.from("expenses").select("trip_id, amount").in("trip_id", tripIds),
  ]);

  const memberMap = new Map<string, { user_id: string; name: string }[]>();
  for (const m of members ?? []) {
    const list = memberMap.get(m.trip_id) ?? [];
    const profile = (m as unknown as { profiles: { name: string } | null }).profiles;
    list.push({ user_id: m.user_id, name: profile?.name ?? "" });
    memberMap.set(m.trip_id, list);
  }

  const expenseMap = new Map<string, { count: number; total: number }>();
  for (const e of expenses ?? []) {
    const cur = expenseMap.get(e.trip_id) ?? { count: 0, total: 0 };
    cur.count += 1;
    cur.total += Number(e.amount);
    expenseMap.set(e.trip_id, cur);
  }

  return trips.map((t) => ({
    ...(t as Trip),
    members: memberMap.get(t.id) ?? [],
    expense_count: expenseMap.get(t.id)?.count ?? 0,
    total_amount: expenseMap.get(t.id)?.total ?? 0,
  }));
}

export async function listAssignedTrips(userId: string): Promise<TripWithCounts[]> {
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("trip_members")
    .select("trip_id")
    .eq("user_id", userId);

  const tripIds = (memberships ?? []).map((m) => m.trip_id);
  if (tripIds.length === 0) return [];

  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .in("id", tripIds)
    .order("start_date", { ascending: false });

  const { data: expenses } = await supabase
    .from("expenses")
    .select("trip_id, amount, user_id")
    .in("trip_id", tripIds);

  return (trips ?? []).map((t) => {
    const mine = (expenses ?? []).filter((e) => e.trip_id === t.id && e.user_id === userId);
    return {
      ...(t as Trip),
      members: [],
      expense_count: mine.length,
      total_amount: mine.reduce((sum, e) => sum + Number(e.amount), 0),
    };
  });
}

export async function getTripWithMembers(
  tripId: string
): Promise<{ trip: Trip; members: Profile[] } | null> {
  const supabase = await createClient();
  const { data: trip } = await supabase.from("trips").select("*").eq("id", tripId).single();
  if (!trip) return null;

  const { data: rows } = await supabase
    .from("trip_members")
    .select("user_id, profiles(*)")
    .eq("trip_id", tripId);

  type Row = { user_id: string; profiles: Profile | Profile[] | null };
  const members = ((rows ?? []) as unknown as Row[])
    .flatMap((r) => (Array.isArray(r.profiles) ? r.profiles : r.profiles ? [r.profiles] : []))
    .filter((p): p is Profile => p !== null);

  return { trip: trip as Trip, members };
}

export async function listPhotographers(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "photographer")
    .order("name");
  return (data ?? []) as Profile[];
}
