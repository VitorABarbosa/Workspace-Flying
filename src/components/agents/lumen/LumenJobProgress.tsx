'use client'
import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { JobStatus } from '@/types/job'

interface LumenJobProgressProps {
  jobStatus: JobStatus
  onCancel: () => void
  isCancelling: boolean
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

export function LumenJobProgress({ jobStatus, onCancel, isCancelling }: LumenJobProgressProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const pct = jobStatus.progress_pct ?? 0
  const found = jobStatus.found ?? 0
  const newLeads = jobStatus.new ?? 0
  const duplicates = jobStatus.duplicates ?? 0

  return (
    <div
      role="status"
      className="bg-[#F1F1F1] dark:bg-[#1A1A1A] rounded-xl p-6 max-w-[600px] mx-auto"
    >
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-4">
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-brand-purple rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm text-gray-400 tabular-nums w-10 text-right">{pct}%</span>
      </div>

      {/* Live counters */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {[
          { label: 'Encontrados', value: found },
          { label: 'Novos', value: newLeads },
          { label: 'Duplicados', value: duplicates },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center bg-white dark:bg-[#0A0A0A] rounded-lg p-3"
          >
            <span
              aria-live="polite"
              aria-atomic="true"
              className="text-xl font-bold text-[#1A1A2E] dark:text-white tabular-nums"
            >
              {value}
            </span>
            <span className="text-xs text-gray-400 mt-1">{label}</span>
          </div>
        ))}
      </div>

      {/* Elapsed timer */}
      {elapsedSeconds > 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-3 text-center">
          Tempo decorrido: {formatElapsed(elapsedSeconds)}
        </p>
      )}

      {/* Cancel button */}
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={onCancel}
          disabled={isCancelling}
          className="text-sm text-red-500 hover:opacity-80 transition-opacity flex items-center gap-1.5 disabled:opacity-60 min-h-[44px] py-3"
        >
          {isCancelling ? (
            <>
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              Cancelando...
            </>
          ) : (
            'Cancelar busca'
          )}
        </button>
      </div>
    </div>
  )
}
