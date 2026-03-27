import { render, screen, fireEvent } from '@testing-library/react'
import { AddressForm } from '@/components/agents/pesquisador/AddressForm'

describe('AddressForm', () => {
  it('renderiza heading "Endereco necessario"', () => {
    render(<AddressForm onSubmit={jest.fn()} isSubmitting={false} />)
    expect(screen.getByText('Endereco necessario')).toBeInTheDocument()
  })

  it('renderiza textarea com id="address-input" e label associado', () => {
    render(<AddressForm onSubmit={jest.fn()} isSubmitting={false} />)
    const textarea = document.getElementById('address-input')
    expect(textarea).toBeInTheDocument()
    expect(textarea?.tagName).toBe('TEXTAREA')
    const label = document.querySelector('label[for="address-input"]')
    expect(label).toBeInTheDocument()
  })

  it('submit com campo vazio exibe erro de validacao', () => {
    render(<AddressForm onSubmit={jest.fn()} isSubmitting={false} />)
    fireEvent.change(document.getElementById('address-input')!, {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByText('Continuar analise'))
    expect(screen.getByText('Insira o endereco antes de continuar.')).toBeInTheDocument()
  })

  it('submit com campo vazio nao chama onSubmit', () => {
    const onSubmit = jest.fn()
    render(<AddressForm onSubmit={onSubmit} isSubmitting={false} />)
    fireEvent.change(document.getElementById('address-input')!, {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByText('Continuar analise'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submit com endereco valido chama onSubmit com valor trimado', () => {
    const onSubmit = jest.fn()
    render(<AddressForm onSubmit={onSubmit} isSubmitting={false} />)
    fireEvent.change(document.getElementById('address-input')!, {
      target: { value: '  Av. Paulista, 1000  ' },
    })
    fireEvent.click(screen.getByText('Continuar analise'))
    expect(onSubmit).toHaveBeenCalledWith('Av. Paulista, 1000')
  })

  it('botao fica disabled quando isSubmitting=true', () => {
    render(<AddressForm onSubmit={jest.fn()} isSubmitting={true} />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('placeholder do textarea e o recomendado pelo backend', () => {
    render(<AddressForm onSubmit={jest.fn()} isSubmitting={false} />)
    const textarea = document.getElementById('address-input') as HTMLTextAreaElement
    expect(textarea.placeholder).toBe('Av. Antonio Gil Veloso, 780 - Praia da Costa, Vila Velha - ES')
  })

  it('renderiza o prompt vindo do backend quando informado', () => {
    render(
      <AddressForm
        onSubmit={jest.fn()}
        isSubmitting={false}
        prompt="Informe o endereco completo do empreendimento para prosseguir."
      />
    )
    expect(
      screen.getByText('Informe o endereco completo do empreendimento para prosseguir.')
    ).toBeInTheDocument()
  })

  it('textarea e obrigatorio', () => {
    render(<AddressForm onSubmit={jest.fn()} isSubmitting={false} />)
    const textarea = document.getElementById('address-input') as HTMLTextAreaElement
    expect(textarea).toBeRequired()
  })
})
