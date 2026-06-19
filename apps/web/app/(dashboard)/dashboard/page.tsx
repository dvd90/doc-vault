import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface Stats {
  total: number
  notStarted: number
  inProgress: number
  complete: number
}

async function getStats(): Promise<Stats> {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/dashboard/stats`, {
    headers: { Cookie: `token=${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return { total: 0, notStarted: 0, inProgress: 0, complete: 0 }
  return res.json()
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your client document collection</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Users className="h-5 w-5 text-blue-600" />} label="Total Clients" value={stats.total} bg="bg-blue-50" />
        <StatCard icon={<AlertCircle className="h-5 w-5 text-gray-500" />} label="Not Started" value={stats.notStarted} bg="bg-gray-50" />
        <StatCard icon={<Clock className="h-5 w-5 text-yellow-600" />} label="In Progress" value={stats.inProgress} bg="bg-yellow-50" />
        <StatCard icon={<CheckCircle className="h-5 w-5 text-green-600" />} label="Complete" value={stats.complete} bg="bg-green-50" />
      </div>

      <div className="flex gap-4">
        <Link href="/clients" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Users className="h-4 w-4" /> View all clients
        </Link>
        <Link href="/clients?new=1" className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
          + Add client
        </Link>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <CardTitle className="text-sm font-medium text-muted-foreground mt-1">{label}</CardTitle>
      </CardContent>
    </Card>
  )
}
