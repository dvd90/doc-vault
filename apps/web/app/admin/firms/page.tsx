import Link from 'next/link'
import { adminFetch } from '@/lib/admin-api'
import { Badge } from '@/components/ui/badge'

interface Firm {
  id: string
  name: string
  subscriptionStatus: string
  createdAt: string
  _count: { users: number; clients: number }
}

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'outline'> = {
  active: 'success',
  trial: 'warning',
  cancelled: 'destructive',
}

export default async function AdminFirmsPage() {
  const firms = await adminFetch<Firm[]>('/internal/admin/firms')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All firms</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Users</th>
              <th className="text-right px-4 py-3 font-medium">Clients</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {firms.map((firm) => (
              <tr
                key={firm.id}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/firms/${firm.id}`}
                    className="font-medium hover:underline text-primary"
                  >
                    {firm.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[firm.subscriptionStatus] ?? 'outline'}>
                    {firm.subscriptionStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{firm._count.users}</td>
                <td className="px-4 py-3 text-right tabular-nums">{firm._count.clients}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(firm.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {firms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No firms yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
