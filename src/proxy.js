import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Every page and API route of the admin site needs an admin session,
// except the login page and NextAuth's own endpoints (see matcher).
export async function proxy(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAdmin = token?.role === 'admin';
  const { pathname } = req.nextUrl;

  if (isAdmin) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/login', req.url);
  if (pathname !== '/') loginUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico|hangover.jpeg|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)',
  ],
};
