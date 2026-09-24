'use client'

import { Download, FileText, Pencil, Trash2 } from 'lucide-react'
import { rotuloDaEmpresa } from './empresas'
import type { RollListado } from './types'

interface Props {
  rolls: RollListado[]
  onAbrir: (id: number) => void
  onExcluir: (id: number) => void
}

/** As versões já geradas, da mais recente para a mais antiga. */
export function RollHistorico({ rolls, onAbrir, onExcluir }: Props) {
  if (!rolls.length) return null
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-[#F1F1F1] p-6 dark:border-gray-700 dark:bg-[#1A1A1A]">
      <p className="mb-3 text-sm font-medium text-[#1A1A2E] dark:text-white">Rolls já gerados</p>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <th className="py-2 pr-4 font-medium">Empresa</th>
            <th className="py-2 pr-4 font-medium">Cliente</th>
            <th className="py-2 pr-4 font-medium">Empreendimento</th>
            <th className="py-2 pr-4 font-medium">Arquivo</th>
            <th className="py-2 pr-4 font-medium">Imagens</th>
            <th className="py-2 pr-4 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rolls.map((r) => (
            <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">
                {rotuloDaEmpresa(r.emissor)}
              </td>
              <td className="py-2 pr-4 text-[#1A1A2E] dark:text-white">{r.cliente}</td>
              <td className="py-2 pr-4 text-[#1A1A2E] dark:text-white">{r.referencia ?? '—'}</td>
              <td className="py-2 pr-4 font-mono text-xs text-[#1A1A2E] dark:text-white">
                {r.nome_arquivo ?? `roll_${r.id}`}
              </td>
              <td className="py-2 pr-4 text-[#1A1A2E] dark:text-white">{r.imagens}</td>
              <td className="py-2 pr-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onAbrir(r.id)}
                    aria-label={`Abrir o roll ${r.id}`}
                    title="Abrir para mexer e gerar a versão seguinte"
                    className="text-brand-purple hover:opacity-80"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <a
                    href={`/api/tools/proposta${r.pdf}`}
                    aria-label={`Baixar PDF do roll ${r.id}`}
                    download
                    className="text-brand-purple hover:opacity-80"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <a
                    href={`/api/tools/proposta${r.download}`}
                    aria-label={`Baixar docx do roll ${r.id}`}
                    download
                    className="text-brand-purple hover:opacity-80"
                  >
                    <FileText className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => onExcluir(r.id)}
                    aria-label={`Excluir o roll ${r.id}`}
                    className="text-red-600 hover:opacity-80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
