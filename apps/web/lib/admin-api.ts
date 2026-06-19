import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export function getAdminSecret(): string | undefined {
  return cookies().get('admin_secret')?.value
}

export async function adminFetch<T>(path: string): Promise<T> {
  const secret = getAdminSecret()
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'x-admin-secret': secret ?? '' },
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? res.statusText)
  }
  return res.json()
}
