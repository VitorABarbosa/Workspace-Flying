'use client'

import { ArrowRight, Download, FileText, Minus, Plus } from 'lucide-react'
import { ROTULO_DA_SECAO } from './rollSecoes'
import type { RollGerado, TipoDeBloco } from './types'

interface Props {
  gerado: RollGerado
  onNovo: () => void
}

function secao(tipo: string) {
  return ROTULO_DA_SECAO[tipo as TipoDeBloco] ?? tipo
}

/**
 * O roll novo e — mais importante — o que mudou desde o anterior.
 *
 * "o que entrou, o que saiu?" é a pergunta que se faz toda vez que um roll é
 * atualizado, e que até aqui se respondia comparando dois PDFs lado a lado.
 */
export function RollResultado({ gerado, onNovo }: Props) {
  const mudou = gerado.mudou
  return (
    <div className="rounded-xl border border-gray-200 bg-[#F1F1F1] p-6 dark:border-gray-700 dark:bg-[#1A1A1A]">
      <h3 className="text-sm font-semibold text-[#1A1A2E] dark:text-white">
        {gerado.nome_arquivo}.docx
      </h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {gerado.versao === 0
          ? `Primeira versão do roll — ${gerado.imagens} imagens.`
          : `Versão ${gerado.versao}, a partir de ${gerado.anterior?.nome_arquivo} — ` +
            `${gerado.imagens} imagens.`}
      </p>

      {mudou && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-[#0F0F0F]">
          <p className="flex items-center gap-2 text-xs font-semibold text-[#1A1A2E] dark:text-white">
            O que mudou
            <span className="font-normal text-gray-500 dark:text-gray-400">
              {mudou.imagens_antes} <ArrowRight className="inline h-3 w-3" /> {mudou.imagens_depois} imagens
            </span>
          </p>
          {mudou.entrou.length === 0 && mudou.saiu.length === 0 ? (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Nenhum item entrou ou saiu em relação à versão anterior.
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-xs">
              {mudou.entrou.map((e) => (
                <li key={`+${e.tipo}${e.item}`} className="flex items-start gap-1 text-emerald-700 dark:text-emerald-400">
                  <Plus className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{e.item} <span className="opacity-70">— {secao(e.tipo)}</span></span>
                </li>
              ))}
              {mudou.saiu.map((e) => (
                <li key={`-${e.tipo}${e.item}`} className="flex items-start gap-1 text-red-700 dark:text-red-400">
                  <Minus className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{e.item} <span className="opacity-70">— {secao(e.tipo)}</span></span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {gerado.avisos.length > 0 && (
        <ul className="mt-3 list-disc pl-4 text-xs text-amber-700 dark:text-amber-400">
          {gerado.avisos.map((a) => <li key={a}>{a}</li>)}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={`/api/tools/proposta${gerado.pdf}`}
          download
          className="inline-flex items-center gap-2 rounded-lg bg-brand-purple px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Download className="h-4 w-4" /> Baixar PDF
        </a>
        <a
          href={`/api/tools/proposta${gerado.download}`}
          download
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-[#1A1A2E] hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
        >
          <FileText className="h-4 w-4" /> Baixar .docx
        </a>
        <button
          onClick={onNovo}
          className="text-sm font-medium text-brand-purple hover:opacity-80"
        >
          Ler outro roll
        </button>
      </div>
    </div>
  )
}
