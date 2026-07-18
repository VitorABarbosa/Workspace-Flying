'use client'
import { useState, useEffect, useRef } from 'react'
import type { JobStatus } from '@/types/job'

const TERMINAL_STATES = ['completed', 'failed', 'cancelled'] as const

// Nº de falhas de poll CONSECUTIVAS toleradas antes de declarar erro.
// Um único 502/blip transitório não deve matar o acompanhamento da busca
// (que segue rodando no backend). Só desiste após várias falhas seguidas.
const MAX_CONSECUTIVE_FAILURES = 4

interface UseJobPollingReturn {
  jobStatus: JobStatus | null
  error: string | null
}

export function useJobPolling(
  jobId: string | null,
  pollEndpoint: string,
  intervalMs = 5000
): UseJobPollingReturn {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  // useRef prevents stale closure on jobStatus.state inside setInterval callback
  const isTerminal = useRef(false)
  const consecutiveFailures = useRef(0)

  useEffect(() => {
    if (!jobId) return
    isTerminal.current = false
    consecutiveFailures.current = 0

    async function poll() {
      if (isTerminal.current) return
      try {
        const res = await fetch(`${pollEndpoint}/${jobId}`)
        if (res.status === 401) {
          setError('Sessão expirada. Faça login novamente.')
          isTerminal.current = true
          return
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const raw = await res.json()
        // Normaliza campos do backend (job_id→id, status→state, errors[]→error, signed_url→result)
        const data: JobStatus = {
          id: raw.job_id ?? raw.id,
          state: raw.status ?? raw.state,
          error: Array.isArray(raw.errors) && raw.errors.length > 0 ? raw.errors[0] : raw.error,
          result: raw.signed_url ? { signed_url: raw.signed_url } : raw.result,
          progress: raw.progress,
          requires_address: raw.requires_address,
          address_prompt: raw.address_prompt,
          // LUMEN fields — undefined for Pesquisador (backend never sends them)
          progress_pct: raw.progress_pct,
          found: raw.found,
          new: raw.new,
          duplicates: raw.duplicates,
          leads_saved: raw.leads_saved,
        }
        // Poll bem-sucedido: zera o contador de falhas e limpa erro transitório
        consecutiveFailures.current = 0
        setError(null)
        setJobStatus(data)
        if (TERMINAL_STATES.includes(data.state as typeof TERMINAL_STATES[number])) {
          isTerminal.current = true
        }
        if (data.state === 'failed') {
          setError(data.error ?? 'Erro desconhecido')
        }
      } catch {
        // Falha transitória (ex.: 502 num único poll): tolera e segue tentando.
        // Só declara erro/encerra após MAX_CONSECUTIVE_FAILURES falhas seguidas.
        consecutiveFailures.current += 1
        if (consecutiveFailures.current >= MAX_CONSECUTIVE_FAILURES) {
          setError('Falha ao verificar status')
          isTerminal.current = true
        }
      }
    }

    poll() // immediate first check
    const timerId = setInterval(poll, intervalMs)
    return () => clearInterval(timerId) // MANDATORY cleanup
  }, [jobId, pollEndpoint, intervalMs])

  return { jobStatus, error }
}
