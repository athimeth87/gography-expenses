import { requireRole } from "@/lib/auth";
import { listAssignedTrips } from "@/lib/queries/trips";
import { BatchExpenseForm } from "./BatchExpenseForm";

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string }>;
}) {
  const user = await requireRole("photographer");
  const { trip } = await searchParams;
  const trips = await listAssignedTrips(user.id);

  return (
    <BatchExpenseForm
      userId={user.id}
      trips={trips.map((t) => ({ id: t.id, title: t.title }))}
      initialTripId={trip ?? trips[0]?.id ?? ""}
    />
  );
}
