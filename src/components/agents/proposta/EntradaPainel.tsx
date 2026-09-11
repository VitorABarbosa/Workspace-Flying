'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { EMISSOR_PADRAO, EMPRESAS, type Emissor } from './empresas'

const EXEMPLO = `Cliente: GALLI, ref Residencial Aurora, a/c Daniel
Externas: Fachada vista da calçada, Jardim
Internas: Academia, Lobby
Plantas: Implantação Térreo, Apartamento Tipo
10% de desconto, preço de planilha

Também dá para pedir filmes, tour virtual e tecnologia (ex: "Filme 3D de 60s", "Tour virtual do apartamento", "App touch para stand").

Trocando a empresa acima, o catálogo muda: Rinno Films orça filmes publicitários e NID Studio, projeto de interiores, fachada e PDV.`

interface Props {
  onPrecificar: (texto: string, emissor: Emissor) => void
  carregando: boolean
}

export function EntradaPainel({ onPrecificar, carregando }: Props) {
  const [texto, setTexto] = useState('')
  const [emissor, setEmissor] = useState<Emissor>(EMISSOR_PADRAO)
  return (
    <div className="rounded-xl border border-gray-200 bg-[#F1F1F1] p-6 dark:border-gray-700 dark:bg-[#1A1A1A]">
      <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#1A1A2E] dark:text-white">
        Empresa
        <select
          aria-label="Empresa"
          value={emissor}
          onChange={(e) => setEmissor(e.target.value as Emissor)}
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
      </label>
      <label className="mb-2 block text-sm font-medium text-[#1A1A2E] dark:text-white">
        Descreva a proposta
      </label>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={EXEMPLO}
        rows={10}
        className={cn(
          'w-full resize-y rounded-lg border border-gray-200 bg-white p-3 text-sm',
          'text-[#1A1A2E] placeholder:text-gray-400 focus:border-brand-purple focus:outline-none',
          'dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white'
        )}
      />
      <button
        onClick={() => onPrecificar(texto, emissor)}
        disabled={carregando || !texto.trim()}
        className={cn(
          'mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-purple px-4 py-2',
          'text-sm font-semibold text-white transition hover:opacity-90',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        <Sparkles className="h-4 w-4" />
        {carregando ? 'Precificando…' : 'Precificar'}
      </button>
    </div>
  )
}
