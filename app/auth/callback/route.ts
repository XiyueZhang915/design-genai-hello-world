import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const supabase = await createClient();
  let destination = "/login?error=callback";
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      destination = "/";
    }
  }
  const response = NextResponse.redirect(new URL(destination, url.origin));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
