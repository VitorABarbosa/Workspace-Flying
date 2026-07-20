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

  it('propostas citadas mostram links de download PDF e DOCX', () => {
    render(
      <ChatPainel
        mensagens={[{ role: 'assistant', content: 'Encontrei a proposta da Avita.' }]}
        quickReplies={[]}
        onEnviar={jest.fn()}
        carregando={false}
        propostasCitadas={[{ id: 7, cliente: 'Avita', referencia: 'FRANCISCO POLITO' }]}
      />
    )
    expect(screen.getByText(/Proposta #7 — Avita \(FRANCISCO POLITO\)/)).toBeInTheDocument()
    const linkPdf = screen.getByRole('link', { name: 'Baixar PDF da proposta 7' })
    const linkDocx = screen.getByRole('link', { name: 'Baixar DOCX da proposta 7' })
    expect(linkPdf).toHaveAttribute('href', '/api/tools/proposta/propostas/7/pdf')
    expect(linkDocx).toHaveAttribute('href', '/api/tools/proposta/propostas/7/docx')
  })

  it('lista vazia de propostas citadas não renderiza nada', () => {
    render(
      <ChatPainel
        mensagens={[{ role: 'assistant', content: 'Oi' }]}
        quickReplies={[]}
        onEnviar={jest.fn()}
        carregando={false}
        propostasCitadas={[]}
      />
    )
    expect(screen.queryByText(/Proposta #/)).not.toBeInTheDocument()
  })
})
