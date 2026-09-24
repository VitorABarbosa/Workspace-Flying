'use client'

import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  ROTULO_DA_SECAO,
  SECOES_DE_IMAGEM,
  adicionarItem,
  moverItem,
  removerItem,
  semSecoesVazias,
  tituloDoBloco,
  totalDeImagens,
  trocarItem,
  trocarTitulo,
} from './rollSecoes'
import type { Roll, TipoDeBloco } from './types'

interface Props {
  roll: Roll
  onEditar: (roll: Roll) => void
}

const CAMPO =
  'rounded border border-gray-200 bg-white px-2 py-1 text-sm text-[#1A1A2E] ' +
  'placeholder:text-gray-400 focus:border-brand-purple focus:outline-none ' +
  'dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white'

/**
 * A lista do roll, do jeito que ela vai sair no documento — e editável.
 *
 * Mover item de seção é o conserto mais comum depois da leitura: a sauna que
 * foi para dentro, o "Tipo 4" que foi para as plantas. Por isso cada item tem
 * o seu seletor de seção ali do lado, em vez de um modo de edição à parte.
 */
export function RollPainel({ roll, onEditar }: Props) {
  const imagens = totalDeImagens(roll.blocos)

  return (
    <div className="rounded-xl border border-gray-200 bg-[#F1F1F1] p-6 dark:border-gray-700 dark:bg-[#1A1A1A]">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-xs text-gray-500 dark:text-gray-400">
          Cliente
          <input
            aria-label="Cliente do roll"
            value={roll.cliente.empresa}
            placeholder="construtora"
            onChange={(e) =>
              onEditar({ ...roll, cliente: { ...roll.cliente, empresa: e.target.value } })}
            className={cn(CAMPO, 'ml-1 w-40')}
          />
        </label>
        <label className="text-xs text-gray-500 dark:text-gray-400">
          Empreendimento
          <input
            aria-label="Empreendimento do roll"
            value={roll.cliente.ref}
            placeholder="nome do projeto"
            onChange={(e) =>
              onEditar({ ...roll, cliente: { ...roll.cliente, ref: e.target.value } })}
            className={cn(CAMPO, 'ml-1 w-44')}
          />
        </label>
        <label className="text-xs text-gray-500 dark:text-gray-400">
          Aprovado em
          <input
            aria-label="Data de aprovação do roll"
            type="date"
            value={roll.aprovado_em ?? ''}
            onChange={(e) => onEditar({ ...roll, aprovado_em: e.target.value || null })}
            className={cn(CAMPO, 'ml-1')}
          />
        </label>
        <span className="ml-auto rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-semibold text-brand-purple">
          {imagens} {imagens === 1 ? 'imagem' : 'imagens'}
        </span>
      </div>

      {roll.avisos.length > 0 && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
        >
          <p className="font-semibold">Confira antes de gerar</p>
          <ul className="mt-1 list-disc pl-4">
            {roll.avisos.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      )}

      {roll.blocos.map((bloco, iBloco) => (
        <section key={`${bloco.tipo}-${iBloco}`} className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            {bloco.tipo === 'servico' || bloco.tipo === '' ? (
              <input
                aria-label={`Título da seção ${iBloco + 1}`}
                value={bloco.titulo}
                placeholder="nome do serviço"
                onChange={(e) => onEditar(trocarTitulo(roll, iBloco, e.target.value))}
                className={cn(CAMPO, 'w-full max-w-md font-semibold')}
              />
            ) : (
              <h3 className="text-sm font-semibold text-[#1A1A2E] dark:text-white">
                {`2.${iBloco + 1} `}{tituloDoBloco(bloco)}
              </h3>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {bloco.itens.length} {bloco.itens.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <ol className="space-y-1">
            {bloco.itens.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-right text-xs text-gray-400">{idx + 1}.</span>
                <input
                  aria-label={`Item ${idx + 1} de ${tituloDoBloco(bloco)}`}
                  value={item}
                  onChange={(e) => onEditar(trocarItem(roll, iBloco, idx, e.target.value))}
                  className={cn(CAMPO, 'min-w-0 flex-1')}
                />
                {bloco.tipo !== 'servico' && (
                  <select
                    aria-label={`Seção de "${item}"`}
                    value={SECOES_DE_IMAGEM.includes(bloco.tipo) ? bloco.tipo : ''}
                    onChange={(e) =>
                      onEditar(semSecoesVazias(
                        moverItem(roll, iBloco, idx, e.target.value as TipoDeBloco)))}
                    className={cn(CAMPO, 'w-36 shrink-0 text-xs')}
                  >
                    {bloco.tipo === '' && <option value="">a confirmar</option>}
                    {SECOES_DE_IMAGEM.map((t) => (
                      <option key={t} value={t}>{ROTULO_DA_SECAO[t]}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => onEditar(semSecoesVazias(removerItem(roll, iBloco, idx)))}
                  aria-label={`Tirar "${item}" do roll`}
                  className="shrink-0 text-red-600 hover:opacity-80"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ol>

          <button
            onClick={() => onEditar(adicionarItem(roll, iBloco))}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-purple hover:opacity-80"
          >
            <Plus className="h-3 w-3" /> item em {tituloDoBloco(bloco)}
          </button>
        </section>
      ))}
    </div>
  )
}
