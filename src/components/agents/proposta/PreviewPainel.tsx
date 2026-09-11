'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Carregando } from './Carregando'
import type { AcaoProposta } from './useProposta'
import {
  EMPRESAS,
  type Emissor,
  empresaDe,
  tabelaPadraoDe,
  tabelaValidaPara,
} from './empresas'
import type { CategoriaMeta, CategoriaOrcada, Estrutura, Fechado, Levantamento } from './types'

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Fallback para respostas antigas do backend sem "_categorias" (as 3 categorias fixas
// de sempre). Assim que o backend emitir "_categorias" (dinâmico, ordenado), é essa
// lista que passa a mandar — inclusive com categorias novas (ex: "filmes").
const CATEGORIAS_FALLBACK: CategoriaMeta[] = [
  { nome: 'externas', rotulo: 'Ilustrações Externas' },
  { nome: 'internas', rotulo: 'Ilustrações Internas' },
  { nome: 'plantas', rotulo: 'Plantas Humanizadas' },
]

const categoriasDe = (orcamento: Fechado['orcamento']): CategoriaMeta[] =>
  orcamento._categorias ?? CATEGORIAS_FALLBACK

const categoriaOrcadaDe = (orcamento: Fechado['orcamento'], nome: string): CategoriaOrcada =>
  (orcamento[nome] as CategoriaOrcada | undefined) ?? { nome, qtd: 0, total: 0, itens: [] }


interface Props {
  levantamento: Levantamento
  onEditar: (estrutura: Estrutura) => void
  carregando: boolean
  acao?: AcaoProposta | null
}

const AJUDA_ESTRATEGIA: Record<Estrutura['estrategia'], string> = {
  auto: 'Usa o histórico do cliente se ele já tiver proposta; senão, a tabela de preços.',
  planilha: 'Preço da tabela oficial da empresa, ignorando o histórico do cliente.',
  historico: 'Repete o preço médio que o cliente pagou no último projeto.',
}

export function PreviewPainel({ levantamento, onEditar, carregando, acao }: Props) {
  const { estrutura, fechado, estrategia_usada, avisos, pendencias } = levantamento
  const reprecificando = carregando && acao === 'reprecificar'
  const empresa = empresaDe(estrutura.emissor)
  const categorias = categoriasDe(fechado.orcamento)
  // Estado do rascunho "novo item" derivado dinamicamente por categoria; chaves ausentes
  // (categoria nova que ainda não foi digitada) caem no fallback '' na leitura.
  const [novoItem, setNovoItem] = useState<Record<string, string>>({})
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

  // Mesmo padrão de rascunho para desconto (% e rótulo): commit no blur/Enter
  // para evitar POSTs de reprecificação a cada tecla (podem resolver fora de ordem).
  const [descontoPct, setDescontoPct] = useState(String(estrutura.desconto_pct))
  useEffect(() => {
    setDescontoPct(String(estrutura.desconto_pct))
  }, [estrutura.desconto_pct])

  const commitDesconto = () => {
    const pct = parseFloat(descontoPct)
    const valor = Number.isFinite(pct) ? pct : 0
    if (valor !== estrutura.desconto_pct) {
      onEditar({ ...estrutura, desconto_pct: valor })
    }
  }

  const [descontoLabel, setDescontoLabel] = useState(estrutura.desconto_label ?? '')
  useEffect(() => {
    setDescontoLabel(estrutura.desconto_label ?? '')
  }, [estrutura.desconto_label])

  const commitDescontoLabel = () => {
    const valor = descontoLabel.trim()
    if (valor !== (estrutura.desconto_label ?? '')) {
      onEditar({ ...estrutura, desconto_label: valor || null })
    }
  }

  const ESTRATEGIAS = [
    { valor: 'auto', rotulo: 'Automática' },
    { valor: 'planilha', rotulo: 'Planilha' },
    { valor: 'historico', rotulo: 'Histórico do cliente' },
  ] as const

  const CAMPOS_CLIENTE = [
    { chave: 'empresa', rotulo: 'Cliente', placeholder: 'construtora/incorporadora' },
    { chave: 'ref', rotulo: 'Empreendimento', placeholder: 'nome do projeto' },
    { chave: 'contato', rotulo: 'A/C', placeholder: 'quem recebe a proposta' },
  ] as const

  const listaDe = (cat: string): string[] => (estrutura[cat] as string[] | undefined) ?? []

  const remover = (cat: string, idx: number) =>
    onEditar({ ...estrutura, [cat]: listaDe(cat).filter((_, i) => i !== idx) })

  const adicionar = (cat: string) => {
    const desc = (novoItem[cat] ?? '').trim()
    if (!desc) return
    setNovoItem((s) => ({ ...s, [cat]: '' }))
    onEditar({ ...estrutura, [cat]: [...listaDe(cat), desc] })
  }

  return (
    <div
      aria-busy={carregando}
      className={cn(
        'relative rounded-xl border border-gray-200 bg-[#F1F1F1] p-6 dark:border-gray-700 dark:bg-[#1A1A1A]',
        carregando && 'pointer-events-none'
      )}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A2E] dark:text-white">Preview da proposta</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tudo aqui é editável; cada mudança reprecifica na hora. Nada é gravado até você gerar.
          </p>
        </div>
        {reprecificando && <Carregando acao={acao} />}
      </div>
      <div className={cn('transition-opacity', carregando && 'opacity-60')}>
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
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          Estratégia
          <select
            aria-label="Estratégia"
            value={estrutura.estrategia}
            onChange={(e) =>
              onEditar({ ...estrutura, estrategia: e.target.value as Estrutura['estrategia'] })
            }
            className="rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
          >
            {ESTRATEGIAS.map(({ valor, rotulo }) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </label>
        <span className="text-gray-400" title={`Fonte dos preços desta rodada: ${estrategia_usada}`}>
          (usada: {estrategia_usada})
        </span>
        <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          Empresa
          <select
            aria-label="Empresa"
            value={empresa.chave}
            onChange={(e) => {
              // Trocar de empresa troca a tabela junto: tabela que não é da
              // empresa escolhida o backend recusa com 422.
              const emissor = e.target.value as Emissor
              onEditar({ ...estrutura, emissor, tabela_precos: tabelaPadraoDe(emissor) })
            }}
            className="rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
          >
            {EMPRESAS.map(({ chave, rotulo }) => (
              <option key={chave} value={chave}>{rotulo}</option>
            ))}
          </select>
        </label>
        {empresa.tabelas.length > 1 && (
          <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            Tabela
            <select
              aria-label="Tabela"
              value={tabelaValidaPara(empresa.chave, estrutura.tabela_precos)}
              onChange={(e) =>
                onEditar({
                  ...estrutura,
                  tabela_precos: e.target.value as Estrutura['tabela_precos'],
                })
              }
              className="rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
            >
              {empresa.tabelas.map(({ valor, rotulo }) => (
                <option key={valor} value={valor}>{rotulo}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      <p className="-mt-2 mb-3 text-[11px] text-gray-400 dark:text-gray-500">
        {AJUDA_ESTRATEGIA[estrutura.estrategia]}
      </p>

      {pendencias.length > 0 && (
        <ul className="mb-4 space-y-1 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950">
          <li className="text-xs font-semibold text-amber-800 dark:text-amber-200">
            Falta para gerar:
          </li>
          {pendencias.map((p, i) => (
            <li key={i} className="text-xs font-medium text-amber-700 dark:text-amber-300">
              {p}
            </li>
          ))}
        </ul>
      )}

      {categorias.map(({ nome: cat, rotulo }) => {
        const bloco = categoriaOrcadaDe(fechado.orcamento, cat)
        return (
          <div key={cat} className="mb-4">
            <p className="mb-1 text-xs font-semibold uppercase text-brand-purple">
              {rotulo}
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
                      aria-label={`Remover ${listaDe(cat)[idx]}`}
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
                value={novoItem[cat] ?? ''}
                onChange={(e) => setNovoItem((s) => ({ ...s, [cat]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && adicionar(cat)}
                placeholder={`adicionar em ${rotulo.toLowerCase()}… (Enter)`}
                className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
              />
              <button
                aria-label={`Adicionar em ${rotulo}`}
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
              aria-label="Desconto (%)"
              type="number"
              min={0}
              max={100}
              value={descontoPct}
              onChange={(e) => setDescontoPct(e.target.value)}
              onBlur={commitDesconto}
              onKeyDown={(e) => e.key === 'Enter' && commitDesconto()}
              className="w-16 rounded border border-gray-200 bg-white px-1 py-0.5 text-xs dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
            />
            %
            <input
              aria-label="Rótulo do desconto"
              value={descontoLabel}
              placeholder="rótulo (ex: parceria)"
              onChange={(e) => setDescontoLabel(e.target.value)}
              onBlur={commitDescontoLabel}
              onKeyDown={(e) => e.key === 'Enter' && commitDescontoLabel()}
              className="w-32 rounded border border-gray-200 bg-white px-1 py-0.5 text-xs dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
            />
          </span>
          <span>-{brl(fechado.financeiro.desconto_valor)}</span>
        </div>
        <div className="mt-2 flex justify-between text-base font-bold text-[#1A1A2E] dark:text-white">
          <span>Investimento</span>
          <span className="text-brand-purple">{brl(fechado.financeiro.total)}</span>
        </div>
      </div>

      {avisos.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/40">
          <li className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            Avisos (não impedem de gerar)
          </li>
          {avisos.map((a, i) => (
            <li key={i} className="text-xs text-amber-600 dark:text-amber-400">
              {a}
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  )
}
