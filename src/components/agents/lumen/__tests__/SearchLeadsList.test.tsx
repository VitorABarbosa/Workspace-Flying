// SearchLeadsList.tsx does not exist yet — stubs only.
// Run: npx jest --testPathPattern="SearchLeadsList" --passWithNoTests

describe('SearchLeadsList', () => {
  describe('LUMEN-06: job_id isolation', () => {
    it.todo('aceita jobId como prop obrigatória (TypeScript: sem ? no tipo)')
    it.todo('faz fetch para /api/tools/lumen/leads?job_id={encodeURIComponent(jobId)} ao montar')
    it.todo('não faz fetch se jobId for string vazia')
    it.todo('exibe 5 linhas skeleton durante carregamento (loading=true)')
    it.todo('exibe estado empty quando leads retornados = []')
    it.todo('exibe estado error quando fetch retorna HTTP 5xx')
    it.todo('botão "Tentar novamente" no estado error re-dispara o fetch')
  })

  describe('LUMEN-07: colunas da tabela', () => {
    it.todo('renderiza coluna Nome com lead.name')
    it.todo('renderiza coluna Cidade com lead.city (ou em dash se vazio)')
    it.todo('renderiza coluna Segmento com lead.segment (ou em dash se vazio)')
    it.todo('renderiza coluna Website como <a> com ExternalLink icon ou em dash se vazio')
    it.todo('renderiza coluna Telefone como texto ou em dash se vazio')
    it.todo('renderiza coluna Score com componente LeadScoreBadge')
    it.todo('renderiza coluna Coleta com label de scraping_status')
    it.todo('linha clicável chama onSelectLead(lead) ao clicar')
    it.todo('linha selecionada recebe bg-brand-purple/10 quando lead.id === selectedLeadId')
    it.todo('linha responde a Enter e Space via onKeyDown para acessibilidade')
  })
})
