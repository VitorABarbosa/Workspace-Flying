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
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [levantamento, setLevantamento] = useState<Levantamento | null>(null)
  const [gerada, setGerada] = useState<PropostaGerada | null>(null)
  const [historico, setHistorico] = useState<PropostaListada[] | null>(null)
  const [chat, setChat] = useState<{ mensagens: MensagemChat[]; resposta: RespostaChat } | null>(null)

  const executar = useCallback(async (fn: () => Promise<void>) => {
    setCarregando(true)
    setErro(null)
    try {
      await fn()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado')
    } finally {
      setCarregando(false)
    }
  }, [])

  const levantarPorTexto = useCallback(
    (texto: string) =>
      executar(async () => {
        setLevantamento(await postJson<Levantamento>('/levantamento', { texto }))
      }),
    [executar]
  )

  const reprecificar = useCallback(
    (estrutura: Estrutura) =>
      executar(async () => {
        setLevantamento(await postJson<Levantamento>('/levantamento', { estrutura }))
      }),
    [executar]
  )

  const gerar = useCallback(
    (estrutura: Estrutura) =>
      executar(async () => {
        setGerada(await postJson<PropostaGerada>('/propostas', { estrutura }))
      }),
    [executar]
  )

  const listarHistorico = useCallback(
    (cliente?: string) =>
      executar(async () => {
        const q = cliente ? `?cliente=${encodeURIComponent(cliente)}` : ''
        const resp = await fetch(`${BASE}/propostas${q}`)
        if (!resp.ok) throw new Error(`Erro ${resp.status}`)
        setHistorico((await resp.json()).propostas)
      }),
    [executar]
  )

  const excluirProposta = useCallback(
    (id: number) =>
      executar(async () => {
        const resp = await fetch(`${BASE}/propostas/${id}`, { method: 'DELETE' })
        if (!resp.ok) throw new Error(`Erro ${resp.status}`)
        setHistorico((h) => (h ?? []).filter((p) => p.id !== id))
      }),
    [executar]
  )

  const conversar = useCallback(
    (mensagens: MensagemChat[]) =>
      executar(async () => {
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

  return {
    carregando,
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
  }
}
