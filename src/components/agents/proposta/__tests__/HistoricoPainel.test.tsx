import { fireEvent, render, screen } from '@testing-library/react'
import { HistoricoPainel } from '../HistoricoPainel'

const LISTA = [
  { id: 7, cliente: 'GALLI', referencia: 'Aurora', data: '2026-07-19',
    total: 5085, docx_url: null, download: '/propostas/7/docx', pdf: '/propostas/7/pdf' },
]

describe('HistoricoPainel', () => {
  it('lista propostas com links de download', () => {
    render(<HistoricoPainel propostas={LISTA} onExcluir={jest.fn()} onFiltrar={jest.fn()} carregando={false} />)
    expect(screen.getByText('GALLI')).toBeInTheDocument()
    expect(screen.getByText(/R\$\s?5\.085,00/)).toBeInTheDocument()
    expect(screen.getByLabelText('Baixar PDF da proposta 7'))
      .toHaveAttribute('href', '/api/tools/proposta/propostas/7/pdf')
  })

  it('exclusão exige confirmação', () => {
    const onExcluir = jest.fn()
    render(<HistoricoPainel propostas={LISTA} onExcluir={onExcluir} onFiltrar={jest.fn()} carregando={false} />)
    fireEvent.click(screen.getByLabelText('Excluir proposta 7'))
    expect(onExcluir).not.toHaveBeenCalled()          // ainda não!
    fireEvent.click(screen.getByText('Confirmar exclusão'))
    expect(onExcluir).toHaveBeenCalledWith(7)
  })
})
