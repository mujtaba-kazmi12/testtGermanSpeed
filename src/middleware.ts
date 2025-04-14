import { NextRequest, NextResponse } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always' // Always include the locale in the URL
});

// This function handles role-based authentication
function handleAuth(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value as string | undefined;
  const pathname = req.nextUrl.pathname;
  
  // Extract the path without the locale prefix
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
  
  // Check if the path is a protected route
  const isAdminRoute = pathWithoutLocale.startsWith('/admin');
  const isUserRoute = pathWithoutLocale.startsWith('/user');
  const isModeratorRoute = pathWithoutLocale.startsWith('/moderator');
  const isPublisherRoute = pathWithoutLocale.startsWith('/publisher');
  
  // Get current locale from pathname
  const locale = pathname.split('/')[1];
  
  // If not a protected route, allow access
  if (!isAdminRoute && !isUserRoute && !isModeratorRoute && !isPublisherRoute) {
    return null; // Continue to next middleware
  }
  
  // If no token, redirect to sign-in
  if (!token) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, req.url));
  }
  
  // Check role-based access
  if (isAdminRoute && role !== 'superadmin') {
    return NextResponse.redirect(new URL(`/${locale}/unauthorized`, req.url));
  }
  
  if (isUserRoute && role !== 'user') {
    return NextResponse.redirect(new URL(`/${locale}/unauthorized`, req.url));
  }
  
  if (isModeratorRoute && role !== 'moderator') {
    return NextResponse.redirect(new URL(`/${locale}/unauthorized`, req.url));
  }
  
  if (isPublisherRoute && role !== 'publisher') {
    return NextResponse.redirect(new URL(`/${locale}/unauthorized`, req.url));
  }
  
  // Allow access if all checks pass
  return null;
}

// Main middleware function that combines i18n and auth
export function middleware(req: NextRequest) {
  // First handle i18n
  const response = intlMiddleware(req);
  
  // Then check authentication for protected routes
  const authResponse = handleAuth(req);
  
  // Return auth response if it exists, otherwise return i18n response
  return authResponse || response;
}

// Specify which routes to run middleware on
export const config = {
  matcher: [
    // Match all paths except those starting with:
    // - api (API routes)
    // - _next (Next.js internals)
    // - .*\\..*$ (files with extensions like images, etc.)
    '/((?!api|_next|.*\\..*).*)'
  ],
};
