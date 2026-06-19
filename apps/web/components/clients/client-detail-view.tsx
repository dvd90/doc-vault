'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { toast } from '@/lib/use-toast'
import { CheckCircle2, Circle, ArrowLeft, Send, Bell, Copy, ExternalLink } from 'lucide-react'

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

export function ClientDetailView({
  client: initial,
  templates,
}: {
  client: Client
  templates: Template[]
}) {
  const [client, setClient] = useState(initial)
  const [sending, setSending] = useState(false)
  const [reminding, setReminding] = useState(false)
  const [applyingId, setApplyingId] = useState<string | null>(null)

  const portalUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace(':4000', ':3000') ?? 'http://localhost:3000'}/portal/${client.portalToken}`

  const requiredItems = client.items.filter((i) => i.required)
  const completedRequired = requiredItems.filter((i) => i.completedAt !== null)
  const progress =
    requiredItems.length > 0
      ? Math.round((completedRequired.length / requiredItems.length) * 100)
      : 100

  async function handleInvite() {
    setSending(true)
    try {
      await api.post(`/clients/${client.id}/invite`)
      toast({ title: 'Invite sent', description: `Portal link sent to ${client.email}` })
    } catch {
      toast({ title: 'Failed to send invite', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  async function handleRemind() {
    setReminding(true)
    try {
      await api.post(`/clients/${client.id}/remind`)
      toast({ title: 'Reminder sent' })
    } catch {
      toast({ title: 'Failed to send reminder', variant: 'destructive' })
    } finally {
      setReminding(false)
    }
  }

  async function handleApplyTemplate(templateId: string) {
    setApplyingId(templateId)
    try {
      const updated = await api.post<Client>(`/clients/${client.id}/apply-template`, { templateId })
      setClient(updated)
      toast({ title: 'Template applied' })
    } catch {
      toast({ title: 'Failed to apply template', variant: 'destructive' })
    } finally {
      setApplyingId(null)
    }
  }

  function copyPortalLink() {
    navigator.clipboard.writeText(portalUrl)
    toast({ title: 'Portal link copied' })
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3 w-3" /> All clients
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">
              {client.email} · Tax year {client.taxYear}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyPortalLink}>
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy portal link
            </Button>
            <Button variant="outline" size="sm" onClick={handleRemind} disabled={reminding}>
              <Bell className="h-3.5 w-3.5 mr-1.5" />
              {reminding ? 'Sending…' : 'Remind'}
            </Button>
            <Button size="sm" onClick={handleInvite} disabled={sending}>
              <Send className="h-3.5 w-3.5 mr-1.5" />
              {sending ? 'Sending…' : 'Send invite'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Checklist</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {completedRequired.length}/{requiredItems.length} required
                </div>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="divide-y">
              {client.items.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No items yet. Apply a template below.
                </p>
              )}
              {client.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-3">
                  {item.completedAt ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    )}
                    {item.uploads.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.uploads.map((u) => (
                          <div key={u.id} className="text-xs text-blue-600">
                            {u.filename}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {!item.required && (
                    <Badge variant="outline" className="text-xs">
                      Optional
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Portal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href={portalUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                Open client portal <ExternalLink className="h-3 w-3" />
              </a>
              <p className="text-xs text-muted-foreground break-all">{portalUrl}</p>
            </CardContent>
          </Card>

          {templates.length > 0 && client.items.length === 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Apply template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((tmpl) => (
                  <Button
                    key={tmpl.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    disabled={applyingId === tmpl.id}
                    onClick={() => handleApplyTemplate(tmpl.id)}
                  >
                    {applyingId === tmpl.id ? 'Applying…' : tmpl.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
