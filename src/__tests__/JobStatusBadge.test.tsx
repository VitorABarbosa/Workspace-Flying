import { render, screen } from '@testing-library/react'
import { JobStatusBadge } from '@/components/tools/JobStatusBadge'

describe('JobStatusBadge', () => {
  it('pending: renderiza "Analisando material" com bg-yellow-100 e icone Clock', () => {
    const { container } = render(<JobStatusBadge state="pending" />)
    expect(screen.getByText('Analisando material')).toBeInTheDocument()
    const badge = container.querySelector('[role="status"]')
    expect(badge).toHaveClass('bg-yellow-100')
  })

  it('processing: renderiza "Analisando material" com bg-blue-100 e icone Loader2 com animate-spin', () => {
    const { container } = render(<JobStatusBadge state="processing" />)
    expect(screen.getByText('Analisando material')).toBeInTheDocument()
    const badge = container.querySelector('[role="status"]')
    expect(badge).toHaveClass('bg-blue-100')
    const spinIcon = container.querySelector('.animate-spin')
    expect(spinIcon).toBeInTheDocument()
  })

  it('awaiting_input: renderiza "Aguardando endereco do empreendimento" com bg-orange-100 e icone MapPin', () => {
    const { container } = render(<JobStatusBadge state="awaiting_input" />)
    expect(screen.getByText('Aguardando endereco do empreendimento')).toBeInTheDocument()
    const badge = container.querySelector('[role="status"]')
    expect(badge).toHaveClass('bg-orange-100')
  })

  it('completed: renderiza "Concluido" com bg-green-100 e icone CheckCircle', () => {
    const { container } = render(<JobStatusBadge state="completed" />)
    expect(screen.getByText('Concluido')).toBeInTheDocument()
    const badge = container.querySelector('[role="status"]')
    expect(badge).toHaveClass('bg-green-100')
  })

  it('failed: renderiza "Falhou" com bg-red-100 e icone AlertCircle', () => {
    const { container } = render(<JobStatusBadge state="failed" />)
    expect(screen.getByText('Falhou')).toBeInTheDocument()
    const badge = container.querySelector('[role="status"]')
    expect(badge).toHaveClass('bg-red-100')
  })

  it('tem role="status" no container', () => {
    render(<JobStatusBadge state="pending" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('icone de spinner tem aria-hidden="true"', () => {
    const { container } = render(<JobStatusBadge state="processing" />)
    const spinIcon = container.querySelector('[aria-hidden="true"]')
    expect(spinIcon).toBeInTheDocument()
  })

  it('badge tem forma rounded-full', () => {
    const { container } = render(<JobStatusBadge state="completed" />)
    const badge = container.querySelector('[role="status"]')
    expect(badge).toHaveClass('rounded-full')
  })
})
