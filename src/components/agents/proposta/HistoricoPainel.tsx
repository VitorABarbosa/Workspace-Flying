'use client'

import { useState } from 'react'
import { Download, FileText, Search, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { PropostaListada } from './types'

interface Props {
  propostas: PropostaListada[]
  onExcluir: (id: number) => void
  onFiltrar: (cliente: string) => void
  carregando: boolean
}

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR')
}

function formatarTotal(total: number) {
  return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function HistoricoPainel({ propostas, onExcluir, onFiltrar, carregando }: Props) {
  const [cliente, setCliente] = useState('')
  const [confirmando, setConfirmando] = useState<number | null>(null)

  return (
    <div className="rounded-xl border border-gray-200 bg-[#F1F1F1] p-6 dark:border-gray-700 dark:bg-[#1A1A1A]">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-[#1A1A2E] dark:text-white" htmlFor="filtro-cliente">
          Filtrar por cliente
        </label>
        <div className="flex items-center gap-2">
          <input
            id="filtro-cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Nome do cliente"
            className={cn(
              'rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm',
              'text-[#1A1A2E] placeholder:text-gray-400 focus:border-brand-purple focus:outline-none',
              'dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white'
            )}
          />
          <button
            onClick={() => onFiltrar(cliente)}
            disabled={carregando}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg bg-brand-purple px-3 py-1.5',
              'text-sm font-semibold text-white hover:opacity-90',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <Search className="h-4 w-4" /> Filtrar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <th className="py-2 pr-4 font-medium">Cliente</th>
              <th className="py-2 pr-4 font-medium">Projeto</th>
              <th className="py-2 pr-4 font-medium">Data</th>
              <th className="py-2 pr-4 font-medium">Total</th>
              <th className="py-2 pr-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {propostas.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 text-[#1A1A2E] dark:text-white">{p.cliente}</td>
                <td className="py-2 pr-4 text-[#1A1A2E] dark:text-white">{p.referencia ?? '—'}</td>
                <td className="py-2 pr-4 text-[#1A1A2E] dark:text-white">{formatarData(p.data)}</td>
                <td className="py-2 pr-4 text-[#1A1A2E] dark:text-white">{formatarTotal(p.total)}</td>
                <td className="py-2 pr-4">
                  {confirmando === p.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        Excluir a proposta #{p.id} de {p.cliente}? Isso apaga o arquivo do Cloudflare também.
                      </span>
                      <button
                        onClick={() => {
                          onExcluir(p.id)
                          setConfirmando(null)
                        }}
                        className="rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:opacity-90"
                      >
                        Confirmar exclusão
                      </button>
                      <button
                        onClick={() => setConfirmando(null)}
                        className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <a
                        href={`/api/tools/proposta${p.pdf}`}
                        aria-label={`Baixar PDF da proposta ${p.id}`}
                        download
                        className="text-brand-purple hover:opacity-80"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <a
                        href={`/api/tools/proposta${p.download}`}
                        aria-label={`Baixar docx da proposta ${p.id}`}
                        download
                        className="text-brand-purple hover:opacity-80"
                      >
                        <FileText className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => setConfirmando(p.id)}
                        aria-label={`Excluir proposta ${p.id}`}
                        className="text-red-600 hover:opacity-80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {propostas.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {carregando ? 'Carregando…' : 'Nenhuma proposta encontrada.'}
          </p>
        )}
      </div>
    </div>
  )
}
