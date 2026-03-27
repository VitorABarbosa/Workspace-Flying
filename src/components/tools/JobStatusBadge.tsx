import { cn } from '@/lib/cn'
import { Clock, Loader2, MapPin, CheckCircle, AlertCircle } from 'lucide-react'
import type { JobState } from '@/types/job'

const BADGE_CONFIG: Record<
  JobState,
  {
    label: string
    classes: string
    icon: React.ReactNode
  }
> = {
  pending: {
    label: 'Analisando material',
    classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: <Clock size={12} />,
  },
  processing: {
    label: 'Analisando material',
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <Loader2 size={12} className="animate-spin" aria-hidden="true" />,
  },
  awaiting_input: {
    label: 'Aguardando endereco do empreendimento',
    classes: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    icon: <MapPin size={12} />,
  },
  completed: {
    label: 'Concluido',
    classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle size={12} />,
  },
  failed: {
    label: 'Falhou',
    classes: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    icon: <AlertCircle size={12} />,
  },
}

export function JobStatusBadge({ state }: { state: JobState }) {
  const { label, classes, icon } = BADGE_CONFIG[state]
  return (
    <span
      role="status"
      className={cn(
        'rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-2',
        classes,
      )}
    >
      {icon}
      {label}
    </span>
  )
}
