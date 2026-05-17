import { requireRole } from "@/lib/auth";
import { getProfile } from "@/lib/queries/profile";
import { MobileTabBar } from "@/components/photographer/MobileTabBar";
import { PhotographerSidebar } from "@/components/photographer/PhotographerSidebar";

export default async function PhotographerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("photographer");
  const profile = await getProfile(user.id);

  return (
    <div className="flex flex-1 bg-surface lg:bg-white">
      <PhotographerSidebar profile={profile} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-white lg:mx-0 lg:max-w-none lg:bg-surface">
        <div className="flex-1 overflow-y-auto pb-2 lg:pb-0">{children}</div>
        <MobileTabBar />
      </div>
    </div>
  );
}
