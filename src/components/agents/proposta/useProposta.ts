'use client'

import { useCallback, useState } from 'react'
import type { Estrutura, Levantamento, PropostaGerada } from './types'

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

  const reiniciar = useCallback(() => {
    setLevantamento(null)
    setGerada(null)
    setErro(null)
  }, [])

  return { carregando, erro, levantamento, gerada, levantarPorTexto, reprecificar, gerar, reiniciar }
}
