import React from 'react'

// LumenAgent.tsx does not exist yet — stubs only.
// Run: npx jest --testPathPatterns="LumenAgent" --passWithNoTests

describe('LumenAgent', () => {
  describe('LUMEN-01: catalog registration', () => {
    it.todo('LUMEN entry exists in src/config/tools.ts with id="lumen", status="active", icon="Building2"')
    it.todo('LumenAgent is registered in AGENT_COMPONENTS in src/app/tools/[slug]/page.tsx')
  })

  describe('LUMEN-03: job creation and polling orchestration', () => {
    it.todo('renderiza LumenSearchForm no estado idle')
    it.todo('chama useJobCreate com endpoint de busca LUMEN ao montar')
    it.todo('chama useJobPolling com jobId quando jobId é definido')
    it.todo('formulário fica desabilitado após submit (view !== idle)')
    it.todo('exibe spinner "Iniciando busca..." durante createStatus="creating"')
    it.todo('exibe LumenJobProgress quando view="searching"')
  })

  describe('LUMEN-05: cancel flow', () => {
    it.todo('handleCancel chama POST /search/{jobId}/cancel')
    it.todo('não chama jobCreate.reset() diretamente no handleCancel')
    it.todo('view transiciona para "cancelled" quando jobStatus.state="cancelled"')
    it.todo('formulário re-habilita após view="cancelled"')
    it.todo('exibe painel "Busca cancelada" com botão "Nova busca"')
    it.todo('exibe toast de erro "Falha ao cancelar busca" quando POST cancel retorna erro')
  })

  describe('LUMEN-04: counter preservation', () => {
    it.todo('finalCounts preserva found/new/duplicates após job terminal (não reseta para 0)')
    it.todo('handleNewSearch limpa finalCounts e re-habilita formulário')
  })

  describe('estado completed (Phase 4 placeholder)', () => {
    it.todo('exibe painel "Busca concluída" quando view="completed"')
    it.todo('exibe finalCounts no painel de conclusão')
    it.todo('botão "Nova busca" reseta o estado')
  })

  describe('estado failed', () => {
    it.todo('exibe painel "Falha na busca" com mensagem de erro')
    it.todo('botão "Tentar novamente" re-usa mesmos valores do formulário')
  })
})
