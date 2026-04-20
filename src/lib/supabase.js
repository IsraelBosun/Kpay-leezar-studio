import { createClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Browser client — for use in client components
export function createBrowserSupabase() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}

// Server client — for server components and server actions (respects RLS)
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server components cannot write cookies — proxy handles this
        }
      },
    },
  });
}

// Admin client — bypasses RLS, only use in trusted API routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
