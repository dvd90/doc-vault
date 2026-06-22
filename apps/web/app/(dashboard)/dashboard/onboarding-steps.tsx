import Link from 'next/link'
import { UserPlus, FileText, Send } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    title: 'Create a client',
    desc: 'Add their name, email, and tax year.',
  },
  {
    icon: FileText,
    title: 'Apply a template',
    desc: 'Pick a saved checklist or add items manually.',
  },
  {
    icon: Send,
    title: 'Send the invite',
    desc: 'One click sends your client a magic-link portal.',
  },
]

export function OnboardingSteps() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <p className="text-lg font-semibold text-slate-800 mb-1">Welcome to DocVault</p>
      <p className="text-sm text-muted-foreground mb-8">
        Get your first client set up in three steps.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        {steps.map((step, i) => (
          <div key={step.title} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-2 max-w-[160px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs font-semibold text-slate-700">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden sm:block h-px w-8 bg-slate-200 shrink-0" />
            )}
          </div>
        ))}
      </div>

      <Link
        href="/clients"
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Add your first client
      </Link>
    </div>
  )
}
