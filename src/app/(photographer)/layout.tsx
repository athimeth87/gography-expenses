import { requireRole } from "@/lib/auth";
import { MobileTabBar } from "@/components/photographer/MobileTabBar";

export default async function PhotographerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("photographer");
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-white">
      <div className="flex-1 overflow-y-auto pb-2">{children}</div>
      <MobileTabBar />
    </div>
  );
}
