import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'photostudio.ng';

export async function proxy(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  const currentHost = hostname.replace(`:${process.env.PORT || 3000}`, '');

  let response = NextResponse.next({ request: { headers: req.headers } });

  // Refresh Supabase session on every request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ── API and static — always pass through ──
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static')
  ) {
    return response;
  }

  // ── Route protection on root domain ──
  if (currentHost === ROOT_DOMAIN || currentHost === `www.${ROOT_DOMAIN}` || currentHost === 'localhost') {

    const isStudioRoute = url.pathname.startsWith('/studio');
    const isAuthRoute = url.pathname.startsWith('/auth');
    const isOnboarding = url.pathname.startsWith('/auth/onboarding');

    // Unauthenticated trying to access studio dashboard → login
    if (isStudioRoute && !user) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Authenticated trying to access login/signup → dashboard
    if (isAuthRoute && !isOnboarding && user) {
      return NextResponse.redirect(new URL('/studio/dashboard', req.url));
    }

    return response;
  }

  // ── Subdomain — e.g. lumis.photostudio.ng ──
  const subdomain = currentHost.replace(`.${ROOT_DOMAIN}`, '');
  if (subdomain && subdomain !== currentHost) {
    return NextResponse.rewrite(
      new URL(`/studio-site/${subdomain}${url.pathname}`, req.url)
    );
  }

  // ── Custom domain — e.g. lumisstudio.com ──
  return NextResponse.rewrite(
    new URL(`/studio-site/custom/${encodeURIComponent(currentHost)}${url.pathname}`, req.url)
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
