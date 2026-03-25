import { render, screen } from '@testing-library/react'
import Heading from '@/components/ui/Heading'

describe('Heading', () => {
  it('renderiza h2 por padrão', () => {
    render(<Heading>Título de teste</Heading>)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('renderiza h1 quando level={1}', () => {
    render(<Heading level={1}>Título H1</Heading>)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renderiza eyebrow quando prop eyebrow é passada', () => {
    render(<Heading eyebrow="EYEBROW">Título</Heading>)
    expect(screen.getByText('EYEBROW')).toBeInTheDocument()
  })

  it('eyebrow tem classes text-brand-purple uppercase', () => {
    render(<Heading eyebrow="TEST">Título</Heading>)
    const eyebrow = screen.getByText('TEST')
    expect(eyebrow).toHaveClass('text-brand-purple', 'uppercase')
  })

  it('não renderiza eyebrow quando prop não é passada', () => {
    render(<Heading>Título</Heading>)
    // Não deve ter elemento com as classes de eyebrow
    const { container } = render(<Heading>Título</Heading>)
    expect(container.querySelector('.text-brand-purple.uppercase')).not.toBeInTheDocument()
  })
})
