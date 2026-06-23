import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X } from 'lucide-react'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'

async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/me`,
      {
        headers: { Cookie: `token=${token}` },
        cache: 'no-store',
      },
    )
    if (!res.ok) return null
    return res.json() as Promise<{
      user: { name: string; email: string; avatarUrl: string | null }
      firm: { name: string }
    }>
  } catch {
    return null
  }
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' as const },
  { href: '/clients', label: 'Clients', icon: 'clients' as const },
  { href: '/templates', label: 'Templates', icon: 'templates' as const },
  { href: '/settings', label: 'Settings', icon: 'settings' as const },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-white border-r flex-col shrink-0">
        <div className="p-4 border-b">
          <span className="text-xl font-bold text-primary">DocVault</span>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{session.firm.name}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <DesktopNavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
            Dashboard
          </DesktopNavLink>
          <DesktopNavLink href="/clients" icon={<Users className="h-4 w-4" />}>
            Clients
          </DesktopNavLink>
          <DesktopNavLink href="/templates" icon={<FileText className="h-4 w-4" />}>
            Templates
          </DesktopNavLink>
          <DesktopNavLink href="/settings" icon={<Settings className="h-4 w-4" />}>
            Settings
          </DesktopNavLink>
        </nav>
        <div className="p-3 border-t">
          <div className="text-sm font-medium truncate">{session.user.name}</div>
          <a
            href="/auth/logout"
            className="flex items-center gap-2 text-xs text-muted-foreground mt-1 hover:text-foreground"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </a>
        </div>
      </aside>

      {/* Mobile layout */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between bg-white border-b px-4 py-3 sticky top-0 z-40">
          <div>
            <span className="text-lg font-bold text-primary">DocVault</span>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">{session.firm.name}</p>
          </div>
          <MobileSidebar userName={session.user.name} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t flex">
          <MobileNavLink href="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
          <MobileNavLink href="/clients" icon={<Users className="h-5 w-5" />} label="Clients" />
          <MobileNavLink href="/templates" icon={<FileText className="h-5 w-5" />} label="Templates" />
          <MobileNavLink href="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
        </nav>
      </div>
    </div>
  )
}

function DesktopNavLink({
  href,
  icon,
  children,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      {icon}
      {children}
    </Link>
  )
}

function MobileNavLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-muted-foreground hover:text-primary transition-colors"
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )
}
