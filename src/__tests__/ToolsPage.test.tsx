import fs from 'fs'
import path from 'path'

// Server Component — testar via fs.readFileSync conforme padrão do projeto
describe('ToolsPage (area hub)', () => {
  let source: string

  beforeAll(() => {
    source = fs.readFileSync(
      path.join(process.cwd(), 'src/app/tools/page.tsx'),
      'utf-8'
    )
  })

  it('importa AREAS de @/config/tools', () => {
    expect(source).toContain('AREAS')
    expect(source).toContain("from '@/config/tools'")
  })

  it('usa AreaCard para renderizar cada área (não ToolCard)', () => {
    expect(source).toContain('<AreaCard')
  })

  it('não renderiza ToolCard diretamente na home', () => {
    expect(source).not.toContain('<ToolCard')
  })

  it('usa grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', () => {
    expect(source).toContain('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')
  })

  it('aplica FadeIn com delay escalonado (index * 0.1)', () => {
    expect(source).toContain('index * 0.1')
  })

  it('grid usa role="list" para acessibilidade', () => {
    expect(source).toContain('role="list"')
  })

  it('eyebrow é "ÁREAS DISPONÍVEIS"', () => {
    expect(source).toContain('ÁREAS DISPONÍVEIS')
  })
})
