import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { GlobalLeadsPagination } from '../GlobalLeadsPagination'

function renderPagination(currentPage: number, totalPages: number, onPageChange = jest.fn()) {
  return { onPageChange, ...render(
    <GlobalLeadsPagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  )}
}

describe('GlobalLeadsPagination', () => {
  describe('LUMEN-12: boundary states', () => {
    it('Prev button is disabled when currentPage === 1', () => {
      renderPagination(1, 5)
      expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
    })

    it('Next button is disabled when currentPage === totalPages', () => {
      renderPagination(5, 5)
      expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled()
    })

    it('both buttons are enabled when currentPage is between 1 and totalPages', () => {
      renderPagination(3, 5)
      expect(screen.getByRole('button', { name: 'Página anterior' })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: 'Próxima página' })).not.toBeDisabled()
    })

    it('Prev button has aria-label "Página anterior"', () => {
      renderPagination(2, 5)
      expect(screen.getByRole('button', { name: 'Página anterior' })).toBeInTheDocument()
    })

    it('Next button has aria-label "Próxima página"', () => {
      renderPagination(2, 5)
      expect(screen.getByRole('button', { name: 'Próxima página' })).toBeInTheDocument()
    })

    it('disabled Prev has aria-disabled="true"', () => {
      renderPagination(1, 5)
      expect(screen.getByRole('button', { name: 'Página anterior' })).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('LUMEN-12: page indicator', () => {
    it('shows "Página 3 de 10" text', () => {
      renderPagination(3, 10)
      expect(screen.getByText('Página 3 de 10')).toBeInTheDocument()
    })
  })

  describe('LUMEN-12: interactions', () => {
    it('clicking Prev calls onPageChange with currentPage - 1', () => {
      const { onPageChange } = renderPagination(3, 5)
      fireEvent.click(screen.getByRole('button', { name: 'Página anterior' }))
      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('clicking Next calls onPageChange with currentPage + 1', () => {
      const { onPageChange } = renderPagination(3, 5)
      fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }))
      expect(onPageChange).toHaveBeenCalledWith(4)
    })
  })
})
