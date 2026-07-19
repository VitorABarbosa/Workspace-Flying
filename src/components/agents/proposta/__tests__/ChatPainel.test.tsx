import { fireEvent, render, screen } from '@testing-library/react'
import { ChatPainel } from '../ChatPainel'

describe('ChatPainel', () => {
  it('mostra bolhas e envia com Enter', () => {
    const onEnviar = jest.fn()
    render(<ChatPainel
      mensagens={[{ role: 'assistant', content: 'Oi, tudo bem? O que vamos fazer hoje?' }]}
      quickReplies={['Nova proposta']}
      onEnviar={onEnviar}
      carregando={false}
    />)
    expect(screen.getByText(/Oi, tudo bem\?/)).toBeInTheDocument()
    const input = screen.getByPlaceholderText(/Escreva aqui/)
    fireEvent.change(input, { target: { value: 'Cliente GALLI' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onEnviar).toHaveBeenCalledWith('Cliente GALLI')
  })

  it('quick reply envia o texto do chip', () => {
    const onEnviar = jest.fn()
    render(<ChatPainel mensagens={[]} quickReplies={['Nova proposta']} onEnviar={onEnviar} carregando={false} />)
    fireEvent.click(screen.getByText('Nova proposta'))
    expect(onEnviar).toHaveBeenCalledWith('Nova proposta')
  })
})
