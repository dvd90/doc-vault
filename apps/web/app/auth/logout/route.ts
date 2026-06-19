import { NextRequest, NextResponse } from 'next/server'

// Clears the web-domain auth cookie (the one the SSR auth gate reads) and sends
// the user back to the login page.
export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/login', req.url))
  res.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
