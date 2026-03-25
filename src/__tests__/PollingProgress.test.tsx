import { render, screen } from '@testing-library/react'
import { PollingProgress } from '@/components/agents/pesquisador/PollingProgress'

describe('PollingProgress', () => {
  it('renderiza spinner com animate-spin', () => {
    render(<PollingProgress state="processing" elapsedSeconds={0} />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('exibe progress prop quando fornecido', () => {
    render(<PollingProgress state="processing" elapsedSeconds={5} progress="Extraindo dados..." />)
    expect(screen.getByText('Extraindo dados...')).toBeInTheDocument()
  })

  it('exibe fallback pending quando state=pending e progress ausente', () => {
    render(<PollingProgress state="pending" elapsedSeconds={0} />)
    expect(screen.getByText('Aguardando início do processamento...')).toBeInTheDocument()
  })

  it('exibe fallback processing quando state=processing e progress ausente', () => {
    render(<PollingProgress state="processing" elapsedSeconds={0} />)
    expect(screen.getByText('Analisando documento...')).toBeInTheDocument()
  })

  it('oculta timer quando elapsedSeconds === 0', () => {
    render(<PollingProgress state="processing" elapsedSeconds={0} />)
    expect(screen.queryByText(/Tempo decorrido/)).not.toBeInTheDocument()
  })

  it('exibe timer quando elapsedSeconds > 0', () => {
    render(<PollingProgress state="processing" elapsedSeconds={154} />)
    expect(screen.getByText(/Tempo decorrido/)).toBeInTheDocument()
    expect(screen.getByText(/2m 34s/)).toBeInTheDocument()
  })

  it('container tem role="status"', () => {
    render(<PollingProgress state="pending" elapsedSeconds={0} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
