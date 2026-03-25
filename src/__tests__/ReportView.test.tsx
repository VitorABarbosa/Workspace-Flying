import { render, screen, fireEvent, act } from '@testing-library/react'
import { ReportView } from '@/components/agents/pesquisador/ReportView'

// Mock MarkdownOutput to avoid ESM chain (react-markdown/devlop) in unit tests
jest.mock('@/components/tools/MarkdownOutput', () => ({
  MarkdownOutput: ({ content }: { content: string }) => <div data-testid="markdown-output">{content}</div>,
}))

// Mock clipboard
const mockWriteText = jest.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
})

const DEFAULT_PROPS = {
  jobId: 'job-123',
  apiBase: 'http://localhost:8000',
  onNewAnalysis: jest.fn(),
}

describe('ReportView', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('renderiza conteúdo markdown (MarkdownOutput presente)', () => {
    render(<ReportView markdown="# Título" {...DEFAULT_PROPS} />)
    expect(document.body.textContent).toContain('Título')
  })

  it('link "Baixar .md" aponta para rota do backend', () => {
    render(<ReportView markdown="conteudo" {...DEFAULT_PROPS} />)
    const link = screen.getByText('Baixar .md').closest('a')
    expect(link).toHaveAttribute('href', 'http://localhost:8000/jobs/job-123/report/download')
    expect(link).toHaveAttribute('download')
  })

  it('link "Baixar PDF" aponta para rota do backend', () => {
    render(<ReportView markdown="conteudo" {...DEFAULT_PROPS} />)
    const link = screen.getByText('Baixar PDF').closest('a')
    expect(link).toHaveAttribute('href', 'http://localhost:8000/jobs/job-123/report/download/pdf')
    expect(link).toHaveAttribute('download')
  })

  it('botão "Copiar" chama navigator.clipboard.writeText com o markdown', async () => {
    mockWriteText.mockResolvedValue(undefined)
    render(<ReportView markdown="# Conteudo copiado" {...DEFAULT_PROPS} />)
    await act(async () => { fireEvent.click(screen.getByText('Copiar')) })
    expect(mockWriteText).toHaveBeenCalledWith('# Conteudo copiado')
  })

  it('após cópia botão muda para "Copiado!"', async () => {
    mockWriteText.mockResolvedValue(undefined)
    jest.useFakeTimers()
    render(<ReportView markdown="texto" {...DEFAULT_PROPS} />)
    await act(async () => { fireEvent.click(screen.getByText('Copiar')) })
    expect(screen.getByText('Copiado!')).toBeInTheDocument()
    act(() => { jest.advanceTimersByTime(2000) })
    expect(screen.queryByText('Copiado!')).not.toBeInTheDocument()
    jest.useRealTimers()
  })

  it('link "← Fazer nova análise" chama onNewAnalysis', () => {
    const onNewAnalysis = jest.fn()
    render(<ReportView markdown="texto" jobId="job-123" apiBase="http://localhost:8000" onNewAnalysis={onNewAnalysis} />)
    fireEvent.click(screen.getByText('← Fazer nova análise'))
    expect(onNewAnalysis).toHaveBeenCalled()
  })
})
