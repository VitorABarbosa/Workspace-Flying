'use client'
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Loader2 } from 'lucide-react'
import { AgentShell } from '@/components/tools/AgentShell'
import { JobStatusBadge } from '@/components/tools/JobStatusBadge'
import { useJobCreate } from '@/hooks/useJobCreate'
import { useJobPolling } from '@/hooks/useJobPolling'
import { useAddressSubmit } from '@/hooks/useAddressSubmit'
import { DropZone } from './DropZone'
import { PollingProgress } from './PollingProgress'
import { AddressForm } from './AddressForm'
import { ReportView } from './ReportView'
import { ReportsManager } from './ReportsManager'
import type { JobState } from '@/types/job'

// Normalização de estado do backend: 'awaiting_address' → 'awaiting_input'
const BACKEND_STATE_MAP: Partial<Record<string, JobState>> = {
  awaiting_address: 'awaiting_input',
}

type View = 'idle' | 'uploading' | 'polling' | 'awaiting_input' | 'completed' | 'failed'

function deriveView(
  createStatus: 'idle' | 'creating' | 'error',
  jobId: string | null,
  jobStatus: { state?: JobState; requires_address?: boolean } | null,
  createError: string | null,
  pollingError: string | null,
): View {
  const pollingState = jobStatus?.state
  if (createStatus === 'creating') return 'uploading'
  if (createStatus === 'error' || pollingError) return 'failed'
  if (!jobId) return 'idle'
  if (!pollingState) return 'polling'
  if (pollingState === 'awaiting_input' || jobStatus?.requires_address) return 'awaiting_input'
  if (pollingState === 'completed') return 'completed'
  if (pollingState === 'failed') return 'failed'
  return 'polling' // pending | processing
}

const VIEW_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: 'easeInOut' as const },
}

const API_BASE = process.env.NEXT_PUBLIC_PESQUISADOR_URL ?? ''

export function PesquisadorAgent() {
  const [activeScreen, setActiveScreen] = useState<'agent' | 'reports'>('agent')
  const jobCreate = useJobCreate(`${API_BASE}/jobs`)
  const { jobStatus, error: pollingError } = useJobPolling(jobCreate.jobId, `${API_BASE}/jobs`)
  const addressSubmit = useAddressSubmit(`${API_BASE}/jobs`)

  // Normalizar estado do backend antes de derivar view
  const rawState = jobStatus?.state
  const normalizedState = rawState
    ? ((BACKEND_STATE_MAP[rawState] ?? rawState) as JobState)
    : undefined

  const currentView = deriveView(
    jobCreate.status,
    jobCreate.jobId,
    jobStatus ? { ...jobStatus, state: normalizedState } : null,
    jobCreate.error,
    pollingError,
  )

  // Elapsed timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const isActive =
      jobCreate.jobId !== null &&
      currentView !== 'completed' &&
      currentView !== 'failed' &&
      currentView !== 'awaiting_input' &&
      currentView !== 'idle'

    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [jobCreate.jobId, currentView])

  // File state for "retry with same file"
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  // Busca o conteúdo do relatório via signed_url quando job completa
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null)
  useEffect(() => {
    if (currentView !== 'completed') return
    const signedUrl = (jobStatus?.result as { signed_url?: string } | undefined)?.signed_url
    if (!signedUrl || reportMarkdown) return
    fetch(signedUrl)
      .then((r) => r.text())
      .then(setReportMarkdown)
      .catch(() => setReportMarkdown('Erro ao carregar relatório.'))
  }, [currentView, jobStatus?.result, reportMarkdown])

  async function handleFileSubmit(file: File) {
    setPendingFile(file)
    setElapsedSeconds(0)
    const formData = new FormData()
    formData.append('file', file)
    await jobCreate.createJob(formData)
  }

  async function handleAddressSubmit(address: string) {
    if (!jobCreate.jobId) return
    await addressSubmit.submit(jobCreate.jobId, address)
  }

  function handleRetryWithSameFile() {
    jobCreate.reset()
    setElapsedSeconds(0)
    if (pendingFile) {
      const formData = new FormData()
      formData.append('file', pendingFile)
      jobCreate.createJob(formData)
    }
  }

  function handleNewAnalysis() {
    jobCreate.reset()
    setPendingFile(null)
    setReportMarkdown(null)
    setElapsedSeconds(0)
    addressSubmit.reset()
  }

  const pollingProgressState =
    normalizedState === 'pending' || normalizedState === 'processing'
      ? normalizedState
      : 'processing'

  const errorMessage = pollingError ?? jobCreate.error ?? 'Erro desconhecido'

  const statusBadge = jobCreate.jobId ? (
    <JobStatusBadge state={normalizedState ?? 'pending'} />
  ) : undefined

  if (activeScreen === 'reports') {
    return (
      <AgentShell title="Pesquisador" description="Analise empreendimentos imobiliários com IA">
        <ReportsManager apiBase={API_BASE} onBack={() => setActiveScreen('agent')} />
      </AgentShell>
    )
  }

  return (
    <AgentShell
      title="Pesquisador"
      description="Analise empreendimentos imobiliários com IA"
      statusBadge={statusBadge}
    >
      <AnimatePresence mode="wait">
        <motion.div key={currentView} {...VIEW_VARIANTS}>
          {currentView === 'idle' && (
            <>
              <DropZone
                onFileAccepted={(file) => setPendingFile(file)}
                onSubmit={handleFileSubmit}
                isUploading={false}
              />
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setActiveScreen('reports')}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-purple transition-colors"
                >
                  Ver relatórios anteriores
                </button>
              </div>
            </>
          )}

          {currentView === 'uploading' && (
            <div className="flex flex-col items-center py-16">
              <Loader2 size={32} className="text-brand-purple animate-spin" aria-hidden="true" />
              <p className="text-base text-gray-500 dark:text-gray-400 mt-3">Enviando arquivo...</p>
            </div>
          )}

          {currentView === 'polling' && (
            <PollingProgress
              state={pollingProgressState}
              elapsedSeconds={elapsedSeconds}
              progress={jobStatus?.progress}
            />
          )}

          {currentView === 'awaiting_input' && (
            <AddressForm
              onSubmit={handleAddressSubmit}
              isSubmitting={addressSubmit.status === 'submitting'}
              submitError={addressSubmit.error}
              prompt={jobStatus?.address_prompt}
            />
          )}

          {currentView === 'completed' && reportMarkdown && (
            <ReportView
              markdown={reportMarkdown}
              jobId={jobCreate.jobId!}
              apiBase={API_BASE}
              onNewAnalysis={handleNewAnalysis}
            />
          )}
          {currentView === 'completed' && !reportMarkdown && (
            <div className="flex flex-col items-center py-16">
              <Loader2 size={32} className="text-brand-purple animate-spin" aria-hidden="true" />
              <p className="text-base text-gray-500 dark:text-gray-400 mt-3">Carregando relatório...</p>
            </div>
          )}

          {currentView === 'failed' && (
            <div role="alert" className="flex flex-col items-center py-16">
              <AlertCircle size={40} className="text-red-500" />
              <h2 className="text-[22px] font-bold mt-4 text-[#1A1A2E] dark:text-white">
                Falha no processamento
              </h2>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-2 max-w-[480px] text-center">
                {errorMessage}
              </p>
              <div className="flex flex-col items-center gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleRetryWithSameFile}
                  className="text-sm text-brand-purple hover:opacity-80"
                >
                  Tentar novamente com o mesmo PDF
                </button>
                <button
                  type="button"
                  onClick={handleNewAnalysis}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:opacity-80"
                >
                  Enviar um novo PDF
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </AgentShell>
  )
}
