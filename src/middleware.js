import { NextResponse } from 'next/server';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'photostudio.ng';

export async function middleware(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Strip port in development
  const currentHost = hostname.replace(`:${process.env.PORT || 3000}`, '');

  // ── Auth routes and API routes — always pass through ──
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // ── Root domain — show the SaaS landing page ──
  if (currentHost === ROOT_DOMAIN || currentHost === `www.${ROOT_DOMAIN}` || currentHost === 'localhost') {
    return NextResponse.next();
  }

  // ── Subdomain — e.g. lumis.photostudio.ng ──
  const subdomain = currentHost.replace(`.${ROOT_DOMAIN}`, '');
  if (subdomain && subdomain !== currentHost) {
    // Rewrite to marketing routes with studio slug injected
    return NextResponse.rewrite(
      new URL(`/studio-site/${subdomain}${url.pathname}`, req.url)
    );
  }

  // ── Custom domain — e.g. lumisstudio.com ──
  // Rewrite to marketing routes with custom domain injected
  return NextResponse.rewrite(
    new URL(`/studio-site/custom/${encodeURIComponent(currentHost)}${url.pathname}`, req.url)
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
