import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock JobStatusBadge
jest.mock('@/components/tools/JobStatusBadge', () => ({
  JobStatusBadge: ({ state }: { state: string }) => (
    <span data-testid="job-status-badge">{state}</span>
  ),
}))

import { SearchHistoryList } from '../SearchHistoryList'

// Helper: mock fetch with resolved data
function mockFetch(data: unknown[]) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data }),
  })
}

function mockFetchError() {
  global.fetch = jest.fn().mockRejectedValueOnce(new Error('HTTP 500'))
}

const ITEM_COMPLETED = {
  id: 'job-abc',
  city: 'São Paulo',
  segments: ['Construtoras', 'Imobiliárias'],
  state: 'completed' as const,
  found: 10,
  new: 7,
  duplicates: 3,
  created_at: '2026-03-28T14:35:00.000Z',
}

const ITEM_FAILED = {
  id: 'job-def',
  city: 'Rio de Janeiro',
  segments: ['Incorporadoras'],
  state: 'failed' as const,
  found: undefined,
  new: undefined,
  duplicates: undefined,
  created_at: '2026-03-27T10:00:00.000Z',
}

const ITEM_CANCELLED = {
  id: 'job-ghi',
  city: 'Curitiba',
  segments: ['Loteadoras'],
  state: 'cancelled' as const,
  found: 5,
  new: 3,
  duplicates: 2,
  created_at: '2026-03-26T08:00:00.000Z',
}

const mockOnReopenSearch = jest.fn()

describe('SearchHistoryList', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('loading state', () => {
    it('shows skeleton rows while loading', () => {
      // fetch never resolves — component stays in loading state
      global.fetch = jest.fn().mockReturnValue(new Promise(() => {}))
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      // 5 skeleton rows should be rendered
      const rows = document.querySelectorAll('tbody tr')
      expect(rows).toHaveLength(5)
      // Each skeleton row should have animated pulse divs
      const skeletonDivs = document.querySelectorAll('.animate-pulse')
      expect(skeletonDivs.length).toBeGreaterThan(0)
    })
  })

  describe('error state', () => {
    it('shows error state with retry button on fetch failure', async () => {
      mockFetchError()
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        expect(screen.getByText('Erro ao carregar histórico')).toBeInTheDocument()
      })
      expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
    })

    it('retry button triggers re-fetch', async () => {
      mockFetchError()
      // Second call resolves
      global.fetch = jest.fn()
        .mockRejectedValueOnce(new Error('HTTP 500'))
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) })

      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Tentar novamente'))

      // fetch should be called twice (initial + retry)
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('empty state', () => {
    it('shows empty state when data array is empty', async () => {
      mockFetch([])
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        expect(screen.getByText('Nenhuma pesquisa realizada ainda')).toBeInTheDocument()
      })
    })
  })

  describe('LUMEN-14: list rendering', () => {
    it('renders city for each history item', async () => {
      mockFetch([ITEM_COMPLETED, ITEM_FAILED])
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        expect(screen.getByText('São Paulo')).toBeInTheDocument()
        expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument()
      })
    })

    it('renders segments as comma-joined string', async () => {
      mockFetch([ITEM_COMPLETED])
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        expect(screen.getByText('Construtoras, Imobiliárias')).toBeInTheDocument()
      })
    })

    it('renders JobStatusBadge for each item state', async () => {
      mockFetch([ITEM_COMPLETED, ITEM_FAILED])
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        const badges = screen.getAllByTestId('job-status-badge')
        expect(badges).toHaveLength(2)
      })
    })

    it('renders found/new/duplicates counters', async () => {
      mockFetch([ITEM_COMPLETED])
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument()
        expect(screen.getByText('7')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
      })
    })

    it('renders — for undefined counters', async () => {
      mockFetch([ITEM_FAILED])
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        // ITEM_FAILED has undefined found/new/duplicates — should render '—'
        const dashes = screen.getAllByText('—')
        // At least 3 dashes for found, new, duplicates counters (plus the action column)
        expect(dashes.length).toBeGreaterThanOrEqual(3)
      })
    })

    it('renders formatted date in pt-BR', async () => {
      mockFetch([ITEM_COMPLETED])
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        // Date should contain 28/03/2026
        expect(screen.getByText(/28\/03\/2026/)).toBeInTheDocument()
      })
    })
  })

  describe('LUMEN-15: action gating', () => {
    it('renders Ver leads button only for completed items', async () => {
      mockFetch([ITEM_COMPLETED, ITEM_FAILED, ITEM_CANCELLED])
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        const buttons = screen.getAllByText('Ver leads')
        expect(buttons).toHaveLength(1)
      })
    })

    it('does not render Ver leads for failed items', async () => {
      mockFetch([ITEM_FAILED])
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        expect(screen.queryByText('Ver leads')).not.toBeInTheDocument()
      })
    })

    it('does not render Ver leads for cancelled items', async () => {
      mockFetch([ITEM_CANCELLED])
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        expect(screen.queryByText('Ver leads')).not.toBeInTheDocument()
      })
    })

    it('clicking Ver leads calls onReopenSearch with item.id', async () => {
      mockFetch([ITEM_COMPLETED])
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        expect(screen.getByText('Ver leads')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Ver leads'))
      expect(mockOnReopenSearch).toHaveBeenCalledWith('job-abc')
    })

    it('uses item.job_id as fallback when item.id is undefined', async () => {
      const itemWithJobId = {
        ...ITEM_COMPLETED,
        id: undefined as unknown as string,
        job_id: 'fallback-job-id',
      }
      mockFetch([itemWithJobId])
      render(<SearchHistoryList onReopenSearch={mockOnReopenSearch} />)
      await waitFor(() => {
        expect(screen.getByText('Ver leads')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Ver leads'))
      expect(mockOnReopenSearch).toHaveBeenCalledWith('fallback-job-id')
    })
  })
})
