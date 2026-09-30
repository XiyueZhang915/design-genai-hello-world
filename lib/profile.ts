import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Profile = { id: string; first_name: string | null; last_name: string | null; avatar_path: string | null };
export function isComplete(profile: Profile | null) {
  return Boolean(profile?.first_name?.trim() && profile?.last_name?.trim());
}
export async function getAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile, error } = await supabase.from("profiles")
    .select("id,first_name,last_name,avatar_path").eq("id", user.id).maybeSingle();
  if (error) throw new Error("Could not load your profile. Please try again.");
  return { supabase, user, profile: profile as Profile | null };
}
export async function requireAccount() {
  const account = await getAccount();
  if (!account.user) redirect("/login");
  return { ...account, user: account.user };
}
