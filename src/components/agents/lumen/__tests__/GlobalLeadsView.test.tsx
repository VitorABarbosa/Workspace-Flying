// Wave 0 stubs — GlobalLeadsView implementation comes in Plan 05
// LUMEN-10: tab switcher delivers GlobalLeadsView only on explicit user action
// LUMEN-13: export link builds href from active nuqs filter params

describe('GlobalLeadsView', () => {
  describe('LUMEN-10: isolated tab access', () => {
    it.todo('mounts GlobalLeadsView only when "Banco de Leads" tab is active')
    it.todo('does NOT mount GlobalLeadsView on job completion — requires explicit tab click')
  })

  describe('LUMEN-13: export link', () => {
    it.todo('export link href contains format=xlsx')
    it.todo('export link href includes city param when city filter is active')
    it.todo('export link href includes segment param when segment filter is active')
    it.todo('export link href includes min_score param only when min_score > 0')
    it.todo('export link href omits min_score when value is 0')
    it.todo('export link href includes created_after param when date filter is active')
    it.todo('export link has aria-label "Exportar leads do banco global com filtros aplicados como XLSX"')
  })
})
