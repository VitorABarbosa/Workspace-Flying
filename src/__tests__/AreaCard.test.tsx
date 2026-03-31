import { render, screen } from '@testing-library/react'
import { AreaCard } from '@/components/tools/AreaCard'
import type { Area } from '@/config/tools'

const testArea: Area = {
  slug: 'comercial',
  name: 'COMERCIAL',
}

describe('AreaCard', () => {
  it.todo('renderiza o nome da área')
  it.todo('renderiza contagem de ferramentas (toolCount > 1)')
  it.todo('renderiza contagem singular (toolCount === 1)')
  it.todo('toolCount === 0 exibe "Nenhuma ferramenta disponível"')
  it.todo('link aponta para /tools/{area.slug}')
  it.todo('tem focus-visible ring com brand-purple')
})
