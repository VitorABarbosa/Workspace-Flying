import { render, screen, fireEvent, act } from '@testing-library/react'
import BackToTop from '@/components/ui/BackToTop'

describe('BackToTop', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
  })

  it('não renderiza quando scrollY < 300', () => {
    render(<BackToTop />)
    expect(screen.queryByLabelText('Voltar ao topo')).not.toBeInTheDocument()
  })

  it('renderiza após scrollY > 300', () => {
    render(<BackToTop />)
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 350, writable: true, configurable: true })
      fireEvent.scroll(window)
    })
    expect(screen.getByLabelText('Voltar ao topo')).toBeInTheDocument()
  })

  it('chama window.scrollTo({ top: 0, behavior: "smooth" }) ao clicar', () => {
    render(<BackToTop />)
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 350, writable: true, configurable: true })
      fireEvent.scroll(window)
    })
    fireEvent.click(screen.getByLabelText('Voltar ao topo'))
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('tem classes fixed bottom-6 right-6 bg-brand-purple rounded-full', () => {
    render(<BackToTop />)
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 350, writable: true, configurable: true })
      fireEvent.scroll(window)
    })
    const btn = screen.getByLabelText('Voltar ao topo')
    expect(btn).toHaveClass('fixed', 'bottom-6', 'right-6', 'bg-brand-purple', 'rounded-full')
  })
})
