import { render, screen } from '@testing-library/react'
import Header from '@/components/layout/Header'

describe('Header', () => {
  it('renderiza com classes fixed top-0 z-50', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('fixed', 'top-0', 'z-50')
  })

  it('renderiza botão hamburguer com aria-label "Abrir menu"', () => {
    render(<Header />)
    expect(screen.getByLabelText('Abrir menu')).toBeInTheDocument()
  })

  it('renderiza ThemeToggle dentro da control pill', () => {
    render(<Header />)
    expect(screen.getByLabelText('Alternar tema')).toBeInTheDocument()
  })

  it('control pill tem classes rounded-full e border', () => {
    render(<Header />)
    // A pill é o container dos dois botões
    const pill = screen.getByLabelText('Abrir menu').closest('div')
    expect(pill).toHaveClass('rounded-full', 'border')
  })
})
