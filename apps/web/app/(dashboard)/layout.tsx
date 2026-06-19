import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getMe } from '@/lib/auth'
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react'

async function getSession() {
  // In SSR, we can't directly call the API with cookies from the browser.
  // We read the JWT cookie and forward it to the API.
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/me`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json() as Promise<{ user: { name: string; email: string; avatarUrl: string | null }; firm: { name: string } }>
  } catch {
    return null
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <span className="text-xl font-bold text-primary">DocVault</span>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{session.firm.name}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</NavLink>
          <NavLink href="/clients" icon={<Users className="h-4 w-4" />}>Clients</NavLink>
          <NavLink href="/settings" icon={<Settings className="h-4 w-4" />}>Settings</NavLink>
        </nav>
        <div className="p-3 border-t">
          <div className="text-sm font-medium truncate">{session.user.name}</div>
          <a href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/logout`} className="flex items-center gap-2 text-xs text-muted-foreground mt-1 hover:text-foreground">
            <LogOut className="h-3 w-3" /> Sign out
          </a>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
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
