import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session?.user) {
      const user = data.session.user;
      const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User";
      
      // Upsert into public.users to ensure foreign key relations work properly for OAuth users
      await supabase.from("users").upsert({
        id: user.id,
        email: user.email || "",
        name: name,
        avatar_url: user.user_metadata?.avatar_url || null,
      }, { onConflict: 'id' });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
