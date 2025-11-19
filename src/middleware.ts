import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth'; // You'll need to create this

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // --- Check for protected pages (e.g., /dashboard, /profile) ---
  // Add any other pages you want to protect here
  const protectedPages = [
  '/dashboard',
  '/admin',
  '/student',
  '/create-exam',
  '/profile'
];

  const isProtectedPage = protectedPages.some((path) => pathname.startsWith(path));

  if (isProtectedPage) {
    if (!token) {
      // If no token, redirect to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // You could optionally verify the token here too, but a simple check is often enough
    // just to redirect. The page itself should do the full user data fetching.
  }

  // --- Check for protected API routes (e.g., /api/teacher/...) ---
  // This is your existing logic, but now targeted at specific API paths.
  const isProtectedApiRoute = pathname.startsWith('/api/protected'); // Your original matcher

  if (isProtectedApiRoute) {
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const decoded = await verifyToken(token); // Assuming verifyToken throws an error on failure

      if (!decoded) { // Should be caught by try/catch, but good to double-check
        throw new Error('Invalid token');
      }

      const userRole = decoded.role as string;
      if (userRole !== 'teacher') {
        return NextResponse.json(
          { message: 'Forbidden: You do not have permission' },
          { status: 403 }
        );
      }
    } catch (err) {
      // This catches errors from verifyToken (e.g., expired, invalid signature)
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  }

  // If none of the above, let the request continue
  return NextResponse.next();
}

// 4. Configure the middleware to run on ALL these routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (the homepage)
     * - /login
     * - /register
     */
    '/((?!_next/static|_next/image|favicon.ico|login|register|$).*)',
  ],
};