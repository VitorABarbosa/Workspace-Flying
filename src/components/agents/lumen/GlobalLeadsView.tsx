'use client'
import type { Lead } from '@/types/lumen'

export interface GlobalLeadsViewProps {
  selectedLead: Lead | null
  onSelectLead: (lead: Lead) => void
}

/**
 * GlobalLeadsView — stub placeholder.
 * Full implementation in Phase 06, Plan 03+.
 * This file exists so imports/mocks in LumenAgent.tsx (and tests) resolve correctly.
 */
export function GlobalLeadsView(_props: GlobalLeadsViewProps) {
  return (
    <div data-testid="global-leads-view-real">
      <p className="text-gray-400 text-sm">Banco de Leads — em breve.</p>
    </div>
  )
}
