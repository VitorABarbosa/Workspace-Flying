// Wave 0 stubs — GlobalLeadsPagination implementation comes in Plan 04
// LUMEN-12: pagination controls

describe('GlobalLeadsPagination', () => {
  describe('LUMEN-12: boundary states', () => {
    it.todo('Prev button is disabled when currentPage === 1')
    it.todo('Next button is disabled when currentPage === totalPages')
    it.todo('both buttons are enabled when currentPage is between 1 and totalPages')
    it.todo('Prev button has aria-label "Página anterior"')
    it.todo('Next button has aria-label "Próxima página"')
    it.todo('disabled buttons have aria-disabled="true"')
  })

  describe('LUMEN-12: page indicator', () => {
    it.todo('shows "Página {N} de {total}" text')
  })

  describe('LUMEN-12: interactions', () => {
    it.todo('clicking Prev calls onPageChange with currentPage - 1')
    it.todo('clicking Next calls onPageChange with currentPage + 1')
  })
})
