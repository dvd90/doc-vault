import { cookies } from 'next/headers'
import { SettingsView } from '@/components/settings/settings-view'

interface Firm {
  id: string
  name: string
  accentColor: string
  logoUrl: string | null
  subscriptionStatus: string
  trialEndsAt: string | null
  stripeCustomerId: string | null
}

async function getFirm(): Promise<Firm | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/me`, {
    headers: { Cookie: `token=${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.firm
}

export default async function SettingsPage() {
  const firm = await getFirm()
  return <SettingsView firm={firm} />
}
