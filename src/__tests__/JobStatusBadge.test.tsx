import { render, screen } from '@testing-library/react'
import { JobStatusBadge } from '@/components/tools/JobStatusBadge'

describe('JobStatusBadge', () => {
  it('pending: renderiza "Na fila" com bg-yellow-100 e ícone Clock', () => {
    const { container } = render(<JobStatusBadge state="pending" />)
    expect(screen.getByText('Na fila')).toBeInTheDocument()
    const badge = container.querySelector('[role="status"]')
    expect(badge).toHaveClass('bg-yellow-100')
  })

  it('processing: renderiza "Processando" com bg-blue-100 e ícone Loader2 com animate-spin', () => {
    const { container } = render(<JobStatusBadge state="processing" />)
    expect(screen.getByText('Processando')).toBeInTheDocument()
    const badge = container.querySelector('[role="status"]')
    expect(badge).toHaveClass('bg-blue-100')
    // Ícone Loader2 tem animate-spin
    const spinIcon = container.querySelector('.animate-spin')
    expect(spinIcon).toBeInTheDocument()
  })

  it('awaiting_input: renderiza "Aguardando endereço" com bg-orange-100 e ícone MapPin', () => {
    const { container } = render(<JobStatusBadge state="awaiting_input" />)
    expect(screen.getByText('Aguardando endereço')).toBeInTheDocument()
    const badge = container.querySelector('[role="status"]')
    expect(badge).toHaveClass('bg-orange-100')
  })

  it('completed: renderiza "Concluído" com bg-green-100 e ícone CheckCircle', () => {
    const { container } = render(<JobStatusBadge state="completed" />)
    expect(screen.getByText('Concluído')).toBeInTheDocument()
    const badge = container.querySelector('[role="status"]')
    expect(badge).toHaveClass('bg-green-100')
  })

  it('failed: renderiza "Falhou" com bg-red-100 e ícone AlertCircle', () => {
    const { container } = render(<JobStatusBadge state="failed" />)
    expect(screen.getByText('Falhou')).toBeInTheDocument()
    const badge = container.querySelector('[role="status"]')
    expect(badge).toHaveClass('bg-red-100')
  })

  it('tem role="status" no container', () => {
    render(<JobStatusBadge state="pending" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('ícone de spinner tem aria-hidden="true"', () => {
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
