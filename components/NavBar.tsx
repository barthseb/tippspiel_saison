'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface NavBarProps {
  userEmail: string
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/teilnehmer', label: 'Teilnehmer' },
  { href: '/dashboard/spiele', label: 'Spiele' },
  { href: '/dashboard/rangliste', label: 'Rangliste' },
]

export default function NavBar({ userEmail }: NavBarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-zinc-900 text-sm">⚽ Tippspiel 2026</span>
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 hidden sm:block">{userEmail}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-zinc-500 hover:text-zinc-900 text-sm"
          >
            Abmelden
          </Button>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="sm:hidden flex border-t border-zinc-100 overflow-x-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 text-center py-2 text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
                isActive
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-zinc-500'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </header>
  )
}
