import { act, render, screen, waitFor } from '@testing-library/react'
import { PropostaAgent } from '../PropostaAgent'
import type { Levantamento } from '../types'

const LEVANTAMENTO: Levantamento = {
  estrutura: {
    cliente: { empresa: 'GALLI', ref: 'Aurora', contato: 'Daniel' },
    externas: ['Fachada'],
    internas: [],
    plantas: [],
    desconto_pct: 0,
    desconto_label: null,
    estrategia: 'planilha',
    mostrar_precos_individuais: false,
    _avisos: [],
  },
  fechado: {
    orcamento: {
      estrategia: 'planilha',
      subtotal: 3000,
      total_imagens: 1,
      externas: {
        nome: 'externas', qtd: 1, total: 3000,
        itens: [{ descricao: 'Perspectiva Fachada', preco: 3000, fonte: 'planilha:fachada' }],
      },
      internas: { nome: 'internas', qtd: 0, total: 0, itens: [] },
      plantas: { nome: 'plantas', qtd: 0, total: 0, itens: [] },
    },
    financeiro: { subtotal: 3000, desconto_pct: 0, desconto_valor: 0, total: 3000, rotulo: '' },
  },
  estrategia_usada: 'planilha',
  avisos: [],
  pendencias: [],
}

function mockFetchImpl() {
  let saudacoes = 0
  return jest.fn((url: string, opts?: { body?: string }) => {
    if (url.endsWith('/chat')) {
      const body = opts?.body ? JSON.parse(opts.body) : { mensagens: [] }
      if (body.mensagens.length === 0) {
        saudacoes += 1
        return Promise.resolve({
          ok: true,
          json: async () => ({
            mensagem: `Saudação inicial #${saudacoes}`,
            quick_replies: ['Cliente novo'],
            levantamento: null,
          }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          mensagem: 'Perfeito, revise abaixo.',
          quick_replies: [],
          levantamento: LEVANTAMENTO,
        }),
      })
    }
    if (url.endsWith('/propostas')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          proposta_id: 42,
          docx_url: null,
          download: '/propostas/42/docx',
          fechado: LEVANTAMENTO.fechado,
          avisos: [],
        }),
      })
    }
    return Promise.reject(new Error(`URL inesperada: ${url}`))
  })
}

describe('PropostaAgent — Nova proposta reseta o chat', () => {
  beforeEach(() => {
    global.fetch = mockFetchImpl() as unknown as typeof fetch
  })

  it('limpa mensagens antigas e busca nova saudação ao clicar em Nova proposta', async () => {
    render(<PropostaAgent />)

    // Saudação inicial chega do backend.
    await waitFor(() => {
      expect(screen.getByText('Saudação inicial #1')).toBeInTheDocument()
    })

    // Usuário conversa, chega um levantamento pronto para gerar.
    await act(async () => {
      screen.getByText('Cliente novo').click()
    })
    await waitFor(() => {
      expect(screen.getByText('Perfeito, revise abaixo.')).toBeInTheDocument()
    })

    // Gera a proposta.
    const botaoGerar = await screen.findByRole('button', { name: /Gerar proposta/ })
    await act(async () => {
      botaoGerar.click()
    })
    await waitFor(() => {
      expect(screen.getByText(/Proposta #42 gerada/)).toBeInTheDocument()
    })

    // Clica em "Nova proposta": formulário reseta e chat deve começar do zero.
    const botaoNova = screen.getByText(/Nova proposta/)
    await act(async () => {
      botaoNova.click()
    })

    // Nova saudação chega (segunda chamada ao /chat com mensagens vazias).
    await waitFor(() => {
      expect(screen.getByText('Saudação inicial #2')).toBeInTheDocument()
    })

    // Mensagens antigas da conversa anterior não devem mais aparecer: só a nova
    // saudação está no histórico do chat (sem a resposta que veio do levantamento
    // e sem o resultado gerado anteriormente).
    expect(screen.queryByText('Perfeito, revise abaixo.')).not.toBeInTheDocument()
    expect(screen.queryByText(/Proposta #42 gerada/)).not.toBeInTheDocument()
    expect(screen.getAllByText(/Saudação inicial #\d/)).toHaveLength(1)
  })
})
