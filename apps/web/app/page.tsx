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
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
} from 'lucide-react'
import { loginUrl } from '@/lib/auth'

export const metadata = {
  title: 'DocVault — Collect client documents without the chase',
  description:
    'DocVault helps accountants collect documents from clients with branded checklists and magic links. No client logins. No more email back-and-forth. Start your 14-day free trial.',
}

export default function LandingPage() {
  const signup = loginUrl()

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Nav signup={signup} />
      <Hero signup={signup} />
      <LogoStrip />
      <Problem />
      <Features />
      <HowItWorks />
      <Pricing signup={signup} />
      <Faq />
      <FinalCta signup={signup} />
      <Footer />
    </div>
  )
}

/* ─── Nav ──────────────────────────────────────────────────────────────── */
function Nav({ signup }: { signup: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-bold tracking-tight">DocVault</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="transition-colors hover:text-slate-900">
            Features
          </a>
          <a href="#how" className="transition-colors hover:text-slate-900">
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
            className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:block"
          >
            Sign in
          </a>
          <a
            href={signup}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/40"
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
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-400 shadow-sm shadow-primary/40">
      <Lock className="h-4 w-4 text-white" />
    </span>
  )
}

/* ─── Hero ─────────────────────────────────────────────────────────────── */
function Hero({ signup }: { signup: string }) {
  return (
    <section className="relative overflow-hidden">
      {/* background glow + grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/25 via-blue-300/20 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div className="animate-fade-up">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Built for accountants &amp; bookkeepers
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Stop chasing clients for{' '}
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
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
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40"
            >
              Start 14-day free trial
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#how"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-7 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              See how it works
            </a>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            No credit card required · Cancel anytime
          </p>
        </div>

        <div className="animate-fade-up [animation-delay:150ms]">
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
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 to-blue-300/10 blur-2xl" />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/40">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Self Assessment 2024–25
            </p>
            <p className="text-base font-bold text-slate-900">Alice Smith</p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
            In progress
          </span>
        </div>
        <div className="mb-4 space-y-2.5">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5"
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
        <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5">
          <span className="text-xs font-medium text-primary">2 of 4 complete</span>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-primary/15">
            <div className="h-full w-1/2 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Logo strip ───────────────────────────────────────────────────────── */
function LogoStrip() {
  return (
    <section className="border-y border-slate-100 bg-slate-50/50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
          Trusted by modern accounting practices
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-lg font-bold text-slate-300">
          <span>Meridian &amp; Co</span>
          <span>Harbour Tax</span>
          <span>Lumen Accounts</span>
          <span>Crest Advisory</span>
          <span>Northgate CPA</span>
        </div>
      </div>
    </section>
  )
}

/* ─── Problem ──────────────────────────────────────────────────────────── */
function Problem() {
  const pains = [
    'Endless "just following up" emails',
    'Files scattered across inboxes & WhatsApp',
    'Clients confused by portal logins',
    'Tax deadlines slipping because docs are late',
  ]
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Document collection shouldn&apos;t eat your week
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          The average practice loses hours every week chasing paperwork. DocVault turns that chaos
          into a single, calm checklist.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
        {pains.map((pain) => (
          <div
            key={pain}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-600"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              ✕
            </span>
            {pain}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Features ─────────────────────────────────────────────────────────── */
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
    <section id="features" className="bg-slate-50/60 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to collect documents
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            One tool that replaces the spreadsheet, the email chain, and the clunky portal.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-slate-200/60"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── How it works ─────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      step: '01',
      title: 'Build a checklist',
      body: 'Pick a template or create one. Add the documents you need from your client.',
    },
    {
      icon: Mail,
      step: '02',
      title: 'Send the magic link',
      body: 'One click emails your client a branded portal link — no login required.',
    },
    {
      icon: Upload,
      step: '03',
      title: 'They upload, you relax',
      body: 'Clients drop in files from any device. You get notified when everything is in.',
    },
  ]
  return (
    <section id="how" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Live in under 5 minutes</h2>
          <p className="mt-4 text-lg text-slate-600">
            No onboarding calls. No setup fees. Sign in with Google and send your first checklist
            today.
          </p>
        </div>
        <div className="relative mt-16 grid gap-10 md:grid-cols-3">
          {steps.map(({ icon: Icon, step, title, body }) => (
            <div key={step} className="relative text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-400 text-white shadow-lg shadow-primary/30">
                <Icon className="h-7 w-7" />
              </span>
              <span className="mt-4 block text-xs font-bold tracking-widest text-primary/60">
                STEP {step}
              </span>
              <h3 className="mt-1 text-lg font-semibold">{title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ──────────────────────────────────────────────────────────── */
function Pricing({ signup }: { signup: string }) {
  const perks = [
    'Unlimited clients & checklists',
    'Unlimited document uploads',
    'Custom branding & accent colour',
    'Automatic client reminders',
    'Email notifications',
    'Secure S3 file storage',
  ]
  return (
    <section id="pricing" className="bg-slate-50/60 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            One simple plan. No surprises.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything included. Start free for 14 days — pay only when you&apos;re hooked.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-md">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-white p-8 shadow-2xl shadow-primary/10">
            <div className="absolute right-0 top-0 rounded-bl-2xl bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
              14-day free trial
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              DocVault Pro
            </p>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-5xl font-extrabold tracking-tight">$49</span>
              <span className="mb-1.5 text-slate-500">/ month</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Per firm · billed monthly · cancel anytime
            </p>
            <a
              href={signup}
              className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-xl"
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

/* ─── FAQ ──────────────────────────────────────────────────────────────── */
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
      q: 'Is my clients’ data secure?',
      a: 'Files are stored encrypted on AWS S3, and every upload is scoped to a single client portal. We never expose one client’s files to another.',
    },
    {
      q: 'Can I use my own branding?',
      a: 'Yes — add your firm’s logo and accent colour so clients see a portal that looks like yours, not ours.',
    },
    {
      q: 'What happens after the free trial?',
      a: 'After 14 days you’re billed $49/month. No credit card is required to start, and you can cancel anytime from your billing settings.',
    },
  ]
  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition-colors open:border-primary/30 open:bg-primary/[0.02]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-slate-900">
                {faq.q}
                <span className="ml-4 text-primary transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Final CTA ────────────────────────────────────────────────────────── */
function FinalCta({ signup }: { signup: string }) {
  return (
    <section className="px-6 pb-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-blue-500 bg-[length:200%_200%] px-8 py-16 text-center shadow-2xl shadow-primary/30 animate-gradient-pan">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_50%)]" />
        <div className="relative">
          <div className="mx-auto mb-4 flex w-fit items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
            <Star className="h-3.5 w-3.5 fill-white" />
            Loved by busy practices
          </div>
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Get your evenings back this tax season
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-50">
            Join the accountants who&apos;ve stopped chasing paperwork. Set up your first checklist
            in minutes.
          </p>
          <a
            href={signup}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-base font-semibold text-primary shadow-lg transition-transform hover:scale-[1.03]"
          >
            Start your free trial
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-4 text-sm text-blue-100">14 days free · No credit card required</p>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ───────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-bold">DocVault</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-500">
          <a href="#features" className="hover:text-slate-900">
            Features
          </a>
          <a href="#pricing" className="hover:text-slate-900">
            Pricing
          </a>
          <a href="#faq" className="hover:text-slate-900">
            FAQ
          </a>
          <a href={loginUrl()} className="hover:text-slate-900">
            Sign in
          </a>
        </nav>
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} DocVault</p>
      </div>
    </footer>
  )
}
