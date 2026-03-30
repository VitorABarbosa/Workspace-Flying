'use client'
import { useState, useEffect } from 'react'
import { AlertCircle, ExternalLink, SearchX } from 'lucide-react'
import type { Lead, LeadsResponse } from '@/types/lumen'
import { LeadScoreBadge } from './LeadScoreBadge'
import { useGlobalLeadsFilters } from './GlobalLeadsFilters'
import { GlobalLeadsPagination } from './GlobalLeadsPagination'

interface GlobalLeadsTableProps {
  onSelectLead: (lead: Lead) => void
  selectedLeadId?: string
}

function ScrapingLabel({ status }: { status?: string }) {
  if (status === 'scraped') return <span className="text-xs text-green-500">Coletado</span>
  if (status === 'failed') return <span className="text-xs text-red-400">Falhou</span>
  return <span className="text-xs text-gray-400">{status ?? '—'}</span>
}

const COLUMNS = ['Nome', 'Cidade', 'Segmento', 'Website', 'Telefone', 'Score', 'Coleta']

export function GlobalLeadsTable({ onSelectLead, selectedLeadId }: GlobalLeadsTableProps) {
  const [filters, setFilters] = useGlobalLeadsFilters()
  const { city, segment, min_score, created_after, page } = filters

  const [leads, setLeads] = useState<Lead[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  const hasActiveFilters =
    city !== '' || segment !== '' || min_score > 0 || created_after !== ''

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (city)          params.set('city', city)
    if (segment)       params.set('segment', segment)
    if (min_score > 0) params.set('min_score', String(min_score))
    if (created_after) params.set('created_after', created_after)
    params.set('page', String(page))
    params.set('per_page', '50')

    fetch(`/api/tools/lumen/leads?${params}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<LeadsResponse>
      })
      .then(data => {
        setLeads(data.data ?? [])
        setTotalPages(data.pages ?? 1)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Erro desconhecido'))
      .finally(() => setLoading(false))
  }, [city, segment, min_score, created_after, page, fetchKey])

  function retry() {
    setFetchKey(k => k + 1)
  }

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

  if (error) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-base font-bold text-gray-500 dark:text-gray-400 mt-3">
          Erro ao carregar banco de leads
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Não foi possível buscar os dados. Verifique a conexão e tente novamente.
        </p>
        <button type="button" onClick={retry} className="text-sm text-brand-purple hover:opacity-80 mt-3">
          Tentar novamente
        </button>
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <SearchX size={32} className="text-gray-300 dark:text-gray-600" />
        <p className="text-base font-bold text-gray-500 dark:text-gray-400 mt-3">
          Nenhum lead encontrado
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {hasActiveFilters
            ? 'Nenhum lead corresponde aos filtros selecionados. Tente ajustar os critérios.'
            : 'O banco de leads está vazio. Execute uma busca para começar a preencher o banco.'}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse" role="table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {COLUMNS.map(col => (
                <th key={col} className="text-xs text-gray-400 uppercase tracking-wide px-4 py-2 text-left font-normal">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => {
              const isSelected = lead.id === selectedLeadId
              return (
                <tr
                  key={lead.id}
                  role="row"
                  tabIndex={0}
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] cursor-pointer transition-colors ${isSelected ? 'bg-brand-purple/10' : ''}`}
                  onClick={() => onSelectLead(lead)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectLead(lead)
                    }
                  }}
                >
                  <td className="px-4 py-3 text-sm">{lead.name}</td>
                  <td className="px-4 py-3 text-sm">{lead.city ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">{lead.segment ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    {lead.website
                      ? <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:opacity-80">{lead.website} <ExternalLink size={12} /></a>
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">{lead.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-sm"><LeadScoreBadge score={lead.score} /></td>
                  <td className="px-4 py-3 text-sm"><ScrapingLabel status={lead.scraping_status} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <GlobalLeadsPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={newPage => void setFilters({ page: newPage })}
        />
      )}
    </div>
  )
}
