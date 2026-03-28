// LumenJobProgress.tsx does not exist yet — stubs only.
// Run: npx jest --testPathPattern="LumenJobProgress" --passWithNoTests

describe('LumenJobProgress', () => {
  describe('LUMEN-04: progress bar', () => {
    it.todo('renderiza barra de progresso com largura baseada em progress_pct')
    it.todo('exibe "0%" quando progress_pct é undefined')
    it.todo('exibe a porcentagem numérica ao lado da barra (ex: "42%")')
    it.todo('barra tem role="progressbar" com aria-valuenow, aria-valuemin=0, aria-valuemax=100')
  })

  describe('LUMEN-04: live counters', () => {
    it.todo('exibe contador Encontrados com valor de jobStatus.found')
    it.todo('exibe contador Novos com valor de jobStatus.new')
    it.todo('exibe contador Duplicados com valor de jobStatus.duplicates')
    it.todo('exibe "0" quando found/new/duplicates são undefined')
    it.todo('cada valor de contador tem aria-live="polite" e aria-atomic="true"')
  })

  describe('LUMEN-04: elapsed timer', () => {
    it.todo('exibe "Tempo decorrido: {elapsed}" quando elapsedSeconds > 0')
    it.todo('não exibe timer quando elapsedSeconds === 0')
  })

  describe('LUMEN-05: cancel button', () => {
    it.todo('renderiza botão "Cancelar busca" quando isCancelling=false')
    it.todo('renderiza "Cancelando..." com spinner quando isCancelling=true')
    it.todo('botão fica disabled quando isCancelling=true')
    it.todo('chama onCancel ao clicar no botão de cancelamento')
    it.todo('botão de cancel tem min-h-[44px] para touch target')
  })
})
