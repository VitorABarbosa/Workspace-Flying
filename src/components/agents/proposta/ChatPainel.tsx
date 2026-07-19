'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { MensagemChat } from './types'

interface Props {
  mensagens: MensagemChat[]
  quickReplies: string[]
  onEnviar: (texto: string) => void
  carregando: boolean
}

export function ChatPainel({ mensagens, quickReplies, onEnviar, carregando }: Props) {
  const [texto, setTexto] = useState('')
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fimRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [mensagens])

  function enviar(valor: string) {
    const conteudo = valor.trim()
    if (!conteudo || carregando) return
    onEnviar(conteudo)
    setTexto('')
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-[#F1F1F1] p-6 dark:border-gray-700 dark:bg-[#1A1A1A]">
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
            {m.content}
          </div>
        ))}
        <div ref={fimRef} />
      </div>

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

      <div className="mt-4 flex items-center gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') enviar(texto)
          }}
          disabled={carregando}
          placeholder="Escreva aqui… (ex.: proposta para GALLI, 3 externas)"
          className={cn(
            'flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm',
            'text-[#1A1A2E] placeholder:text-gray-400 focus:border-brand-purple focus:outline-none',
            'dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white'
          )}
        />
        <button
          onClick={() => enviar(texto)}
          disabled={carregando || !texto.trim()}
          aria-label="Enviar mensagem"
          className={cn(
            'inline-flex items-center justify-center rounded-lg bg-brand-purple p-2.5 text-white',
            'hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
