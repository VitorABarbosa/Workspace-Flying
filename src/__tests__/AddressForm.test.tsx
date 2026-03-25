import { render, screen, fireEvent } from '@testing-library/react'
import { AddressForm } from '@/components/agents/pesquisador/AddressForm'

describe('AddressForm', () => {
  it('renderiza heading "Endereço necessário"', () => {
    render(<AddressForm onSubmit={jest.fn()} isSubmitting={false} />)
    expect(screen.getByText('Endereço necessário')).toBeInTheDocument()
  })

  it('renderiza textarea com id="address-input" e label associado', () => {
    render(<AddressForm onSubmit={jest.fn()} isSubmitting={false} />)
    const textarea = document.getElementById('address-input')
    expect(textarea).toBeInTheDocument()
    expect(textarea?.tagName).toBe('TEXTAREA')
    const label = document.querySelector('label[for="address-input"]')
    expect(label).toBeInTheDocument()
  })

  it('submit com campo vazio exibe erro de validação', () => {
    render(<AddressForm onSubmit={jest.fn()} isSubmitting={false} />)
    fireEvent.click(screen.getByText('Confirmar endereço'))
    expect(screen.getByText('Insira o endereço antes de continuar.')).toBeInTheDocument()
  })

  it('submit com campo vazio não chama onSubmit', () => {
    const onSubmit = jest.fn()
    render(<AddressForm onSubmit={onSubmit} isSubmitting={false} />)
    fireEvent.click(screen.getByText('Confirmar endereço'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submit com endereço válido chama onSubmit com valor trimado', () => {
    const onSubmit = jest.fn()
    render(<AddressForm onSubmit={onSubmit} isSubmitting={false} />)
    fireEvent.change(document.getElementById('address-input')!, {
      target: { value: '  Av. Paulista, 1000  ' },
    })
    fireEvent.click(screen.getByText('Confirmar endereço'))
    expect(onSubmit).toHaveBeenCalledWith('Av. Paulista, 1000')
  })

  it('botão fica disabled quando isSubmitting=true', () => {
    render(<AddressForm onSubmit={jest.fn()} isSubmitting={true} />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('placeholder do textarea é correto', () => {
    render(<AddressForm onSubmit={jest.fn()} isSubmitting={false} />)
    const textarea = document.getElementById('address-input') as HTMLTextAreaElement
    expect(textarea.placeholder).toBe('Ex: Av. Paulista, 1000, São Paulo – SP')
  })
})
