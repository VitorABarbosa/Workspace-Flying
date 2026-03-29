'use client'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Download, Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { AgentShell } from '@/components/tools/AgentShell'
import { JobStatusBadge } from '@/components/tools/JobStatusBadge'
import { useJobPolling } from '@/hooks/useJobPolling'
import { LumenSearchForm } from './LumenSearchForm'
import { LumenJobProgress } from './LumenJobProgress'
import { SearchLeadsList } from './SearchLeadsList'
import { LeadDetailPanel } from './LeadDetailPanel'
import type { JobState, LumenProgress } from '@/types/job'
import type { Lead } from '@/types/lumen'

type View = 'idle' | 'submitting' | 'searching' | 'cancelled' | 'completed' | 'failed'

function deriveView(
  createStatus: 'idle' | 'creating' | 'error',
  jobId: string | null,
  jobState: JobState | null | undefined,
  createError: string | null,
  pollingError: string | null,
): View {
  if (createStatus === 'creating') return 'submitting'
  if (createStatus === 'error' || pollingError) return 'failed'
  if (!jobId) return 'idle'
  if (!jobState) return 'searching'
  if (jobState === 'completed') return 'completed'
  if (jobState === 'cancelled') return 'cancelled'
  if (jobState === 'failed') return 'failed'
  return 'searching' // pending | processing
}

const VIEW_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: 'easeInOut' as const },
}

const API_BASE = '/api/tools/lumen'

export function LumenAgent() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [createStatus, setCreateStatus] = useState<'idle' | 'creating' | 'error'>('idle')
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [finalCounts, setFinalCounts] = useState<LumenProgress | null>(null)
  const [leadsSaved, setLeadsSaved] = useState<number>(0)

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Store last form values for retry
  const [lastFormValues, setLastFormValues] = useState<{
    city: string
    segments: string[]
    customQuery: string
  } | null>(null)

  const { jobStatus, error: pollingError } = useJobPolling(
    jobId,
    `${API_BASE}/search`,
  )

  // Preserve final counts on every polling cycle
  useEffect(() => {
    if (!jobStatus) return
    const { found, new: newLeads, duplicates, progress_pct } = jobStatus
    if (found !== undefined) {
      setFinalCounts({
        found,
        new: newLeads ?? 0,
        duplicates: duplicates ?? 0,
        progress_pct: progress_pct ?? 0,
      })
    }
  }, [jobStatus])

  const view = deriveView(
    createStatus,
    jobId,
    jobStatus?.state ?? null,
    createError,
    pollingError,
  )

  const errorMessage = createError ?? pollingError ?? 'Erro desconhecido'

  async function handleSubmit(values: { city: string; segments: string[]; customQuery: string }) {
    setLastFormValues(values)
    setCreateStatus('creating')
    setCreateError(null)
    setFinalCounts(null)
    try {
      const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: values.city,
          segments: values.segments,
          custom_query: values.customQuery || undefined,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json()
      setJobId(body.job_id ?? body.id)
      setCreateStatus('idle')
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Erro ao iniciar busca')
      setCreateStatus('error')
    }
  }

  async function handleCancel() {
    if (!jobId || isCancelling) return
    setIsCancelling(true)
    try {
      const res = await fetch(`${API_BASE}/search/${jobId}/cancel`, { method: 'POST' })
      if (!res.ok) {
        toast.error('Falha ao cancelar busca')
        return
      }
      const body = await res.json().catch(() => ({}))
      setLeadsSaved(body.leads_saved ?? 0)
      // Do NOT call reset here — let polling detect state='cancelled'
    } catch {
      toast.error('Erro de rede ao cancelar')
    } finally {
      setIsCancelling(false)
    }
  }

  function handleNewSearch() {
    setJobId(null)
    setCreateStatus('idle')
    setCreateError(null)
    setFinalCounts(null)
    setLeadsSaved(0)
    setLastFormValues(null)
    setSelectedLead(null)
  }

  function handleRetry() {
    if (!lastFormValues) return
    handleSubmit(lastFormValues)
  }

  const statusBadge =
    jobId && jobStatus ? <JobStatusBadge state={jobStatus.state} /> : undefined

  // Counter row used in cancelled + completed panels
  const CounterRow = finalCounts ? (
    <div className="grid grid-cols-3 gap-4 mt-4 max-w-[400px] w-full">
      {[
        { label: 'Encontrados', value: finalCounts.found },
        { label: 'Novos', value: finalCounts.new },
        { label: 'Duplicados', value: finalCounts.duplicates },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center bg-white dark:bg-[#0A0A0A] rounded-lg p-3"
        >
          <span className="text-xl font-bold text-[#1A1A2E] dark:text-white tabular-nums">
            {value}
          </span>
          <span className="text-xs text-gray-400 mt-1">{label}</span>
        </div>
      ))}
    </div>
  ) : null

  const ctaButtonClasses =
    'w-full bg-brand-purple text-white rounded-xl px-6 py-3 font-bold text-base min-h-[44px] hover:bg-brand-purple/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2'

  return (
    <AgentShell
      title="LUMEN"
      description="Busca leads do setor imobiliário por cidade e segmento"
      statusBadge={statusBadge}
    >
      <AnimatePresence mode="wait">
        <motion.div key={view} {...VIEW_VARIANTS}>

          {view === 'idle' && (
            <LumenSearchForm
              onSubmit={handleSubmit}
              disabled={false}
              isSubmitting={false}
            />
          )}

          {view === 'submitting' && (
            <div className="flex flex-col items-center py-16">
              <Loader2 size={32} className="text-brand-purple animate-spin" aria-hidden="true" />
              <p className="text-base text-gray-500 dark:text-gray-400 mt-3">Iniciando busca...</p>
            </div>
          )}

          {view === 'searching' && jobStatus && (
            <LumenJobProgress
              jobStatus={jobStatus}
              onCancel={handleCancel}
              isCancelling={isCancelling}
            />
          )}

          {view === 'cancelled' && (
            <div className="flex flex-col items-center py-16">
              <XCircle size={40} className="text-gray-400 dark:text-gray-500" />
              <h2 className="text-[22px] font-bold mt-4 text-[#1A1A2E] dark:text-white">
                Busca cancelada
              </h2>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-2 text-center max-w-[480px]">
                {leadsSaved > 0
                  ? `A busca foi interrompida. ${leadsSaved} leads foram salvos antes do cancelamento.`
                  : 'A busca foi interrompida. Nenhum lead foi salvo.'}
              </p>
              {CounterRow}
              <button
                type="button"
                onClick={handleNewSearch}
                className={`mt-6 max-w-[300px] ${ctaButtonClasses}`}
              >
                Nova busca
              </button>
            </div>
          )}

          {view === 'completed' && jobId && (
            <div className="flex flex-col gap-4">
              {/* Header row */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="flex items-center gap-2 text-base font-bold text-[#1A1A2E] dark:text-white">
                  <CheckCircle size={20} className="text-green-500" />
                  Busca concluída
                </span>
                {finalCounts && (
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Encontrados', value: finalCounts.found },
                      { label: 'Novos', value: finalCounts.new },
                      { label: 'Duplicados', value: finalCounts.duplicates },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center bg-white dark:bg-[#0A0A0A] rounded-lg p-3"
                      >
                        <span className="text-xl font-bold text-[#1A1A2E] dark:text-white tabular-nums">
                          {value}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">{label}</span>
                      </div>
                    ))}
                  </div>
                )}
                <a
                  href={`/api/tools/lumen/leads?job_id=${encodeURIComponent(jobId)}&format=xlsx`}
                  download
                  aria-label="Exportar leads desta pesquisa como XLSX"
                  className="flex items-center gap-2 text-sm text-brand-purple hover:opacity-80 transition-opacity"
                >
                  <Download size={16} />
                  Exportar XLSX
                </a>
              </div>

              {/* Leads table */}
              <SearchLeadsList
                jobId={jobId}
                onSelectLead={setSelectedLead}
                selectedLeadId={selectedLead?.id}
              />

              {/* Nova busca */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNewSearch}
                  className={`max-w-[300px] ${ctaButtonClasses}`}
                >
                  Nova busca
                </button>
              </div>
            </div>
          )}

          {view === 'failed' && (
            <div role="alert" className="flex flex-col items-center py-16">
              <AlertCircle size={40} className="text-red-500" />
              <h2 className="text-[22px] font-bold mt-4 text-[#1A1A2E] dark:text-white">
                Falha na busca
              </h2>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-2 max-w-[480px] text-center">
                {errorMessage}
              </p>
              <div className="flex flex-col items-center gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="text-sm text-brand-purple hover:opacity-80"
                >
                  Tentar novamente
                </button>
                <button
                  type="button"
                  onClick={handleNewSearch}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:opacity-80"
                >
                  Nova busca
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
      <LeadDetailPanel
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </AgentShell>
  )
}
