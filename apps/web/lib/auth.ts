import { api, ApiError } from './api'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  firmId: string
}

export interface Firm {
  id: string
  name: string
  logoUrl: string | null
  accentColor: string
  subscriptionStatus: string
  trialEndsAt: string | null
}

export async function getMe(): Promise<{ user: User; firm: Firm } | null> {
  try {
    return await api.get<{ user: User; firm: Firm }>('/auth/me')
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null
    throw err
  }
}

export function loginUrl() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  return `${base}/auth/google`
}

export async function requestMagicLink(email: string): Promise<void> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  const res = await fetch(`${base}/auth/magic-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.message ?? 'Could not send magic link', body.code)
  }
}
