/**
 * O que a tela mostra enquanto cada ação roda. A reclamação era "não aparece
 * se está carregando": botão desabilitado com opacidade baixa não conta como
 * aparecer. Cada estado precisa de texto dizendo o que está acontecendo.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { Carregando, MENSAGEM_DA_ACAO } from '../Carregando'
import { ChatPainel } from '../ChatPainel'
import { EntradaPainel } from '../EntradaPainel'
import { GuiaPassos } from '../GuiaPassos'
import { HistoricoPainel } from '../HistoricoPainel'
import { PreviewPainel } from '../PreviewPainel'
import type { Levantamento } from '../types'

const LEV: Levantamento = {
  estrutura: {
    cliente: { empresa: 'GALLI', ref: 'Aurora', contato: 'Daniel' },
    externas: ['Fachada'],
    desconto_pct: 0,
    desconto_label: null,
    estrategia: 'auto',
    mostrar_precos_individuais: false,
    _avisos: [],
  },
  fechado: {
    orcamento: {
      estrategia: 'planilha', subtotal: 3000, total_imagens: 1,
      _categorias: [{ nome: 'externas', rotulo: 'Ilustrações Externas' }],
      externas: { nome: 'externas', qtd: 1, total: 3000,
                  itens: [{ descricao: 'Perspectiva Fachada', preco: 3000, fonte: 'planilha:fachada' }] },
    },
    financeiro: { subtotal: 3000, desconto_pct: 0, desconto_valor: 0, total: 3000, rotulo: '' },
  },
  estrategia_usada: 'planilha',
  avisos: [],
  pendencias: [],
}

describe('Carregando', () => {
  it('não renderiza nada sem ação', () => {
    const { container } = render(<Carregando acao={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('cada ação tem uma frase própria, anunciada como status', () => {
    for (const [acao, frase] of Object.entries(MENSAGEM_DA_ACAO)) {
      const { unmount } = render(<Carregando acao={acao as keyof typeof MENSAGEM_DA_ACAO} />)
      expect(screen.getByRole('status')).toHaveTextContent(frase)
      unmount()
    }
  })
})

describe('ChatPainel — espera', () => {
  const base = { mensagens: [], quickReplies: [], onEnviar: jest.fn() }

  it('mostra as dicas de uso até a pessoa mandar a primeira mensagem', () => {
    const { rerender } = render(<ChatPainel {...base} carregando={false} />)
    expect(screen.getByText('Como usar o chat')).toBeInTheDocument()
    expect(screen.getByText(/Anexe um print/)).toBeInTheDocument()

    rerender(
      <ChatPainel {...base} carregando={false}
                  mensagens={[{ role: 'assistant', content: 'Oi!' }, { role: 'user', content: 'GALLI' }]} />
    )
    expect(screen.queryByText('Como usar o chat')).not.toBeInTheDocument()
  })

  it('na saudação inicial, diz que está iniciando em vez de mostrar caixa vazia', () => {
    render(<ChatPainel {...base} carregando acao="saudacao" />)
    expect(screen.getByRole('status')).toHaveTextContent('Iniciando o chat…')
  })

  it('depois de mandar mensagem, aparece uma bolha "pensando" no lugar da resposta', () => {
    render(
      <ChatPainel {...base} carregando acao="conversar"
                  mensagens={[{ role: 'user', content: 'proposta para GALLI' }]} />
    )
    expect(screen.getByRole('status')).toHaveTextContent(/Pensando/)
    expect(screen.getByPlaceholderText('Aguarde a resposta…')).toBeDisabled()
  })

  it('se a mensagem levou print, a bolha diz que está lendo o print', () => {
    render(
      <ChatPainel {...base} carregando acao="conversar"
                  mensagens={[{ role: 'user', content: [
                    { type: 'image_url', image_url: { url: 'data:image/png;base64,eA==' } }] }]} />
    )
    expect(screen.getByRole('status')).toHaveTextContent(/Lendo o print/)
  })

  it('carregando por outra ação (gerar) não põe bolha no chat', () => {
    render(<ChatPainel {...base} carregando acao="gerar" />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})

describe('EntradaPainel — instruções e espera', () => {
  it('traz instrução, exemplo por empresa e botão para usar o exemplo', () => {
    const onPrecificar = jest.fn()
    render(<EntradaPainel onPrecificar={onPrecificar} carregando={false} />)
    expect(screen.getByText(/Cole o pedido inteiro de uma vez/)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Empresa'), { target: { value: 'rinno' } })
    expect(screen.getByText(/Ver exemplo de pedido para Rinno Films/)).toBeInTheDocument()

    fireEvent.click(screen.getByText('Usar este exemplo'))
    fireEvent.click(screen.getByText('Precificar'))
    expect(onPrecificar).toHaveBeenCalledWith(expect.stringContaining('Filme conceito'), 'rinno')
  })

  it('enquanto precifica, o botão e a frase dizem isso', () => {
    render(<EntradaPainel onPrecificar={jest.fn()} carregando acao="levantar" />)
    expect(screen.getByText('Precificando…')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/interpretando o texto/)
  })
})

describe('PreviewPainel — espera e ajuda', () => {
  it('explica o que a estratégia escolhida faz', () => {
    render(<PreviewPainel levantamento={LEV} onEditar={jest.fn()} carregando={false} />)
    expect(screen.getByText(/Usa o histórico do cliente se ele já tiver proposta/)).toBeInTheDocument()
    expect(screen.getByText('Preview da proposta')).toBeInTheDocument()
  })

  it('ao reprecificar mostra a faixa de status, não só opacidade', () => {
    render(<PreviewPainel levantamento={LEV} onEditar={jest.fn()} carregando acao="reprecificar" />)
    expect(screen.getByRole('status')).toHaveTextContent('Reprecificando com a alteração…')
  })

  it('pendências ganham título dizendo que impedem de gerar', () => {
    const comPendencia = { ...LEV, pendencias: ['Informe o A/C — responsável que recebe a proposta.'] }
    render(<PreviewPainel levantamento={comPendencia} onEditar={jest.fn()} carregando={false} />)
    expect(screen.getByText('Falta para gerar:')).toBeInTheDocument()
  })
})

describe('HistoricoPainel — espera', () => {
  const LISTA = [
    { id: 7, cliente: 'GALLI', referencia: 'Aurora', data: '2026-07-19',
      total: 5085, docx_url: null, download: '/propostas/7/docx', pdf: '/propostas/7/pdf' },
  ]

  it('mostra que está buscando mesmo com a lista cheia', () => {
    render(<HistoricoPainel propostas={LISTA} onExcluir={jest.fn()} onFiltrar={jest.fn()}
                            carregando acao="listar" />)
    expect(screen.getByRole('status')).toHaveTextContent('Buscando as propostas…')
    expect(screen.getByText('GALLI')).toBeInTheDocument()
  })

  it('lista vazia sem carregar explica de onde as propostas vêm', () => {
    render(<HistoricoPainel propostas={[]} onExcluir={jest.fn()} onFiltrar={jest.fn()} carregando={false} />)
    expect(screen.getByText(/Nenhuma proposta encontrada/)).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('Enter no filtro filtra', () => {
    const onFiltrar = jest.fn()
    render(<HistoricoPainel propostas={[]} onExcluir={jest.fn()} onFiltrar={onFiltrar} carregando={false} />)
    const campo = screen.getByLabelText('Filtrar por cliente')
    fireEvent.change(campo, { target: { value: 'GALLI' } })
    fireEvent.keyDown(campo, { key: 'Enter' })
    expect(onFiltrar).toHaveBeenCalledWith('GALLI')
  })
})

describe('GuiaPassos', () => {
  it('destaca o passo atual e marca os anteriores como feitos', () => {
    render(<GuiaPassos atual={2} />)
    const passos = screen.getAllByRole('listitem')
    expect(passos).toHaveLength(3)
    expect(passos[1]).toHaveAttribute('aria-current', 'step')
    expect(passos[0]).not.toHaveAttribute('aria-current')
    expect(screen.getByLabelText('concluído')).toBeInTheDocument()  // só o passo 1
    expect(screen.getByText('Revise o preview')).toBeInTheDocument()
  })
})
