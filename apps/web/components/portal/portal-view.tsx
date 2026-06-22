'use client'
import { useState } from 'react'
import { CheckCircle2, Upload, Loader2 } from 'lucide-react'
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
  const completedRequired = requiredItems.filter((i) => i.completedAt !== null)
  const progress =
    requiredItems.length > 0
      ? Math.round((completedRequired.length / requiredItems.length) * 100)
      : 100
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
        throw new Error((body as { message?: string }).message ?? 'Upload failed')
      }
      const { item } = (await res.json()) as { item: ChecklistItem }
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, completedAt: item.completedAt } : i)),
      )
      toast({ title: 'File uploaded' })
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : 'Upload failed', variant: 'destructive' })
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header
        className="bg-white border-b relative"
        style={{ borderTopColor: firm.accentColor, borderTopWidth: 4 }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          {firm.logoUrl && (
            <img src={firm.logoUrl} alt={firm.name} className="h-8 object-contain" />
          )}
          <div>
            <div className="font-semibold text-slate-900" style={{ color: firm.accentColor }}>
              {firm.name}
            </div>
            <div className="text-xs text-slate-500">{client.name} · Secure document portal</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {allDone ? (
          <div className="text-center py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900">All done!</h2>
            <p className="mt-2 text-slate-500">
              Thank you, {client.name}. Your documents have been received by {firm.name}.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Upload your documents</h1>
              <p className="mt-1 text-slate-500">
                Hi {client.name}, please upload the following documents for {firm.name}.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* gradient shimmer line */}
              <div className="h-0.5 bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400" />

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 last:border-0"
                >
                  {item.completedAt ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300">
                      <Upload className="h-2.5 w-2.5 text-slate-400" />
                    </span>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          item.completedAt
                            ? 'text-sm font-medium text-slate-400 line-through'
                            : 'text-sm font-medium text-slate-700'
                        }
                      >
                        {item.label}
                      </span>
                      {!item.required && (
                        <Badge variant="outline" className="text-xs">
                          Optional
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    )}
                    {item.uploads.length > 0 && (
                      <div className="mt-0.5 text-xs text-emerald-600">
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
                            <>
                              <Upload className="h-3.5 w-3.5 mr-1.5" />
                              Upload
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                  )}
                </div>
              ))}

              {/* progress footer */}
              <div className="flex items-center justify-between bg-blue-50 px-4 py-3 ring-1 ring-inset ring-blue-100">
                <span className="text-xs font-semibold text-blue-600">
                  {completedRequired.length} of {requiredItems.length} complete
                </span>
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
