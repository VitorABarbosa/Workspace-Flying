'use client'
import { useState } from 'react'
import { Download, FileDown, Copy, Check } from 'lucide-react'
import { MarkdownOutput } from '@/components/tools/MarkdownOutput'

interface ReportViewProps {
  markdown: string
  jobId: string
  apiBase: string
  onNewAnalysis: () => void
}

export function ReportView({ markdown, jobId, apiBase, onNewAnalysis }: ReportViewProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex justify-end gap-3 mb-6">
        <a
          href={`${apiBase}/jobs/${jobId}/report/download`}
          download
          className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm font-bold text-[#1A1A2E] dark:text-white hover:border-brand-purple/50 transition-colors min-h-[44px]"
        >
          <Download size={16} aria-hidden="true" />
          Baixar .md
        </a>

        <a
          href={`${apiBase}/jobs/${jobId}/report/download/pdf`}
          download
          className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm font-bold text-[#1A1A2E] dark:text-white hover:border-brand-purple/50 transition-colors min-h-[44px]"
        >
          <FileDown size={16} aria-hidden="true" />
          Baixar PDF
        </a>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Conteúdo copiado para a área de transferência' : undefined}
          className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm font-bold text-[#1A1A2E] dark:text-white hover:border-brand-purple/50 transition-colors min-h-[44px]"
        >
          {copied ? (
            <>
              <Check size={16} className="text-green-600" aria-hidden="true" />
              Copiado!
            </>
          ) : (
            <>
              <Copy size={16} aria-hidden="true" />
              Copiar
            </>
          )}
        </button>
      </div>

      <MarkdownOutput content={markdown} />

      <div className="mt-6">
        <button
          type="button"
          onClick={onNewAnalysis}
          className="text-sm text-brand-purple hover:opacity-80 transition-opacity"
        >
          ← Fazer nova análise
        </button>
      </div>
    </div>
  )
}
