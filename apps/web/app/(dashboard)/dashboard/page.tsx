import { cookies } from 'next/headers'
import Link from 'next/link'
import { Users, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react'
import { RecentClientsTable } from './recent-clients-table'
import { OnboardingSteps } from './onboarding-steps'

interface Stats {
  total: number
  notStarted: number
  inProgress: number
  complete: number
}

interface Client {
  id: string
  name: string
  email: string
  taxYear: string
  status: string
  createdAt: string
}

async function getDashboardData() {
  const token = cookies().get('token')?.value
  const headers = { Cookie: `token=${token}` }
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

  const [statsRes, clientsRes] = await Promise.all([
    fetch(`${base}/dashboard/stats`, { headers, cache: 'no-store' }),
    fetch(`${base}/clients`, { headers, cache: 'no-store' }),
  ])

  const stats: Stats = statsRes.ok
    ? await statsRes.json()
    : { total: 0, notStarted: 0, inProgress: 0, complete: 0 }

  const clients: Client[] = clientsRes.ok ? await clientsRes.json() : []

  return { stats, recentClients: clients.slice(0, 8) }
}

export default async function DashboardPage() {
  const { stats, recentClients } = await getDashboardData()

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
        </div>
        <Link
          href="/clients"
          className="inline-flex h-9 w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add client
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Total clients"
          value={stats.total}
          color="text-blue-600"
          border="border-l-blue-500"
        />
        <StatCard
          icon={<AlertCircle className="h-4 w-4" />}
          label="Not started"
          value={stats.notStarted}
          color="text-slate-500"
          border="border-l-slate-300"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="In progress"
          value={stats.inProgress}
          color="text-amber-600"
          border="border-l-amber-400"
        />
        <StatCard
          icon={<CheckCircle className="h-4 w-4" />}
          label="Complete"
          value={stats.complete}
          color="text-emerald-600"
          border="border-l-emerald-500"
        />
      </div>

      {/* Recent clients / Onboarding */}
      {stats.total === 0 ? (
        <OnboardingSteps />
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b">
            <h2 className="text-sm font-semibold">Recent clients</h2>
            <Link href="/clients" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="px-2 sm:px-5 pb-2">
            <RecentClientsTable clients={recentClients} />
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
  border,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  border: string
}) {
  return (
    <div
      className={`rounded-xl border-l-4 border border-slate-100 bg-white px-4 py-3 sm:px-5 sm:py-4 ${border}`}
    >
      <div className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 sm:mb-2 ${color}`}>
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{value}</div>
    </div>
  )
}
