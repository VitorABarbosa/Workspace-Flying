// LeadDetailPanel.tsx does not exist yet — stubs only.
// Run: npx jest --testPathPattern="LeadDetailPanel" --passWithNoTests

describe('LeadDetailPanel', () => {
  describe('LUMEN-08: slide-over detail panel', () => {
    it.todo('renderiza null quando lead prop é null')
    it.todo('renderiza painel quando lead prop é não-null')
    it.todo('exibe lead.name no header do painel')
    it.todo('exibe "{city} · {segment}" na linha de metadados')
    it.todo('exibe LeadScoreBadge com lead.score na seção Score')
    it.todo('renderiza score_breakdown como lista <dl> de key:value quando presente')
    it.todo('renderiza seção "Contatos Apollo" quando apollo_contacts é array não-vazio')
    it.todo('omite seção "Contatos Apollo" quando apollo_contacts está vazio ou ausente')
    it.todo('renderiza seção "Keywords Detectadas" quando keywords é array não-vazio')
    it.todo('omite seção "Keywords Detectadas" quando keywords está vazio ou ausente')
    it.todo('renderiza website como <a> com ExternalLink icon no footer quando presente')
    it.todo('renderiza telefone no footer quando presente')
    it.todo('chama onClose() ao pressionar Escape')
    it.todo('chama onClose() ao clicar no overlay')
    it.todo('chama onClose() ao clicar no botão X')
    it.todo('aplica document.body.style.overflow = "hidden" ao montar')
    it.todo('restaura document.body.style.overflow ao desmontar')
    it.todo('botão X tem aria-label="Fechar painel"')
    it.todo('painel aside tem role="dialog" e aria-modal="true"')
  })
})
