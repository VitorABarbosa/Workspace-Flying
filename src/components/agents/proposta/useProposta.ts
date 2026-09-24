'use client'

import { useCallback, useState } from 'react'
import type {
  Estrutura,
  Levantamento,
  MensagemChat,
  PropostaGerada,
  PropostaListada,
  RespostaChat,
} from './types'

const BASE = '/api/tools/proposta'

/**
 * Qual ação está em curso. `carregando` sozinho só serve para desabilitar
 * botão; é a ação que deixa a tela dizer "lendo o print", "gerando o .docx",
 * em vez de um genérico "carregando" — ou pior, nada.
 */
export type AcaoProposta =
  | 'saudacao'
  | 'conversar'
  | 'levantar'
  | 'reprecificar'
  | 'gerar'
  | 'listar'
  | 'excluir'

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const resp = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!resp.ok) throw new Error(await mensagemDeErro(resp))
  return resp.json() as Promise<T>
}

/**
 * O que mostrar quando a chamada falha.
 *
 * A API manda o motivo em `detail` ("O banco está atrás do código...") e antes
 * a tela jogava o JSON cru na cara da pessoa — ou, pior, quando o erro não
 * tinha corpo, só "Erro 500: Internal Server Error", que não diz nada a
 * ninguém. Aqui sai a frase da API; sem ela, uma frase nossa por faixa de
 * status.
 */
async function mensagemDeErro(resp: Response): Promise<string> {
  const cru = await resp.text().catch(() => '')
  try {
    const corpo = JSON.parse(cru)
    const detalhe = corpo?.detail ?? corpo?.error
    if (typeof detalhe === 'string' && detalhe.trim()) return detalhe.slice(0, 300)
  } catch {
    // corpo não-JSON (HTML de gateway, texto solto): cai no genérico abaixo
  }
  if (resp.status === 401 || resp.status === 403) {
    return 'Sem permissão para usar a ferramenta de propostas. Fale com o admin.'
  }
  if (resp.status === 503) {
    return 'O serviço de propostas está indisponível agora. Tente de novo em alguns minutos.'
  }
  if (resp.status >= 500) {
    return `O serviço de propostas falhou (erro ${resp.status}). Se continuar, ` +
           'abra /api/tools/proposta/saude para ver o que está fora.'
  }
  return cru.trim() ? `Erro ${resp.status}: ${cru.slice(0, 300)}` : `Erro ${resp.status}`
}

export function useProposta() {
  const [acao, setAcao] = useState<AcaoProposta | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [levantamento, setLevantamento] = useState<Levantamento | null>(null)
  const [gerada, setGerada] = useState<PropostaGerada | null>(null)
  const [historico, setHistorico] = useState<PropostaListada[] | null>(null)
  const [chat, setChat] = useState<{ mensagens: MensagemChat[]; resposta: RespostaChat } | null>(null)

  const executar = useCallback(async (qual: AcaoProposta, fn: () => Promise<void>) => {
    setAcao(qual)
    setErro(null)
    try {
      await fn()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado')
    } finally {
      setAcao(null)
    }
  }, [])

  const reprecificar = useCallback(
    (estrutura: Estrutura) =>
      executar('reprecificar', async () => {
        setLevantamento(await postJson<Levantamento>('/levantamento', { estrutura }))
      }),
    [executar]
  )

  const gerar = useCallback(
    (estrutura: Estrutura) =>
      executar('gerar', async () => {
        setGerada(await postJson<PropostaGerada>('/propostas', { estrutura }))
      }),
    [executar]
  )

  const listarHistorico = useCallback(
    (cliente?: string) =>
      executar('listar', async () => {
        const q = cliente ? `?cliente=${encodeURIComponent(cliente)}` : ''
        const resp = await fetch(`${BASE}/propostas${q}`)
        if (!resp.ok) throw new Error(`Erro ${resp.status}`)
        setHistorico((await resp.json()).propostas)
      }),
    [executar]
  )

  const excluirProposta = useCallback(
    (id: number) =>
      executar('excluir', async () => {
        const resp = await fetch(`${BASE}/propostas/${id}`, { method: 'DELETE' })
        if (!resp.ok) throw new Error(`Erro ${resp.status}`)
        setHistorico((h) => (h ?? []).filter((p) => p.id !== id))
      }),
    [executar]
  )

  const conversar = useCallback(
    (mensagens: MensagemChat[]) =>
      // Sem mensagem é o pedido da saudação inicial: a tela mostra outra coisa.
      executar(mensagens.length ? 'conversar' : 'saudacao', async () => {
        const resp = await postJson<RespostaChat>('/chat', { mensagens })
        setChat({ mensagens, resposta: resp })
        if (resp.levantamento) setLevantamento(resp.levantamento)
      }),
    [executar]
  )

  // Reabrir uma proposta gerada: a estrutura volta como foi feita e cai no
  // preview, de onde dá para mexer e gerar de novo.
  const editar = useCallback(
    (id: number) =>
      executar('levantar', async () => {
        const resp = await fetch(`${BASE}/propostas/${id}/estrutura`)
        if (!resp.ok) throw new Error(await mensagemDeErro(resp))
        const { estrutura } = (await resp.json()) as { estrutura: Estrutura }
        setGerada(null)
        setLevantamento(await postJson<Levantamento>('/levantamento', { estrutura }))
      }),
    [executar]
  )

  const reiniciar = useCallback(() => {
    setLevantamento(null)
    setGerada(null)
    setErro(null)
  }, [])

  const limparErro = useCallback(() => {
    setErro(null)
  }, [])

  return {
    carregando: acao !== null,
    acao,
    erro,
    levantamento,
    editar,
    gerada,
    historico,
    chat,
    reprecificar,
    gerar,
    reiniciar,
    listarHistorico,
    excluirProposta,
    conversar,
    limparErro,
  }
}
