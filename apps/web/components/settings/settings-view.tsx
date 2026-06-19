'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { toast } from '@/lib/use-toast'

interface Firm {
  id: string
  name: string
  accentColor: string
  logoUrl: string | null
  subscriptionStatus: string
  trialEndsAt: string | null
  stripeCustomerId: string | null
}

export function SettingsView({ firm: initial }: { firm: Firm | null }) {
  const [firm, setFirm] = useState(initial)
  const [name, setName] = useState(initial?.name ?? '')
  const [accentColor, setAccentColor] = useState(initial?.accentColor ?? '#185FA5')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  if (!firm) return <div>Failed to load settings.</div>

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await api.patch<Firm>('/firms/me', { name, accentColor })
      setFirm(updated)
      toast({ title: 'Settings saved' })
    } catch {
      toast({ title: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      const updated = await api.upload<Firm>('/firms/me/logo', formData)
      setFirm(updated)
      toast({ title: 'Logo updated' })
    } catch {
      toast({ title: 'Failed to upload logo', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  async function handleBillingPortal() {
    try {
      const { url } = await api.post<{ url: string }>('/billing/portal')
      window.location.href = url
    } catch {
      toast({ title: 'Could not open billing portal', variant: 'destructive' })
    }
  }

  const subVariant =
    firm.subscriptionStatus === 'active'
      ? 'success'
      : firm.subscriptionStatus === 'trial'
        ? 'warning'
        : 'destructive'

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Firm branding</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="firmName">Firm name</Label>
                <Input
                  id="firmName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accentColor">Accent colour</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    id="accentColor"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="w-32 font-mono"
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {firm.logoUrl && (
              <img src={firm.logoUrl} alt="Firm logo" className="h-16 object-contain" />
            )}
            <Label htmlFor="logo" className="cursor-pointer">
              <Button variant="outline" size="sm" disabled={uploading} asChild>
                <span>{uploading ? 'Uploading…' : 'Upload logo'}</span>
              </Button>
            </Label>
            <input
              id="logo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">Status:</span>
              <Badge variant={subVariant as 'success' | 'warning' | 'destructive'}>
                {firm.subscriptionStatus}
              </Badge>
              {firm.trialEndsAt && firm.subscriptionStatus === 'trial' && (
                <span className="text-xs text-muted-foreground">
                  Ends {new Date(firm.trialEndsAt).toLocaleDateString()}
                </span>
              )}
            </div>
            {firm.stripeCustomerId ? (
              <Button variant="outline" size="sm" onClick={handleBillingPortal}>
                Manage billing
              </Button>
            ) : (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/billing/checkout`}
              >
                <Button size="sm">Subscribe — $49/month</Button>
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
