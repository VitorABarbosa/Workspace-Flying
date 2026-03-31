'use client'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { Area } from '@/config/tools'

interface AreaCardProps {
  area: Area
  toolCount: number
}

function toolCountString(count: number): string {
  if (count === 0) return 'Nenhuma ferramenta disponível'
  if (count === 1) return '1 ferramenta disponível'
  return `${count} ferramentas disponíveis`
}

export function AreaCard({ area, toolCount }: AreaCardProps) {
  return (
    <Link
      href={`/tools/${area.slug}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 rounded-xl"
    >
      <div
        className={cn(
          'relative rounded-xl border p-6 min-h-[180px]',
          'bg-[#F1F1F1] dark:bg-[#1A1A1A]',
          'border-gray-200 dark:border-gray-700',
          'transition-colors duration-200',
          'hover:border-brand-purple/50',
        )}
      >
        <p className="text-[22px] font-bold text-[#1A1A2E] dark:text-white leading-tight">
          {area.name}
        </p>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          {toolCountString(toolCount)}
        </p>
      </div>
    </Link>
  )
}
