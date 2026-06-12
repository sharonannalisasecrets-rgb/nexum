import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import type { Role } from '@/types';

const ROLE_REDIRECTS: Record<Role, string> = {
  worshipper: '/worshipper/bookings',
  medical_officer: '/officer/incidents',
  security_officer: '/officer/missing-persons',
  driver: '/driver/rides',
  admin: '/admin/dashboard',
  host: '/host/properties',
};

const PROTECTED_PREFIXES: { prefix: string; roles: Role[] }[] = [
  { prefix: '/admin', roles: ['admin'] },
  { prefix: '/officer', roles: ['medical_officer', 'security_officer', 'admin'] },
  { prefix: '/driver', roles: ['driver', 'admin'] },
  { prefix: '/worshipper', roles: ['worshipper', 'admin'] },
  { prefix: '/host', roles: ['host', 'admin'] },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Redirect authenticated users away from login/register
  if ((pathname === '/login' || pathname === '/register') && token) {
    const role = token.role as Role;
    return NextResponse.redirect(
      new URL(ROLE_REDIRECTS[role] ?? '/', req.url)
    );
  }

  // Check protected routes
  for (const { prefix, roles } of PROTECTED_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      if (!token) {
        const url = new URL('/login', req.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }
      const role = token.role as Role;
      if (!roles.includes(role)) {
        // Wrong role — redirect to their home
        return NextResponse.redirect(
          new URL(ROLE_REDIRECTS[role] ?? '/', req.url)
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/officer/:path*',
    '/driver/:path*',
    '/worshipper/:path*',
    '/host/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
