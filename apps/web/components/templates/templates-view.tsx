'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { toast } from '@/lib/use-toast'
import { FileText, Plus, Trash2, X } from 'lucide-react'

interface TemplateItem {
  id: string
  label: string
  required: boolean
  sortOrder: number
}

interface Template {
  id: string
  name: string
  items: TemplateItem[]
}

interface DraftItem {
  label: string
  required: boolean
}

export function TemplatesView({ initialTemplates }: { initialTemplates: Template[] }) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [items, setItems] = useState<DraftItem[]>([{ label: '', required: true }])
  const [saving, setSaving] = useState(false)

  function addItem() {
    setItems((prev) => [...prev, { label: '', required: true }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function resetForm() {
    setName('')
    setItems([{ label: '', required: true }])
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name,
        items: items
          .filter((i) => i.label.trim())
          .map((i, sortOrder) => ({ label: i.label.trim(), required: i.required, sortOrder })),
      }
      const created = await api.post<Template>('/templates', payload)
      setTemplates((prev) => [...prev, created])
      setOpen(false)
      resetForm()
      toast({ title: 'Template created' })
    } catch {
      toast({ title: 'Failed to create template', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this template?')) return
    try {
      await api.delete(`/templates/${id}`)
      setTemplates((prev) => prev.filter((t) => t.id !== id))
      toast({ title: 'Template deleted' })
    } catch {
      toast({ title: 'Failed to delete template', variant: 'destructive' })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Reusable document checklists to apply to clients
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No templates yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first template to define which documents to collect.
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> New template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Card key={t.id} className="relative group">
              <CardHeader className="pb-2">
                <CardTitle className="text-base pr-8">{t.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t.items.length} {t.items.length === 1 ? 'item' : 'items'}
                </p>
              </CardHeader>
              <CardContent className="space-y-1">
                {t.items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="text-xs text-muted-foreground flex items-center gap-1.5"
                  >
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
                    {item.label}
                  </div>
                ))}
                {t.items.length > 4 && (
                  <p className="text-xs text-muted-foreground">+{t.items.length - 4} more</p>
                )}
              </CardContent>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                aria-label="delete"
                onClick={() => handleDelete(t.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) resetForm()
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="template-name">Template name</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Self Assessment Pack"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Document items</Label>
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={item.label}
                    onChange={(e) => updateItem(i, { label: e.target.value })}
                    placeholder="e.g. P60"
                    className="flex-1"
                  />
                  <label className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.required}
                      onChange={(e) => updateItem(i, { required: e.target.checked })}
                      className="h-3.5 w-3.5"
                    />
                    Required
                  </label>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removeItem(i)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add item
              </Button>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Creating…' : 'Create template'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
