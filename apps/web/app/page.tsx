import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  Link2,
  Lock,
  Mail,
  Palette,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  Users,
  Zap,
} from 'lucide-react'
export const metadata = {
  title: 'DocVault — Collect client documents without the chase',
  description:
    'DocVault helps accountants collect documents from clients with branded checklists and magic links. No client logins. No more email back-and-forth. Start your 14-day free trial.',
}

export default function LandingPage() {
  const signup = '/login'
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Nav signup={signup} />
      <Hero signup={signup} />
      <Stats />
      <LogoStrip />
      <Problem />
      <Features />
      <HowItWorks />
      <Pricing signup={signup} />
      <Testimonials />
      <Faq />
      <FinalCta signup={signup} />
      <Footer signup={signup} />
    </div>
  )
}

/* ─── Nav ──────────────────────────────────────────────────────────────────── */

function Nav({ signup }: { signup: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-bold tracking-tight text-slate-900">DocVault</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
          <a href="#features" className="transition-colors hover:text-slate-900">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-slate-900">
            How it works
          </a>
          <a href="#pricing" className="transition-colors hover:text-slate-900">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-slate-900">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href={signup}
            className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 sm:block"
          >
            Sign in
          </a>
          <a
            href={signup}
            className="shimmer-btn inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-4 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.03] hover:shadow-blue-500/40"
          >
            Start free
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  )
}

function Logo() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 shadow-md shadow-blue-500/30">
      <Lock className="h-4 w-4 text-white" />
    </span>
  )
}

/* ─── Hero ─────────────────────────────────────────────────────────────────── */

function Hero({ signup }: { signup: string }) {
  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-16 lg:pb-32">
      {/* Soft animated blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-24 -top-16 h-[560px] w-[560px] rounded-full bg-blue-100 blur-3xl" />
        <div className="animate-blob absolute -right-24 top-0 h-[480px] w-[480px] rounded-full bg-violet-100 blur-3xl [animation-delay:2.5s]" />
        <div className="animate-blob absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-sky-100 blur-3xl [animation-delay:5s]" />
      </div>

      {/* Dot-grid overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_65%_at_50%_0%,#000_50%,transparent_100%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:py-10">
        {/* Copy */}
        <div className="animate-fade-up">
          {/* Announcement banner */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Built for accountants &amp; bookkeepers
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.6rem]">
            Stop chasing clients
            <br className="hidden sm:block" />
            for{' '}
            <span className="animate-gradient-pan bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 bg-[length:200%_auto] bg-clip-text text-transparent">
              documents
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
            Send a branded checklist with one magic link. Clients upload their files — no logins, no
            apps, no friction. You get notified the moment everything&apos;s in.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={signup}
              className="shimmer-btn inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-7 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98]"
            >
              Start 14-day free trial
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-7 text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              See how it works
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Cancel anytime
            </span>
          </div>
        </div>

        {/* Mockup */}
        <div className="animate-fade-up [animation-delay:200ms]">
          <HeroMockup />
        </div>
      </div>
    </section>
  )
}

function HeroMockup() {
  const items = [
    { label: 'P60 from employer', done: true },
    { label: '3 months bank statements', done: true },
    { label: 'Mortgage interest certificate', done: false },
    { label: 'Dividend vouchers', done: false },
  ]
  return (
    <div className="relative animate-float">
      {/* Glow halo */}
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-blue-200/60 via-violet-200/40 to-transparent blur-2xl" />

      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/80">
        {/* Top edge shimmer */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400" />

        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Self Assessment 2024–25
            </p>
            <p className="mt-0.5 text-base font-bold text-slate-900">Alice Smith</p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 ring-1 ring-amber-200">
            In progress
          </span>
        </div>

        <div className="mb-4 space-y-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5"
            >
              {item.done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300">
                  <Upload className="h-2.5 w-2.5 text-slate-400" />
                </span>
              )}
              <span
                className={
                  item.done
                    ? 'text-sm font-medium text-slate-400 line-through'
                    : 'text-sm font-medium text-slate-700'
                }
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2.5 ring-1 ring-blue-100">
          <span className="text-xs font-semibold text-blue-600">2 of 4 complete</span>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-blue-100">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
          </div>
        </div>
      </div>

      {/* Notification badge — sits outside the card so it isn't clipped by overflow-hidden */}
      <div className="absolute -right-3 -top-3 z-10 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/30">
        <Bell className="h-3 w-3 shrink-0" />
        New upload!
      </div>
    </div>
  )
}

/* ─── Stats ────────────────────────────────────────────────────────────────── */

function Stats() {
  const stats = [
    { value: '500+', label: 'Accounting firms', icon: Users },
    { value: '2M+', label: 'Documents collected', icon: FileText },
    { value: '4.9★', label: 'Average rating', icon: Star },
  ]
  return (
    <div className="border-y border-slate-100 bg-slate-50/60">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid grid-cols-3 gap-4 text-center">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
                {value}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Logo strip ───────────────────────────────────────────────────────────── */

function LogoStrip() {
  const names = [
    'Meridian & Co',
    'Harbour Tax',
    'Lumen Accounts',
    'Crest Advisory',
    'Northgate CPA',
    'Atlas Partners',
    'Summit Bookkeeping',
    'Clarity Finance',
  ]
  return (
    <section className="overflow-hidden border-b border-slate-100 bg-white py-12">
      <p className="mb-7 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
        Trusted by modern accounting practices
      </p>
      <div className="animate-marquee gap-16 text-base font-bold text-slate-300">
        {[...names, ...names].map((n, i) => (
          <span key={i} className="shrink-0 px-8">
            {n}
          </span>
        ))}
      </div>
    </section>
  )
}

/* ─── Problem ──────────────────────────────────────────────────────────────── */

function Problem() {
  const pains = [
    'Endless "just following up" emails',
    'Files scattered across inboxes & WhatsApp',
    'Clients confused by portal logins',
    'Tax deadlines slipping because docs are late',
  ]
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mb-4 inline-block rounded-full bg-rose-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-rose-500">
          The problem
        </span>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Document collection shouldn&apos;t eat your week
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          The average practice loses 5+ hours every week chasing paperwork. Sound familiar?
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
        {pains.map((pain, i) => (
          <div
            key={pain}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50/40 hover:shadow-md"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-500">
              ✕
            </span>
            {pain}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Features ─────────────────────────────────────────────────────────────── */

const FEATURE_COLORS = [
  'from-blue-500 to-blue-600',
  'from-violet-500 to-violet-600',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
  'from-pink-500 to-rose-500',
] as const

function Features() {
  const features = [
    {
      icon: FileText,
      title: 'Reusable checklists',
      body: 'Build templates once — Self Assessment, year-end, onboarding — and apply them to any client in a click.',
    },
    {
      icon: Link2,
      title: 'Magic-link portals',
      body: 'Each client gets a private URL. No accounts, no passwords. They click, they upload, done.',
    },
    {
      icon: Bell,
      title: 'Instant notifications',
      body: 'Get an email the moment a client uploads — and when their checklist is fully complete.',
    },
    {
      icon: Palette,
      title: 'Your branding',
      body: 'Add your logo and accent colour. Clients see your firm, not ours.',
    },
    {
      icon: Clock,
      title: 'Automatic reminders',
      body: 'DocVault nudges clients who go quiet, so you never have to send another follow-up.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure by default',
      body: 'Files stored encrypted on AWS S3. Access scoped tightly to each client portal.',
    },
  ]

  return (
    <section id="features" className="bg-slate-50/70 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Features
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to collect documents
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            One tool that replaces the spreadsheet, the email chain, and the clunky portal.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="glow-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-lg"
            >
              {/* Colour accent top bar */}
              <div
                className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${FEATURE_COLORS[i]} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${FEATURE_COLORS[i]} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── How it works ─────────────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      step: '1',
      title: 'Build a checklist',
      body: 'Pick a template or create one. Add the documents you need from your client.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Mail,
      step: '2',
      title: 'Send the magic link',
      body: 'One click emails your client a branded portal link — no login required.',
      color: 'from-violet-500 to-violet-600',
    },
    {
      icon: Zap,
      step: '3',
      title: 'They upload, you relax',
      body: 'Clients drop in files from any device. You get notified when everything is in.',
      color: 'from-emerald-500 to-teal-500',
    },
  ]

  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-violet-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-violet-600">
            How it works
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Live in under 5 minutes</h2>
          <p className="mt-4 text-lg text-slate-600">
            No onboarding calls. No setup fees. Sign in with Google and send your first checklist
            today.
          </p>
        </div>

        <div className="relative mt-16 grid gap-10 md:grid-cols-3">
          {/* Connecting gradient line */}
          <div className="absolute left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] top-8 hidden h-px bg-gradient-to-r from-blue-300 via-violet-300 to-emerald-300 md:block" />

          {steps.map(({ icon: Icon, step, title, body, color }, i) => (
            <div
              key={step}
              className="relative flex flex-col items-center text-center"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="relative z-10">
                <span
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-xl`}
                >
                  <Icon className="h-7 w-7" />
                </span>
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-800 shadow ring-1 ring-slate-200">
                  {step}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mx-auto mt-2 max-w-[14rem] text-sm leading-relaxed text-slate-600">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ──────────────────────────────────────────────────────────────── */

function Pricing({ signup }: { signup: string }) {
  const perks = [
    'Unlimited clients & checklists',
    'Unlimited document uploads',
    'Custom branding & accent colour',
    'Automatic client reminders',
    'Instant email notifications',
    'Secure AWS S3 file storage',
    'Google OAuth — no passwords',
    'Cancel anytime',
  ]

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-blue-500 py-28"
    >
      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:40px_40px]" />
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,255,255,0.15),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-white">
            Pricing
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            One simple plan. No surprises.
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Everything included. Start free for 14 days — pay only when you&apos;re hooked.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-md">
          <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-2xl shadow-blue-900/30">
            {/* Corner badge */}
            <div className="absolute right-0 top-0 rounded-bl-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
              14-day free trial
            </div>
            {/* Top edge highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500" />

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              DocVault Pro
            </p>
            <div className="mt-4 flex items-end gap-1">
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
                $49
              </span>
              <span className="mb-1.5 text-slate-500">/ month</span>
            </div>
            <p className="mt-1.5 text-sm text-slate-500">
              Per firm · billed monthly · cancel anytime
            </p>
            <a
              href={signup}
              className="shimmer-btn mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/40"
            >
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </a>
            <ul className="mt-8 space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials ─────────────────────────────────────────────────────────── */

function Testimonials() {
  const quotes = [
    {
      body: 'DocVault has saved our team at least 3 hours every week. Clients actually upload on time now!',
      name: 'Sarah Mitchell',
      role: 'Senior Accountant, Meridian & Co',
      stars: 5,
    },
    {
      body: 'The magic-link portal is genius. No more "I forgot my password" calls. Pure bliss.',
      name: 'James Adeyemi',
      role: 'Partner, Harbour Tax',
      stars: 5,
    },
    {
      body: 'Onboarded in 10 minutes, sent our first checklist in 15. Game changer for self assessment season.',
      name: 'Priya Nair',
      role: 'Founder, Lumen Accounts',
      stars: 5,
    },
  ]

  return (
    <section className="bg-slate-50/70 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-600">
            Testimonials
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Loved by busy practices</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {quotes.map(({ body, name, role, stars }) => (
            <div
              key={name}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <Quote className="mb-3 h-6 w-6 text-blue-200 transition-colors group-hover:text-blue-400" />
              <p className="flex-1 text-sm leading-relaxed text-slate-700">&ldquo;{body}&rdquo;</p>
              <div className="mt-4 flex items-center gap-0.5">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="text-sm font-semibold text-slate-900">{name}</p>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FAQ ──────────────────────────────────────────────────────────────────── */

function Faq() {
  const faqs = [
    {
      q: 'Do my clients need to create an account?',
      a: 'No. Each client gets a unique magic link to their private portal. They click it and upload — no passwords, no sign-ups, nothing to forget.',
    },
    {
      q: 'How do I log in?',
      a: 'Accountants sign in with their Google account in one click. Your session is secured with an HttpOnly cookie.',
    },
    {
      q: "Is my clients' data secure?",
      a: "Files are stored encrypted on AWS S3, and every upload is scoped to a single client portal. We never expose one client's files to another.",
    },
    {
      q: 'Can I use my own branding?',
      a: "Yes — add your firm's logo and accent colour so clients see a portal that looks like yours, not ours.",
    },
    {
      q: 'What happens after the free trial?',
      a: "After 14 days you're billed $49/month. No credit card is required to start, and you can cancel anytime from your billing settings.",
    },
  ]

  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="mb-4 inline-block rounded-full bg-amber-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-amber-600">
            FAQ
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-12 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-slate-200 bg-white shadow-sm transition-all open:border-blue-200 open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-slate-900 transition-colors hover:text-blue-600 sm:text-base">
                {faq.q}
                <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all group-open:rotate-45 group-open:bg-blue-500 group-open:text-white">
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 pt-0 text-sm leading-relaxed text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Final CTA ────────────────────────────────────────────────────────────── */

function FinalCta({ signup }: { signup: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-blue-500 py-28">
      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:40px_40px]" />
      {/* Radial light */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(255,255,255,0.12),transparent)]" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <div className="mx-auto mb-5 flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3.5 py-1 text-xs font-semibold text-white">
          <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
          Loved by busy practices everywhere
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Get your evenings back this tax season
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-blue-100">
          Join the accountants who&apos;ve stopped chasing paperwork. Set up your first checklist in
          minutes.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={signup}
            className="shimmer-btn inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-600 shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.03] hover:shadow-blue-900/30 active:scale-[0.98]"
          >
            Start your free trial
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <p className="mt-4 text-sm text-blue-200">14 days free · No credit card required</p>
      </div>
    </section>
  )
}

/* ─── Footer ───────────────────────────────────────────────────────────────── */

function Footer({ signup }: { signup: string }) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-bold text-slate-900">DocVault</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-500">
          <a href="#features" className="transition-colors hover:text-slate-900">
            Features
          </a>
          <a href="#pricing" className="transition-colors hover:text-slate-900">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-slate-900">
            FAQ
          </a>
          <a href={signup} className="transition-colors hover:text-slate-900">
            Sign in
          </a>
        </nav>
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} DocVault</p>
      </div>
    </footer>
  )
}
