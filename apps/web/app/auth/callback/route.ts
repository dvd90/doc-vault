import { NextRequest, NextResponse } from 'next/server'

// The API lives on a different domain from the web app, so a cookie it sets is
// invisible to this app's server-side rendering. After Google/magic-link auth,
// the API redirects here with the signed JWT; we set it as a cookie on the web
// domain so SSR (and the dashboard layout's auth gate) can read it.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', req.url))
  }

  const res = NextResponse.redirect(new URL('/dashboard', req.url))
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return res
}
