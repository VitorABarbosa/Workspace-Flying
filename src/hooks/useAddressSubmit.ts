'use client'
import { useState } from 'react'

interface UseAddressSubmitReturn {
  submit: (jobId: string, address: string) => Promise<void>
  status: 'idle' | 'submitting' | 'error'
  error: string | null
  reset: () => void
}

export function useAddressSubmit(baseEndpoint: string): UseAddressSubmitReturn {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function submit(jobId: string, address: string) {
    setStatus('submitting')
    setError(null)
    try {
      const res = await fetch(`${baseEndpoint}/${jobId}/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
      if (res.status === 401) {
        setError('Sessão expirada. Faça login novamente.')
        setStatus('error')
        return
      }
      if (res.status === 409) {
        setError('Job não está aguardando endereço.')
        setStatus('error')
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('idle')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar endereço')
      setStatus('error')
    }
  }

  function reset() {
    setStatus('idle')
    setError(null)
  }

  return { submit, status, error, reset }
}
