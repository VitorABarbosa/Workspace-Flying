import fs from 'fs'
import path from 'path'

// Area page is inline in [slug]/page.tsx — test via fs.readFileSync pattern
describe('AreaPage (slug dispatch)', () => {
  let source: string

  beforeAll(() => {
    source = fs.readFileSync(
      path.join(process.cwd(), 'src/app/tools/[slug]/page.tsx'),
      'utf-8'
    )
  })

  it.todo('importa getAreaBySlug e getToolsByArea de @/config/tools')
  it.todo('renderiza ToolCard para ferramentas da área (AREA-04)')
  it.todo('exibe estado vazio "Nenhuma ferramenta disponível nesta área ainda" quando área não tem ferramentas (AREA-05)')
  it.todo('ferramenta com múltiplas áreas aparece em todas as suas áreas (AREA-06)')
  it.todo('link de volta "← Ferramentas" aponta para /tools')
  it.todo('chama notFound() quando slug não é tool nem área')
})
