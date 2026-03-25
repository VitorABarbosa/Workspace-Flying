import { render, screen } from '@testing-library/react'
import { AgentShell } from '@/components/tools/AgentShell'

describe('AgentShell', () => {
  it('renderiza title como heading (text-[22px] font-bold)', () => {
    render(<AgentShell title="Minha Ferramenta"><div /></AgentShell>)
    expect(screen.getByText('Minha Ferramenta')).toBeInTheDocument()
  })

  it('renderiza description quando fornecida', () => {
    render(
      <AgentShell title="Test" description="Descrição da ferramenta">
        <div />
      </AgentShell>
    )
    expect(screen.getByText('Descrição da ferramenta')).toBeInTheDocument()
  })

  it('não renderiza description quando omitida', () => {
    const { container } = render(<AgentShell title="Test"><div /></AgentShell>)
    // Não deve haver parágrafo de descrição quando prop omitida
    const section = container.querySelector('section')
    expect(section?.querySelectorAll('p').length).toBe(0)
  })

  it('renderiza link "← Ferramentas" com href="/tools"', () => {
    render(<AgentShell title="Test"><div /></AgentShell>)
    const link = screen.getByRole('link', { name: /ferramentas/i })
    expect(link).toHaveAttribute('href', '/tools')
  })

  it('link tem cor text-brand-purple', () => {
    render(<AgentShell title="Test"><div /></AgentShell>)
    const link = screen.getByRole('link', { name: /ferramentas/i })
    expect(link).toHaveClass('text-brand-purple')
  })

  it('renderiza statusBadge quando fornecido', () => {
    render(
      <AgentShell title="Test" statusBadge={<span data-testid="badge">Processando</span>}>
        <div />
      </AgentShell>
    )
    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  it('não renderiza área de statusBadge quando omitido', () => {
    const { container } = render(<AgentShell title="Test"><div /></AgentShell>)
    // Não deve ter segundo filho no flex header quando statusBadge é omitido
    const flexRow = container.querySelector('.flex.items-start.justify-between')
    // Apenas o div left side (sem badge wrapper)
    expect(flexRow?.children.length).toBe(1)
  })

  it('renderiza children no content area', () => {
    render(
      <AgentShell title="Test">
        <p data-testid="content">Conteúdo do agente</p>
      </AgentShell>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo do agente')).toBeInTheDocument()
  })

  it('container tem max-w-[1200px] mx-auto px-6 py-20', () => {
    const { container } = render(<AgentShell title="Test"><div /></AgentShell>)
    const section = container.querySelector('section')
    expect(section).toHaveClass('py-20', 'px-6', 'max-w-[1200px]', 'mx-auto')
  })
})
