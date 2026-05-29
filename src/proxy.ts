import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'vi']
const defaultLocale = 'en'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Exclude internal Next.js paths, api routes, and static assets from redirection
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|json)$/)
  ) {
    return
  }

  // Check if the path already starts with a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return
  }

  // Redirect if there is no locale
  // Detect locale from Accept-Language header if possible, or fallback to default
  let locale = defaultLocale
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    if (acceptLanguage.includes('vi') || acceptLanguage.includes('vi-VN')) {
      locale = 'vi'
    }
  }

  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Apply proxy to all paths except specific ones
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}
