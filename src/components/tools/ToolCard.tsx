'use client'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { Tool } from '@/config/tools'

// Importação dinâmica de ícone Lucide baseada no nome
import * as LucideIcons from 'lucide-react'

function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[name]
  if (!Icon) return null
  return <Icon size={24} className={className} />
}

function ComingSoonBadge() {
  return (
    <span
      className={cn(
        'absolute top-3 right-3',
        'px-2 py-1 rounded-full',
        'bg-brand-purple/10 dark:bg-brand-purple/20',
        'text-brand-purple text-xs font-bold',
      )}
    >
      Em breve
    </span>
  )
}

export function ToolCard({ tool }: { tool: Tool }) {
  const isComingSoon = tool.status === 'coming-soon'

  const cardContent = (
    <div
      className={cn(
        'relative rounded-xl border p-6 min-h-[180px]',
        'bg-[#F1F1F1] dark:bg-[#1A1A1A]',
        'border-gray-200 dark:border-gray-700',
        'transition-colors duration-200',
        isComingSoon
          ? 'opacity-50 cursor-not-allowed pointer-events-none'
          : 'hover:border-brand-purple/50',
      )}
    >
      {isComingSoon && <ComingSoonBadge />}
      {tool.icon && (
        <div className="mb-4">
          <ToolIcon
            name={tool.icon}
            className={isComingSoon ? 'text-gray-400' : 'text-brand-purple'}
          />
        </div>
      )}
      <p className="text-[22px] font-bold text-[#1A1A2E] dark:text-white leading-tight">
        {tool.name}
      </p>
      <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-2">
        {tool.description}
      </p>
    </div>
  )

  if (isComingSoon) {
    return (
      <div
        tabIndex={-1}
        aria-disabled="true"
        aria-label={`${tool.name} — Em breve`}
        className="cursor-not-allowed"
      >
        {cardContent}
      </div>
    )
  }

  return (
    <Link
      href={tool.href}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 rounded-xl"
    >
      {cardContent}
    </Link>
  )
}
