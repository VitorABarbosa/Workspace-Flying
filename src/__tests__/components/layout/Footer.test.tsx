import { render, screen } from '@testing-library/react'
import Footer from '@/components/layout/Footer'

describe('Footer', () => {
  it('renderiza com fundo bg-[#0D0D0D]', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')
    expect(footer).toHaveClass('bg-[#0D0D0D]')
  })

  it('renderiza número de telefone de contato', () => {
    render(<Footer />)
    expect(screen.getByText('+55 11 2351-4138')).toBeInTheDocument()
  })

  it('renderiza email de contato', () => {
    render(<Footer />)
    expect(screen.getByText('studio@flyingstudio.com.br')).toBeInTheDocument()
  })

  it('renderiza endereço de contato', () => {
    render(<Footer />)
    expect(screen.getByText('Av. Eng. Luís Carlos Berrini, 936')).toBeInTheDocument()
  })

  it('renderiza ícones de redes sociais', () => {
    render(<Footer />)
    expect(screen.getByLabelText('WhatsApp Flying Studio')).toBeInTheDocument()
    expect(screen.getByLabelText('Instagram Flying Studio')).toBeInTheDocument()
  })
})
