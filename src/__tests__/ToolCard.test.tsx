import { render, screen } from '@testing-library/react'
import { ToolCard } from '@/components/tools/ToolCard'
import type { Tool } from '@/config/tools'

const activeTool: Tool = {
  id: 'test-tool',
  name: 'Ferramenta Teste',
  description: 'Descrição da ferramenta de teste',
  status: 'active',
  href: '/tools/test-tool',
  areas: [],
}

const comingSoonTool: Tool = {
  ...activeTool,
  status: 'coming-soon',
}

describe('ToolCard', () => {
  describe('status: active', () => {
    it('renderiza o nome da ferramenta', () => {
      render(<ToolCard tool={activeTool} />)
      expect(screen.getByText('Ferramenta Teste')).toBeInTheDocument()
    })

    it('renderiza a descrição da ferramenta', () => {
      render(<ToolCard tool={activeTool} />)
      expect(screen.getByText('Descrição da ferramenta de teste')).toBeInTheDocument()
    })

    it('é clicável — renderiza um link <a> com href correto', () => {
      render(<ToolCard tool={activeTool} />)
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/tools/test-tool')
    })

    it('não tem classe opacity-50', () => {
      const { container } = render(<ToolCard tool={activeTool} />)
      expect(container.firstChild).not.toHaveClass('opacity-50')
    })

    it('não renderiza badge "Em breve"', () => {
      render(<ToolCard tool={activeTool} />)
      expect(screen.queryByText('Em breve')).not.toBeInTheDocument()
    })

    it('tem tabIndex padrão (não -1)', () => {
      const { container } = render(<ToolCard tool={activeTool} />)
      const link = container.querySelector('a')
      expect(link).not.toHaveAttribute('tabIndex', '-1')
    })
  })

  describe('status: coming-soon', () => {
    it('renderiza badge "Em breve"', () => {
      render(<ToolCard tool={comingSoonTool} />)
      expect(screen.getByText('Em breve')).toBeInTheDocument()
    })

    it('tem classe opacity-50', () => {
      const { container } = render(<ToolCard tool={comingSoonTool} />)
      // opacity-50 está no div interno do card
      const cardDiv = container.querySelector('.opacity-50')
      expect(cardDiv).toBeInTheDocument()
    })

    it('tem cursor-not-allowed', () => {
      const { container } = render(<ToolCard tool={comingSoonTool} />)
      const el = container.querySelector('.cursor-not-allowed')
      expect(el).toBeInTheDocument()
    })

    it('tem pointer-events-none', () => {
      const { container } = render(<ToolCard tool={comingSoonTool} />)
      const el = container.querySelector('.pointer-events-none')
      expect(el).toBeInTheDocument()
    })

    it('não renderiza link clicável (wrapper é div, não a)', () => {
      render(<ToolCard tool={comingSoonTool} />)
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('tem aria-disabled="true"', () => {
      const { container } = render(<ToolCard tool={comingSoonTool} />)
      const el = container.querySelector('[aria-disabled="true"]')
      expect(el).toBeInTheDocument()
    })

    it('tem aria-label descrevendo a ferramenta como "Em breve"', () => {
      const { container } = render(<ToolCard tool={comingSoonTool} />)
      const el = container.querySelector('[aria-label]')
      expect(el?.getAttribute('aria-label')).toContain('Em breve')
    })
  })

  describe('acessibilidade', () => {
    it('card ativo é focalizável via teclado', () => {
      render(<ToolCard tool={activeTool} />)
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
    })

    it('card coming-soon não é focalizável (tabIndex=-1)', () => {
      const { container } = render(<ToolCard tool={comingSoonTool} />)
      const el = container.querySelector('[tabIndex="-1"]')
      expect(el).toBeInTheDocument()
    })
  })
})
