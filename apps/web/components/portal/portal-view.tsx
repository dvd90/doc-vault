'use client'
import { useState } from 'react'
import { CheckCircle2, Circle, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/lib/use-toast'

interface ChecklistItem {
  id: string
  label: string
  description: string | null
  required: boolean
  sortOrder: number
  completedAt: string | null
  uploads: Array<{ id: string; filename: string }>
}

interface Props {
  client: { id: string; name: string; status: string }
  firm: { name: string; accentColor: string; logoUrl: string | null }
  items: ChecklistItem[]
  token: string
}

export function PortalView({ client, firm, items: initial, token }: Props) {
  const [items, setItems] = useState(initial)
  const [uploading, setUploading] = useState<string | null>(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

  const requiredItems = items.filter((i) => i.required)
  const allDone = requiredItems.every((i) => i.completedAt !== null)

  async function handleUpload(itemId: string, file: File) {
    setUploading(itemId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${apiUrl}/portal/${token}/upload/${itemId}`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? 'Upload failed')
      }
      const { item } = await res.json() as { item: ChecklistItem }
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, completedAt: item.completedAt } : i)))
      toast({ title: 'File uploaded' })
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : 'Upload failed', variant: 'destructive' })
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-white border-b" style={{ borderTopColor: firm.accentColor, borderTopWidth: 4 }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          {firm.logoUrl && <img src={firm.logoUrl} alt={firm.name} className="h-8 object-contain" />}
          <div>
            <div className="font-semibold" style={{ color: firm.accentColor }}>{firm.name}</div>
            <div className="text-xs text-muted-foreground">Secure document portal</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {allDone ? (
          <div className="text-center py-16">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">All done!</h2>
            <p className="text-muted-foreground">Thank you, {client.name}. Your documents have been received by {firm.name}.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Upload your documents</h1>
              <p className="text-muted-foreground mt-1">Hi {client.name}, please upload the following documents for {firm.name}.</p>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    {item.completedAt ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.label}</span>
                        {!item.required && <Badge variant="outline" className="text-xs">Optional</Badge>}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                      {item.uploads.length > 0 && (
                        <div className="mt-1 text-xs text-green-600">
                          {item.uploads.map((u) => u.filename).join(', ')}
                        </div>
                      )}
                    </div>
                    {!item.completedAt && (
                      <label className="cursor-pointer shrink-0">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,image/*"
                          disabled={uploading === item.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleUpload(item.id, file)
                          }}
                        />
                        <Button variant="outline" size="sm" disabled={uploading === item.id} asChild>
                          <span>
                            {uploading === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <><Upload className="h-3.5 w-3.5 mr-1.5" />Upload</>
                            )}
                          </span>
                        </Button>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
