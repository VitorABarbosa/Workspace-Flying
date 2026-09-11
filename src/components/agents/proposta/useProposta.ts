'use client'

import { useCallback, useState } from 'react'
import type { Emissor } from './empresas'
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
  if (!resp.ok) {
    const detalhe = await resp.text()
    throw new Error(`Erro ${resp.status}: ${detalhe.slice(0, 300)}`)
  }
  return resp.json() as Promise<T>
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

  // No texto direto a empresa vai no corpo: o texto livre não diz de qual
  // das três é a proposta, e sem isso o backend assume Flying.
  const levantarPorTexto = useCallback(
    (texto: string, emissor?: Emissor) =>
      executar('levantar', async () => {
        setLevantamento(await postJson<Levantamento>('/levantamento', { texto, emissor }))
      }),
    [executar]
  )

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
    gerada,
    historico,
    chat,
    levantarPorTexto,
    reprecificar,
    gerar,
    reiniciar,
    listarHistorico,
    excluirProposta,
    conversar,
    limparErro,
  }
}
