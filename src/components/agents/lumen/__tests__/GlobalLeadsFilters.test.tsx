import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing'
import { GlobalLeadsFilters, SEGMENTS } from '../GlobalLeadsFilters'

function renderFilters(searchParams: Record<string, string> = {}) {
  return render(<GlobalLeadsFilters />, {
    wrapper: withNuqsTestingAdapter({ searchParams }),
  })
}

describe('GlobalLeadsFilters', () => {
  describe('LUMEN-11: filter inputs', () => {
    it('renders Cidade text input with placeholder "ex: São Paulo"', () => {
      renderFilters()
      const input = screen.getByPlaceholderText('ex: São Paulo')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('renders Segmento select with "Todos os segmentos" as default option', () => {
      renderFilters()
      const select = screen.getByRole('combobox', { name: /segmento/i })
      expect(select).toBeInTheDocument()
      expect(screen.getByText('Todos os segmentos')).toBeInTheDocument()
    })

    it('renders Segmento select with all 5 segment options', () => {
      renderFilters()
      SEGMENTS.forEach(seg => {
        expect(screen.getByRole('option', { name: seg })).toBeInTheDocument()
      })
    })

    it('renders Score mínimo number input with min=0 max=100', () => {
      renderFilters()
      const input = screen.getByLabelText('Score mínimo')
      expect(input).toHaveAttribute('type', 'number')
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('max', '100')
    })

    it('renders Criado a partir de date input', () => {
      renderFilters()
      const input = screen.getByLabelText('Criado a partir de')
      expect(input).toHaveAttribute('type', 'date')
    })

    it('all filter inputs have explicit label associations via htmlFor/id', () => {
      renderFilters()
      expect(screen.getByLabelText('Cidade')).toBeInTheDocument()
      expect(screen.getByLabelText('Segmento')).toBeInTheDocument()
      expect(screen.getByLabelText('Score mínimo')).toBeInTheDocument()
      expect(screen.getByLabelText('Criado a partir de')).toBeInTheDocument()
    })
  })

  describe('LUMEN-11: URL-backed filter state', () => {
    it('city input reflects value from URL params', () => {
      renderFilters({ city: 'Curitiba' })
      expect(screen.getByLabelText('Cidade')).toHaveValue('Curitiba')
    })

    it('segment select reflects value from URL params', () => {
      renderFilters({ segment: 'Construtoras' })
      expect(screen.getByLabelText('Segmento')).toHaveValue('Construtoras')
    })

    it('city input onChange fires setFilters (input value updates)', () => {
      renderFilters()
      const cityInput = screen.getByLabelText('Cidade')
      fireEvent.change(cityInput, { target: { value: 'São Paulo' } })
      expect(cityInput).toHaveValue('São Paulo')
    })

    it('segment select onChange fires setFilters (select value updates)', () => {
      renderFilters()
      const segSelect = screen.getByLabelText('Segmento')
      fireEvent.change(segSelect, { target: { value: 'Incorporadoras' } })
      expect(segSelect).toHaveValue('Incorporadoras')
    })

    it('min_score input onChange fires setFilters (input value updates)', () => {
      renderFilters()
      const scoreInput = screen.getByLabelText('Score mínimo')
      fireEvent.change(scoreInput, { target: { value: '70' } })
      expect(scoreInput).toHaveValue(70)
    })

    it('created_after input onChange fires setFilters (input value updates)', () => {
      renderFilters()
      const dateInput = screen.getByLabelText('Criado a partir de')
      fireEvent.change(dateInput, { target: { value: '2026-01-01' } })
      expect(dateInput).toHaveValue('2026-01-01')
    })
  })

  describe('LUMEN-11: clear filters button', () => {
    it('"Limpar filtros" button is NOT visible when no filters are active', () => {
      renderFilters()
      expect(screen.queryByText('Limpar filtros')).not.toBeInTheDocument()
    })

    it('"Limpar filtros" button IS visible when city filter is active', () => {
      renderFilters({ city: 'SP' })
      expect(screen.getByText('Limpar filtros')).toBeInTheDocument()
    })

    it('"Limpar filtros" button IS visible when segment filter is active', () => {
      renderFilters({ segment: 'Construtoras' })
      expect(screen.getByText('Limpar filtros')).toBeInTheDocument()
    })

    it('"Limpar filtros" button IS visible when min_score > 0', () => {
      renderFilters({ min_score: '50' })
      expect(screen.getByText('Limpar filtros')).toBeInTheDocument()
    })

    it('"Limpar filtros" button IS visible when created_after is set', () => {
      renderFilters({ created_after: '2026-01-01' })
      expect(screen.getByText('Limpar filtros')).toBeInTheDocument()
    })

    it('"Limpar filtros" resets all filters — city input clears', () => {
      renderFilters({ city: 'SP', segment: 'Construtoras' })
      fireEvent.click(screen.getByText('Limpar filtros'))
      expect(screen.getByLabelText('Cidade')).toHaveValue('')
      expect(screen.getByLabelText('Segmento')).toHaveValue('')
    })

    it('"Limpar filtros" disappears after clearing all filters', () => {
      renderFilters({ city: 'SP' })
      fireEvent.click(screen.getByText('Limpar filtros'))
      expect(screen.queryByText('Limpar filtros')).not.toBeInTheDocument()
    })
  })
})
