'use client'
import Link from 'next/link'
import { cn } from '@/lib/cn'

interface AgentShellProps {
  title: string
  description?: string
  statusBadge?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function AgentShell({
  title,
  description,
  statusBadge,
  children,
  className,
}: AgentShellProps) {
  return (
    <section className={cn('py-20 px-6 max-w-[1200px] mx-auto', className)}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link
            href="/tools"
            className="text-sm text-brand-purple hover:opacity-80 transition-opacity duration-150 mb-2 inline-block"
          >
            ← Ferramentas
          </Link>
          <h1 className="text-[22px] font-bold text-[#1A1A2E] dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-base">
              {description}
            </p>
          )}
        </div>
        {statusBadge && <div>{statusBadge}</div>}
      </div>
      {children}
    </section>
  )
}
