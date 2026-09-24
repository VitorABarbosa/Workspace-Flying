'use client'

import { useCallback, useState } from 'react'
import type { Emissor } from './empresas'
import type { Roll, RollGerado, RollListado } from './types'

const BASE = '/api/tools/proposta'

export type AcaoRoll = 'lendo' | 'gerando' | 'listando' | 'abrindo' | 'excluindo'

async function mensagemDeErro(resp: Response): Promise<string> {
  const cru = await resp.text().catch(() => '')
  try {
    const corpo = JSON.parse(cru)
    const detalhe = corpo?.detail ?? corpo?.error
    if (typeof detalhe === 'string' && detalhe.trim()) return detalhe.slice(0, 300)
  } catch {
    // corpo não-JSON: cai no genérico
  }
  return cru.trim() ? `Erro ${resp.status}: ${cru.slice(0, 300)}` : `Erro ${resp.status}`
}

async function chamar<T>(caminho: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${BASE}${caminho}`, init)
  if (!resp.ok) throw new Error(await mensagemDeErro(resp))
  return resp.json() as Promise<T>
}

const json = (corpo: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(corpo),
})

/**
 * O ciclo do roll: ler o que chegou, mexer, gerar a versão nova.
 *
 * Fica separado do `useProposta` de propósito — roll e proposta são dois
 * documentos diferentes, com vidas diferentes. A proposta é o que foi
 * vendido; o roll é o que vai ser feito, e ele muda depois de vendido.
 */
export function useRoll() {
  const [acao, setAcao] = useState<AcaoRoll | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [roll, setRoll] = useState<Roll | null>(null)
  const [gerado, setGerado] = useState<RollGerado | null>(null)
  const [lista, setLista] = useState<RollListado[] | null>(null)

  const executar = useCallback(async (qual: AcaoRoll, fn: () => Promise<void>) => {
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

  /** PDF, print ou lista colada → seções e itens, prontos para conferir. */
  const ler = useCallback(
    (entrada: { texto?: string; pdfs?: string[]; imagens?: string[] }) =>
      executar('lendo', async () => {
        const { roll } = await chamar<{ roll: Roll }>('/rolls/leitura', json({
          texto: entrada.texto ?? '',
          pdfs: entrada.pdfs ?? [],
          imagens: entrada.imagens ?? [],
        }))
        setGerado(null)
        setRoll(roll)
      }),
    [executar]
  )

  const gerar = useCallback(
    (atual: Roll, emissor?: Emissor) =>
      executar('gerando', async () => {
        setGerado(await chamar<RollGerado>('/rolls', json({ roll: atual, emissor })))
      }),
    [executar]
  )

  const listar = useCallback(
    (cliente?: string) =>
      executar('listando', async () => {
        const q = cliente ? `?cliente=${encodeURIComponent(cliente)}` : ''
        setLista((await chamar<{ rolls: RollListado[] }>(`/rolls${q}`)).rolls)
      }),
    [executar]
  )

  /** Reabre um roll já gerado para mexer e gerar a versão seguinte. */
  const abrir = useCallback(
    (id: number) =>
      executar('abrindo', async () => {
        const guardado = await chamar<{ estrutura: Roll }>(`/rolls/${id}`)
        setGerado(null)
        setRoll(guardado.estrutura)
      }),
    [executar]
  )

  const excluir = useCallback(
    (id: number) =>
      executar('excluindo', async () => {
        await chamar(`/rolls/${id}`, { method: 'DELETE' })
        setLista((l) => (l ?? []).filter((r) => r.id !== id))
      }),
    [executar]
  )

  const reiniciar = useCallback(() => {
    setRoll(null)
    setGerado(null)
    setErro(null)
  }, [])

  return {
    carregando: acao !== null,
    acao, erro, roll, gerado, lista,
    ler, gerar, listar, abrir, excluir, reiniciar,
    editar: setRoll,
    limparErro: () => setErro(null),
  }
}
