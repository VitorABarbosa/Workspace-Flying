// Wave 0 stubs — GlobalLeadsTable implementation comes in Plan 04
// LUMEN-12: paginated leads table without job_id

describe('GlobalLeadsTable', () => {
  describe('LUMEN-12: fetch behavior', () => {
    it.todo('fetches /api/tools/lumen/leads without job_id param')
    it.todo('fetch URL includes city param when city is non-empty')
    it.todo('fetch URL includes segment param when segment is non-empty')
    it.todo('fetch URL includes min_score param when min_score > 0')
    it.todo('fetch URL includes created_after param when created_after is non-empty')
    it.todo('fetch URL always includes page and per_page=50')
    it.todo('re-fetches when filter params change')
    it.todo('re-fetches when page changes')
  })

  describe('LUMEN-12: loading state', () => {
    it.todo('shows 5 skeleton rows with 7 columns each during loading')
  })

  describe('LUMEN-12: empty state', () => {
    it.todo('shows "Nenhum lead encontrado" when data=[] and no filters active')
    it.todo('shows "Nenhum lead corresponde aos filtros selecionados" body text when data=[] with filters active')
    it.todo('shows empty DB message when data=[] and no filters — "O banco de leads está vazio. Execute uma busca para começar."')
  })

  describe('LUMEN-12: error state', () => {
    it.todo('shows "Erro ao carregar banco de leads" heading on fetch error')
    it.todo('"Tentar novamente" link triggers re-fetch')
  })

  describe('LUMEN-12: table content', () => {
    it.todo('renders column headers: Nome, Cidade, Segmento, Website, Telefone, Score, Coleta')
    it.todo('renders lead name, city, segment, website, phone in correct columns')
    it.todo('renders LeadScoreBadge for each lead row')
    it.todo('clicking a row calls onSelectLead with the lead object')
    it.todo('selected row has bg-brand-purple/10 class')
    it.todo('row responds to Enter key — calls onSelectLead')
    it.todo('row responds to Space key — calls onSelectLead')
  })
})
