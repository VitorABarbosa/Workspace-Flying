'use client'
import { useState, useEffect } from 'react'
import { AlertCircle, History } from 'lucide-react'
import { JobStatusBadge } from '@/components/tools/JobStatusBadge'
import type { SearchHistoryItem } from '@/types/lumen'

interface SearchHistoryListProps {
  onReopenSearch: (jobId: string) => void
}

const COLUMNS = ['Cidade', 'Segmentos', 'Status', 'Encontrados', 'Novos', 'Duplicados', 'Data', 'Ação']

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SearchHistoryList({ onReopenSearch }: SearchHistoryListProps) {
  const [items, setItems] = useState<SearchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch('/api/tools/lumen/search')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => setItems(data.data ?? data ?? []))
      .catch(e => setError(e instanceof Error ? e.message : 'Erro desconhecido'))
      .finally(() => setLoading(false))
  }, [fetchKey])

  // LOADING STATE
  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm border-collapse" role="table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {COLUMNS.map(col => (
                <th key={col} className="text-xs text-gray-400 uppercase tracking-wide px-4 py-2 text-left font-normal">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                {COLUMNS.map(col => (
                  <td key={col} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AlertCircle size={32} className="text-red-400" aria-hidden="true" />
        <p className="text-base font-bold text-gray-500 dark:text-gray-400 mt-3">Erro ao carregar histórico</p>
        <p className="text-sm text-gray-400 mt-1">
          Não foi possível buscar o histórico de pesquisas. Verifique a conexão e tente novamente.
        </p>
        <button
          type="button"
          onClick={() => setFetchKey(k => k + 1)}
          className="text-sm text-brand-purple hover:opacity-80 mt-3"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // EMPTY STATE
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <History size={32} className="text-gray-300 dark:text-gray-600" aria-hidden="true" />
        <p className="text-base font-bold text-gray-500 dark:text-gray-400 mt-3">Nenhuma pesquisa realizada ainda</p>
        <p className="text-sm text-gray-400 mt-1">Execute uma busca na aba Busca para ver o histórico aqui.</p>
      </div>
    )
  }

  // LIST STATE
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[22px] font-bold text-[#1A1A2E] dark:text-white">Histórico de Pesquisas</h2>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm border-collapse" role="table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {COLUMNS.map(col => (
                <th key={col} className="text-xs text-gray-400 uppercase tracking-wide px-4 py-2 text-left font-normal">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const jobId = item.id ?? (item as unknown as { job_id?: string }).job_id
              const formattedDate = formatDate(item.created_at)
              return (
                <tr
                  key={item.id ?? item.created_at}
                  role="row"
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors"
                >
                  <td className="px-4 py-3 text-sm">{item.city}</td>
                  <td className="px-4 py-3 text-sm">{item.segments.join(', ')}</td>
                  <td className="px-4 py-3 text-sm">
                    <JobStatusBadge state={item.state} />
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums">{item.found ?? '—'}</td>
                  <td className="px-4 py-3 text-sm tabular-nums">{item.new ?? '—'}</td>
                  <td className="px-4 py-3 text-sm tabular-nums">{item.duplicates ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">{formattedDate}</td>
                  <td className="px-4 py-3 text-sm">
                    {item.state === 'completed' && jobId ? (
                      <button
                        type="button"
                        onClick={() => onReopenSearch(jobId)}
                        aria-label={`Ver leads da busca em ${item.city} em ${formattedDate}`}
                        className="text-sm text-brand-purple hover:opacity-80 transition-opacity"
                      >
                        Ver leads
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
