import { notFound } from 'next/navigation'
import { PortalView } from '@/components/portal/portal-view'

interface ChecklistItem {
  id: string
  label: string
  description: string | null
  required: boolean
  sortOrder: number
  completedAt: string | null
  uploads: Array<{ id: string; filename: string }>
}

interface PortalData {
  client: { id: string; name: string; status: string }
  firm: { name: string; accentColor: string; logoUrl: string | null }
  items: ChecklistItem[]
}

async function getPortal(token: string): Promise<PortalData | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/portal/${token}`,
    { cache: 'no-store' }
  )
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to load portal')
  return res.json()
}

export default async function PortalPage({ params }: { params: { token: string } }) {
  const data = await getPortal(params.token)
  if (!data) notFound()

  return (
    <PortalView
      client={data.client}
      firm={data.firm}
      items={data.items}
      token={params.token}
    />
  )
}
