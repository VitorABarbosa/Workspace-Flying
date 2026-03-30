import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing'

// Mock LeadScoreBadge
jest.mock('../LeadScoreBadge', () => ({
  LeadScoreBadge: ({ score }: { score: number }) => (
    <span data-testid="score-badge">{score}</span>
  ),
}))

// Mock GlobalLeadsPagination
jest.mock('../GlobalLeadsPagination', () => ({
  GlobalLeadsPagination: ({ currentPage, totalPages, onPageChange }: {
    currentPage: number; totalPages: number; onPageChange: (p: number) => void
  }) => (
    <div
      data-testid="pagination"
      data-current={currentPage}
      data-total={totalPages}
      onClick={() => onPageChange(currentPage + 1)}
    />
  ),
}))

import { GlobalLeadsTable } from '../GlobalLeadsTable'
import type { LeadsResponse } from '@/types/lumen'

const mockLead = {
  id: 'lead-1',
  job_id: 'job-1',
  name: 'Test Company',
  city: 'São Paulo',
  segment: 'Construtoras',
  website: 'https://test.com',
  phone: '11 99999-9999',
  score: 85,
  scraping_status: 'scraped',
}

function makeLeadsResponse(overrides: Partial<LeadsResponse> = {}): LeadsResponse {
  return {
    data: [mockLead],
    total: 1,
    page: 1,
    pages: 1,
    per_page: 50,
    ...overrides,
  }
}

function renderTable(
  props: { onSelectLead?: jest.Mock; selectedLeadId?: string } = {},
  searchParams: Record<string, string> = {},
) {
  const onSelectLead = props.onSelectLead ?? jest.fn()
  return {
    onSelectLead,
    ...render(
      <GlobalLeadsTable onSelectLead={onSelectLead} selectedLeadId={props.selectedLeadId} />,
      { wrapper: withNuqsTestingAdapter({ searchParams }) },
    ),
  }
}

describe('GlobalLeadsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('LUMEN-12: fetch behavior', () => {
    it('fetches /api/tools/lumen/leads without job_id param', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => makeLeadsResponse(),
      })
      renderTable()
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
      const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
      expect(url).toContain('/api/tools/lumen/leads')
      expect(url).not.toContain('job_id')
    })

    it('fetch URL always includes page and per_page=50', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => makeLeadsResponse(),
      })
      renderTable({}, { page: '2' })
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
      const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
      expect(url).toContain('page=2')
      expect(url).toContain('per_page=50')
    })

    it('fetch URL includes city param when city is non-empty', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => makeLeadsResponse(),
      })
      renderTable({}, { city: 'Curitiba' })
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
      const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
      expect(url).toContain('city=Curitiba')
    })

    it('fetch URL includes min_score param only when min_score > 0', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => makeLeadsResponse(),
      })
      renderTable({}, { min_score: '70' })
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
      const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
      expect(url).toContain('min_score=70')
    })

    it('fetch URL omits min_score when value is 0', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => makeLeadsResponse(),
      })
      renderTable({}, { min_score: '0' })
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
      const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
      expect(url).not.toContain('min_score')
    })
  })

  describe('LUMEN-12: loading state', () => {
    it('shows 5 skeleton rows with 7 columns each during loading', () => {
      global.fetch = jest.fn().mockReturnValue(new Promise(() => {})) // never resolves
      renderTable()
      const skeletonCells = screen.getAllByRole('cell')
      // 5 rows × 7 cols = 35 cells
      expect(skeletonCells).toHaveLength(35)
    })
  })

  describe('LUMEN-12: empty state', () => {
    it('shows "Nenhum lead encontrado" when data=[] and no filters active', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => ({ ...makeLeadsResponse(), data: [], total: 0 }),
      })
      renderTable()
      await waitFor(() => expect(screen.getByText('Nenhum lead encontrado')).toBeInTheDocument())
      expect(screen.getByText(/O banco de leads está vazio/)).toBeInTheDocument()
    })

    it('shows filter-specific body text when data=[] with filters active', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => ({ ...makeLeadsResponse(), data: [], total: 0 }),
      })
      renderTable({}, { city: 'SP' })
      await waitFor(() =>
        expect(screen.getByText(/Nenhum lead corresponde aos filtros/)).toBeInTheDocument()
      )
    })
  })

  describe('LUMEN-12: error state', () => {
    it('shows "Erro ao carregar banco de leads" heading on fetch error', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'))
      renderTable()
      await waitFor(() =>
        expect(screen.getByText('Erro ao carregar banco de leads')).toBeInTheDocument()
      )
    })

    it('"Tentar novamente" link triggers re-fetch', async () => {
      global.fetch = jest.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce({ ok: true, json: async () => makeLeadsResponse() })
      renderTable()
      await waitFor(() => expect(screen.getByText('Tentar novamente')).toBeInTheDocument())
      fireEvent.click(screen.getByText('Tentar novamente'))
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2))
    })
  })

  describe('LUMEN-12: table content', () => {
    it('renders column headers: Nome, Cidade, Segmento, Website, Telefone, Score, Coleta', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => makeLeadsResponse(),
      })
      renderTable()
      await waitFor(() => expect(screen.getByText('Nome')).toBeInTheDocument())
      ;['Cidade', 'Segmento', 'Website', 'Telefone', 'Score', 'Coleta'].forEach(col =>
        expect(screen.getByText(col)).toBeInTheDocument()
      )
    })

    it('renders lead name in the table', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => makeLeadsResponse(),
      })
      renderTable()
      await waitFor(() => expect(screen.getByText('Test Company')).toBeInTheDocument())
    })

    it('renders LeadScoreBadge for each lead row', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => makeLeadsResponse(),
      })
      renderTable()
      await waitFor(() => expect(screen.getByTestId('score-badge')).toBeInTheDocument())
    })

    it('clicking a row calls onSelectLead with the lead object', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => makeLeadsResponse(),
      })
      const { onSelectLead } = renderTable()
      await waitFor(() => expect(screen.getByText('Test Company')).toBeInTheDocument())
      const rows = screen.getAllByRole('row')
      // rows[0] is header, rows[1] is first data row
      fireEvent.click(rows[1])
      expect(onSelectLead).toHaveBeenCalledWith(expect.objectContaining({ id: 'lead-1' }))
    })

    it('selected row has bg-brand-purple/10 class', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => makeLeadsResponse(),
      })
      renderTable({ selectedLeadId: 'lead-1' })
      await waitFor(() => expect(screen.getByText('Test Company')).toBeInTheDocument())
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveClass('bg-brand-purple/10')
    })

    it('row responds to Enter key — calls onSelectLead', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => makeLeadsResponse(),
      })
      const { onSelectLead } = renderTable()
      await waitFor(() => expect(screen.getByText('Test Company')).toBeInTheDocument())
      const rows = screen.getAllByRole('row')
      fireEvent.keyDown(rows[1], { key: 'Enter' })
      expect(onSelectLead).toHaveBeenCalledWith(expect.objectContaining({ id: 'lead-1' }))
    })

    it('row responds to Space key — calls onSelectLead', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true, json: async () => makeLeadsResponse(),
      })
      const { onSelectLead } = renderTable()
      await waitFor(() => expect(screen.getByText('Test Company')).toBeInTheDocument())
      const rows = screen.getAllByRole('row')
      fireEvent.keyDown(rows[1], { key: ' ' })
      expect(onSelectLead).toHaveBeenCalledWith(expect.objectContaining({ id: 'lead-1' }))
    })
  })
})
