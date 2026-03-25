import fs from 'fs'
import path from 'path'

// Testamos o arquivo fonte diretamente para verificar o atributo defaultTheme
describe('Providers defaultTheme', () => {
  it('Providers.tsx contém defaultTheme="light" (não "dark")', async () => {
    // Importa o módulo e verifica via snapshot que ThemeProvider recebe defaultTheme="light"
    // Como next-themes está mockado, validamos via inspeção do arquivo fonte
    const providersPath = path.join(process.cwd(), 'src/components/layout/Providers.tsx')
    const content = fs.readFileSync(providersPath, 'utf-8')
    expect(content).toContain('defaultTheme="light"')
    expect(content).not.toContain('defaultTheme="dark"')
  })
})
