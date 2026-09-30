import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isComplete } from "@/lib/profile";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const supabase = await createClient();
  let destination = "/login?error=callback";
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const { data: profile, error: profileError } = await supabase.from("profiles")
        .select("id,first_name,last_name,avatar_path").eq("id", data.user.id).maybeSingle();
      destination = profileError || !isComplete(profile) ? "/profile" : "/members";
    }
  }
  const response = NextResponse.redirect(new URL(destination, url.origin));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
