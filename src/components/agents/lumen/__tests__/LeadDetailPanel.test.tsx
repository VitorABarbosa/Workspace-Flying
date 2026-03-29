import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { LeadDetailPanel } from '../LeadDetailPanel'
import type { Lead } from '@/types/lumen'

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    aside: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <aside {...props}>{children}</aside>,
  },
}))

jest.mock('../LeadScoreBadge', () => ({
  LeadScoreBadge: ({ score }: { score: number }) => <span data-testid="score-badge">{score}</span>,
}))

const baseLead: Lead = {
  id: '1',
  job_id: 'job-1',
  name: 'Construtora Alpha',
  score: 85,
}

const fullLead: Lead = {
  id: '2',
  job_id: 'job-1',
  name: 'Imobiliária Beta',
  city: 'São Paulo',
  segment: 'Imóveis',
  website: 'https://beta.com.br',
  phone: '(11) 9999-9999',
  score: 75,
  apollo_contacts: [
    {
      name: 'João Silva',
      title: 'Diretor Comercial',
      email: 'joao@beta.com.br',
      email_confidence: 'high',
      linkedin_url: 'https://linkedin.com/in/joaosilva',
      phone: '(11) 8888-8888',
    },
  ],
  keywords: ['lançamento', 'apartamento'],
  score_breakdown: {
    website_score: 30,
    apollo_score: 25,
    keyword_score: 20,
  },
}

describe('LeadDetailPanel', () => {
  describe('LUMEN-08: slide-over detail panel', () => {
    it('renderiza null quando lead prop é null', () => {
      const { container } = render(<LeadDetailPanel lead={null} onClose={jest.fn()} />)
      expect(container.firstChild).toBeNull()
    })

    it('renderiza painel quando lead prop é não-null', () => {
      render(<LeadDetailPanel lead={baseLead} onClose={jest.fn()} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('exibe lead.name no header do painel', () => {
      render(<LeadDetailPanel lead={baseLead} onClose={jest.fn()} />)
      expect(screen.getByText('Construtora Alpha')).toBeInTheDocument()
    })

    it('exibe "{city} · {segment}" na linha de metadados', () => {
      render(<LeadDetailPanel lead={fullLead} onClose={jest.fn()} />)
      expect(screen.getByText('São Paulo · Imóveis')).toBeInTheDocument()
    })

    it('exibe LeadScoreBadge com lead.score na seção Score', () => {
      render(<LeadDetailPanel lead={baseLead} onClose={jest.fn()} />)
      const badge = screen.getByTestId('score-badge')
      expect(badge).toHaveTextContent('85')
    })

    it('renderiza score_breakdown como lista <dl> de key:value quando presente', () => {
      render(<LeadDetailPanel lead={fullLead} onClose={jest.fn()} />)
      const dl = document.querySelector('dl')
      expect(dl).toBeInTheDocument()
      const dts = document.querySelectorAll('dt')
      expect(dts.length).toBeGreaterThan(0)
      const dds = document.querySelectorAll('dd')
      expect(dds.length).toBeGreaterThan(0)
    })

    it('renderiza seção "Contatos Apollo" quando apollo_contacts é array não-vazio', () => {
      render(<LeadDetailPanel lead={fullLead} onClose={jest.fn()} />)
      expect(screen.getByText('Contatos Apollo')).toBeInTheDocument()
    })

    it('omite seção "Contatos Apollo" quando apollo_contacts está vazio ou ausente', () => {
      render(<LeadDetailPanel lead={baseLead} onClose={jest.fn()} />)
      expect(screen.queryByText('Contatos Apollo')).not.toBeInTheDocument()
    })

    it('renderiza seção "Keywords Detectadas" quando keywords é array não-vazio', () => {
      render(<LeadDetailPanel lead={fullLead} onClose={jest.fn()} />)
      expect(screen.getByText('Keywords Detectadas')).toBeInTheDocument()
    })

    it('omite seção "Keywords Detectadas" quando keywords está vazio ou ausente', () => {
      render(<LeadDetailPanel lead={baseLead} onClose={jest.fn()} />)
      expect(screen.queryByText('Keywords Detectadas')).not.toBeInTheDocument()
    })

    it('renderiza website como <a> com ExternalLink icon no footer quando presente', () => {
      render(<LeadDetailPanel lead={fullLead} onClose={jest.fn()} />)
      const link = screen.getByRole('link', { name: /beta\.com\.br/i })
      expect(link).toHaveAttribute('href', 'https://beta.com.br')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('renderiza telefone no footer quando presente', () => {
      render(<LeadDetailPanel lead={fullLead} onClose={jest.fn()} />)
      // phone appears in footer (lead-level phone) and possibly contact phone
      const phoneElements = screen.getAllByText('(11) 9999-9999')
      expect(phoneElements.length).toBeGreaterThan(0)
    })

    it('chama onClose() ao pressionar Escape', () => {
      const onClose = jest.fn()
      render(<LeadDetailPanel lead={baseLead} onClose={onClose} />)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('chama onClose() ao clicar no overlay', () => {
      const onClose = jest.fn()
      render(<LeadDetailPanel lead={baseLead} onClose={onClose} />)
      const overlay = document.querySelector('[aria-hidden="true"]') as HTMLElement
      expect(overlay).toBeInTheDocument()
      fireEvent.click(overlay)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('chama onClose() ao clicar no botão X', () => {
      const onClose = jest.fn()
      render(<LeadDetailPanel lead={baseLead} onClose={onClose} />)
      fireEvent.click(screen.getByRole('button', { name: 'Fechar painel' }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('aplica document.body.style.overflow = "hidden" ao montar', () => {
      render(<LeadDetailPanel lead={baseLead} onClose={jest.fn()} />)
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('restaura document.body.style.overflow ao desmontar', () => {
      const { unmount } = render(<LeadDetailPanel lead={baseLead} onClose={jest.fn()} />)
      unmount()
      expect(document.body.style.overflow).toBe('unset')
    })

    it('botão X tem aria-label="Fechar painel"', () => {
      render(<LeadDetailPanel lead={baseLead} onClose={jest.fn()} />)
      expect(screen.getByRole('button', { name: 'Fechar painel' })).toBeInTheDocument()
    })

    it('painel aside tem role="dialog" e aria-modal="true"', () => {
      render(<LeadDetailPanel lead={baseLead} onClose={jest.fn()} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })
  })
})
