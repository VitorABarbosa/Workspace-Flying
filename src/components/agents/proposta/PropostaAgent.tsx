'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText, X } from 'lucide-react'
import { AgentShell } from '@/components/tools/AgentShell'
import { cn } from '@/lib/cn'
import { Carregando, SpinnerBotao } from './Carregando'
import { ChatPainel } from './ChatPainel'
import { EntradaPainel } from './EntradaPainel'
import { GuiaPassos, type Passo } from './GuiaPassos'
import { HistoricoPainel } from './HistoricoPainel'
import type { PrintPreparado } from './prepararPrint'
import { PreviewPainel } from './PreviewPainel'
import { ResultadoPainel } from './ResultadoPainel'
import type { Estrutura, Levantamento, MensagemChat, ParteConteudo, PropostaCitada } from './types'
import { useProposta, type AcaoProposta } from './useProposta'

type Aba = 'chat' | 'texto' | 'historico'

const ABAS: { key: Aba; label: string; descricao: string }[] = [
  { key: 'chat', label: 'Chat', descricao: 'Conversa guiada: a IA pergunta o que faltar e monta a proposta.' },
  { key: 'texto', label: 'Texto direto', descricao: 'Cole o pedido inteiro de uma vez, sem conversa.' },
  { key: 'historico', label: 'Histórico', descricao: 'Baixar ou excluir propostas já geradas.' },
]

function PreviewComGerar({
  levantamento,
  onEditar,
  onGerar,
  carregando,
  acao,
}: {
  levantamento: Levantamento
  onEditar: (estrutura: Estrutura) => void
  onGerar: () => void
  carregando: boolean
  acao: AcaoProposta | null
}) {
  const gerando = carregando && acao === 'gerar'
  const pendente = levantamento.pendencias.length > 0
  return (
    <div>
      <PreviewPainel
        levantamento={levantamento}
        onEditar={onEditar}
        carregando={carregando}
        acao={acao}
      />
      <button
        onClick={onGerar}
        disabled={carregando || pendente}
        className={cn(
          'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg',
          'bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white',
          'hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        {gerando ? <SpinnerBotao /> : <FileText className="h-4 w-4" />}
        {gerando ? 'Gerando o .docx…' : 'Gerar proposta'}
      </button>
      {gerando ? (
        <Carregando acao={acao} className="mt-2 w-full justify-center text-xs" />
      ) : pendente ? (
        <p className="mt-1 text-center text-xs text-amber-600 dark:text-amber-400">
          Preencha o que falta (listado acima em amarelo) para liberar o botão.
        </p>
      ) : (
        <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
          Grava a proposta, monta o .docx no timbrado da empresa e libera PDF e Word para baixar.
        </p>
      )}
    </div>
  )
}

export function PropostaAgent() {
  const {
    carregando, acao, erro, levantamento, gerada, historico, chat,
    levantarPorTexto, reprecificar, gerar, reiniciar,
    listarHistorico, excluirProposta, conversar, limparErro, editar,
  } = useProposta()

  const [aba, setAba] = useState<Aba>('chat')
  const [mensagens, setMensagens] = useState<MensagemChat[]>([])
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [propostasCitadas, setPropostasCitadas] = useState<PropostaCitada[]>([])
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
    setPropostasCitadas(chat.resposta.propostas_citadas ?? [])
  }, [chat])

  // Print lido vira texto no histórico: o chat é stateless e reenvia tudo a
  // cada mensagem — sem isso o mesmo base64 subiria em toda rodada.
  useEffect(() => {
    const transcricao = chat?.resposta.transcricao
    if (!transcricao) return
    setMensagens((atuais) => {
      const i = atuais.findLastIndex((m) => typeof m.content !== 'string')
      if (i < 0) return atuais
      const trocadas = [...atuais]
      trocadas[i] = { ...trocadas[i], content: transcricao }
      return trocadas
    })
  }, [chat])

  function enviarMensagem(texto: string, prints: PrintPreparado[] = []) {
    const conteudo: string | ParteConteudo[] = prints.length
      ? [
          ...(texto ? [{ type: 'text' as const, text: texto }] : []),
          ...prints.map((p) => ({ type: 'image_url' as const, image_url: { url: p.dataUrl } })),
        ]
      : texto
    const proximas: MensagemChat[] = [...mensagens, { role: 'user', content: conteudo }]
    setMensagens(proximas)
    setQuickReplies([])
    conversar(proximas)
  }

  function novaProposta() {
    reiniciar()
    setMensagens([])
    setQuickReplies([])
    setPropostasCitadas([])
    saudacaoPedida.current = false
    conversar([])
    saudacaoPedida.current = true
  }

  // Onde a pessoa está no fluxo: define o passo em destaque no guia.
  const passo: Passo = gerada ? 3 : levantamento ? 2 : 1
  const abaAtual = ABAS.find((a) => a.key === aba)!

  return (
    <AgentShell
      title="Proposta"
      description="Gera a proposta comercial no timbrado da Flying, da Rinno ou da NID a partir do pedido do cliente. Você descreve, revisa o preço e baixa o PDF."
    >
      {aba !== 'historico' && <GuiaPassos atual={passo} />}

      <div className="mb-1 flex gap-2 border-b border-gray-200 dark:border-gray-700" role="tablist">
        {ABAS.map((item) => (
          <button
            key={item.key}
            role="tab"
            onClick={() => setAba(item.key)}
            aria-selected={aba === item.key}
            title={item.descricao}
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
      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">{abaAtual.descricao}</p>

      {erro && (
        <div
          role="alert"
          className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
        >
          <div>
            <p className="font-semibold">Não deu certo</p>
            <p className="mt-0.5 break-words">{erro}</p>
            <p className="mt-1 text-xs opacity-80">
              Tente de novo. Se continuar, o serviço de propostas pode estar fora do ar.
            </p>
          </div>
          <button
            onClick={limparErro}
            aria-label="Fechar erro"
            className="shrink-0 rounded p-0.5 hover:bg-red-100 dark:hover:bg-red-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Depois de gerar, o resultado toma o lugar do chat/texto — mas o
          Histórico continua abrindo: a pessoa vai lá conferir a que acabou
          de sair. Sem esse `aba !== 'historico'`, clicar na aba não fazia nada. */}
      {gerada && aba !== 'historico' ? (
        <ResultadoPainel gerada={gerada} onNova={novaProposta} />
      ) : (
        <>
          {aba === 'chat' && (
            <div className={cn('grid gap-6 lg:items-start', levantamento && 'lg:grid-cols-2')}>
              <ChatPainel
                mensagens={mensagens}
                quickReplies={quickReplies}
                onEnviar={enviarMensagem}
                carregando={carregando}
                acao={acao}
                propostasCitadas={propostasCitadas}
              />
              {levantamento && (
                <PreviewComGerar
                  levantamento={levantamento}
                  onEditar={reprecificar}
                  onGerar={() => gerar(levantamento.estrutura)}
                  carregando={carregando}
                  acao={acao}
                />
              )}
            </div>
          )}

          {aba === 'texto' && (
            <div className={cn('grid gap-6 lg:items-start', levantamento && 'lg:grid-cols-2')}>
              <EntradaPainel onPrecificar={levantarPorTexto} carregando={carregando} acao={acao} />
              {levantamento && (
                <PreviewComGerar
                  levantamento={levantamento}
                  onEditar={reprecificar}
                  onGerar={() => gerar(levantamento.estrutura)}
                  carregando={carregando}
                  acao={acao}
                />
              )}
            </div>
          )}

          {aba === 'historico' && (
            <HistoricoPainel
              propostas={historico ?? []}
              onExcluir={excluirProposta}
              // Editar leva para o preview, que é onde se mexe e se gera.
              onEditar={(id) => {
                setAba('texto')
                editar(id)
              }}
              onFiltrar={(cliente) => listarHistorico(cliente)}
              carregando={carregando}
              acao={acao}
            />
          )}
        </>
      )}
    </AgentShell>
  )
}
