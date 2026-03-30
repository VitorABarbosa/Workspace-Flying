// Wave 0 stubs — GlobalLeadsFilters implementation comes in Plan 03
// LUMEN-11: filter panel with nuqs URL-backed state

describe('GlobalLeadsFilters', () => {
  describe('LUMEN-11: filter inputs', () => {
    it.todo('renders Cidade text input with placeholder "ex: São Paulo"')
    it.todo('renders Segmento select with "Todos os segmentos" as default option')
    it.todo('renders Segmento select with 5 segment options: Construtoras, Incorporadoras, Imobiliárias, Loteadoras, Administradoras de Condomínio')
    it.todo('renders Score mínimo number input with min=0 max=100')
    it.todo('renders Criado a partir de date input')
    it.todo('all filter inputs have explicit label associations via htmlFor/id')
  })

  describe('LUMEN-11: URL-backed filter state', () => {
    it.todo('city input onChange calls setFilters with { city, page: 1 } atomically')
    it.todo('segment select onChange calls setFilters with { segment, page: 1 } atomically')
    it.todo('min_score input onChange calls setFilters with { min_score, page: 1 } atomically')
    it.todo('created_after input onChange calls setFilters with { created_after, page: 1 } atomically')
    it.todo('changing any filter resets page to 1')
  })

  describe('LUMEN-11: clear filters button', () => {
    it.todo('"Limpar filtros" button is NOT visible when no filters are active')
    it.todo('"Limpar filtros" button IS visible when city filter is active')
    it.todo('"Limpar filtros" button IS visible when segment filter is active')
    it.todo('"Limpar filtros" button IS visible when min_score > 0')
    it.todo('"Limpar filtros" button IS visible when created_after is set')
    it.todo('"Limpar filtros" resets all filters and page to defaults atomically')
  })
})
