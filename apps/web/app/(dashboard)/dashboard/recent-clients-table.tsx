import Link from 'next/link'

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

const STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-amber-100 text-amber-700',
  complete: 'bg-emerald-100 text-emerald-700',
}

export function RecentClientsTable({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No clients yet — add your first one above.
      </p>
    )
  }

  return (
    <div className="divide-y">
      {clients.map((c) => (
        <div key={c.id} className="flex items-center gap-2 py-3 px-1">
          {/* Name + meta */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{c.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              <span className="hidden sm:inline">{c.email} · </span>
              {c.taxYear}
            </p>
          </div>

          {/* Badge */}
          <span
            className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? 'bg-slate-100 text-slate-600'}`}
          >
            <span className="hidden xs:inline">{STATUS_LABELS[c.status] ?? c.status}</span>
            <span className="xs:hidden">
              {c.status === 'complete' ? '✓' : c.status === 'in_progress' ? '…' : '—'}
            </span>
          </span>

          {/* View link */}
          <Link
            href={`/clients/${c.id}`}
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            View
          </Link>
        </div>
      ))}
    </div>
  )
}
