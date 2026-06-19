import { adminFetch } from '@/lib/admin-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, Upload, Activity } from 'lucide-react'

interface Stats {
  totalFirms: number
  totalClients: number
  totalUploads: number
  bySubscription: Record<string, number>
}

export default async function AdminOverviewPage() {
  const stats = await adminFetch<Stats>('/internal/admin/stats')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform overview</h1>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
          label="Total firms"
          value={stats.totalFirms}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          label="Total clients"
          value={stats.totalClients}
        />
        <StatCard
          icon={<Upload className="h-5 w-5 text-muted-foreground" />}
          label="Total uploads"
          value={stats.totalUploads}
        />
        <StatCard
          icon={<Activity className="h-5 w-5 text-muted-foreground" />}
          label="Active subscriptions"
          value={stats.bySubscription['active'] ?? 0}
        />
      </div>

      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-base">Subscription breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(stats.bySubscription).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between text-sm">
              <span className="capitalize text-muted-foreground">{status}</span>
              <span className="font-semibold tabular-nums">{count}</span>
            </div>
          ))}
          {Object.keys(stats.bySubscription).length === 0 && (
            <p className="text-sm text-muted-foreground">No firms yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
