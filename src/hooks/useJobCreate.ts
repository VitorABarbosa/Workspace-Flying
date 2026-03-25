'use client'
import { useState } from 'react'

interface UseJobCreateReturn {
  jobId: string | null
  status: 'idle' | 'creating' | 'error'
  error: string | null
  createJob: (formData: FormData) => Promise<void>
  reset: () => void
}

export function useJobCreate(endpoint: string): UseJobCreateReturn {
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'creating' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function createJob(formData: FormData) {
    setStatus('creating')
    setError(null)
    try {
      const res = await fetch(endpoint, { method: 'POST', body: formData })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json()
      setJobId(body.job_id ?? body.id)
      setStatus('idle')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar job')
      setStatus('error')
    }
  }

  function reset() {
    setJobId(null)
    setStatus('idle')
    setError(null)
  }

  return { jobId, status, error, createJob, reset }
}
