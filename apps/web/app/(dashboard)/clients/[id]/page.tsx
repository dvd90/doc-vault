import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ClientDetailView } from '@/components/clients/client-detail-view'

interface ChecklistItem {
  id: string
  label: string
  description: string | null
  required: boolean
  sortOrder: number
  completedAt: string | null
  uploads: Array<{ id: string; filename: string; storagePath: string }>
}

interface Client {
  id: string
  name: string
  email: string
  taxYear: string
  status: string
  portalToken: string
  items: ChecklistItem[]
}

interface Template {
  id: string
  name: string
}

async function getData(id: string) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  const headers = { Cookie: `token=${token}` }
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

  const [clientRes, templatesRes] = await Promise.all([
    fetch(`${base}/clients/${id}`, { headers, cache: 'no-store' }),
    fetch(`${base}/templates`, { headers, cache: 'no-store' }),
  ])

  if (clientRes.status === 404) notFound()
  if (!clientRes.ok) throw new Error('Failed to load client')

  const client: Client = await clientRes.json()
  const templates: Template[] = templatesRes.ok ? await templatesRes.json() : []

  return { client, templates }
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const { client, templates } = await getData(params.id)
  return <ClientDetailView client={client} templates={templates} />
}
