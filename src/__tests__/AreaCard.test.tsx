import { render, screen } from '@testing-library/react'
import { AreaCard } from '@/components/tools/AreaCard'
import type { Area } from '@/config/tools'

// Mock next/link — same pattern as ToolCard.test.tsx
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

const testArea: Area = {
  slug: 'comercial',
  name: 'COMERCIAL',
}

describe('AreaCard', () => {
  it('renderiza o nome da área', () => {
    render(<AreaCard area={testArea} toolCount={2} />)
    expect(screen.getByText('COMERCIAL')).toBeInTheDocument()
  })

  it('renderiza contagem plural de ferramentas (toolCount > 1)', () => {
    render(<AreaCard area={testArea} toolCount={2} />)
    expect(screen.getByText('2 ferramentas disponíveis')).toBeInTheDocument()
  })

  it('renderiza contagem singular (toolCount === 1)', () => {
    render(<AreaCard area={testArea} toolCount={1} />)
    expect(screen.getByText('1 ferramenta disponível')).toBeInTheDocument()
  })

  it('toolCount === 0 exibe "Nenhuma ferramenta disponível"', () => {
    render(<AreaCard area={testArea} toolCount={0} />)
    expect(screen.getByText('Nenhuma ferramenta disponível')).toBeInTheDocument()
  })

  it('link aponta para /tools/comercial', () => {
    render(<AreaCard area={testArea} toolCount={2} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/tools/comercial')
  })

  it('tem focus-visible ring com brand-purple', () => {
    render(<AreaCard area={testArea} toolCount={2} />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('focus-visible:ring-brand-purple')
  })
})
