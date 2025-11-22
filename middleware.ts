// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Si intenta acceder a /cliente y es admin, redirigir a /dashboard
    if (pathname.startsWith('/cliente') && token?.role === 'admin') {
      const url = new URL('/dashboard', req.url);
      return NextResponse.redirect(url);
    }

    // Si intenta acceder a /dashboard y no es admin, redirigir a /cliente
    if (pathname.startsWith('/dashboard') && token?.role !== 'admin') {
      const url = new URL('/cliente', req.url);
      return NextResponse.redirect(url);
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Proteger rutas del dashboard y cliente
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/cliente')) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cliente/:path*',
  ],
};