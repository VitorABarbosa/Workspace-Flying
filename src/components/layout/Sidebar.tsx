'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/cn'
import { authClient } from '@/lib/auth-client'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navLinks = [
  { href: '/', label: 'Home' },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session } = authClient.useSession()
  const user = session?.user ?? null
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  async function handleLogout() {
    await authClient.signOut()
    onClose()
    router.push('/login')
    router.refresh()
  }

  const isAdmin = (user as { role?: string } | null)?.role === 'admin'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay escuro */}
          <motion.div
            key="overlay"
            data-testid="overlay"
            aria-hidden="true"
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="fixed left-0 top-0 h-full w-[300px] z-50 bg-[#0D0D0D] flex flex-col"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Header da sidebar */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="w-28 h-7 bg-white/20 rounded" aria-hidden="true" />
              <button
                aria-label="Fechar menu"
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-white hover:text-brand-purple transition-colors text-2xl font-light"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Divisor */}
            <div className="border-t border-white/10 mx-6" />

            {/* Links de navegação */}
            <nav className="flex-1 py-6 overflow-y-auto" aria-label="Navegação principal">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    'block py-3 px-6 text-[20px] font-medium',
                    'text-white hover:text-brand-purple',
                    'transition-colors duration-200'
                  )}
                >
                  {label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className={cn(
                    'block py-3 px-6 text-[20px] font-medium',
                    'text-white hover:text-brand-purple',
                    'transition-colors duration-200'
                  )}
                >
                  Painel Admin
                </Link>
              )}
            </nav>

            {/* Rodapé: usuário + logout */}
            {user && (
              <>
                <div className="border-t border-white/10 mx-6" />
                <div className="px-6 py-5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    aria-label="Sair da conta"
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors shrink-0"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Sair
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
