'use client'
import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'

const SEGMENTS = [
  'Construtoras',
  'Incorporadoras',
  'Imobiliárias',
  'Loteadoras',
  'Administradoras de Condomínio',
] as const

interface FormErrors {
  city?: string
  segments?: string
}

interface LumenSearchFormValues {
  city: string
  segments: string[]
  customQuery: string
}

interface LumenSearchFormProps {
  onSubmit: (values: LumenSearchFormValues) => void
  disabled?: boolean
  isSubmitting?: boolean
}

function validate(city: string, segments: string[]): FormErrors {
  const errors: FormErrors = {}
  if (!city.trim()) errors.city = 'Cidade é obrigatória'
  if (segments.length === 0) errors.segments = 'Selecione ao menos um segmento'
  return errors
}

export function LumenSearchForm({ onSubmit, disabled = false, isSubmitting = false }: LumenSearchFormProps) {
  const [city, setCity] = useState('')
  const [segments, setSegments] = useState<string[]>([])
  const [customQuery, setCustomQuery] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  function handleSegmentToggle(segment: string) {
    setSegments((prev) =>
      prev.includes(segment) ? prev.filter((s) => s !== segment) : [...prev, segment]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(city, segments)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSubmit({ city, segments, customQuery })
  }

  const inputClasses =
    'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0A0A0A] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-purple'

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-[#F1F1F1] dark:bg-[#1A1A1A] rounded-xl p-6 max-w-[600px] mx-auto${disabled ? ' opacity-60 cursor-not-allowed' : ''}`}
    >
      {/* Cidade */}
      <div className="mb-5">
        <label className="block text-sm mb-1" htmlFor="lumen-city">
          Cidade
        </label>
        <input
          id="lumen-city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="São Paulo, SP"
          disabled={disabled || isSubmitting}
          className={inputClasses}
        />
        {errors.city && (
          <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
            <AlertCircle size={16} aria-hidden="true" />
            {errors.city}
          </p>
        )}
      </div>

      {/* Segmentos */}
      <div className="mb-5">
        <p className="text-sm mb-0.5">Segmentos</p>
        <p className="text-xs text-gray-400 mb-2">Selecione ao menos um</p>
        <div className="flex flex-col gap-2">
          {SEGMENTS.map((segment) => (
            <label
              key={segment}
              className="flex items-center gap-2 text-base py-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={segments.includes(segment)}
                onChange={() => handleSegmentToggle(segment)}
                disabled={disabled || isSubmitting}
                className="accent-brand-purple"
              />
              {segment}
            </label>
          ))}
        </div>
        {errors.segments && (
          <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
            <AlertCircle size={16} aria-hidden="true" />
            {errors.segments}
          </p>
        )}
      </div>

      {/* Query livre */}
      <div className="mb-5">
        <label className="block text-sm mb-0.5" htmlFor="lumen-query">
          Query personalizada
        </label>
        <p className="text-xs text-gray-400 mb-1">Opcional — refine a busca com termos adicionais</p>
        <input
          id="lumen-query"
          type="text"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          placeholder="ex: construtoras sustentáveis certificadas"
          disabled={disabled || isSubmitting}
          className={inputClasses}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className="w-full mt-6 bg-brand-purple text-white rounded-xl px-6 py-3 font-bold text-base min-h-[44px] hover:bg-brand-purple/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Iniciando...
          </>
        ) : (
          'Iniciar busca'
        )}
      </button>
    </form>
  )
}
