import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ChatPainel } from '../ChatPainel'

const PNG = 'data:image/png;base64,iVBORw0KGgo='

function anexarArquivo(nome: string, tipo: string, tamanho = 1024) {
  const arquivo = new File(['x'], nome, { type: tipo })
  Object.defineProperty(arquivo, 'size', { value: tamanho })
  fireEvent.change(screen.getByTestId('input-print'), { target: { files: [arquivo] } })
}

describe('ChatPainel', () => {
  // jsdom não implementa canvas: sem isso cada anexo cospe um "Not implemented"
  // no log. O fallback de prepararPrint já cobre esse caso (o backend encolhe).
  beforeAll(() => {
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })
  afterAll(() => jest.restoreAllMocks())

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
    expect(onEnviar).toHaveBeenCalledWith('Cliente GALLI', [])
  })

  it('quick reply envia o texto do chip', () => {
    const onEnviar = jest.fn()
    render(<ChatPainel mensagens={[]} quickReplies={['Nova proposta']} onEnviar={onEnviar} carregando={false} />)
    fireEvent.click(screen.getByText('Nova proposta'))
    expect(onEnviar).toHaveBeenCalledWith('Nova proposta', [])
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

  it('mensagem com print mostra texto e imagem na bolha', () => {
    render(
      <ChatPainel
        mensagens={[
          {
            role: 'user',
            content: [
              { type: 'text', text: 'monta a proposta desse e-mail' },
              { type: 'image_url', image_url: { url: PNG } },
            ],
          },
        ]}
        quickReplies={[]}
        onEnviar={jest.fn()}
        carregando={false}
      />
    )
    expect(screen.getByText('monta a proposta desse e-mail')).toBeInTheDocument()
    expect(screen.getByAltText('Print anexado')).toHaveAttribute('src', PNG)
  })

  it('print anexado aparece como miniatura e vai junto no envio', async () => {
    const onEnviar = jest.fn()
    render(<ChatPainel mensagens={[]} quickReplies={[]} onEnviar={onEnviar} carregando={false} />)

    anexarArquivo('print.png', 'image/png')
    const miniatura = await screen.findByAltText('print.png')
    expect(miniatura).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/Escreva aqui/), {
      target: { value: 'monta a proposta' },
    })
    fireEvent.click(screen.getByLabelText('Enviar mensagem'))

    expect(onEnviar).toHaveBeenCalledWith('monta a proposta', [
      expect.objectContaining({ nome: 'print.png' }),
    ])
    // Anexo some depois de enviar — não vai de novo na próxima mensagem.
    await waitFor(() => expect(screen.queryByAltText('print.png')).not.toBeInTheDocument())
  })

  it('print sozinho já pode ser enviado, sem texto junto', async () => {
    const onEnviar = jest.fn()
    render(<ChatPainel mensagens={[]} quickReplies={[]} onEnviar={onEnviar} carregando={false} />)
    expect(screen.getByLabelText('Enviar mensagem')).toBeDisabled()

    anexarArquivo('print.png', 'image/png')
    await waitFor(() => expect(screen.getByLabelText('Enviar mensagem')).toBeEnabled())
    fireEvent.click(screen.getByLabelText('Enviar mensagem'))
    expect(onEnviar).toHaveBeenCalledWith('', [expect.objectContaining({ nome: 'print.png' })])
  })

  it('dá para remover o print antes de enviar', async () => {
    render(<ChatPainel mensagens={[]} quickReplies={[]} onEnviar={jest.fn()} carregando={false} />)
    anexarArquivo('print.png', 'image/png')
    await screen.findByAltText('print.png')
    fireEvent.click(screen.getByLabelText('Remover print print.png'))
    expect(screen.queryByAltText('print.png')).not.toBeInTheDocument()
  })

  it('anexo inválido vira aviso, não erro de tela', async () => {
    render(<ChatPainel mensagens={[]} quickReplies={[]} onEnviar={jest.fn()} carregando={false} />)
    anexarArquivo('contrato.pdf', 'application/pdf')
    expect(await screen.findByRole('alert')).toHaveTextContent(/não é uma imagem/)
    expect(screen.queryByAltText('contrato.pdf')).not.toBeInTheDocument()
  })

  it('print acima do limite nem chega a subir', async () => {
    render(<ChatPainel mensagens={[]} quickReplies={[]} onEnviar={jest.fn()} carregando={false} />)
    anexarArquivo('foto.jpg', 'image/jpeg', 6 * 1024 * 1024)
    expect(await screen.findByRole('alert')).toHaveTextContent(/5 MB/)
  })
})
