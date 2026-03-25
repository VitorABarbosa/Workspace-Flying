import { render, screen } from '@testing-library/react'
import FadeIn from '@/components/ui/FadeIn'

describe('FadeIn', () => {
  it('renderiza os children passados', () => {
    render(<FadeIn><span>Conteúdo de teste</span></FadeIn>)
    expect(screen.getByText('Conteúdo de teste')).toBeInTheDocument()
  })

  it('aceita prop delay sem erros', () => {
    render(<FadeIn delay={0.2}><span>Conteúdo</span></FadeIn>)
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })

  it('aceita prop className e aplica no wrapper', () => {
    render(<FadeIn className="test-class"><span>X</span></FadeIn>)
    const wrapper = screen.getByText('X').parentElement
    expect(wrapper).toHaveClass('test-class')
  })
})
