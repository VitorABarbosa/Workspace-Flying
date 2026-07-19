'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText } from 'lucide-react'
import { AgentShell } from '@/components/tools/AgentShell'
import { cn } from '@/lib/cn'
import { ChatPainel } from './ChatPainel'
import { EntradaPainel } from './EntradaPainel'
import { HistoricoPainel } from './HistoricoPainel'
import { PreviewPainel } from './PreviewPainel'
import { ResultadoPainel } from './ResultadoPainel'
import type { Estrutura, Levantamento, MensagemChat } from './types'
import { useProposta } from './useProposta'

type Aba = 'chat' | 'texto' | 'historico'

const ABAS: { key: Aba; label: string }[] = [
  { key: 'chat', label: 'Chat' },
  { key: 'texto', label: 'Texto direto' },
  { key: 'historico', label: 'Histórico' },
]

function PreviewComGerar({
  levantamento,
  onEditar,
  onGerar,
  carregando,
}: {
  levantamento: Levantamento
  onEditar: (estrutura: Estrutura) => void
  onGerar: () => void
  carregando: boolean
}) {
  return (
    <div>
      <PreviewPainel levantamento={levantamento} onEditar={onEditar} carregando={carregando} />
      <button
        onClick={onGerar}
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
  )
}

export function PropostaAgent() {
  const {
    carregando, erro, levantamento, gerada, historico, chat,
    levantarPorTexto, reprecificar, gerar, reiniciar,
    listarHistorico, excluirProposta, conversar, limparErro,
  } = useProposta()

  const [aba, setAba] = useState<Aba>('chat')
  const [mensagens, setMensagens] = useState<MensagemChat[]>([])
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const saudacaoPedida = useRef(false)

  useEffect(() => {
    if (aba === 'chat' && !saudacaoPedida.current) {
      saudacaoPedida.current = true
      conversar([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba])

  useEffect(() => {
    if (aba === 'historico') {
      listarHistorico()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba])

  useEffect(() => {
    limparErro()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba])

  useEffect(() => {
    if (!chat) return
    setMensagens([...chat.mensagens, { role: 'assistant', content: chat.resposta.mensagem }])
    setQuickReplies(chat.resposta.quick_replies)
  }, [chat])

  function enviarMensagem(texto: string) {
    const proximas: MensagemChat[] = [...mensagens, { role: 'user', content: texto }]
    setMensagens(proximas)
    setQuickReplies([])
    conversar(proximas)
  }

  return (
    <AgentShell
      title="Proposta"
      description="Descreva o pedido em texto livre; o preço vem da tabela oficial ou do histórico do cliente. Revise, ajuste e gere o .docx timbrado."
    >
      <div className="mb-4 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {ABAS.map((item) => (
          <button
            key={item.key}
            onClick={() => setAba(item.key)}
            aria-pressed={aba === item.key}
            className={cn(
              'px-4 py-2 text-sm font-medium transition',
              aba === item.key
                ? 'border-b-2 border-brand-purple text-brand-purple'
                : 'text-gray-500 hover:text-[#1A1A2E] dark:text-gray-400 dark:hover:text-white'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {erro && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300">
          {erro}
        </p>
      )}

      {gerada ? (
        <ResultadoPainel gerada={gerada} onNova={reiniciar} />
      ) : (
        <>
          {aba === 'chat' && (
            <div className={cn('grid gap-6', levantamento && 'lg:grid-cols-2')}>
              <ChatPainel
                mensagens={mensagens}
                quickReplies={quickReplies}
                onEnviar={enviarMensagem}
                carregando={carregando}
              />
              {levantamento && (
                <PreviewComGerar
                  levantamento={levantamento}
                  onEditar={reprecificar}
                  onGerar={() => gerar(levantamento.estrutura)}
                  carregando={carregando}
                />
              )}
            </div>
          )}

          {aba === 'texto' && (
            <div className={cn('grid gap-6', levantamento && 'lg:grid-cols-2')}>
              <EntradaPainel onPrecificar={levantarPorTexto} carregando={carregando} />
              {levantamento && (
                <PreviewComGerar
                  levantamento={levantamento}
                  onEditar={reprecificar}
                  onGerar={() => gerar(levantamento.estrutura)}
                  carregando={carregando}
                />
              )}
            </div>
          )}

          {aba === 'historico' && (
            <HistoricoPainel
              propostas={historico ?? []}
              onExcluir={excluirProposta}
              onFiltrar={(cliente) => listarHistorico(cliente)}
              carregando={carregando}
            />
          )}
        </>
      )}
    </AgentShell>
  )
}
