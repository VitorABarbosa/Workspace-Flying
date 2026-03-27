import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PesquisadorAgent } from '@/components/agents/pesquisador/PesquisadorAgent'
import { useJobCreate } from '@/hooks/useJobCreate'
import { useJobPolling } from '@/hooks/useJobPolling'

jest.mock('@/hooks/useJobCreate', () => ({
  useJobCreate: jest.fn(() => ({
    jobId: null,
    status: 'idle',
    error: null,
    createJob: jest.fn(),
    reset: jest.fn(),
  })),
}))

jest.mock('@/hooks/useJobPolling', () => ({
  useJobPolling: jest.fn(() => ({ jobStatus: null, error: null })),
}))

jest.mock('@/hooks/useAddressSubmit', () => ({
  useAddressSubmit: jest.fn(() => ({
    submit: jest.fn(),
    status: 'idle',
    error: null,
    reset: jest.fn(),
  })),
}))

jest.mock('@/components/agents/pesquisador/ReportView', () => ({
  ReportView: ({ onNewAnalysis }: { markdown: string; onNewAnalysis: () => void }) => (
    <div>
      <button onClick={onNewAnalysis}>Baixar .md</button>
    </div>
  ),
}))

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}))

const mockUseJobCreate = jest.mocked(useJobCreate)
const mockUseJobPolling = jest.mocked(useJobPolling)

describe('PesquisadorAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('renderiza DropZone no estado idle (jobId=null, createStatus=idle)', () => {
    mockUseJobCreate.mockReturnValue({ jobId: null, status: 'idle', error: null, createJob: jest.fn(), reset: jest.fn() })
    mockUseJobPolling.mockReturnValue({ jobStatus: null, error: null })
    render(<PesquisadorAgent />)
    expect(screen.getByText('Arraste o PDF aqui')).toBeInTheDocument()
  })

  it('renderiza UploadProgress quando createStatus=creating', () => {
    mockUseJobCreate.mockReturnValue({ jobId: null, status: 'creating', error: null, createJob: jest.fn(), reset: jest.fn() })
    mockUseJobPolling.mockReturnValue({ jobStatus: null, error: null })
    render(<PesquisadorAgent />)
    expect(screen.getByText('Enviando arquivo...')).toBeInTheDocument()
  })

  it('renderiza PollingProgress quando jobId definido e state=pending', () => {
    mockUseJobCreate.mockReturnValue({ jobId: 'job-1', status: 'idle', error: null, createJob: jest.fn(), reset: jest.fn() })
    mockUseJobPolling.mockReturnValue({ jobStatus: { id: 'job-1', state: 'pending' }, error: null })
    render(<PesquisadorAgent />)
    expect(screen.getByText('Aguardando início do processamento...')).toBeInTheDocument()
  })

  it('renderiza AddressForm quando state=awaiting_input', () => {
    mockUseJobCreate.mockReturnValue({ jobId: 'job-1', status: 'idle', error: null, createJob: jest.fn(), reset: jest.fn() })
    mockUseJobPolling.mockReturnValue({ jobStatus: { id: 'job-1', state: 'awaiting_input' }, error: null })
    render(<PesquisadorAgent />)
    expect(screen.getByText('Endereco necessario')).toBeInTheDocument()
  })

  it('renderiza AddressForm quando backend retorna awaiting_address com address_prompt', () => {
    mockUseJobCreate.mockReturnValue({ jobId: 'job-1', status: 'idle', error: null, createJob: jest.fn(), reset: jest.fn() })
    mockUseJobPolling.mockReturnValue({
      jobStatus: {
        id: 'job-1',
        state: 'awaiting_address',
        address_prompt: 'Informe o endereco completo para continuar.',
      },
      error: null,
    })
    render(<PesquisadorAgent />)
    expect(screen.getByText('Informe o endereco completo para continuar.')).toBeInTheDocument()
  })

  it('renderiza AddressForm quando backend sinaliza requires_address=true', () => {
    mockUseJobCreate.mockReturnValue({ jobId: 'job-1', status: 'idle', error: null, createJob: jest.fn(), reset: jest.fn() })
    mockUseJobPolling.mockReturnValue({
      jobStatus: {
        id: 'job-1',
        state: 'processing',
        requires_address: true,
      },
      error: null,
    })
    render(<PesquisadorAgent />)
    expect(screen.getByText('Endereco necessario')).toBeInTheDocument()
  })

  it('renderiza ReportView quando state=completed com signed_url', async () => {
    const mockFetch = jest.mocked(global.fetch)
    mockFetch.mockResolvedValue({
      text: async () => '# Relatorio',
    } as Response)
    mockUseJobCreate.mockReturnValue({ jobId: 'job-1', status: 'idle', error: null, createJob: jest.fn(), reset: jest.fn() })
    mockUseJobPolling.mockReturnValue({
      jobStatus: { id: 'job-1', state: 'completed', result: { signed_url: '/signed/report.md' } },
      error: null,
    })
    render(<PesquisadorAgent />)
    expect(await screen.findByText('Baixar .md')).toBeInTheDocument()
  })

  it('renderiza ErrorView quando pollingError nao e null', () => {
    mockUseJobCreate.mockReturnValue({ jobId: 'job-1', status: 'idle', error: null, createJob: jest.fn(), reset: jest.fn() })
    mockUseJobPolling.mockReturnValue({ jobStatus: null, error: 'Documento invÃ¡lido' })
    render(<PesquisadorAgent />)
    expect(screen.getByText('Falha no processamento')).toBeInTheDocument()
    expect(screen.getByText('Documento invÃ¡lido')).toBeInTheDocument()
  })

  it('renderiza ErrorView quando createStatus=error', () => {
    mockUseJobCreate.mockReturnValue({ jobId: null, status: 'error', error: 'HTTP 500', createJob: jest.fn(), reset: jest.fn() })
    mockUseJobPolling.mockReturnValue({ jobStatus: null, error: null })
    render(<PesquisadorAgent />)
    expect(screen.getByText('Falha no processamento')).toBeInTheDocument()
  })

  it('"Enviar um novo PDF" chama reset de useJobCreate', () => {
    const resetMock = jest.fn()
    mockUseJobCreate.mockReturnValue({ jobId: 'job-1', status: 'idle', error: null, createJob: jest.fn(), reset: resetMock })
    mockUseJobPolling.mockReturnValue({ jobStatus: null, error: 'Erro qualquer' })
    render(<PesquisadorAgent />)
    fireEvent.click(screen.getByText('Enviar um novo PDF'))
    expect(resetMock).toHaveBeenCalled()
  })
})
