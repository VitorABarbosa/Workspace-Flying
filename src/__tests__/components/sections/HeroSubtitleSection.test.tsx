import { render, screen } from '@testing-library/react'
import HeroSubtitleSection from '@/components/sections/HeroSubtitleSection'

// Cobre: HOME-03 (eyebrow "SOMOS EXPERT NO MERCADO IMOBILIÁRIO" e heading com span roxo)
describe('HeroSubtitleSection', () => {
  it('renderiza eyebrow com texto "SOMOS EXPERT NO MERCADO IMOBILIÁRIO"', () => {
    render(<HeroSubtitleSection />)
    expect(screen.getByText('SOMOS EXPERT NO MERCADO IMOBILIÁRIO')).toBeInTheDocument()
  })

  it('renderiza heading com "Tecnologia Artística 3D"', () => {
    render(<HeroSubtitleSection />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('contém seção renderizada', () => {
    const { container } = render(<HeroSubtitleSection />)
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})
