'use client'
import { Loader2 } from 'lucide-react'

interface PollingProgressProps {
  state: 'pending' | 'processing'
  elapsedSeconds: number
  progress?: string
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const STATUS_MESSAGES: Record<'pending' | 'processing', string> = {
  pending: 'Aguardando início do processamento...',
  processing: 'Analisando documento...',
}

export function PollingProgress({ state, elapsedSeconds, progress }: PollingProgressProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center py-16"
    >
      <Loader2 size={40} className="text-brand-purple animate-spin" aria-hidden="true" />
      <p className="text-base text-gray-600 dark:text-gray-400 mt-4">
        {progress ?? STATUS_MESSAGES[state]}
      </p>
      {elapsedSeconds > 0 && (
        <p
          className="text-sm text-gray-400 dark:text-gray-500 mt-2"
          aria-atomic="false"
        >
          Tempo decorrido: {formatElapsed(elapsedSeconds)}
        </p>
      )}
    </div>
  )
}
