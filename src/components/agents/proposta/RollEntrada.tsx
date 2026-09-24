'use client'

import { useRef, useState } from 'react'
import { FileUp, ScanLine } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SpinnerBotao } from './Carregando'
import { EMPRESAS, type Emissor } from './empresas'
import { PrintInvalido } from './prepararPrint'
import { prepararRoll } from './prepararRoll'

interface Props {
  onLer: (entrada: { texto?: string; pdfs?: string[]; imagens?: string[] }) => void
  emissor: Emissor
  onEmissor: (emissor: Emissor) => void
  carregando: boolean
}

const EXEMPLO = `OUSY - REF: VILA MARIANA

2.1 – Ilustrações Externas
1. Fachada noturna conceitual
2. Portaria de acesso

2.2 – Ilustrações Internas
1. Lobby

2.3 – Plantas Baixas
1. Implantação do térreo

Aprovado em: 30 de junho de 2026.`

export function RollEntrada({ onLer, emissor, onEmissor, carregando }: Props) {
  const [texto, setTexto] = useState('')
  const [anexos, setAnexos] = useState<{ pdfs: string[]; imagens: string[]; nomes: string[] }>(
    { pdfs: [], imagens: [], nomes: [] }
  )
  const [erro, setErro] = useState<string | null>(null)
  const [sobre, setSobre] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  async function receber(arquivos: File[]) {
    if (!arquivos.length) return
    setErro(null)
    try {
      const { pdfs, prints } = await prepararRoll(arquivos)
      if (!pdfs.length && !prints.length) {
        setErro('Manda o PDF do roll, ou um print dele.')
        return
      }
      setAnexos({
        pdfs: pdfs.map((p) => p.base64),
        imagens: prints.map((p) => p.dataUrl),
        nomes: [...pdfs.map((p) => p.nome), ...prints.map((p) => p.nome)],
      })
    } catch (e) {
      setErro(e instanceof PrintInvalido ? e.message : 'Não consegui ler esse arquivo.')
    }
  }

  const temAlgo = anexos.nomes.length > 0 || texto.trim().length > 0

  return (
    <div className="rounded-xl border border-gray-200 bg-[#F1F1F1] p-6 dark:border-gray-700 dark:bg-[#1A1A1A]">
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Manda o roll: o PDF, um print dele, ou a lista colada. Eu leio, separo em
        externas, internas, plantas e serviços, e comparo com a última versão que saiu
        desse empreendimento.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-[#1A1A2E] dark:text-white" htmlFor="roll-empresa">
          Empresa
        </label>
        <select
          id="roll-empresa"
          value={emissor}
          onChange={(e) => onEmissor(e.target.value as Emissor)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
        >
          {EMPRESAS.map((e) => (
            <option key={e.chave} value={e.chave}>{e.rotulo}</option>
          ))}
        </select>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          define o timbrado e o nome do arquivo (Roll_Flying, Roll_Rinno, Roll_NID)
        </span>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setSobre(true) }}
        onDragLeave={() => setSobre(false)}
        onDrop={(e) => {
          e.preventDefault()
          setSobre(false)
          receber(Array.from(e.dataTransfer.files ?? []))
        }}
        onClick={() => input.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && input.current?.click()}
        aria-label="Anexar o roll (PDF ou print)"
        className={cn(
          'mb-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg',
          'border-2 border-dashed p-6 text-center text-sm transition',
          sobre
            ? 'border-brand-purple bg-brand-purple/5 text-brand-purple'
            : 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400'
        )}
      >
        <FileUp className="h-5 w-5" />
        {anexos.nomes.length ? (
          <span className="font-medium text-[#1A1A2E] dark:text-white">
            {anexos.nomes.join(', ')}
          </span>
        ) : (
          <span>Solte aqui o PDF do roll (ou um print dele), ou clique para escolher</span>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="application/pdf,image/*"
        multiple
        className="hidden"
        aria-label="Arquivo do roll"
        onChange={(e) => receber(Array.from(e.target.files ?? []))}
      />

      <label className="mb-1 block text-sm font-medium text-[#1A1A2E] dark:text-white" htmlFor="roll-texto">
        Ou cole a lista
      </label>
      <textarea
        id="roll-texto"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={8}
        placeholder={EXEMPLO}
        className={cn(
          'w-full rounded-lg border border-gray-200 bg-white p-3 text-sm',
          'text-[#1A1A2E] placeholder:text-gray-400 focus:border-brand-purple focus:outline-none',
          'dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white'
        )}
      />

      {erro && (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">{erro}</p>
      )}

      <button
        onClick={() => onLer({ texto, pdfs: anexos.pdfs, imagens: anexos.imagens })}
        disabled={carregando || !temAlgo}
        className={cn(
          'mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-purple px-4 py-2',
          'text-sm font-semibold text-white hover:opacity-90',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        {carregando ? <SpinnerBotao /> : <ScanLine className="h-4 w-4" />}
        {carregando ? 'Lendo o roll…' : 'Ler o roll'}
      </button>
      <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
        Nada é gravado ainda — a lista aparece para você conferir.
      </span>
    </div>
  )
}
