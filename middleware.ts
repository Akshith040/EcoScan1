import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Define public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/signup', '/auth/error'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // API routes should be accessible
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // If the user is not authenticated and trying to access a protected route
  if (!token && !isPublicPath) {
    // Redirect to login
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and trying to access auth pages
  if (token && isPublicPath) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure which routes this middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth (NextAuth endpoints)
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};