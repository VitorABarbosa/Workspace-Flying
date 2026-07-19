'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { CategoriaKey, Estrutura, Levantamento } from './types'

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const ROTULOS: Record<CategoriaKey, string> = {
  externas: 'Ilustrações Externas',
  internas: 'Ilustrações Internas',
  plantas: 'Plantas Humanizadas',
}

interface Props {
  levantamento: Levantamento
  onEditar: (estrutura: Estrutura) => void
  carregando: boolean
}

export function PreviewPainel({ levantamento, onEditar, carregando }: Props) {
  const { estrutura, fechado, estrategia_usada, avisos, pendencias } = levantamento
  const [novoItem, setNovoItem] = useState<Record<CategoriaKey, string>>({
    externas: '', internas: '', plantas: '',
  })
  // Rascunho local dos campos do cliente; commit no blur/Enter para não
  // reprecificar a cada tecla. Ressincroniza quando o backend responde.
  const [cliente, setCliente] = useState(estrutura.cliente)
  useEffect(() => {
    setCliente(estrutura.cliente)
  }, [estrutura.cliente])

  const commitCliente = () => {
    if (
      cliente.empresa !== estrutura.cliente.empresa ||
      cliente.ref !== estrutura.cliente.ref ||
      cliente.contato !== estrutura.cliente.contato
    ) {
      onEditar({ ...estrutura, cliente })
    }
  }

  const CAMPOS_CLIENTE = [
    { chave: 'empresa', rotulo: 'Cliente', placeholder: 'construtora/incorporadora' },
    { chave: 'ref', rotulo: 'Empreendimento', placeholder: 'nome do projeto' },
    { chave: 'contato', rotulo: 'A/C', placeholder: 'quem recebe a proposta' },
  ] as const

  const remover = (cat: CategoriaKey, idx: number) =>
    onEditar({ ...estrutura, [cat]: estrutura[cat].filter((_, i) => i !== idx) })

  const adicionar = (cat: CategoriaKey) => {
    const desc = novoItem[cat].trim()
    if (!desc) return
    setNovoItem((s) => ({ ...s, [cat]: '' }))
    onEditar({ ...estrutura, [cat]: [...estrutura[cat], desc] })
  }

  const mudarDesconto = (pct: number) =>
    onEditar({ ...estrutura, desconto_pct: Number.isFinite(pct) ? pct : 0 })

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-[#F1F1F1] p-6 dark:border-gray-700 dark:bg-[#1A1A1A]',
        carregando && 'pointer-events-none opacity-60'
      )}
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {CAMPOS_CLIENTE.map(({ chave, rotulo, placeholder }) => (
          <label key={chave} className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{rotulo}</span>
            <input
              aria-label={rotulo}
              value={cliente[chave]}
              placeholder={placeholder}
              onChange={(e) => setCliente((c) => ({ ...c, [chave]: e.target.value }))}
              onBlur={commitCliente}
              onKeyDown={(e) => e.key === 'Enter' && commitCliente()}
              className="mt-0.5 w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
            />
          </label>
        ))}
      </div>
      <p className="mb-3 text-xs text-gray-400">estratégia: {estrategia_usada}</p>

      {pendencias.length > 0 && (
        <ul className="mb-4 space-y-1 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950">
          {pendencias.map((p, i) => (
            <li key={i} className="text-xs font-medium text-amber-700 dark:text-amber-300">
              {p}
            </li>
          ))}
        </ul>
      )}

      {(Object.keys(ROTULOS) as CategoriaKey[]).map((cat) => {
        const bloco = fechado.orcamento[cat]
        return (
          <div key={cat} className="mb-4">
            <p className="mb-1 text-xs font-semibold uppercase text-brand-purple">
              {ROTULOS[cat]}
            </p>
            {bloco.itens.length === 0 && (
              <p className="text-xs text-gray-400">nenhum item</p>
            )}
            <ul>
              {bloco.itens.map((item, idx) => (
                <li
                  key={`${item.descricao}-${idx}`}
                  className="flex items-center justify-between border-b border-gray-200 py-1 text-sm dark:border-gray-700"
                >
                  <span className="text-[#1A1A2E] dark:text-white">{item.descricao}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-[#1A1A2E] dark:text-white">
                      {brl(item.preco)}
                    </span>
                    <button
                      aria-label={`Remover ${estrutura[cat][idx]}`}
                      onClick={() => remover(cat, idx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-1 flex gap-2">
              <input
                value={novoItem[cat]}
                onChange={(e) => setNovoItem((s) => ({ ...s, [cat]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && adicionar(cat)}
                placeholder="adicionar item…"
                className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
              />
              <button
                aria-label={`Adicionar em ${ROTULOS[cat]}`}
                onClick={() => adicionar(cat)}
                className="text-brand-purple hover:opacity-70"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      })}

      <div className="mt-4 border-t border-gray-300 pt-3 text-sm dark:border-gray-600">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Subtotal ({fechado.orcamento.total_imagens} imagens)</span>
          <span>{brl(fechado.financeiro.subtotal)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-2">
            Desconto
            <input
              type="number"
              min={0}
              max={100}
              value={estrutura.desconto_pct}
              onChange={(e) => mudarDesconto(parseFloat(e.target.value))}
              className="w-16 rounded border border-gray-200 bg-white px-1 py-0.5 text-xs dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
            />
            %
          </span>
          <span>-{brl(fechado.financeiro.desconto_valor)}</span>
        </div>
        <div className="mt-2 flex justify-between text-base font-bold text-[#1A1A2E] dark:text-white">
          <span>Investimento</span>
          <span className="text-brand-purple">{brl(fechado.financeiro.total)}</span>
        </div>
      </div>

      {avisos.length > 0 && (
        <ul className="mt-3 space-y-1">
          {avisos.map((a, i) => (
            <li key={i} className="text-xs text-amber-600 dark:text-amber-400">
              {a}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
