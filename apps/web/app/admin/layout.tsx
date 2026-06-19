import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { LayoutDashboard, Building2, LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const secret = cookies().get('admin_secret')?.value
  if (!secret) redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="p-4 border-b border-t-4 border-t-rose-600">
          <span className="text-xl font-bold">DocVault</span>
          <p className="text-xs text-rose-600 font-medium mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>Overview</NavLink>
          <NavLink href="/admin/firms" icon={<Building2 className="h-4 w-4" />}>Firms</NavLink>
        </nav>
        <div className="p-3 border-t">
          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </form>
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
