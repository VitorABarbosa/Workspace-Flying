import fs from 'fs'
import path from 'path'

// Server Component — testar via fs.readFileSync conforme padrão do projeto
// (evita problemas de contexto SSR no jsdom)

describe('ToolsPage', () => {
  let source: string

  beforeAll(() => {
    source = fs.readFileSync(
      path.join(process.cwd(), 'src/app/tools/page.tsx'),
      'utf-8'
    )
  })

  it('importa tools de @/config/tools', () => {
    expect(source).toContain("from '@/config/tools'")
  })

  it('usa ToolCard para renderizar cada ferramenta', () => {
    expect(source).toContain('<ToolCard')
  })

  it('usa grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', () => {
    expect(source).toContain('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')
  })

  it('aplica FadeIn com delay escalonado (index * 0.1)', () => {
    expect(source).toContain('index * 0.1')
  })

  it('tem estado vazio quando tools.length === 0', () => {
    expect(source).toContain('Ferramentas em preparação')
  })

  it('grid usa role="list" para acessibilidade', () => {
    expect(source).toContain('role="list"')
  })
})
