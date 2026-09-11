'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export type Passo = 1 | 2 | 3

const PASSOS: { n: Passo; titulo: string; detalhe: string }[] = [
  {
    n: 1,
    titulo: 'Descreva o pedido',
    detalhe: 'Pelo chat, colando o texto ou anexando um print do e-mail/WhatsApp.',
  },
  {
    n: 2,
    titulo: 'Revise o preview',
    detalhe: 'Cliente, itens, empresa e desconto são editáveis. Cada mudança reprecifica.',
  },
  {
    n: 3,
    titulo: 'Gere e baixe',
    detalhe: 'Sai o .docx no timbrado da empresa, com PDF. Fica salvo no Histórico.',
  },
]

/**
 * Os três passos da ferramenta, com o atual em destaque. Serve de instrução
 * e de bússola ao mesmo tempo: quem abre pela primeira vez vê o caminho
 * inteiro, e quem está no meio vê onde está.
 */
export function GuiaPassos({ atual }: { atual: Passo }) {
  return (
    <ol
      aria-label="Passos da proposta"
      className="mb-6 grid gap-3 sm:grid-cols-3"
    >
      {PASSOS.map(({ n, titulo, detalhe }) => {
        const feito = n < atual
        const ativo = n === atual
        return (
          <li
            key={n}
            aria-current={ativo ? 'step' : undefined}
            className={cn(
              'flex gap-3 rounded-lg border p-3 transition',
              ativo
                ? 'border-brand-purple bg-brand-purple/5 dark:bg-brand-purple/10'
                : 'border-gray-200 dark:border-gray-700',
              feito && 'opacity-70'
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                ativo && 'bg-brand-purple text-white',
                feito && 'bg-brand-lime text-[#1A1A2E]',
                !ativo && !feito && 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              )}
            >
              {feito ? <Check className="h-3.5 w-3.5" aria-label="concluído" /> : n}
            </span>
            <span>
              <span className="block text-sm font-semibold text-[#1A1A2E] dark:text-white">
                {titulo}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">{detalhe}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
