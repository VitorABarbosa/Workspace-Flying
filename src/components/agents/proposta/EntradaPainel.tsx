'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Carregando, SpinnerBotao } from './Carregando'
import { EMISSOR_PADRAO, EMPRESAS, type Emissor } from './empresas'
import type { AcaoProposta } from './useProposta'

/**
 * Exemplo por empresa. Fica visível o tempo todo (não é placeholder, que
 * some ao digitar) e entra no campo com um clique — é a instrução mais
 * eficaz: mostrar o formato pronto.
 */
export const EXEMPLOS: Record<Emissor, string> = {
  flying: `Cliente: GALLI, ref Residencial Aurora, a/c Daniel
Externas: Fachada vista da calçada, Jardim
Internas: Academia, Lobby
Plantas: Implantação Térreo, Apartamento Tipo
10% de desconto, preço de planilha`,
  rinno: `Cliente: OUSY, ref Vila Mariana, a/c Yuri
Filmes: Filme institucional de até 2:00 = 15.000, Filme corretor, Viral para redes sociais
Takes: Take IA da piscina, Take IA do lobby`,
  nid: `Cliente: OUSY, ref Vila Mariana, a/c Yuri
Fachada: Design de fachada
Interiores: Apto modelo 3 dorm, Piscina (área comum), Academia (área comum)
PDV: Stand de vendas`,
}

interface Props {
  onPrecificar: (texto: string, emissor: Emissor) => void
  carregando: boolean
  acao?: AcaoProposta | null
}

export function EntradaPainel({ onPrecificar, carregando, acao }: Props) {
  const [texto, setTexto] = useState('')
  const [emissor, setEmissor] = useState<Emissor>(EMISSOR_PADRAO)
  const precificando = carregando && acao === 'levantar'
  const exemplo = EXEMPLOS[emissor]

  return (
    <div
      aria-busy={precificando}
      className="rounded-xl border border-gray-200 bg-[#F1F1F1] p-6 dark:border-gray-700 dark:bg-[#1A1A1A]"
    >
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Cole o pedido inteiro de uma vez. Uma linha por categoria, itens separados por vírgula;
        quantidade pode ir por extenso (&quot;três fachadas&quot;). O preço sai da tabela da
        empresa escolhida ou do histórico do cliente — nunca da IA. Item com valor fechado vai
        com o número no fim: &quot;Filme institucional de até 2:00 = 15.000&quot;.
      </p>

      <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#1A1A2E] dark:text-white">
        Empresa
        <select
          aria-label="Empresa"
          value={emissor}
          onChange={(e) => setEmissor(e.target.value as Emissor)}
          disabled={carregando}
          className={cn(
            'rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm font-normal',
            'text-[#1A1A2E] focus:border-brand-purple focus:outline-none',
            'dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white'
          )}
        >
          {EMPRESAS.map(({ chave, rotulo }) => (
            <option key={chave} value={chave}>{rotulo}</option>
          ))}
        </select>
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
          define o timbrado e o catálogo de preços
        </span>
      </label>

      <label className="mb-2 block text-sm font-medium text-[#1A1A2E] dark:text-white">
        Descreva a proposta
      </label>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={exemplo}
        rows={8}
        disabled={carregando}
        className={cn(
          'w-full resize-y rounded-lg border border-gray-200 bg-white p-3 text-sm',
          'text-[#1A1A2E] placeholder:text-gray-400 focus:border-brand-purple focus:outline-none',
          'disabled:opacity-60',
          'dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white'
        )}
      />

      <details className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <summary className="cursor-pointer select-none hover:text-brand-purple">
          Ver exemplo de pedido para {EMPRESAS.find((e) => e.chave === emissor)?.rotulo}
        </summary>
        <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-gray-200 bg-white p-3 font-sans text-xs text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white">
          {exemplo}
        </pre>
        <button
          type="button"
          onClick={() => setTexto(exemplo)}
          disabled={carregando}
          className="mt-1 text-brand-purple hover:underline disabled:opacity-50"
        >
          Usar este exemplo
        </button>
      </details>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => onPrecificar(texto, emissor)}
          disabled={carregando || !texto.trim()}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg bg-brand-purple px-4 py-2',
            'text-sm font-semibold text-white transition hover:opacity-90',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {precificando ? <SpinnerBotao /> : <Sparkles className="h-4 w-4" />}
          {precificando ? 'Precificando…' : 'Precificar'}
        </button>
        {precificando ? (
          <Carregando acao={acao} />
        ) : (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Nada é gravado ainda — o preview aparece ao lado para você revisar.
          </span>
        )}
      </div>
    </div>
  )
}
