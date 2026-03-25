'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Sidebar from '@/components/layout/Sidebar'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 w-full h-16',
          'flex items-center justify-between px-6 md:px-10',
          'transition-all duration-300',
          scrolled
            ? 'bg-white dark:bg-[#0A0A0A] shadow-sm'
            : 'bg-transparent'
        )}
      >
        {/* Logo placeholder — substituir por <Image> quando asset chegar */}
        <div
          className={cn(
            'w-36 h-9 rounded',
            scrolled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white/20'
          )}
          aria-label="Flying Studio"
        />

        {/* Control pill: hambúrguer + toggle */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300',
            scrolled
              ? 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a]'
              : 'border border-white/30 bg-white/10 backdrop-blur-sm'
          )}
        >
          <button
            aria-label="Abrir menu"
            onClick={() => setIsOpen(true)}
            className={cn(
              'w-10 h-10 flex items-center justify-center transition-colors',
              scrolled
                ? 'text-gray-700 dark:text-gray-300 hover:text-brand-purple'
                : 'text-white hover:text-white/70'
            )}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <ThemeToggle />
        </div>
      </header>

      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
