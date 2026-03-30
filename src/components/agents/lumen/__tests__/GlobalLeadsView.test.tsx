import React from 'react'
import { render, screen } from '@testing-library/react'
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing'

// Module-level jest.fn() so tests can call .mockReturnValueOnce
const mockUseGlobalLeadsFilters = jest.fn(() => [
  { city: '', segment: '', min_score: 0, created_after: '', page: 1 },
  jest.fn(),
])

// Mock child components to isolate GlobalLeadsView behavior
jest.mock('../GlobalLeadsFilters', () => ({
  GlobalLeadsFilters: () => <div data-testid="global-leads-filters" />,
  get useGlobalLeadsFilters() {
    return mockUseGlobalLeadsFilters
  },
}))

jest.mock('../GlobalLeadsTable', () => ({
  GlobalLeadsTable: ({ selectedLeadId }: { selectedLeadId?: string }) => (
    <div data-testid="global-leads-table" data-selected-id={selectedLeadId ?? ''} />
  ),
}))

import { GlobalLeadsView } from '../GlobalLeadsView'
import type { Lead } from '@/types/lumen'

const mockLead: Lead = {
  id: 'lead-1',
  job_id: 'job-1',
  name: 'Test Co',
  score: 80,
}

function renderView(
  props: Partial<{ selectedLead: Lead | null; onSelectLead: jest.Mock }> = {},
  nuqsSearchParams: Record<string, string> = {},
) {
  return render(
    <GlobalLeadsView
      selectedLead={props.selectedLead ?? null}
      onSelectLead={props.onSelectLead ?? jest.fn()}
    />,
    { wrapper: withNuqsTestingAdapter({ searchParams: nuqsSearchParams }) },
  )
}

describe('GlobalLeadsView', () => {
  beforeEach(() => {
    mockUseGlobalLeadsFilters.mockImplementation(() => [
      { city: '', segment: '', min_score: 0, created_after: '', page: 1 },
      jest.fn(),
    ])
  })

  describe('LUMEN-10: component renders core elements', () => {
    it('renders "Banco de Leads" heading', () => {
      renderView()
      expect(screen.getByText('Banco de Leads')).toBeInTheDocument()
    })

    it('renders GlobalLeadsFilters', () => {
      renderView()
      expect(screen.getByTestId('global-leads-filters')).toBeInTheDocument()
    })

    it('renders GlobalLeadsTable', () => {
      renderView()
      expect(screen.getByTestId('global-leads-table')).toBeInTheDocument()
    })

    it('passes selectedLead.id to GlobalLeadsTable as selectedLeadId', () => {
      renderView({ selectedLead: mockLead })
      expect(screen.getByTestId('global-leads-table')).toHaveAttribute('data-selected-id', 'lead-1')
    })

    it('passes null selectedLead as undefined selectedLeadId', () => {
      renderView({ selectedLead: null })
      expect(screen.getByTestId('global-leads-table')).toHaveAttribute('data-selected-id', '')
    })
  })

  describe('LUMEN-13: export link', () => {
    it('export link always contains format=xlsx', () => {
      renderView()
      const link = screen.getByRole('link', { name: /exportar leads do banco global/i })
      expect(link).toHaveAttribute('href', expect.stringContaining('format=xlsx'))
    })

    it('export link has download attribute', () => {
      renderView()
      const link = screen.getByRole('link', { name: /exportar leads do banco global/i })
      expect(link).toHaveAttribute('download')
    })

    it('export link has correct aria-label', () => {
      renderView()
      expect(screen.getByRole('link', {
        name: 'Exportar leads do banco global com filtros aplicados como XLSX',
      })).toBeInTheDocument()
    })

    it('export link href includes city param when city filter is active', () => {
      mockUseGlobalLeadsFilters.mockReturnValueOnce([
        { city: 'Curitiba', segment: '', min_score: 0, created_after: '', page: 1 },
        jest.fn(),
      ])
      renderView()
      const link = screen.getByRole('link', { name: /exportar leads do banco global/i })
      expect(link).toHaveAttribute('href', expect.stringContaining('city=Curitiba'))
    })

    it('export link href includes segment param when segment filter is active', () => {
      mockUseGlobalLeadsFilters.mockReturnValueOnce([
        { city: '', segment: 'Construtoras', min_score: 0, created_after: '', page: 1 },
        jest.fn(),
      ])
      renderView()
      const link = screen.getByRole('link', { name: /exportar leads do banco global/i })
      expect(link).toHaveAttribute('href', expect.stringContaining('segment=Construtoras'))
    })

    it('export link href includes min_score param only when min_score > 0', () => {
      mockUseGlobalLeadsFilters.mockReturnValueOnce([
        { city: '', segment: '', min_score: 70, created_after: '', page: 1 },
        jest.fn(),
      ])
      renderView()
      const link = screen.getByRole('link', { name: /exportar leads do banco global/i })
      expect(link).toHaveAttribute('href', expect.stringContaining('min_score=70'))
    })

    it('export link href omits min_score when value is 0', () => {
      renderView() // default mock has min_score=0
      const link = screen.getByRole('link', { name: /exportar leads do banco global/i })
      expect(link).not.toHaveAttribute('href', expect.stringContaining('min_score'))
    })

    it('export link href includes created_after param when date filter is active', () => {
      mockUseGlobalLeadsFilters.mockReturnValueOnce([
        { city: '', segment: '', min_score: 0, created_after: '2026-01-01', page: 1 },
        jest.fn(),
      ])
      renderView()
      const link = screen.getByRole('link', { name: /exportar leads do banco global/i })
      expect(link).toHaveAttribute('href', expect.stringContaining('created_after=2026-01-01'))
    })
  })
})
