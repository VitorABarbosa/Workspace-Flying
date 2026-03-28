// LumenSearchForm.tsx does not exist yet — stubs only.
// Run: npx jest --testPathPattern="LumenSearchForm" --passWithNoTests

describe('LumenSearchForm', () => {
  describe('LUMEN-02: submit-time validation', () => {
    it.todo('mostra erro "Cidade é obrigatória" ao submeter com cidade vazia')
    it.todo('mostra erro "Selecione ao menos um segmento" ao submeter sem segmentos selecionados')
    it.todo('não mostra erros ao carregar o formulário (sem interação)')
    it.todo('não mostra erros ao digitar na cidade sem submeter (onChange não valida)')
    it.todo('limpa os erros ao re-submeter com dados válidos')
    it.todo('chama onSubmit com { city, segments, customQuery } quando formulário é válido')
    it.todo('renderiza 5 checkboxes de segmento: Construtoras, Incorporadoras, Imobiliárias, Loteadoras, Administradoras de Condomínio')
  })

  describe('LUMEN-02: disabled state', () => {
    it.todo('todos os inputs ficam disabled quando prop disabled=true')
    it.todo('botão submit fica disabled quando prop disabled=true')
    it.todo('container do formulário recebe opacity-60 quando disabled=true')
  })

  describe('LUMEN-02: form fields', () => {
    it.todo('input de cidade tem placeholder "São Paulo, SP"')
    it.todo('botão submit exibe "Iniciar busca" no estado idle')
    it.todo('botão submit exibe "Iniciando..." com spinner quando isSubmitting=true')
  })
})
