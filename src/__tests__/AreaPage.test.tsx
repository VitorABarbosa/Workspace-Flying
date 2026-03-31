import fs from 'fs'
import path from 'path'

describe('AreaPage (slug dispatch)', () => {
  let source: string

  beforeAll(() => {
    source = fs.readFileSync(
      path.join(process.cwd(), 'src/app/tools/[slug]/page.tsx'),
      'utf-8'
    )
  })

  it('importa getAreaBySlug e getToolsByArea de @/config/tools', () => {
    expect(source).toContain('getAreaBySlug')
    expect(source).toContain('getToolsByArea')
    expect(source).toContain("from '@/config/tools'")
  })

  it('renderiza ToolCard para ferramentas da área (AREA-04)', () => {
    expect(source).toContain('<ToolCard')
  })

  it('exibe estado vazio "Nenhuma ferramenta disponível nesta área ainda" (AREA-05)', () => {
    expect(source).toContain('Nenhuma ferramenta disponível nesta área ainda')
  })

  it('ferramenta com múltiplas áreas: getToolsByArea retorna filtro por área (AREA-06)', () => {
    // getToolsByArea filters tools.filter(t => t.areas.includes(areaSlug))
    // This test verifies the dispatch uses getToolsByArea (not filtering manually)
    expect(source).toContain('getToolsByArea(area.slug)')
  })

  it('link de volta aponta para /tools (AREA-03 — navegação de retorno)', () => {
    expect(source).toContain('href="/tools"')
    expect(source).toContain('← Ferramentas')
  })

  it('chama notFound() quando slug não é tool nem área', () => {
    expect(source).toContain('notFound()')
  })

  it('usa grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 na área', () => {
    expect(source).toContain('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')
  })
})
