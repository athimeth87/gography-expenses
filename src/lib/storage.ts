const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function tripCoverUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (!SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/trip-covers/${path}`;
}
