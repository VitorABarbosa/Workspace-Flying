import { render, screen } from '@testing-library/react'
import { LockedToolShell } from '../LockedToolShell'

jest.mock('@/components/tools/AgentShell', () => ({
  AgentShell: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="agent-shell" data-title={title}>{children}</div>
  ),
}))

describe('LockedToolShell', () => {
  it('renders inside AgentShell wrapper', () => {
    render(<LockedToolShell toolName="LUMEN" />)
    expect(screen.getByTestId('agent-shell')).toBeInTheDocument()
  })

  it('displays "Acesso restrito" heading', () => {
    render(<LockedToolShell toolName="LUMEN" />)
    expect(screen.getByRole('heading', { name: 'Acesso restrito' })).toBeInTheDocument()
  })

  it('displays "Você não tem acesso a esta ferramenta. Contate o administrador." body text', () => {
    render(<LockedToolShell toolName="LUMEN" />)
    expect(
      screen.getByText('Você não tem acesso a esta ferramenta. Contate o administrador.')
    ).toBeInTheDocument()
  })

  it('renders LockKeyhole icon with aria-hidden="true"', () => {
    const { container } = render(<LockedToolShell toolName="LUMEN" />)
    const icon = container.querySelector('[aria-hidden="true"]')
    expect(icon).toBeInTheDocument()
  })

  it('heading is an h2 element', () => {
    render(<LockedToolShell toolName="LUMEN" />)
    const heading = screen.getByText('Acesso restrito')
    expect(heading.tagName).toBe('H2')
  })
})
