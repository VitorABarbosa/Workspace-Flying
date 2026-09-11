'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, FileText, ImagePlus, Loader2, Send, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SpinnerBotao } from './Carregando'
import { MAX_PRINTS, PrintInvalido, prepararPrint, type PrintPreparado } from './prepararPrint'
import type { MensagemChat, ParteConteudo, PropostaCitada } from './types'
import type { AcaoProposta } from './useProposta'

interface Props {
  mensagens: MensagemChat[]
  quickReplies: string[]
  onEnviar: (texto: string, prints?: PrintPreparado[]) => void
  carregando: boolean
  acao?: AcaoProposta | null
  propostasCitadas?: PropostaCitada[]
}

const DICAS = [
  'Diga a construtora, o empreendimento, o A/C e os itens — tudo de uma vez ou aos poucos.',
  'Anexe um print do e-mail ou do WhatsApp com o pedido: a IA lê e monta a proposta.',
  'Para repetir um cliente, peça "copiar a última proposta da GALLI" e ajuste o que mudou.',
  'Os preços nunca vêm da IA: saem da tabela oficial ou do histórico do cliente.',
]

/** O que o chat diz enquanto espera a resposta, conforme o que foi mandado. */
function fraseDeEspera(acao: AcaoProposta | null | undefined, ultima?: MensagemChat): string {
  if (acao === 'saudacao') return 'Iniciando o chat…'
  if (ultima && typeof ultima.content !== 'string') return 'Lendo o print e montando a proposta…'
  return 'Pensando… lendo o pedido e montando a proposta.'
}

/** Bolha do assistente com spinner — ocupa o lugar da resposta que vem aí. */
function BolhaEsperando({ texto }: { texto: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex max-w-[80%] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-gray-400"
    >
      <Loader2 className="h-4 w-4 animate-spin text-brand-purple" aria-hidden="true" />
      {texto}
    </div>
  )
}

/** Bolha do chat: texto puro, ou texto + prints quando a mensagem tem anexo. */
function Bolha({ mensagem }: { mensagem: MensagemChat }) {
  if (typeof mensagem.content === 'string') return <>{mensagem.content}</>
  const partes = mensagem.content as ParteConteudo[]
  return (
    <div className="flex flex-col gap-2">
      {partes.map((parte, i) =>
        parte.type === 'text' ? (
          <span key={i}>{parte.text}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={parte.image_url.url}
            alt="Print anexado"
            className="max-h-48 w-auto rounded border border-white/30"
          />
        )
      )}
    </div>
  )
}

export function ChatPainel({
  mensagens, quickReplies, onEnviar, carregando, acao, propostasCitadas = [],
}: Props) {
  const [texto, setTexto] = useState('')
  const [prints, setPrints] = useState<PrintPreparado[]>([])
  const [erroAnexo, setErroAnexo] = useState<string | null>(null)
  const fimRef = useRef<HTMLDivElement>(null)
  const arquivoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fimRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [mensagens, carregando])

  // As dicas ficam até a primeira mensagem da pessoa; depois só atrapalham.
  const aindaNaoFalou = !mensagens.some((m) => m.role === 'user')
  const esperando = carregando && (acao === 'saudacao' || acao === 'conversar')

  async function anexar(arquivos: FileList | null) {
    if (!arquivos?.length) return
    setErroAnexo(null)
    const sobra = MAX_PRINTS - prints.length
    if (sobra <= 0) {
      setErroAnexo(`Dá para mandar até ${MAX_PRINTS} prints por mensagem.`)
      return
    }
    const novos: PrintPreparado[] = []
    for (const arquivo of Array.from(arquivos).slice(0, sobra)) {
      try {
        novos.push(await prepararPrint(arquivo))
      } catch (e) {
        setErroAnexo(e instanceof PrintInvalido ? e.message : 'Não consegui preparar esse print.')
      }
    }
    if (novos.length) setPrints((atuais) => [...atuais, ...novos])
    if (arquivoRef.current) arquivoRef.current.value = ''
  }

  function enviar(valor: string) {
    const conteudo = valor.trim()
    // Print sozinho já é um pedido — não exige texto junto.
    if ((!conteudo && prints.length === 0) || carregando) return
    onEnviar(conteudo, prints)
    setTexto('')
    setPrints([])
    setErroAnexo(null)
  }

  return (
    <div
      aria-busy={esperando}
      // Sem h-full: no grid ao lado do preview, 100% seria a altura do preview
      // e o chat virava um bloco cinza vazio embaixo do input.
      className="flex flex-col rounded-xl border border-gray-200 bg-[#F1F1F1] p-6 dark:border-gray-700 dark:bg-[#1A1A1A]"
    >
      {aindaNaoFalou && (
        <div className="mb-3 rounded-lg border border-dashed border-brand-purple/40 bg-white/60 p-3 text-xs text-gray-600 dark:bg-[#0F0F0F]/60 dark:text-gray-300">
          <p className="mb-1 font-semibold text-[#1A1A2E] dark:text-white">Como usar o chat</p>
          <ul className="list-disc space-y-0.5 pl-4">
            {DICAS.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex max-h-[420px] min-h-[240px] flex-col gap-3 overflow-y-auto pr-1">
        {mensagens.map((m, i) => (
          <div
            key={i}
            className={cn(
              'max-w-[80%] rounded-lg px-3 py-2 text-sm',
              m.role === 'user'
                ? 'ml-auto bg-brand-purple text-white'
                : 'border border-gray-200 bg-white text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white'
            )}
          >
            <Bolha mensagem={m} />
          </div>
        ))}
        {esperando && <BolhaEsperando texto={fraseDeEspera(acao, mensagens.at(-1))} />}
        <div ref={fimRef} />
      </div>

      {propostasCitadas.length > 0 && (
        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 text-xs dark:border-gray-700 dark:bg-[#0F0F0F]">
          {propostasCitadas.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#1A1A2E] dark:text-white">
                Proposta #{p.id} — {p.cliente}
                {p.referencia ? ` (${p.referencia})` : ''}
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={`/api/tools/proposta/propostas/${p.id}/pdf`}
                  aria-label={`Baixar PDF da proposta ${p.id}`}
                  download
                  className="inline-flex items-center gap-1 text-brand-purple hover:opacity-80"
                >
                  <Download className="h-3.5 w-3.5" /> PDF
                </a>
                <a
                  href={`/api/tools/proposta/propostas/${p.id}/docx`}
                  aria-label={`Baixar DOCX da proposta ${p.id}`}
                  download
                  className="inline-flex items-center gap-1 text-brand-purple hover:opacity-80"
                >
                  <FileText className="h-3.5 w-3.5" /> DOCX
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {quickReplies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {quickReplies.map((qr) => (
            <button
              key={qr}
              onClick={() => enviar(qr)}
              disabled={carregando}
              className="rounded-full border border-brand-purple px-3 py-1 text-xs text-brand-purple hover:bg-brand-purple/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {qr}
            </button>
          ))}
        </div>
      )}

      {prints.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {prints.map((print, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={print.dataUrl}
                alt={print.nome}
                className="h-16 w-16 rounded border border-gray-300 object-cover dark:border-gray-600"
              />
              <button
                onClick={() => setPrints((atuais) => atuais.filter((_, j) => j !== i))}
                aria-label={`Remover print ${print.nome}`}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-[#1A1A2E] p-0.5 text-white hover:opacity-80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {erroAnexo && (
        <p role="alert" className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          {erroAnexo}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <input
          ref={arquivoRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          hidden
          data-testid="input-print"
          onChange={(e) => anexar(e.target.files)}
        />
        <button
          onClick={() => arquivoRef.current?.click()}
          disabled={carregando}
          aria-label="Anexar print"
          title="Anexar print de e-mail, WhatsApp ou briefing"
          className={cn(
            'inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2.5',
            'text-brand-purple hover:bg-brand-purple/10 disabled:cursor-not-allowed disabled:opacity-50',
            'dark:border-gray-700 dark:bg-[#0F0F0F]'
          )}
        >
          <ImagePlus className="h-4 w-4" />
        </button>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') enviar(texto)
          }}
          disabled={carregando}
          placeholder={
            carregando
              ? 'Aguarde a resposta…'
              : 'Escreva aqui… (ex.: proposta para GALLI, 3 externas) e aperte Enter'
          }
          className={cn(
            'flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm',
            'text-[#1A1A2E] placeholder:text-gray-400 focus:border-brand-purple focus:outline-none',
            'dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white'
          )}
        />
        <button
          onClick={() => enviar(texto)}
          disabled={carregando || (!texto.trim() && prints.length === 0)}
          aria-label="Enviar mensagem"
          className={cn(
            'inline-flex items-center justify-center rounded-lg bg-brand-purple p-2.5 text-white',
            'hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {esperando ? <SpinnerBotao /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
