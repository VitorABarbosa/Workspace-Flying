'use client'

import { CheckCircle2, Download, ExternalLink, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { PropostaGerada } from './types'

interface Props {
  gerada: PropostaGerada
  onNova: () => void
}

export function ResultadoPainel({ gerada, onNova }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-[#F1F1F1] p-6 text-center dark:border-gray-700 dark:bg-[#1A1A1A]">
      <CheckCircle2 className="mx-auto h-10 w-10 text-brand-lime" />
      <p className="mt-2 font-semibold text-[#1A1A2E] dark:text-white">
        Proposta #{gerada.proposta_id} gerada
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <a
          href={`/api/tools/proposta/propostas/${gerada.proposta_id}/pdf`}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg bg-brand-purple px-4 py-2',
            'text-sm font-semibold text-white hover:opacity-90'
          )}
        >
          <Download className="h-4 w-4" /> Baixar PDF
        </a>
        <a
          href={`/api/tools/proposta${gerada.download}`}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border border-brand-purple px-4 py-2',
            'text-sm font-semibold text-brand-purple hover:bg-brand-purple/10'
          )}
        >
          <Download className="h-4 w-4" /> Baixar .docx
        </a>
        {gerada.docx_url && (
          <a
            href={gerada.docx_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-brand-purple hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Ver no R2
          </a>
        )}
        <button
          onClick={onNova}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-purple dark:text-gray-400"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Nova proposta
        </button>
      </div>
      {gerada.avisos.length > 0 && (
        <ul className="mt-4 space-y-1">
          {gerada.avisos.map((a, i) => (
            <li key={i} className="text-xs text-amber-600 dark:text-amber-400">
              {a}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
