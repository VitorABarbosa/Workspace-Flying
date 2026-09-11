'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { AcaoProposta } from './useProposta'

/**
 * O que a tela diz enquanto cada ação roda. Cada uma demora por um motivo
 * diferente — a IA pensa, o print é lido, o .docx é montado e sobe no
 * Cloudflare — e a pessoa precisa saber qual é, senão acha que travou.
 */
export const MENSAGEM_DA_ACAO: Record<AcaoProposta, string> = {
  saudacao: 'Iniciando o chat…',
  conversar: 'Pensando… a IA está lendo o pedido e montando a proposta.',
  levantar: 'Precificando… interpretando o texto e buscando os preços.',
  reprecificar: 'Reprecificando com a alteração…',
  gerar: 'Gerando o .docx timbrado e salvando no Cloudflare… leva alguns segundos.',
  listar: 'Buscando as propostas…',
  excluir: 'Excluindo a proposta e o arquivo…',
}

interface Props {
  acao: AcaoProposta | null | undefined
  /** Sobrescreve a mensagem padrão da ação (ex.: "lendo o print"). */
  mensagem?: string
  className?: string
}

/** Spinner + frase, anunciado a leitor de tela. Não renderiza sem ação. */
export function Carregando({ acao, mensagem, className }: Props) {
  if (!acao) return null
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300',
        className
      )}
    >
      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-purple" aria-hidden="true" />
      {mensagem ?? MENSAGEM_DA_ACAO[acao]}
    </p>
  )
}

/** Spinner pequeno para dentro de botão. */
export function SpinnerBotao() {
  return <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
}
