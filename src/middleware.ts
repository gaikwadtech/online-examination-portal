import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth'; // Import your new async verifyToken

// Make the middleware async
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 }
    );
  }

  // 2. Verify the token (using await)
  const decoded = await verifyToken(token);
  
  if (!decoded) {
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // 3. Check for the role
  const userRole = decoded.role as string;

  if (userRole !== 'teacher') {
    return NextResponse.json(
      { message: 'Forbidden: You do not have permission' },
      { status: 403 }
    );
  }

  // If all checks pass, let the request continue
  return NextResponse.next();
}

// 4. Configure the middleware
export const config = {
  matcher: '/api/protected',
};