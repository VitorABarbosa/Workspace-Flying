'use client'
import { useQueryStates, parseAsString, parseAsInteger } from 'nuqs'

export const SEGMENTS = [
  'Construtoras',
  'Incorporadoras',
  'Imobiliárias',
  'Loteadoras',
  'Administradoras de Condomínio',
] as const

export function useGlobalLeadsFilters() {
  return useQueryStates({
    city:          parseAsString.withDefault(''),
    segment:       parseAsString.withDefault(''),
    min_score:     parseAsInteger.withDefault(0),
    created_after: parseAsString.withDefault(''),
    page:          parseAsInteger.withDefault(1),
  })
}

export function GlobalLeadsFilters() {
  const [filters, setFilters] = useGlobalLeadsFilters()

  const hasActiveFilters =
    filters.city !== '' ||
    filters.segment !== '' ||
    filters.min_score > 0 ||
    filters.created_after !== ''

  function handleClearFilters() {
    void setFilters({ city: '', segment: '', min_score: 0, created_after: '', page: 1 })
  }

  const inputClasses =
    'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0A0A0A] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple'
  const labelClasses = 'text-xs text-gray-400 mb-1 block'

  return (
    <div className="bg-[#F1F1F1] dark:bg-[#1A1A1A] rounded-xl p-4 mb-4">
      <div className="flex flex-wrap gap-4 items-end">

        {/* City filter */}
        <div>
          <label htmlFor="filter-city" className={labelClasses}>Cidade</label>
          <input
            id="filter-city"
            type="text"
            value={filters.city}
            onChange={e => void setFilters({ city: e.target.value, page: 1 })}
            placeholder="ex: São Paulo"
            className={`${inputClasses} w-40`}
          />
        </div>

        {/* Segment filter */}
        <div>
          <label htmlFor="filter-segment" className={labelClasses}>Segmento</label>
          <select
            id="filter-segment"
            value={filters.segment}
            onChange={e => void setFilters({ segment: e.target.value, page: 1 })}
            className={`${inputClasses} w-48`}
          >
            <option value="">Todos os segmentos</option>
            {SEGMENTS.map(seg => (
              <option key={seg} value={seg}>{seg}</option>
            ))}
          </select>
        </div>

        {/* Min score filter */}
        <div>
          <label htmlFor="filter-min-score" className={labelClasses}>Score mínimo</label>
          <input
            id="filter-min-score"
            type="number"
            min={0}
            max={100}
            value={filters.min_score === 0 ? '' : filters.min_score}
            onChange={e => {
              const val = e.target.value === '' ? 0 : Number(e.target.value)
              void setFilters({ min_score: val, page: 1 })
            }}
            placeholder="0"
            className={`${inputClasses} w-24`}
          />
        </div>

        {/* Created after filter */}
        <div>
          <label htmlFor="filter-created-after" className={labelClasses}>Criado a partir de</label>
          <input
            id="filter-created-after"
            type="date"
            value={filters.created_after}
            onChange={e => void setFilters({ created_after: e.target.value, page: 1 })}
            className={`${inputClasses} w-44`}
          />
        </div>

        {/* Clear filters button — only visible when any filter is active */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[44px] flex items-end pb-3"
          >
            Limpar filtros
          </button>
        )}

      </div>
    </div>
  )
}
