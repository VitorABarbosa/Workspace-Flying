'use client'
import { useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

interface AddressFormProps {
  onSubmit: (address: string) => void
  isSubmitting: boolean
  submitError?: string | null
}

export function AddressForm({ onSubmit, isSubmitting, submitError }: AddressFormProps) {
  const [address, setAddress] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!address.trim()) {
      setValidationError('Insira o endereço antes de continuar.')
      return
    }
    setValidationError(null)
    onSubmit(address.trim())
  }

  return (
    <div className="bg-[#F1F1F1] dark:bg-[#1A1A1A] rounded-xl p-6 max-w-[600px] mx-auto">
      <h2 className="text-[22px] font-bold leading-tight text-[#1A1A2E] dark:text-white">
        Endereço necessário
      </h2>
      <p className="text-base text-gray-500 dark:text-gray-400 mt-1 mb-6">
        O agente precisa do endereço completo do empreendimento para continuar a análise.
      </p>

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="address-input"
          className="block text-sm mb-1 text-[#1A1A2E] dark:text-white"
        >
          Endereço do empreendimento
        </label>
        <textarea
          id="address-input"
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ex: Av. Paulista, 1000, São Paulo – SP"
          className={cn(
            'w-full rounded-lg border border-gray-200 dark:border-gray-700',
            'bg-white dark:bg-[#0A0A0A] px-4 py-3 text-base resize-y',
            'focus:outline-none focus:ring-2 focus:ring-brand-purple',
          )}
        />

        {(validationError || submitError) && (
          <div className="flex items-center gap-2 mt-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-500">{validationError ?? submitError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="mt-4 bg-brand-purple text-white rounded-xl px-6 py-3 font-bold text-base min-h-[44px] hover:bg-brand-purple/90 transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Enviando...
            </>
          ) : (
            'Confirmar endereço'
          )}
        </button>
      </form>
    </div>
  )
}
