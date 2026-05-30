import { NextResponse } from 'next/server';
import {
  DEV_ADMIN_PROFILE,
  DEV_AUTH_COOKIE_KEY,
  isLocalDevelopmentHost,
} from './src/lib/auth.js';
import { getRouteAccessDecision, isAdminPath, isProtectedPath } from './src/lib/route-access.js';
import { createMiddlewareClient } from './src/lib/supabase/middleware.js';

const redirectTo = (request, pathname) => NextResponse.redirect(new URL(pathname, request.url));

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host')?.split(':')[0] || '';
  const hasDevAdminCookie =
    isLocalDevelopmentHost(host) && request.cookies.get(DEV_AUTH_COOKIE_KEY)?.value === 'true';

  if (!isProtectedPath(pathname) && !isAdminPath(pathname)) {
    return NextResponse.next();
  }

  let user = null;
  let profile = hasDevAdminCookie ? DEV_ADMIN_PROFILE : null;
  let response = NextResponse.next({ request });

  if (!hasDevAdminCookie) {
    const middlewareClient = await createMiddlewareClient(request);
    user = middlewareClient.user;
    response = middlewareClient.response;

    if (user) {
      const { data } = await middlewareClient.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      profile = data || null;
    }
  }

  const decision = getRouteAccessDecision(pathname, {
    user,
    profile,
    isDevAdmin: hasDevAdminCookie,
  });

  return decision.allowed ? response : redirectTo(request, decision.redirectTo);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|site.webmanifest|robots.txt|service-worker.js|.*\\..*).*)',
  ],
};
