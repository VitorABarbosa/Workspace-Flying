import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// Mock framer-motion to avoid JSDOM animation issues
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock sonner toast
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }))

// Mock AgentShell
jest.mock('@/components/tools/AgentShell', () => ({
  AgentShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock JobStatusBadge
jest.mock('@/components/tools/JobStatusBadge', () => ({
  JobStatusBadge: ({ state }: { state: string }) => (
    <span data-testid="job-status-badge">{state}</span>
  ),
}))

// Mock LumenSearchForm
jest.mock('../LumenSearchForm', () => ({
  LumenSearchForm: ({
    onSubmit,
  }: {
    onSubmit: (v: { city: string; segments: string[]; customQuery: string }) => void
  }) => (
    <button
      data-testid="search-form"
      onClick={() => onSubmit({ city: 'São Paulo', segments: ['Imóveis'], customQuery: '' })}
    >
      Submit
    </button>
  ),
}))

// Mock LumenJobProgress
jest.mock('../LumenJobProgress', () => ({
  LumenJobProgress: () => <div data-testid="lumen-job-progress" />,
}))

// Mock SearchLeadsList as a jest.fn() so we can use mockImplementation per test
type MockSearchLeadsListProps = {
  jobId: string
  onSelectLead: (lead: { id: string; name: string; score: number }) => void
  selectedLeadId?: string
}
const mockSearchLeadsList = jest.fn(({ jobId }: MockSearchLeadsListProps) => (
  <div data-testid="search-leads-list" data-job-id={jobId} />
))
jest.mock('../SearchLeadsList', () => ({
  get SearchLeadsList() {
    return mockSearchLeadsList
  },
}))

// Mock LeadDetailPanel
jest.mock('../LeadDetailPanel', () => ({
  LeadDetailPanel: ({
    lead,
    onClose,
  }: {
    lead: { name: string } | null
    onClose: () => void
  }) =>
    lead ? (
      <div data-testid="lead-detail-panel" data-name={lead.name} onClick={onClose} />
    ) : null,
}))

// Mock useJobPolling
const mockJobPolling = jest.fn()
jest.mock('@/hooks/useJobPolling', () => ({
  useJobPolling: (...args: unknown[]) => mockJobPolling(...args),
}))

import { LumenAgent } from '../LumenAgent'

describe('LumenAgent', () => {
  beforeEach(() => {
    mockJobPolling.mockReturnValue({ jobStatus: null, error: null })
    mockSearchLeadsList.mockImplementation(({ jobId }: MockSearchLeadsListProps) => (
      <div data-testid="search-leads-list" data-job-id={jobId} />
    ))
    jest.clearAllMocks()
    mockJobPolling.mockReturnValue({ jobStatus: null, error: null })
  })

  describe('LUMEN-01: catalog registration', () => {
    it.todo('LUMEN entry exists in src/config/tools.ts with id="lumen", status="active", icon="Building2"')
    it.todo('LumenAgent is registered in AGENT_COMPONENTS in src/app/tools/[slug]/page.tsx')
  })

  describe('LUMEN-03: job creation and polling orchestration', () => {
    it.todo('renderiza LumenSearchForm no estado idle')
    it.todo('chama useJobCreate com endpoint de busca LUMEN ao montar')
    it.todo('chama useJobPolling com jobId quando jobId é definido')
    it.todo('formulário fica desabilitado após submit (view !== idle)')
    it.todo('exibe spinner "Iniciando busca..." durante createStatus="creating"')
    it.todo('exibe LumenJobProgress quando view="searching"')
  })

  describe('LUMEN-05: cancel flow', () => {
    it.todo('handleCancel chama POST /search/{jobId}/cancel')
    it.todo('não chama jobCreate.reset() diretamente no handleCancel')
    it.todo('view transiciona para "cancelled" quando jobStatus.state="cancelled"')
    it.todo('formulário re-habilita após view="cancelled"')
    it.todo('exibe painel "Busca cancelada" com botão "Nova busca"')
    it.todo('exibe toast de erro "Falha ao cancelar busca" quando POST cancel retorna erro')
  })

  describe('LUMEN-04: counter preservation', () => {
    it.todo('finalCounts preserva found/new/duplicates após job terminal (não reseta para 0)')
    it.todo('handleNewSearch limpa finalCounts e re-habilita formulário')
  })

  describe('estado completed (Phase 4 placeholder)', () => {
    it.todo('exibe painel "Busca concluída" quando view="completed"')
    it.todo('exibe finalCounts no painel de conclusão')
    it.todo('botão "Nova busca" reseta o estado')
  })

  describe('estado failed', () => {
    it.todo('exibe painel "Falha na busca" com mensagem de erro')
    it.todo('botão "Tentar novamente" re-usa mesmos valores do formulário')
  })

  describe('LUMEN-06..09: completed view com SearchLeadsList (Phase 5)', () => {
    it('view="completed" renderiza SearchLeadsList com jobId correto', async () => {
      const jobId = 'test-job-abc'
      mockJobPolling.mockReturnValue({
        jobStatus: {
          state: 'completed',
          found: 5,
          new: 3,
          duplicates: 2,
          progress_pct: 100,
        },
        error: null,
      })
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ job_id: jobId }),
      })

      render(<LumenAgent />)

      await act(async () => {
        fireEvent.click(screen.getByTestId('search-form'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('search-leads-list')).toBeInTheDocument()
      })
      expect(screen.getByTestId('search-leads-list')).toHaveAttribute('data-job-id', jobId)
    })

    it('view="completed" renderiza header "Busca concluída" com CheckCircle icon', async () => {
      const jobId = 'test-job-header'
      mockJobPolling.mockReturnValue({
        jobStatus: { state: 'completed', found: 3, new: 2, duplicates: 1, progress_pct: 100 },
        error: null,
      })
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ job_id: jobId }),
      })

      render(<LumenAgent />)
      await act(async () => {
        fireEvent.click(screen.getByTestId('search-form'))
      })

      await waitFor(() => {
        expect(screen.getByText('Busca concluída')).toBeInTheDocument()
      })
    })

    it('view="completed" renderiza link de export XLSX com href correto', async () => {
      const jobId = 'job-xlsx-test'
      mockJobPolling.mockReturnValue({
        jobStatus: { state: 'completed', found: 3, new: 2, duplicates: 1, progress_pct: 100 },
        error: null,
      })
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ job_id: jobId }),
      })

      render(<LumenAgent />)
      await act(async () => {
        fireEvent.click(screen.getByTestId('search-form'))
      })

      await waitFor(() => {
        const exportLink = screen.getByRole('link', { name: /exportar leads/i })
        expect(exportLink).toBeInTheDocument()
        expect(exportLink).toHaveAttribute(
          'href',
          `/api/tools/lumen/leads?job_id=${encodeURIComponent(jobId)}&format=xlsx`,
        )
      })
    })

    it('LeadDetailPanel renderiza quando selectedLead !== null', async () => {
      const jobId = 'job-panel-test'
      mockJobPolling.mockReturnValue({
        jobStatus: { state: 'completed', found: 1, new: 1, duplicates: 0, progress_pct: 100 },
        error: null,
      })
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ job_id: jobId }),
      })

      let capturedOnSelectLead: ((lead: { id: string; name: string; score: number }) => void) | null =
        null
      mockSearchLeadsList.mockImplementation(({ onSelectLead }: MockSearchLeadsListProps) => {
        capturedOnSelectLead = onSelectLead
        return <div data-testid="search-leads-list-interactive" />
      })

      render(<LumenAgent />)
      await act(async () => {
        fireEvent.click(screen.getByTestId('search-form'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('search-leads-list-interactive')).toBeInTheDocument()
      })

      expect(capturedOnSelectLead).not.toBeNull()
      await act(async () => {
        capturedOnSelectLead!({ id: 'lead-1', name: 'Test Company', score: 85 })
      })

      await waitFor(() => {
        expect(screen.getByTestId('lead-detail-panel')).toBeInTheDocument()
      })
    })

    it('LeadDetailPanel chama onClose que define selectedLead=null', async () => {
      const jobId = 'job-close-test'
      mockJobPolling.mockReturnValue({
        jobStatus: { state: 'completed', found: 1, new: 1, duplicates: 0, progress_pct: 100 },
        error: null,
      })
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ job_id: jobId }),
      })

      let capturedOnSelectLead: ((lead: { id: string; name: string; score: number }) => void) | null =
        null
      mockSearchLeadsList.mockImplementation(({ onSelectLead }: MockSearchLeadsListProps) => {
        capturedOnSelectLead = onSelectLead
        return <div data-testid="search-leads-list-close" />
      })

      render(<LumenAgent />)
      await act(async () => {
        fireEvent.click(screen.getByTestId('search-form'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('search-leads-list-close')).toBeInTheDocument()
      })

      await act(async () => {
        capturedOnSelectLead!({ id: 'lead-2', name: 'Another Company', score: 60 })
      })

      await waitFor(() => {
        expect(screen.getByTestId('lead-detail-panel')).toBeInTheDocument()
      })

      // Click panel (triggers onClose in mock)
      await act(async () => {
        fireEvent.click(screen.getByTestId('lead-detail-panel'))
      })

      await waitFor(() => {
        expect(screen.queryByTestId('lead-detail-panel')).not.toBeInTheDocument()
      })
    })

    it('handleNewSearch limpa selectedLead além dos outros estados', async () => {
      const jobId = 'job-newsearch-test'
      mockJobPolling.mockReturnValue({
        jobStatus: { state: 'completed', found: 1, new: 1, duplicates: 0, progress_pct: 100 },
        error: null,
      })
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ job_id: jobId }),
      })

      let capturedOnSelectLead: ((lead: { id: string; name: string; score: number }) => void) | null =
        null
      mockSearchLeadsList.mockImplementation(({ onSelectLead }: MockSearchLeadsListProps) => {
        capturedOnSelectLead = onSelectLead
        return <div data-testid="search-leads-list-newsearch" />
      })

      render(<LumenAgent />)
      await act(async () => {
        fireEvent.click(screen.getByTestId('search-form'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('search-leads-list-newsearch')).toBeInTheDocument()
      })

      await act(async () => {
        capturedOnSelectLead!({ id: 'lead-3', name: 'Company X', score: 75 })
      })

      await waitFor(() => {
        expect(screen.getByTestId('lead-detail-panel')).toBeInTheDocument()
      })

      // Click "Nova busca" — state resets
      mockJobPolling.mockReturnValue({ jobStatus: null, error: null })
      await act(async () => {
        fireEvent.click(screen.getByText('Nova busca'))
      })

      await waitFor(() => {
        expect(screen.queryByTestId('lead-detail-panel')).not.toBeInTheDocument()
        expect(screen.getByTestId('search-form')).toBeInTheDocument()
      })
    })
  })

  describe('LUMEN-10: tab switcher (Phase 6)', () => {
    it.todo('renders "Busca" and "Banco de Leads" tab buttons')
    it.todo('"Busca" tab is active by default (activeTab === "busca")')
    it.todo('GlobalLeadsView is NOT rendered when activeTab === "busca"')
    it.todo('clicking "Banco de Leads" tab renders GlobalLeadsView')
    it.todo('switching tabs does NOT reset in-progress job state')
    it.todo('switching back to "Busca" tab hides GlobalLeadsView')
  })
})
