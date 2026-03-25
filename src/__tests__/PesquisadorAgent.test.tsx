import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PesquisadorAgent } from '@/components/agents/pesquisador/PesquisadorAgent'
import { useJobCreate } from '@/hooks/useJobCreate'
import { useJobPolling } from '@/hooks/useJobPolling'

// Mock hooks
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

// Mock ReportView para isolar da cadeia ESM de react-markdown
jest.mock('@/components/agents/pesquisador/ReportView', () => ({
  ReportView: ({ onNewAnalysis }: { markdown: string; onNewAnalysis: () => void }) => (
    <div>
      <button onClick={onNewAnalysis}>Baixar .md</button>
    </div>
  ),
}))

// Mock framer-motion AnimatePresence (não disponível em jsdom)
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}))

const mockUseJobCreate = jest.mocked(useJobCreate)
const mockUseJobPolling = jest.mocked(useJobPolling)

describe('PesquisadorAgent', () => {
  beforeEach(() => { jest.clearAllMocks() })

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
    expect(screen.getByText('Endereço necessário')).toBeInTheDocument()
  })

  it('renderiza ReportView quando state=completed com result.markdown', () => {
    mockUseJobCreate.mockReturnValue({ jobId: 'job-1', status: 'idle', error: null, createJob: jest.fn(), reset: jest.fn() })
    mockUseJobPolling.mockReturnValue({
      jobStatus: { id: 'job-1', state: 'completed', result: { markdown: '# Relatório' } },
      error: null,
    })
    render(<PesquisadorAgent />)
    expect(screen.getByText('Baixar .md')).toBeInTheDocument()
  })

  it('renderiza ErrorView quando pollingError não é null', () => {
    mockUseJobCreate.mockReturnValue({ jobId: 'job-1', status: 'idle', error: null, createJob: jest.fn(), reset: jest.fn() })
    mockUseJobPolling.mockReturnValue({ jobStatus: null, error: 'Documento inválido' })
    render(<PesquisadorAgent />)
    expect(screen.getByText('Falha no processamento')).toBeInTheDocument()
    expect(screen.getByText('Documento inválido')).toBeInTheDocument()
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
