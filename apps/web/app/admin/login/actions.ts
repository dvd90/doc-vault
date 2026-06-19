'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function adminLogin(formData: FormData) {
  const secret = formData.get('secret') as string
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

  const res = await fetch(`${apiUrl}/internal/admin/stats`, {
    headers: { 'x-admin-secret': secret },
    cache: 'no-store',
  })

  if (!res.ok) {
    return { error: 'Invalid admin secret' }
  }

  cookies().set('admin_secret', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })

  redirect('/admin')
}
