import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export const getProfile = cache(async (userId: string): Promise<Pick<Profile, "name" | "role"> | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", userId)
    .single();
  return data;
});
