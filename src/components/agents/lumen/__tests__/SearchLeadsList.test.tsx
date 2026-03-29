import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { SearchLeadsList } from '../SearchLeadsList'
import type { Lead } from '@/types/lumen'

const mockLead: Lead = {
  id: 'lead-1',
  job_id: 'job-abc',
  name: 'Imobiliária Central',
  city: 'São Paulo',
  segment: 'Construtora',
  website: 'https://imobcentral.com',
  phone: '(11) 9999-0001',
  score: 82,
  scraping_status: 'scraped',
}

const mockLeadFailed: Lead = {
  id: 'lead-2',
  job_id: 'job-abc',
  name: 'Empresa Sem Site',
  score: 30,
  scraping_status: 'failed',
}

const mockLeadNoOptionals: Lead = {
  id: 'lead-3',
  job_id: 'job-abc',
  name: 'Lead Básico',
  score: 55,
}

beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('SearchLeadsList', () => {
  describe('LUMEN-06: job_id isolation', () => {
    it('faz fetch para /api/tools/lumen/leads?job_id={encodeURIComponent(jobId)} ao montar', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0, page: 1, pages: 0, per_page: 50 }),
      })
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() =>
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('job_id=job-abc'),
        ),
      )
    })

    it('usa encodeURIComponent no jobId com caracteres especiais', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0, page: 1, pages: 0, per_page: 50 }),
      })
      render(<SearchLeadsList jobId="job abc/123" onSelectLead={jest.fn()} />)
      await waitFor(() =>
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('job_id=job%20abc%2F123'),
        ),
      )
    })

    it('exibe 5 linhas skeleton durante carregamento (loading=true)', () => {
      ;(global.fetch as jest.Mock).mockReturnValueOnce(new Promise(() => {}))
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      const skeletons = document.querySelectorAll('.animate-pulse')
      // 5 rows x 7 columns = 35 skeleton divs
      expect(skeletons.length).toBe(35)
    })

    it('exibe estado empty quando leads retornados = []', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0, page: 1, pages: 0, per_page: 50 }),
      })
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() =>
        expect(screen.getByText('Nenhum lead encontrado')).toBeInTheDocument(),
      )
    })

    it('exibe estado error quando fetch retorna HTTP 5xx', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() =>
        expect(screen.getByText('Erro ao carregar leads')).toBeInTheDocument(),
      )
    })

    it('exibe estado error quando fetch lança exceção', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() =>
        expect(screen.getByText('Erro ao carregar leads')).toBeInTheDocument(),
      )
    })

    it('botão "Tentar novamente" no estado error re-dispara o fetch', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [], total: 0, page: 1, pages: 0, per_page: 50 }),
        })

      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() => screen.getByText('Tentar novamente'))

      fireEvent.click(screen.getByText('Tentar novamente'))

      await waitFor(() =>
        expect(global.fetch).toHaveBeenCalledTimes(2),
      )
    })
  })

  describe('LUMEN-07: colunas da tabela', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockLead], total: 1, page: 1, pages: 1, per_page: 50 }),
      })
    })

    it('renderiza cabeçalhos das 7 colunas da tabela', async () => {
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() => screen.getByText('Imobiliária Central'))

      expect(screen.getByText('Nome')).toBeInTheDocument()
      expect(screen.getByText('Cidade')).toBeInTheDocument()
      expect(screen.getByText('Segmento')).toBeInTheDocument()
      expect(screen.getByText('Website')).toBeInTheDocument()
      expect(screen.getByText('Telefone')).toBeInTheDocument()
      expect(screen.getByText('Score')).toBeInTheDocument()
      expect(screen.getByText('Coleta')).toBeInTheDocument()
    })

    it('renderiza coluna Nome com lead.name', async () => {
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() =>
        expect(screen.getByText('Imobiliária Central')).toBeInTheDocument(),
      )
    })

    it('renderiza coluna Cidade com lead.city', async () => {
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() =>
        expect(screen.getByText('São Paulo')).toBeInTheDocument(),
      )
    })

    it('renderiza coluna Segmento com lead.segment', async () => {
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() =>
        expect(screen.getByText('Construtora')).toBeInTheDocument(),
      )
    })

    it('renderiza coluna Website como <a> com ExternalLink icon', async () => {
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() => screen.getByText('Imobiliária Central'))

      const link = screen.getByRole('link', { name: /imobcentral/i })
      expect(link).toHaveAttribute('href', 'https://imobcentral.com')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renderiza coluna Telefone como texto', async () => {
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() =>
        expect(screen.getByText('(11) 9999-0001')).toBeInTheDocument(),
      )
    })

    it('renderiza coluna Score com componente LeadScoreBadge (aria-label Score: 82)', async () => {
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() => screen.getByText('Imobiliária Central'))

      expect(screen.getByLabelText('Score: 82')).toBeInTheDocument()
    })

    it('renderiza coluna Coleta com "Coletado" para scraping_status scraped', async () => {
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() =>
        expect(screen.getByText('Coletado')).toBeInTheDocument(),
      )
    })
  })

  describe('LUMEN-07: em dash fallbacks para campos opcionais', () => {
    it('renderiza em dash para city, segment, website e phone quando ausentes', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockLeadNoOptionals], total: 1, page: 1, pages: 1, per_page: 50 }),
      })
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() => screen.getByText('Lead Básico'))

      const dashes = screen.getAllByText('—')
      // city, segment, website, phone = 4 dashes
      expect(dashes.length).toBeGreaterThanOrEqual(4)
    })

    it('renderiza "Falhou" para scraping_status failed', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockLeadFailed], total: 1, page: 1, pages: 1, per_page: 50 }),
      })
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() =>
        expect(screen.getByText('Falhou')).toBeInTheDocument(),
      )
    })
  })

  describe('LUMEN-07: interação com linha da tabela', () => {
    it('linha clicável chama onSelectLead(lead) ao clicar', async () => {
      const onSelectLead = jest.fn()
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockLead], total: 1, page: 1, pages: 1, per_page: 50 }),
      })
      render(<SearchLeadsList jobId="job-abc" onSelectLead={onSelectLead} />)
      await waitFor(() => screen.getByText('Imobiliária Central'))

      const rows = screen.getAllByRole('row')
      // rows[0] = header, rows[1] = data row
      fireEvent.click(rows[1])
      expect(onSelectLead).toHaveBeenCalledWith(mockLead)
    })

    it('linha selecionada recebe bg-brand-purple/10 quando lead.id === selectedLeadId', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockLead], total: 1, page: 1, pages: 1, per_page: 50 }),
      })
      render(
        <SearchLeadsList
          jobId="job-abc"
          onSelectLead={jest.fn()}
          selectedLeadId="lead-1"
        />,
      )
      await waitFor(() => screen.getByText('Imobiliária Central'))

      const rows = screen.getAllByRole('row')
      expect(rows[1].className).toContain('bg-brand-purple/10')
    })

    it('linha responde a Enter via onKeyDown para acessibilidade', async () => {
      const onSelectLead = jest.fn()
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockLead], total: 1, page: 1, pages: 1, per_page: 50 }),
      })
      render(<SearchLeadsList jobId="job-abc" onSelectLead={onSelectLead} />)
      await waitFor(() => screen.getByText('Imobiliária Central'))

      const rows = screen.getAllByRole('row')
      fireEvent.keyDown(rows[1], { key: 'Enter' })
      expect(onSelectLead).toHaveBeenCalledWith(mockLead)
    })

    it('linha responde a Space via onKeyDown para acessibilidade', async () => {
      const onSelectLead = jest.fn()
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockLead], total: 1, page: 1, pages: 1, per_page: 50 }),
      })
      render(<SearchLeadsList jobId="job-abc" onSelectLead={onSelectLead} />)
      await waitFor(() => screen.getByText('Imobiliária Central'))

      const rows = screen.getAllByRole('row')
      fireEvent.keyDown(rows[1], { key: ' ' })
      expect(onSelectLead).toHaveBeenCalledWith(mockLead)
    })

    it('linha tem tabIndex={0} para navegação por teclado', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockLead], total: 1, page: 1, pages: 1, per_page: 50 }),
      })
      render(<SearchLeadsList jobId="job-abc" onSelectLead={jest.fn()} />)
      await waitFor(() => screen.getByText('Imobiliária Central'))

      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveAttribute('tabIndex', '0')
    })
  })
})
