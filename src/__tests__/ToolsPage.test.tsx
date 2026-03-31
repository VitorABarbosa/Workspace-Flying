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

  it.todo('importa AREAS de @/config/tools')
  it.todo('usa AreaCard para renderizar cada área (não ToolCard)')
  it.todo('não renderiza ToolCard diretamente na home')
  it.todo('usa grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')
  it.todo('aplica FadeIn com delay escalonado (index * 0.1)')
  it.todo('grid usa role="list" para acessibilidade')
  it.todo('eyebrow é "ÁREAS DISPONÍVEIS"')
})
