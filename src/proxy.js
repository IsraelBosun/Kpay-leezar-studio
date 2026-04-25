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

  // ── Local dev: *.localhost subdomain → studio site ──
  if (currentHost.endsWith('.localhost')) {
    const subdomain = currentHost.replace('.localhost', '');
    const studioHeaders = new Headers(req.headers);
    studioHeaders.set('x-is-studio-site', '1');
    return NextResponse.rewrite(
      new URL(`/studio-site/${subdomain}${url.pathname}`, req.url),
      { request: { headers: studioHeaders } }
    );
  }

  // ── Route protection on root domain ──
  if (currentHost === ROOT_DOMAIN || currentHost === `www.${ROOT_DOMAIN}` || currentHost === 'localhost') {

    const isAdminRoute = url.pathname.startsWith('/admin');
    const isStudioRoute = url.pathname.startsWith('/studio');
    const isAuthRoute = url.pathname.startsWith('/auth');
    const isOnboarding = url.pathname.startsWith('/auth/onboarding');

    // Admin routes — must be logged in AND be the admin email
    if (isAdminRoute) {
      if (!user) return NextResponse.redirect(new URL('/auth/login', req.url));
      if (user.email !== process.env.ADMIN_EMAIL) return NextResponse.redirect(new URL('/studio/dashboard', req.url));
    }

    // Unauthenticated trying to access studio dashboard → login
    if (isStudioRoute && !user) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Authenticated trying to access login/signup → dashboard
    if (isAuthRoute && !isOnboarding && user) {
      return NextResponse.redirect(new URL('/studio/dashboard', req.url));
    }

    // Direct /studio-site/* path access (testing workaround — no subdomain needed)
    // Used on teststudios.vercel.app until photostudio.ng domain is configured
    if (url.pathname.startsWith('/studio-site/')) {
      const studioHeaders = new Headers(req.headers);
      studioHeaders.set('x-is-studio-site', '1');
      return NextResponse.next({ request: { headers: studioHeaders } });
    }

    return response;
  }

  // ── Subdomain — e.g. lumis.photostudio.ng ──
  const subdomain = currentHost.replace(`.${ROOT_DOMAIN}`, '');
  if (subdomain && subdomain !== currentHost) {
    const studioHeaders = new Headers(req.headers);
    studioHeaders.set('x-is-studio-site', '1');
    return NextResponse.rewrite(
      new URL(`/studio-site/${subdomain}${url.pathname}`, req.url),
      { request: { headers: studioHeaders } }
    );
  }

  // ── Custom domain — e.g. lumisstudio.com ──
  const customHeaders = new Headers(req.headers);
  customHeaders.set('x-is-studio-site', '1');
  return NextResponse.rewrite(
    new URL(`/studio-site/custom/${encodeURIComponent(currentHost)}${url.pathname}`, req.url),
    { request: { headers: customHeaders } }
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
