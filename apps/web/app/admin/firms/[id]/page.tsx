import { notFound } from 'next/navigation'
import Link from 'next/link'
import { adminFetch } from '@/lib/admin-api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, CheckCircle2, Circle } from 'lucide-react'

interface Upload {
  id: string
  filename: string
  fileSize: number
  uploadedAt: string
}

interface ChecklistItem {
  id: string
  label: string
  required: boolean
  completedAt: string | null
  uploads: Upload[]
}

interface Client {
  id: string
  name: string
  email: string
  taxYear: string
  status: string
  archived: boolean
  createdAt: string
  items: ChecklistItem[]
}

interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

interface FirmDetail {
  id: string
  name: string
  accentColor: string
  logoUrl: string | null
  subscriptionStatus: string
  trialEndsAt: string | null
  stripeCustomerId: string | null
  createdAt: string
  users: User[]
  clients: Client[]
}

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'outline'> = {
  active: 'success',
  trial: 'warning',
  cancelled: 'destructive',
}

const clientStatusVariant: Record<string, 'success' | 'warning' | 'outline'> = {
  complete: 'success',
  in_progress: 'warning',
  not_started: 'outline',
}

export default async function AdminFirmDetailPage({ params }: { params: { id: string } }) {
  let firm: FirmDetail
  try {
    firm = await adminFetch<FirmDetail>(`/internal/admin/firms/${params.id}`)
  } catch {
    notFound()
  }

  const totalUploads = firm.clients.flatMap((c) => c.items.flatMap((i) => i.uploads)).length

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/firms"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> All firms
      </Link>

      <div className="flex items-center gap-3 mb-6">
        {firm.logoUrl && <img src={firm.logoUrl} alt={firm.name} className="h-10 object-contain" />}
        <div>
          <h1 className="text-2xl font-bold">{firm.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant={statusVariant[firm.subscriptionStatus] ?? 'outline'}>
              {firm.subscriptionStatus}
            </Badge>
            {firm.stripeCustomerId && (
              <span className="text-xs text-muted-foreground font-mono">
                {firm.stripeCustomerId}
              </span>
            )}
            {firm.trialEndsAt && firm.subscriptionStatus === 'trial' && (
              <span className="text-xs text-muted-foreground">
                Trial ends {new Date(firm.trialEndsAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold tabular-nums">{firm.users.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Team members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold tabular-nums">{firm.clients.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold tabular-nums">{totalUploads}</p>
            <p className="text-xs text-muted-foreground mt-1">Total uploads</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team members</CardTitle>
          </CardHeader>
          <CardContent>
            {firm.users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            ) : (
              <div className="space-y-2">
                {firm.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{user.name}</span>
                      <span className="text-muted-foreground ml-2">{user.email}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clients ({firm.clients.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {firm.clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clients yet.</p>
            ) : (
              firm.clients.map((client) => (
                <div key={client.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">{client.name}</span>
                      <span className="text-muted-foreground text-sm ml-2">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {client.archived && <Badge variant="outline">Archived</Badge>}
                      <Badge variant={clientStatusVariant[client.status] ?? 'outline'}>
                        {client.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{client.taxYear}</span>
                    </div>
                  </div>
                  {client.items.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {client.items.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 text-sm">
                          {item.completedAt ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          )}
                          <span
                            className={
                              item.completedAt ? 'text-foreground' : 'text-muted-foreground'
                            }
                          >
                            {item.label}
                          </span>
                          {item.uploads.length > 0 && (
                            <span className="text-xs text-green-600 ml-auto shrink-0">
                              {item.uploads.length} file{item.uploads.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
