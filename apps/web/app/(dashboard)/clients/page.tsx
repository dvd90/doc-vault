import { cookies } from 'next/headers'
import { ClientsView } from '@/components/clients/clients-view'

interface Client {
  id: string
  name: string
  email: string
  taxYear: string
  status: string
  createdAt: string
}

async function getClients(): Promise<Client[]> {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/clients`, {
    headers: { Cookie: `token=${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return []
  return res.json()
}

export default async function ClientsPage() {
  const clients = await getClients()
  return <ClientsView initialClients={clients} />
}
