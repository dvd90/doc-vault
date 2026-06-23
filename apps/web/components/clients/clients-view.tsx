'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { toast } from '@/lib/use-toast'
import { Users, Plus, Trash2 } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  taxYear: string
  status: string
  createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  complete: 'Complete',
}

const STATUS_VARIANT: Record<string, 'outline' | 'warning' | 'success'> = {
  not_started: 'outline',
  in_progress: 'warning',
  complete: 'success',
}

export function ClientsView({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter()
  const [clients, setClients] = useState(initialClients)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', taxYear: '' })
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const created = await api.post<Client>('/clients', form)
      toast({ title: 'Client created' })
      router.push(`/clients/${created.id}`)
    } catch {
      toast({ title: 'Failed to create client', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Archive this client?')) return
    try {
      await api.delete(`/clients/${id}`)
      setClients((prev) => prev.filter((c) => c.id !== id))
      toast({ title: 'Client archived' })
    } catch {
      toast({ title: 'Failed to archive client', variant: 'destructive' })
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground text-sm">
            {clients.length} active client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Add client
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No clients yet</h3>
            <p className="text-muted-foreground mb-4">Add your first client to get started.</p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-3 py-4 px-4">
                <Link href={`/clients/${client.id}`} className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base">{client.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">
                    <span className="hidden sm:inline">{client.email} · </span>
                    {client.taxYear}
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={STATUS_VARIANT[client.status] ?? 'outline'}
                    className="hidden xs:inline-flex"
                  >
                    {STATUS_LABELS[client.status] ?? client.status}
                  </Badge>
                  <span className="xs:hidden text-xs text-muted-foreground">
                    {client.status === 'complete'
                      ? '✓'
                      : client.status === 'in_progress'
                        ? '…'
                        : '—'}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Alice Smith"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="alice@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxYear">Tax year</Label>
              <Input
                id="taxYear"
                value={form.taxYear}
                onChange={(e) => setForm({ ...form, taxYear: e.target.value })}
                placeholder="2024-25"
                required
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Creating…' : 'Create client'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
