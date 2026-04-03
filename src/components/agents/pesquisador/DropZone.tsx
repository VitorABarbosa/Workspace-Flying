'use client'
import { useRef, useState } from 'react'
import { Upload, FileText, X, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

interface DropZoneProps {
  onFileAccepted: (file: File) => void
  onSubmit: (file: File) => void
  isUploading?: boolean
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DropZone({ onFileAccepted, onSubmit, isUploading = false }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  function validateAndAccept(candidate: File) {
    if (!candidate.type.includes('pdf') && !candidate.name.endsWith('.pdf')) {
      setValidationError('Apenas arquivos PDF são aceitos.')
      return
    }
    if (candidate.size > 35 * 1024 * 1024) {
      setValidationError('O arquivo deve ter no máximo 35 MB.')
      return
    }
    setValidationError(null)
    setFile(candidate)
    onFileAccepted(candidate)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (picked) validateAndAccept(picked)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) validateAndAccept(dropped)
  }

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault()
    setFile(null)
    setValidationError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const containerClasses = cn(
    'rounded-xl border-2 border-dashed p-12 flex flex-col items-center gap-4 text-center transition-colors duration-200 cursor-pointer',
    isDragOver
      ? 'border-brand-purple bg-brand-purple/5'
      : file
        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
        : 'border-gray-200 dark:border-gray-700 bg-[#F1F1F1] dark:bg-[#1A1A1A]',
  )

  return (
    <div>
      <label
        className={containerClasses}
        onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={handleChange}
        />
        {file ? (
          <div className="flex items-center gap-3 w-full justify-center">
            <FileText size={24} className="text-brand-purple flex-shrink-0" />
            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
            <span className="text-sm text-gray-500">{formatBytes(file.size)}</span>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remover arquivo"
              className="p-2 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] flex items-center"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={40} className="text-brand-purple" />
            <p className="text-base">Arraste o PDF aqui</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">ou clique para selecionar</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">PDF · máximo 35 MB</p>
          </>
        )}
      </label>

      {validationError && (
        <div className="flex items-center gap-2 mt-2">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-500">{validationError}</span>
        </div>
      )}

      {file && (
        <button
          type="button"
          onClick={() => onSubmit(file)}
          disabled={isUploading}
          aria-busy={isUploading}
          className="mt-4 w-full sm:w-auto bg-brand-purple text-white rounded-xl px-6 py-3 font-bold text-base min-h-[44px] hover:bg-brand-purple/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Enviando...
            </>
          ) : (
            'Enviar PDF'
          )}
        </button>
      )}
    </div>
  )
}
