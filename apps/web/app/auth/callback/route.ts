import { NextRequest, NextResponse } from 'next/server'

// The API lives on a different domain from the web app, so a cookie it sets is
// invisible to this app's server-side rendering. After Google/magic-link auth,
// the API redirects here with the signed JWT; we set it as a cookie on the web
// domain so SSR (and the dashboard layout's auth gate) can read it.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  // Railway reverse-proxies to localhost:PORT, so req.nextUrl.origin is often
  // "localhost:8080". Read the forwarded headers Railway sets to get the real
  // public origin, falling back to req.nextUrl.origin for local dev.
  const fwdHost = req.headers.get('x-forwarded-host')
  const fwdProto = req.headers.get('x-forwarded-proto') ?? 'https'
  const origin = fwdHost ? `${fwdProto}://${fwdHost}` : req.nextUrl.origin

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`)
  }

  const res = NextResponse.redirect(`${origin}/dashboard`)
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return res
}
