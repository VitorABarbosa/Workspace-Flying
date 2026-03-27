'use client'
import { useEffect, useState } from 'react'
import { Trash2, Download, FileDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

interface ReportItem {
  id: string
  state: string
  signedUrl: string | null
  name: string | null
  createdAt: string | null
}

interface ReportsManagerProps {
  apiBase: string
  onBack: () => void
}

// Normaliza o payload retornado pelo GET /jobs (formato do backend pode variar)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeJob(raw: any): ReportItem {
  const state = raw.status ?? raw.state ?? 'unknown'

  return {
    id: raw.job_id ?? raw.id ?? '',
    state: state === 'awaiting_address' ? 'awaiting_input' : state,
    signedUrl: raw.signed_url ?? raw.result?.signed_url ?? null,
    name: raw.product_name ?? raw.empreendimento ?? raw.name ?? null,
    createdAt: raw.created_at ?? null,
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

function StatusBadge({ state }: { state: string }) {
  let className = 'bg-gray-100 text-gray-600'
  if (state === 'completed') className = 'bg-green-100 text-green-700'
  else if (state === 'failed') className = 'bg-red-100 text-red-700'

  const labels: Record<string, string> = {
    completed: 'Concluido',
    failed: 'Falhou',
    pending: 'Analisando material',
    processing: 'Analisando material',
    awaiting_input: 'Aguardando endereco do empreendimento',
    unknown: 'Desconhecido',
  }
  const label = labels[state] ?? state

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

export function ReportsManager({ apiBase, onBack }: ReportsManagerProps) {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingAll, setDeletingAll] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`${apiBase}/jobs`)
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`)
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        const items: ReportItem[] = (Array.isArray(data) ? data : data.jobs ?? []).map(normalizeJob)
        setReports(items)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Erro ao carregar relatorios.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [apiBase, refreshKey])

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await fetch(`${apiBase}/jobs/${id}`, { method: 'DELETE' })
      setReports((prev) => prev.filter((r) => r.id !== id))
    } catch {
      // Silencioso: item permanece na lista se a requisicao falhar.
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDeleteAll() {
    if (!window.confirm('Apagar todos os relatorios? Esta acao nao pode ser desfeita.')) return
    setDeletingAll(true)
    try {
      await fetch(`${apiBase}/jobs`, { method: 'DELETE' })
      setReports([])
    } catch {
      // Silencioso
    } finally {
      setDeletingAll(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-brand-purple hover:opacity-80 transition-opacity"
          >
            {'<-'} Nova analise
          </button>
          <h2 className="text-[22px] font-bold text-[#1A1A2E] dark:text-white">Relatorios</h2>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            aria-label="Atualizar lista"
            className="text-gray-400 hover:text-brand-purple transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleDeleteAll}
          disabled={reports.length === 0 || deletingAll}
          className="text-sm text-red-500 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {deletingAll ? 'Apagando...' : 'Apagar tudo'}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center py-16">
          <Loader2 size={32} className="text-brand-purple animate-spin" aria-hidden="true" />
          <p className="text-base text-gray-500 dark:text-gray-400 mt-3">Carregando relatorios...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center py-16">
          <AlertCircle size={40} className="text-red-500" />
          <p className="text-base text-gray-500 dark:text-gray-400 mt-3 text-center">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="mt-4 text-sm text-brand-purple hover:opacity-80 transition-opacity"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="flex flex-col items-center py-16">
          <p className="text-base text-gray-500 dark:text-gray-400">Nenhum relatorio encontrado.</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 text-sm text-brand-purple hover:opacity-80 transition-opacity"
          >
            {'<-'} Voltar
          </button>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <ul className="flex flex-col gap-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-bold text-[#1A1A2E] dark:text-white truncate">
                  {report.name ?? 'Empreendimento nao identificado'}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge state={report.state} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(report.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {report.state === 'completed' && (
                  <>
                    <a
                      href={`${apiBase}/jobs/${report.id}/report/download`}
                      download
                      className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-bold text-[#1A1A2E] dark:text-white hover:border-brand-purple/50 transition-colors"
                    >
                      <Download size={14} aria-hidden="true" />
                      .md
                    </a>
                    <a
                      href={`${apiBase}/jobs/${report.id}/report/download/pdf`}
                      download
                      className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-bold text-[#1A1A2E] dark:text-white hover:border-brand-purple/50 transition-colors"
                    >
                      <FileDown size={14} aria-hidden="true" />
                      PDF
                    </a>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(report.id)}
                  disabled={deletingId === report.id || deletingAll}
                  aria-label={`Deletar relatorio ${report.name ?? report.id}`}
                  className="flex items-center gap-1 text-red-500 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deletingId === report.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
