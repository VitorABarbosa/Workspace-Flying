'use client'
import { Download } from 'lucide-react'
import type { Lead } from '@/types/lumen'
import { GlobalLeadsFilters, useGlobalLeadsFilters } from './GlobalLeadsFilters'
import { GlobalLeadsTable } from './GlobalLeadsTable'

export interface GlobalLeadsViewProps {
  selectedLead: Lead | null
  onSelectLead: (lead: Lead) => void
}

export function GlobalLeadsView({ selectedLead, onSelectLead }: GlobalLeadsViewProps) {
  const [filters] = useGlobalLeadsFilters()
  const { city, segment, min_score, created_after } = filters

  // Build export URL from active filter params
  const exportParams = new URLSearchParams()
  if (city)          exportParams.set('city', city)
  if (segment)       exportParams.set('segment', segment)
  if (min_score > 0) exportParams.set('min_score', String(min_score))
  if (created_after) exportParams.set('created_after', created_after)
  exportParams.set('format', 'xlsx')
  const exportHref = `/api/tools/lumen/leads?${exportParams}`

  return (
    <div>
      {/* Header: section title + export CTA */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[22px] font-bold text-[#1A1A2E] dark:text-white">
          Banco de Leads
        </h2>
        <a
          href={exportHref}
          download
          aria-label="Exportar leads do banco global com filtros aplicados como XLSX"
          className="flex items-center gap-2 text-sm text-brand-purple hover:opacity-80 transition-opacity"
        >
          <Download size={16} />
          Exportar XLSX
        </a>
      </div>

      {/* Filter panel */}
      <GlobalLeadsFilters />

      {/* Paginated table */}
      <GlobalLeadsTable
        onSelectLead={onSelectLead}
        selectedLeadId={selectedLead?.id}
      />
    </div>
  )
}
