'use client'

import { FileText } from 'lucide-react'
import { AgentShell } from '@/components/tools/AgentShell'
import { cn } from '@/lib/cn'
import { EntradaPainel } from './EntradaPainel'
import { PreviewPainel } from './PreviewPainel'
import { ResultadoPainel } from './ResultadoPainel'
import { useProposta } from './useProposta'

export function PropostaAgent() {
  const {
    carregando, erro, levantamento, gerada,
    levantarPorTexto, reprecificar, gerar, reiniciar,
  } = useProposta()

  return (
    <AgentShell
      title="Proposta"
      description="Descreva o pedido em texto livre; o preço vem da tabela oficial ou do histórico do cliente. Revise, ajuste e gere o .docx timbrado."
    >
      {erro && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300">
          {erro}
        </p>
      )}

      {gerada ? (
        <ResultadoPainel gerada={gerada} onNova={reiniciar} />
      ) : (
        <div className={cn('grid gap-6', levantamento && 'lg:grid-cols-2')}>
          <EntradaPainel onPrecificar={levantarPorTexto} carregando={carregando} />
          {levantamento && (
            <div>
              <PreviewPainel
                levantamento={levantamento}
                onEditar={reprecificar}
                carregando={carregando}
              />
              <button
                onClick={() => gerar(levantamento.estrutura)}
                disabled={carregando || levantamento.pendencias.length > 0}
                className={cn(
                  'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg',
                  'bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white',
                  'hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                <FileText className="h-4 w-4" />
                {carregando ? 'Gerando…' : 'Gerar proposta'}
              </button>
              {levantamento.pendencias.length > 0 && (
                <p className="mt-1 text-center text-xs text-amber-600 dark:text-amber-400">
                  Complete as pendências para gerar.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </AgentShell>
  )
}
