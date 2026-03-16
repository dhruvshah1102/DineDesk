import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const key = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Get hostname (e.g., 'app.menuflow.com', 'brew-house.menuflow.com', 'localhost:3000')
  const hostname = req.headers.get('host') || '';
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  // Exclude public paths and static files
  if (
    url.pathname.startsWith('/api') || 
    url.pathname.startsWith('/_next') || 
    url.pathname.includes('.')
  ) {
    // Basic Auth checks on APIs can be done in API routes themselves
    return NextResponse.next();
  }

  // Determine Subdomain / App logic
  let slug = '';
  let appType = 'customer'; // default

  if (!isLocalhost) {
    if (hostname === 'menuflow.com' || hostname === 'www.menuflow.com') {
      appType = 'landing';
    } else if (hostname.startsWith('app.')) {
      appType = 'dashboard';
    } else if (hostname.startsWith('admin.')) {
      appType = 'admin';
    } else {
      // It's a cafe slug
      slug = hostname.split('.')[0];
      appType = 'customer';
    }
  } else {
    // Localhost fallback logic
    const queryCafe = url.searchParams.get('cafe');

    if (url.pathname.startsWith('/dashboard') || url.pathname === '/login' || url.pathname === '/register' || queryCafe === 'app') {
      appType = 'dashboard';
    } else if (url.pathname.startsWith('/admin') || queryCafe === 'admin') {
      appType = 'admin';
    } else if (url.pathname === '/' && !queryCafe) {
      appType = 'landing';
    } else {
      appType = 'customer';
      slug = queryCafe || '';
    }
  }

  // --- Auth Guards ---
  const token = req.cookies.get('menuflow_token')?.value;
  let decodedPayload: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, key);
      decodedPayload = payload;
    } catch (err) {
      decodedPayload = null;
    }
  }

  // 1. Dashboard Routing
  if (appType === 'dashboard') {
    const isAuthRoute = url.pathname === '/login' || url.pathname === '/register';
    
    if (!decodedPayload && !isAuthRoute) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (decodedPayload && decodedPayload.role === 'owner' && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (!url.pathname.startsWith('/dashboard') && !isAuthRoute) {
      return NextResponse.rewrite(new URL(`/dashboard${url.pathname}`, req.url));
    }
    
    if (isAuthRoute) {
       return NextResponse.rewrite(new URL(`/dashboard${url.pathname}`, req.url));
    }

    if (url.pathname === '/' || url.pathname === '') {
       return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    if (url.pathname === '/dashboard') {
       return NextResponse.rewrite(new URL(`/dashboard/dashboard`, req.url));
    }
    
    return NextResponse.next();
  }

  // 2. Admin Routing
  if (appType === 'admin') {
    const isLogin = url.pathname === '/admin/login' || url.pathname === '/login';

    if (!decodedPayload?.role?.includes('admin') && !isLogin) {
      return NextResponse.redirect(new URL('/admin/login', req.url)); 
    }
    if (decodedPayload?.role?.includes('admin') && isLogin) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url)); 
    }

    if (!url.pathname.startsWith('/admin') && !isLogin) {
      return NextResponse.rewrite(new URL(`/admin${url.pathname}`, req.url));
    }
    
    if (url.pathname === '/login') {
       return NextResponse.rewrite(new URL(`/admin/login`, req.url));
    }

    if (url.pathname === '/' || url.pathname === '' || url.pathname === '/admin') {
       return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    
    return NextResponse.next();
  }

  // 3. Customer Routing (default if customer)
  if (appType === 'customer') {
    const response = NextResponse.rewrite(new URL(`/customer${url.pathname}`, req.url));
    if (slug) {
      response.headers.set('x-cafe-slug', slug);
    }
    return response;
  }

  // 4. Landing Page
  if (appType === 'landing') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
