import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that require authentication here
const protectedPaths = ['/dashboard', '/profile', '/admin'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  const path = request.nextUrl.pathname;

  const isProtectedPath = protectedPaths.some(p => path.startsWith(p));

  // If path is protected and no token, redirect to login
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }

  // If path is auth related (login/register) and user is logged in, redirect to dashboard
  if ((path.startsWith('/login') || path.startsWith('/register')) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
