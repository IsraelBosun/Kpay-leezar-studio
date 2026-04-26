import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: studio } = await supabase
          .from('studios')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();
        if (studio) {
          return NextResponse.redirect(`${origin}/studio/dashboard`);
        }
      }
      return NextResponse.redirect(`${origin}/auth/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`);
}
